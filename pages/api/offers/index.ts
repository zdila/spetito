import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { prisma } from "../../../lib/prisma";
import { sendPushNotifications } from "../../../utility/pushNotifications";

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
  const { message, validFrom, validTo, audience, place } = req.body as {
    message: string;
    validFrom?: string;
    validTo?: string;
    audience: {
      users: string[];
      lists: string[];
    };
    place: null | {
      center: {
        lng: number;
        lat: number;
      };
      zoom: number;
      radius: number;
    };
  };

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

  sendPushNotifications(pushRegistrations, {
    type: "offer",
    payload: {
      from: { name: user.name, id: user.id },
      offer: { id: result.id },
    },
  });

  res.json(result);
}
