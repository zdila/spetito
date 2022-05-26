import { Invitation } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { prisma } from "../../../lib/prisma";
import webpush from "../../../lib/webpush";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Invitation>
) {
  if (req.method !== "POST") {
    res.status(405).end();

    return;
  }

  const session = await getSession({ req });

  const user = session?.user;

  if (!user) {
    res.status(403).end();

    return;
  }

  // TODO validate
  const { userId } = req.body as {
    userId: string;
  };

  const result = await prisma.invitation.create({
    data: {
      inviterId: user.id,
      invitingId: userId,
    },
  });

  const pushRegistrations = await prisma.pushRegistration.findMany({
    where: {
      userId,
    },
  });

  pushRegistrations.map((pushRegistration) => {
    const pushSubscription: webpush.PushSubscription = {
      endpoint: pushRegistration.endpoint,
      keys: {
        auth: pushRegistration.auth.toString("base64url"),
        p256dh: pushRegistration.p256dh.toString("base64url"),
      },
    };

    webpush.sendNotification(
      pushSubscription,
      JSON.stringify({
        type: "invite",
        payload: { from: { name: user.name, id: user.id } },
      })
    );
  });

  res.json(result);
}
