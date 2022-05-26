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
    default:
      // ignore
      break;
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const type = event.notification.data?.type;

  if (type !== "invite" && invite !== "accept") {
    return;
  }

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      const { pathname } = new URL(client.url);

      for (const client of clientList) {
        if (
          (pathname === "/friends" ||
            (invite === "accept" && pathname === "/")) &&
          "focus" in client
        ) {
          return client.focus();
        }
      }

      return clients?.openWindow("/friends");
    })
  );
});
