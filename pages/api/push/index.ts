// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
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

  const id = session?.user?.id;

  if (!id) {
    res.status(403).end();

    return;
  }

  const {
    endpoint,
    auth: authString,
    p256dh: p256dhString,
  } = req.body as {
    endpoint: string;
    auth: string;
    p256dh: string;
  };

  const auth = Buffer.from(authString, "base64");

  const p256dh = Buffer.from(p256dhString, "base64");

  await prisma.pushRegistration.upsert({
    where: {
      endpoint,
    },
    create: {
      userId: id,
      endpoint,
      auth,
      p256dh,
    },
    update: {
      endpoint,
      auth,
      p256dh,
    },
  });

  res.status(204).end();
}
