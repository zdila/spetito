import { Offer } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { OfferBody, validateDates } from ".";
import { prisma } from "../../../lib/prisma";
import { validateSchema } from "../../../lib/schemaValidation";

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

    const userId = session?.user?.id;

    if (!userId) {
      res.status(403).end();

      return;
    }

    if (req.method === "DELETE") {
      const { count } = await prisma.offer.deleteMany({
        where: {
          id,
          userId,
        },
      });

      // if not deleted (assume not own offer) then hide
      if (count === 0) {
        await prisma.hiddenOffers.create({
          data: {
            offerId: id,
            userId,
          },
        });
      }
    } else if (req.method === "PUT") {
      if (!validateSchema(OfferBody, req.body) || !validateDates(req.body)) {
        res.status(400).end();

        return;
      }

      const { message, validFrom, validTo, audience, place } = req.body;

      await prisma.$transaction(async (prisma) => {
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

        await prisma.offer.update({
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
                data: audience.lists
                  .filter((listId) => !offerListIds.includes(listId))
                  .map((listId) => ({
                    listId,
                  })),
              },
            },
            offerUsers: {
              createMany: {
                data: audience.users
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
    }

    res.status(204).end();
  } else {
    res.status(405).end();
  }
}
