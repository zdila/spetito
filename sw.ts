/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

import { get } from "idb-keyval";

const resources = self.__WB_MANIFEST; // just to satisfy Workbox InjectManifest plugin

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  if (Notification?.permission !== "granted") {
    return;
  }

  const data = event.data?.json() ?? {};

  switch (data.type) {
    case "invite":
      event.waitUntil(
        get("notifTranslations").then((m) =>
          Promise.all([
            self.registration.showNotification(
              m?.invite?.title ?? "Spetito friend request",
              {
                body: (
                  m?.invite?.body ??
                  "<_> is sending you a friend request on Spetito."
                ).replace("<_>", data.payload.from.name),
                // icon: ..., TODO user's avatar
                data,
              }
            ),
            self.clients.matchAll({ type: "window" }).then((clientList) => {
              for (const client of clientList) {
                client.postMessage({ type: "refreshInvites" });
              }
            }),
          ])
        )
      );

      break;
    case "accept":
      event.waitUntil(
        get("notifTranslations").then((m) =>
          Promise.all([
            self.registration.showNotification(
              m?.invite?.title ?? "Spetito friend request accepted",
              {
                body: (
                  m?.accept?.body ??
                  "<_> has accepted your friend request on Spetito."
                ).replace("<_>", data.payload.from.name),

                // icon: ..., TODO user's avatar
                data,
              }
            ),
            self.clients.matchAll({ type: "window" }).then((clientList) => {
              for (const client of clientList) {
                client.postMessage({ type: "refreshFriends" });
              }
            }),
          ])
        )
      );

      break;
    case "offer":
      event.waitUntil(
        get("notifTranslations").then((m) =>
          Promise.all([
            self.registration.showNotification(
              m?.offer?.title ?? "New offer on Spetito",
              {
                body: (
                  m?.offer?.body ?? "<_> placed a new offer on Spetito."
                ).replace("<_>", data.payload.from.name),
                // icon: ..., TODO user's avatar
                data,
              }
            ),
            self.clients.matchAll({ type: "window" }).then((clientList) => {
              for (const client of clientList) {
                client.postMessage({ type: "refreshOffers" });
              }
            }),
          ])
        )
      );

      break;
    default:
      // ignore
      break;
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const type = event.notification.data?.type;

  if (!["invite", "accept", "offer"].includes(type)) {
    return;
  }

  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        const { pathname } = new URL(client.url);

        if (
          "focus" in client &&
          ((type === "offer" && pathname === "/") ||
            ((type === "invite" || type === "accept") &&
              pathname === "/friends"))
        ) {
          return client.focus();
        }
      }

      return self.clients.openWindow(type === "offer" ? "/" : "/friends");
    })
  );
});
