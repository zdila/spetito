import { Offer } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { prisma } from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Offer>
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

  await prisma.offer.deleteMany({
    where: {
      id,
      userId,
    },
  });

  await prisma.hiddenOffers.create({
    data: {
      offerId: id,
      userId,
    },
  });

  res.status(204).end();
}
