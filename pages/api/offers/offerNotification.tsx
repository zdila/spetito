import { Offer, Prisma } from "@prisma/client";
import { User } from "next-auth";
import type { OfferBody } from ".";
import { OfferMail } from "../../../emails/OfferMail";
import { prisma } from "../../../lib/prisma";
import { sendMail } from "../../../utility/mail";
import { sendPushNotifications } from "../../../utility/pushNotifications";

export async function sendOfferNotifications(
  offer: Offer,
  user: User,
  audience: OfferBody["audience"]
) {
  const toEverybody = audience.users.length + audience.lists.length === 0;

  console.log("AAAAAAAAAAAAAAA");

  const recipients = await prisma.user.findMany({
    include: { pushRegistrations: true },
    where: {
      notifiedOffers: {
        none: {
          offerId: offer.id,
        },
      },
      AND: [
        {
          OR: [
            {
              followedBy: {
                some: {
                  followerId: user.id,
                },
              },
            },
            {
              following: {
                some: {
                  followingId: user.id,
                },
              },
            },
          ],
        },
      ],
      ...(toEverybody
        ? {}
        : {
            OR: [
              {
                id: {
                  in: audience.users,
                },
              },
              {
                listMemebers: {
                  some: {
                    listId: {
                      in: audience.lists,
                    },
                  },
                },
              },
            ],
          }),
    },
  });

  console.log("BBBBBBBBBBB", recipients);

  await prisma.notifiedOffers.createMany({
    data: recipients.map((user) => ({
      offerId: offer.id,
      userId: user.id,
    })),
  });

  sendPushNotifications(
    recipients.flatMap((user) => user.pushRegistrations),
    {
      type: "offer",
      payload: {
        from: { name: user.name, id: user.id },
        offer: { id: offer.id },
      },
    }
  );

  for (const recipient of recipients) {
    if (recipient.useEmailNotif && recipient.email)
      sendMail(
        {
          name: recipient.name!,
          address: recipient.email!,
        },
        <OfferMail
          offerrer={user.name ?? user.id}
          offer={offer}
          recipient={recipient}
        />
      );
  }
}
