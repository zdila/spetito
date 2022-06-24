import type { NextApiRequest, NextApiResponse } from "next";
import { assertHttpMethod } from "../../../lib/assertHttpMethod";
import { getSessionUserOrThrow } from "../../../lib/getSessionUserOrThrow";
import { prisma } from "../../../lib/prisma";
import {
  HttpError,
  withHttpErrorHandler,
} from "../../../lib/withHttpErrorHandler";

export default withHttpErrorHandler(handler);

async function handler(req: NextApiRequest, res: NextApiResponse) {
  assertHttpMethod(req, "DELETE");

  const { id } = req.query;

  if (typeof id !== "string") {
    throw new HttpError(400);
  }

  const user = await getSessionUserOrThrow(req);

  await prisma.follows.deleteMany({
    where: {
      OR: [
        {
          followerId: user.id,
          followingId: id,
        },
        {
          followerId: id,
          followingId: user.id,
        },
      ],
    },
  });

  // nicer would be DB trigger
  await prisma.listMember.deleteMany({
    where: {
      OR: [
        {
          list: {
            userId: user.id,
          },
          userId: id,
        },
        {
          list: {
            userId: id,
          },
          userId: user.id,
        },
      ],
    },
  });

  res.status(204).end();
}
