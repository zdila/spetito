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

  if (typeof q !== "string" || !q) {
    res.status(400).end();

    return;
  }

  const noneOf: Prisma.UserWhereInput[] = [
    // exclude self
    { id },
  ];

  if ("friendSearch" in req.query) {
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
  }

  const result = await prisma.user.findMany({
    where: {
      name: {
        contains: q,
      },
      NOT: {
        OR: noneOf,
      },
    },
  });

  res.json(result);
}
