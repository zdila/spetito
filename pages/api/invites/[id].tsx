import { User } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { AcceptFriendRequestMail } from "../../../emails/AcceptFriendRequestMail";
import { getSessionUserOrThrow } from "../../../lib/getSessionUserOrThrow";
import { prisma } from "../../../lib/prisma";
import {
  HttpError,
  withHttpErrorHandler,
} from "../../../lib/withHttpErrorHandler";
import { sendMail } from "../../../utility/mail";
import { sendPushNotifications } from "../../../utility/pushNotifications";

export default withHttpErrorHandler(handler);

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    // accept invite

    const { id } = req.query;

    if (typeof id !== "string") {
      throw new HttpError(400);
    }

    const user = await getSessionUserOrThrow(req);

    await prisma.$transaction(async (prisma) => {
      const [x] = await prisma.invitation.findMany({
        where: {
          inviterId: id,
          invitingId: user.id,
        },
      });

      if (!x) {
        throw new HttpError(404);
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
    // reject invite

    const { id } = req.query;

    if (typeof id !== "string") {
      throw new HttpError(400);
    }

    const user = await getSessionUserOrThrow(req);

    await prisma.invitation.deleteMany({
      where: {
        OR: [
          // delete invitation from me
          {
            inviterId: user.id,
            invitingId: id,
          },
          // delete someone elses invitation
          {
            inviterId: id,
            invitingId: user.id,
          },
        ],
      },
    });

    res.status(204).end();
  } else {
    res.status(405).end();
  }
}
