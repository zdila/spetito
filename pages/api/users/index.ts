import { Prisma } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { assertHttpMethod } from "../../../lib/assertHttpMethod";
import { getSessionUserOrThrow } from "../../../lib/getSessionUserOrThrow";
import { prisma } from "../../../lib/prisma";
import {
  HttpError,
  withHttpErrorHandler,
} from "../../../lib/withHttpErrorHandler";
import { PublicUser } from "../../../types";

export default withHttpErrorHandler(handler);

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PublicUser[]>
) {
  assertHttpMethod(req, "GET");

  const { id } = await getSessionUserOrThrow(req);

  const { q } = req.query;

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

  if (req.query.filter === "notFriendsAndNotPending") {
    if (typeof q !== "string" || q.length < 3) {
      throw new HttpError(400);
    }

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
  } else {
    throw new HttpError(400);
  }

  res.json(
    await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        image: true,
      },
      where,
    })
  );
}
