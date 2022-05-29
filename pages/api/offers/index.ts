import { Offer } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { prisma } from "../../../lib/prisma";
import webpush from "../../../lib/webpush";

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

  // TODO validate
  const { message, validFrom, validTo, audience } = req.body as {
    message: string;
    validFrom?: string;
    validTo?: string;
    audience: {
      users: string[];
      lists: string[];
    };
  };

  const result = await prisma.offer.create({
    data: {
      message,
      validFrom,
      validTo,
      userId,
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

  const pushRegistrations = await prisma.pushRegistration.findMany({
    where: {
      user: {
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
      },
    },
  });

  const pnPayload = JSON.stringify({
    type: "offer",
    payload: {
      from: { name: user.name, id: user.id },
      offer: { id: result.id },
    },
  });

  Promise.all(
    pushRegistrations.map((pushRegistration) => {
      const pushSubscription: webpush.PushSubscription = {
        endpoint: pushRegistration.endpoint,
        keys: {
          auth: pushRegistration.auth.toString("base64url"),
          p256dh: pushRegistration.p256dh.toString("base64url"),
        },
      };

      return webpush.sendNotification(pushSubscription, pnPayload);
    })
  ).catch((err) => {
    console.log("Error sending push", err);
  });

  res.json(result);
}
