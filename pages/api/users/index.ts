import { Invitation, Prisma } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { User } from "next-auth";
import { getSession } from "next-auth/react";
import { prisma } from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<User[]>
) {
  if (req.method !== "GET") {
    res.status(405).end();

    return;
  }

  const session = await getSession({ req });

  const id = session?.user?.id;

  if (!id) {
    res.status(403).end();

    return;
  }

  const q = req.query.q;

  const noneOf: Prisma.UserWhereInput[] = [
    // exclude self
    { id },
  ];

  const where: Prisma.UserWhereInput = {
    NOT: {
      OR: noneOf,
    },
  };

  if (typeof q === "string" && q) {
    where.name = {
      contains: q,
    };
  }

  const params: Prisma.UserFindManyArgs = { where };

  if (req.query.filter === "notFriendsAndNotPending") {
    noneOf.push(
      // exclude already invited
      {
        invitedBy: {
          some: {
            inviterId: id,
          },
        },
      },
      // exclude existing friends
      {
        followedBy: {
          some: {
            followerId: id,
          },
        },
      },
      {
        following: {
          some: {
            followingId: id,
          },
        },
      }
    );
  } else if (req.query.filter === "friends") {
    where.OR = [
      {
        followedBy: {
          some: {
            followerId: id,
          },
        },
      },
      {
        following: {
          some: {
            followingId: id,
          },
        },
      },
    ];
  }

  if (req.query.inList) {
    params.include = {
      groupMemebers: {
        where: {
          groupId: "123",
        },
      },
    };
  }

  const result = await prisma.user.findMany(params);

  res.json(result);
}
