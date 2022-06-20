import { Offer } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { OfferBody, validateDates } from ".";
import { prisma } from "../../../lib/prisma";
import { validateSchema } from "../../../lib/schemaValidation";
import { sendOfferNotifications } from "./offerNotification";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Offer>
) {
  if (req.method === "DELETE" || req.method === "PUT") {
    const { id } = req.query;

    if (typeof id !== "string") {
      res.status(400).end();

      return;
    }

    const session = await getSession({ req });

    const user = session?.user;

    if (!user) {
      res.status(403).end();

      return;
    }

    if (req.method === "DELETE") {
      const { count } = await prisma.offer.deleteMany({
        where: {
          id,
          userId: user.id,
        },
      });

      // if not deleted (assume not own offer) then hide
      if (count === 0) {
        await prisma.hiddenOffers.create({
          data: {
            offerId: id,
            userId: user.id,
          },
        });
      }
    } else if (req.method === "PUT") {
      if (!validateSchema(OfferBody, req.body) || !validateDates(req.body)) {
        res.status(400).end();

        return;
      }

      const { message, validFrom, validTo, audience, place } = req.body;

      const offer = await prisma.$transaction(async (prisma) => {
        const offerListIds = (
          await prisma.offerList.findMany({
            where: { offerId: id },
          })
        ).map((item) => item.listId);

        const offerUserIds = (
          await prisma.offerUser.findMany({
            where: { offerId: id },
          })
        ).map((item) => item.userId);

        await prisma.offerList.deleteMany({
          where: {
            offerId: id,
            listId: {
              in: offerListIds.filter((id) => !audience.lists.includes(id)),
            },
          },
        });

        await prisma.offerUser.deleteMany({
          where: {
            offerId: id,
            userId: {
              in: offerUserIds.filter((id) => !audience.users.includes(id)),
            },
          },
        });

        return await prisma.offer.update({
          data: {
            message,
            validFrom,
            validTo,
            lat: place?.center.lat,
            lng: place?.center.lng,
            zoom: place?.zoom,
            radius: place?.radius ? Math.floor(place?.radius) : undefined,
            offerLists: {
              createMany: {
                data: audience.lists // TODO check if the list is ours
                  .filter((listId) => !offerListIds.includes(listId))
                  .map((listId) => ({
                    listId,
                  })),
              },
            },
            offerUsers: {
              createMany: {
                data: audience.users // TODO check if we are friends
                  .filter((userId) => !offerUserIds.includes(userId))
                  .map((userId) => ({
                    userId,
                  })),
              },
            },
          },
          where: { id },
        });
      });

      await sendOfferNotifications(offer, user, audience);
    }

    res.status(204).end();
  } else {
    res.status(405).end();
  }
}
