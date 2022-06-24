import { Offer } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { OfferBody, validateDates } from ".";
import { getSessionUserOrThrow } from "../../../lib/getSessionUserOrThrow";
import { prisma } from "../../../lib/prisma";
import { validateSchemaOrThrow } from "../../../lib/schemaValidation";
import {
  HttpError,
  withHttpErrorHandler,
} from "../../../lib/withHttpErrorHandler";
import { sendOfferNotifications } from "../../../lib/offerNotification";

export default withHttpErrorHandler(handler);

async function handler(req: NextApiRequest, res: NextApiResponse<Offer>) {
  if (req.method === "DELETE" || req.method === "PUT") {
    const { id } = req.query;

    if (typeof id !== "string") {
      throw new HttpError(400);
    }

    const user = await getSessionUserOrThrow(req);

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
      validateSchemaOrThrow(OfferBody, req.body);

      if (!validateDates(req.body)) {
        throw new HttpError(400, { errorCode: "invalid_dates" });
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
