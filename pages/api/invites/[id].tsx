import { User } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { AcceptFriendRequestMail } from "../../../emails/AcceptFriendRequestMail";
import { prisma } from "../../../lib/prisma";
import { sendMail } from "../../../utility/mail";
import { sendPushNotifications } from "../../../utility/pushNotifications";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { id } = req.query;

    if (typeof id !== "string") {
      res.status(400).end();

      return;
    }

    const session = await getSession({ req });

    const user = session?.user;

    if (!user) {
      res.status(403).end();

      return;
    }

    await prisma.$transaction(async (prisma) => {
      const [x] = await prisma.invitation.findMany({
        where: {
          inviterId: id,
          invitingId: user.id,
        },
      });

      if (!x) {
        throw new Error("no such invitation"); // TODO 404
      }

      await prisma.follows.create({
        data: {
          followerId: id,
          followingId: user.id,
        },
      });

      await prisma.invitation.deleteMany({
        where: {
          inviterId: id,
          invitingId: user.id,
        },
      });
    });

    const pushRegistrations = await prisma.pushRegistration.findMany({
      where: {
        userId: id,
      },
    });

    sendPushNotifications(
      pushRegistrations,
      {
        type: "accept",
        payload: { from: { name: user.name, id: user.id } },
      },
      24 * 3600
    );

    const recipient = await prisma.user.findFirst({
      where: {
        id,
        useEmailNotif: true,
        NOT: [{ email: null }],
      },
    });

    if (recipient?.email) {
      sendMail(
        {
          name: recipient.name!,
          address: recipient.email,
        },
        <AcceptFriendRequestMail sender={user as User} recipient={recipient} />
      );
    }

    res.status(204).end();
  } else if (req.method === "DELETE") {
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

    await prisma.invitation.deleteMany({
      where: {
        OR: [
          // delete invitation from me
          {
            inviterId: userId,
            invitingId: id,
          },
          // delete someone elses invitation
          {
            inviterId: id,
            invitingId: userId,
          },
        ],
      },
    });

    res.status(204).end();
  } else {
    res.status(405).end();
  }
}
