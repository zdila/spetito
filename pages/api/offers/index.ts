import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { prisma } from "../../../lib/prisma";
import { Static, Type } from "@sinclair/typebox";
import { validateSchema } from "../../../lib/schemaValidation";
import { sendOfferNotifications } from "./offerNotification";

export const OfferBody = Type.Object(
  {
    message: Type.String({ maxLength: 2000 }),
    validFrom: Type.Union([Type.String({ format: "date-time" }), Type.Null()]),
    validTo: Type.Union([Type.String({ format: "date-time" }), Type.Null()]),
    audience: Type.Object({
      users: Type.Array(Type.String({ minLength: 1 })),
      lists: Type.Array(Type.String({ minLength: 1 })),
    }),
    place: Type.Union([
      Type.Null(),
      Type.Object({
        center: Type.Object({
          lng: Type.Number(),
          lat: Type.Number(),
        }),
        zoom: Type.Number({ minimum: 0 }),
        radius: Type.Number({ minimum: 0 }),
      }),
    ]),
  },
  { additionalProperties: false }
);

export type OfferBody = Static<typeof OfferBody>;

export function validateDates({
  validFrom,
  validTo,
}: Pick<OfferBody, "validFrom" | "validTo">) {
  return (
    (validFrom === null || new Date(validFrom).getTime() > Date.now()) &&
    (validTo === null || new Date(validTo).getTime() > Date.now()) &&
    (validFrom === null ||
      validTo === null ||
      new Date(validFrom).getTime() < new Date(validTo).getTime())
  );
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).end();

    return;
  }

  const session = await getSession({ req });

  const user = session?.user;

  if (!user) {
    res.status(403).end();

    return;
  }

  const userId = user?.id;

  if (!validateSchema(OfferBody, req.body) || !validateDates(req.body)) {
    res.status(400).end();

    return;
  }

  const { message, validFrom, validTo, audience, place } = req.body;

  const result = await prisma.offer.create({
    data: {
      message,
      validFrom,
      validTo,
      userId,
      lat: place?.center.lat,
      lng: place?.center.lng,
      zoom: place?.zoom,
      radius: place?.radius ? Math.floor(place?.radius) : undefined,
      offerLists: {
        createMany: {
          data: audience.lists.map((listId) => ({
            listId,
          })),
        },
      },
      offerUsers: {
        createMany: {
          data: audience.users.map((userId) => ({
            userId,
          })),
        },
      },
    },
  });

  await sendOfferNotifications(result, user, audience);

  res.json(result);
}
