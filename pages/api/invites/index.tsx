import { Invitation, User } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { FriendRequestMail } from "../../../emails/FriendRequestMail";
import { prisma } from "../../../lib/prisma";
import { sendMail } from "../../../utility/mail";
import { sendPushNotifications } from "../../../utility/pushNotifications";
import { Type } from "@sinclair/typebox";
import { validateSchemaOrThrow } from "../../../lib/schemaValidation";
import { days, multiLimit } from "../../../lib/limit";
import { withHttpErrorHandler } from "../../../lib/withHttpErrorHandler";
import { getSessionUserOrThrow } from "../../../lib/getSessionUserOrThrow";
import { assertHttpMethod } from "../../../lib/assertHttpMethod";

const Body = Type.Object(
  {
    userId: Type.String({ minLength: 1 }),
  },
  { additionalProperties: false }
);

export default withHttpErrorHandler(handler);

async function handler(req: NextApiRequest, res: NextApiResponse<Invitation>) {
  assertHttpMethod(req, "POST");

  const user = await getSessionUserOrThrow(req);

  validateSchemaOrThrow(Body, req.body);

  const { userId } = req.body;

  await multiLimit([
    {
      key: `invite-${user.id}-${userId}`,
      maxCount: 2,
      timeSpan: days(1),
    },
    {
      key: `invite-${user.id}`,
      maxCount: 10,
      timeSpan: days(1),
    },
  ]);

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

  sendPushNotifications(
    pushRegistrations,
    {
      type: "invite",
      payload: { from: { name: user.name, id: user.id } },
    },
    24 * 3600
  );

  const recipient = await prisma.user.findFirst({
    where: {
      id: userId,
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
      <FriendRequestMail sender={user as User} recipient={recipient} />
    );
  }

  res.json(result);
}
