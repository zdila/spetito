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

  const authBuffer = Buffer.from(authString, "base64");

  const auth = new Uint8Array(
    authBuffer.buffer,
    authBuffer.byteOffset,
    authBuffer.byteLength
  );

  const p256dhBuffer = Buffer.from(p256dhString, "base64");

  const p256dh = new Uint8Array(
    p256dhBuffer.buffer,
    p256dhBuffer.byteOffset,
    p256dhBuffer.byteLength
  );

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
