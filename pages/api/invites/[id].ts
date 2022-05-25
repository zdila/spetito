// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Invitation, PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { prisma } from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Invitation>
) {
  if (req.method === "POST") {
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

    await prisma.$transaction(async (prisma) => {
      const [x] = await prisma.invitation.findMany({
        where: {
          inviterId: id,
          invitingId: userId,
        },
      });

      if (!x) {
        throw new Error("no such invitation"); // TODO 404
      }

      await prisma.follows.create({
        data: {
          followerId: id,
          followingId: userId,
        },
      });

      await prisma.invitation.deleteMany({
        where: {
          inviterId: id,
          invitingId: userId,
        },
      });
    });
  } else if (req.method === "DELETE") {
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

    await prisma.invitation.deleteMany({
      where: {
        OR: [
          // delete invitation from me
          {
            inviterId: userId,
            invitingId: id,
          },
          // delete someone elses invitation
          {
            inviterId: id,
            invitingId: userId,
          },
        ],
      },
    });

    res.status(204).end();
  } else {
    res.status(405).end();
  }
}
