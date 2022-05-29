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

    await prisma.list.deleteMany({
      where: {
        id,
        userId,
      },
    });

    res.status(204).end();
  } else if (req.method === "PUT") {
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

    // TODO validate
    const { name, members } = req.body as {
      name: string;
      members: string[];
    };

    const list = await prisma.list.findUnique({
      select: {
        owner: {
          select: {
            id: true,
          },
        },
      },
      where: {
        id,
      },
    });

    if (!list) {
      res.status(404).end();

      return;
    }

    if (list.owner.id !== userId) {
      res.status(403).end();

      return;
    }

    await prisma.$transaction(async (prisma) => {
      await prisma.list.update({
        data: {
          name,
          // i think i finally hate prisma
          // members: {
          //   // `set` does not work
          //   create: members.map((member) => ({ // causes PK error on duplicates
          //     userId: member,
          //   })),
          //   deleteMany: {
          //     userId: {
          //       notIn: members,
          //     },
          //   },
          // },
        },
        where: {
          id,
        },
      });

      await prisma.listMember.deleteMany({
        where: {
          userId: {
            notIn: members,
          },
          listId: id,
        },
      });

      const currMembers = await prisma.listMember.findMany({
        select: { userId: true },
        where: {
          listId: id,
        },
      });

      const membersSet = new Set(members);

      for (const member of currMembers) {
        membersSet.delete(member.userId);
      }

      await prisma.listMember.createMany({
        data: [...membersSet].map((userId) => ({
          listId: id,
          userId,
        })),
      });
    });

    res.status(204).end();
  } else {
    res.status(405).end();
  }
}
