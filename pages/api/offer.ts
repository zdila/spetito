// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Offer } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { prisma } from "../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Offer>
) {
  const session = await getSession({ req });

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
      author: {
        connect: {
          email: session?.user?.email ?? undefined,
        },
      },
    },
  });

  res.json(result);
}
