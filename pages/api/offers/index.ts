import { renderToStaticMarkup } from "react-dom/server";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { prisma } from "../../../lib/prisma";
import { sendMail } from "../../../utility/mail";
import { sendPushNotifications } from "../../../utility/pushNotifications";
import { OfferMail } from "../../../emails/OfferMail";
import { Static, Type } from "@sinclair/typebox";
import { validateSchema } from "../../../lib/schemaValidation";
import { Prisma } from "@prisma/client";

export const OfferBody = Type.Object(
  {
    message: Type.String(),
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

export function validateDates({
  validFrom,
  validTo,
}: Pick<Static<typeof OfferBody>, "validFrom" | "validTo">) {
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

  const toEverybody = audience.users.length + audience.lists.length === 0;

  const userFilter: Prisma.UserWhereInput = {
    AND: [
      {
        OR: [
          {
            followedBy: {
              some: {
                followerId: userId,
              },
            },
          },
          {
            following: {
              some: {
                followingId: userId,
              },
            },
          },
        ],
      },
    ],
    ...(toEverybody
      ? {}
      : {
          OR: [
            {
              id: {
                in: audience.users,
              },
            },
            {
              listMemebers: {
                some: {
                  listId: {
                    in: audience.lists,
                  },
                },
              },
            },
          ],
        }),
  };

  const pushRegistrations = await prisma.pushRegistration.findMany({
    where: {
      user: userFilter,
    },
  });

  sendPushNotifications(pushRegistrations, {
    type: "offer",
    payload: {
      from: { name: user.name, id: user.id },
      offer: { id: result.id },
    },
  });

  const recipients = await prisma.user.findMany({
    where: {
      NOT: [{ email: null }],
      useEmailNotif: true,
      ...userFilter,
    },
  });

  for (const recipient of recipients) {
    sendMail(
      {
        name: recipient.name!,
        address: recipient.email!,
      },
      OfferMail,
      {
        offerrer: user.name ?? user.id,
        offer: result,
        recipient,
      }
    );
  }

  res.json(result);
}
