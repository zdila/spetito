self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener("push", (event) => {
  if (self.Notification?.permission !== "granted") {
    return;
  }

  const data = event.data?.json() ?? {};

  switch (data.type) {
    case "invite":
      event.waitUntil(
        Promise.all([
          self.registration.showNotification("Offerbook friend request", {
            body:
              data.payload.from.name +
              " is sending you a friend request on Offerbook.",
            // icon: ..., TODO user's avatar
            data,
          }),
        ]),
        clients.matchAll({ type: "window" }).then((clientList) => {
          for (const client of clientList) {
            client.postMessage({ type: "refreshInvites" });
          }
        })
      );

      break;
    case "accept":
      event.waitUntil(
        Promise.all([
          self.registration.showNotification(
            "Offerbook friend request accepted",
            {
              body:
                data.payload.from.name +
                " has accepted your friend request on Offerbook.",
              // icon: ..., TODO user's avatar
              data,
            }
          ),
        ]),
        clients.matchAll({ type: "window" }).then((clientList) => {
          for (const client of clientList) {
            client.postMessage({ type: "refreshFriends" });
          }
        })
      );

      break;
    case "offer":
      event.waitUntil(
        Promise.all([
          self.registration.showNotification("New offer on Offerbook", {
            body: data.payload.from.name + " placed a new offer on Offerbook.",
            // icon: ..., TODO user's avatar
            data,
          }),
        ]),
        clients.matchAll({ type: "window" }).then((clientList) => {
          for (const client of clientList) {
            client.postMessage({ type: "refreshOffers" });
          }
        })
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
    clients.matchAll({ type: "window" }).then((clientList) => {
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

      return clients?.openWindow(type === "offer" ? "/" : "/friends");
    })
  );
});
