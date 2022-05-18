// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Invitation } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { prisma } from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Invitation>
) {
  if (req.method !== "POST") {
    res.status(405).end();

    return;
  }

  const session = await getSession({ req });

  const id = session?.user?.id;

  if (!id) {
    res.status(403).end();

    return;
  }

  // TODO validate
  const { userId } = req.body as {
    userId: string;
  };

  const result = await prisma.invitation.create({
    data: {
      inviterId: id,
      invitingId: userId,
    },
  });

  res.json(result);
}
