import { webpush } from "../lib/webpush";
import { PushRegistration } from "@prisma/client";
import { WebPushError } from "web-push";
import { prisma } from "../lib/prisma";

export function sendPushNotifications(
  pushRegistrations: PushRegistration[],
  payload: Record<string, unknown>
) {
  const pnPayload = JSON.stringify(payload);

  Promise.all(
    pushRegistrations.map((pushRegistration) =>
      webpush
        .sendNotification(
          {
            endpoint: pushRegistration.endpoint,
            keys: {
              auth: pushRegistration.auth.toString("base64url"),
              p256dh: pushRegistration.p256dh.toString("base64url"),
            },
          },
          pnPayload
        )
        .catch((err) => {
          if (
            err instanceof WebPushError &&
            err.body.startsWith("push subscription has unsubscribed or expired")
          ) {
            return prisma.pushRegistration.deleteMany({
              where: {
                endpoint: err.endpoint,
              },
            });
          } else {
            console.log("Error sending push", err);
          }
        })
    )
  ).catch((err) => {
    console.log("Error sending pushes", err);
  });
}
