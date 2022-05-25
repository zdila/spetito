self.addEventListener("push", (event) => {
  if (self.Notification?.permission !== "granted") {
    return;
  }

  const data = event.data?.json() ?? {};

  switch (data.action) {
    case "invite":
      event.waitUntil(
        Promise.all([
          self.registration.showNotification("Offerbook friend request", {
            body:
              data.payload.from.name +
              " is sending you a friend request on Offerbook.",
            // icon: ..., TODO user's avatar
          }),
        ]),
        clients.matchAll({ type: "window" }).then((clientList) => {
          for (const client of clientList) {
            client.postMessage({ action: "refreshInvites" });
          }
        })
      );
    default:
    // ignore
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      const { pathname } = new URL(client.url);

      for (const client of clientList) {
        if (pathname === "/contacts" && "focus" in client) {
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow("/contacts");
      }
    })
  );
});
