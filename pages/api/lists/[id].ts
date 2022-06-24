import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { Type } from "@sinclair/typebox";
import { validateSchemaOrThrow } from "../../../lib/schemaValidation";
import {
  HttpError,
  withHttpErrorHandler,
} from "../../../lib/withHttpErrorHandler";
import { getSessionUserOrThrow } from "../../../lib/getSessionUserOrThrow";

const Body = Type.Object(
  {
    name: Type.String({ minLength: 1 }),
    members: Type.Array(Type.String({ minLength: 1 })),
  },
  { additionalProperties: false }
);

export default withHttpErrorHandler(handler);

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "DELETE") {
    const { id } = req.query;

    if (typeof id !== "string") {
      throw new HttpError(400);
    }

    const user = await getSessionUserOrThrow(req);

    await prisma.list.deleteMany({
      where: {
        id,
        userId: user.id,
      },
    });

    res.status(204).end();
  } else if (req.method === "PUT") {
    const { id } = req.query;

    if (typeof id !== "string") {
      throw new HttpError(400);
    }

    const user = await getSessionUserOrThrow(req);

    validateSchemaOrThrow(Body, req.body);

    const { name, members } = req.body;

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
      throw new HttpError(404);
    }

    if (list.owner.id !== user.id) {
      throw new HttpError(403);
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
