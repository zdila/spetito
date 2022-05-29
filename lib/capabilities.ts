export const supportsPush = Boolean(
  "PushManager" in window && navigator.permissions && navigator.serviceWorker
);
