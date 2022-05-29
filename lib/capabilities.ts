export const supportsPush = Boolean(
  typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    "PushManager" in window &&
    navigator.permissions &&
    navigator.serviceWorker
);
