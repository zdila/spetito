// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Offer } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Offer>
) {
  if (req.method !== "DELETE") {
    res.status(405).end();

    return;
  }

  const { endpoint } = req.query;

  if (typeof endpoint !== "string") {
    res.status(400).end();

    return;
  }

  await prisma.pushRegistration.delete({
    where: { endpoint },
  });

  res.status(204).end();
}
