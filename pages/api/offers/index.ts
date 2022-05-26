import { Offer } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { prisma } from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).end();

    return;
  }

  const session = await getSession({ req });

  const userId = session?.user?.id;

  if (!userId) {
    res.status(403).end();

    return;
  }

  // TODO validate
  const { message, validFrom, validTo } = req.body as {
    message: string;
    validFrom?: string;
    validTo?: string;
  };

  const result = await prisma.offer.create({
    data: {
      message,
      validFrom,
      validTo,
      userId,
    },
  });

  res.json(result);
}
