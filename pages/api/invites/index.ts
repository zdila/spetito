import { Invitation } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { prisma } from "../../../lib/prisma";
import { sendPushNotifications } from "../../../utility/pushNotifications";

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

  sendPushNotifications(pushRegistrations, {
    type: "invite",
    payload: { from: { name: user.name, id: user.id } },
  });

  res.json(result);
}
