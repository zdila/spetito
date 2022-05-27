import { Invitation } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { prisma } from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "DELETE") {
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

    await prisma.follows.deleteMany({
      where: {
        OR: [
          {
            followerId: userId,
            followingId: id,
          },
          {
            followerId: id,
            followingId: userId,
          },
        ],
      },
    });

    // nicer would be DB trigger
    await prisma.listMemeber.deleteMany({
      where: {
        OR: [
          {
            list: {
              owner: {
                id: userId,
              },
            },
            user: { id },
          },
          {
            list: {
              owner: {
                id,
              },
            },
            user: { id: userId },
          },
        ],
      },
    });

    res.status(204).end();
  } else {
    res.status(405).end();
  }
}
