import { Offer } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { prisma } from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "DELETE") {
    res.status(405).end();

    return;
  }

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

  await prisma.group.deleteMany({
    where: {
      id,
      userId,
    },
  });

  res.status(204).end();
}
