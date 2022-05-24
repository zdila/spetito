self.addEventListener("push", (event) => {
  if (!self.Notification || self.Notification.permission !== "granted") {
    return;
  }

  self.registration.showNotification("Hello");

  const data = event.data ? event.data.json() : {};
});
