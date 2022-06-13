import { set } from "idb-keyval";
import { TFunction } from "next-i18next";
import { useCallback, useEffect, useState } from "react";
import { toBase64 } from "./base64";

export function usePushNotificationRegistration(t: TFunction) {
  const register = useCallback(async () => {
    navigator.serviceWorker.register("/sw.js"); // no need to await

    set("notifTranslations", t("notifTranslations", { returnObjects: true }));

    const swr = await navigator.serviceWorker.ready;

    if (!(await swr?.pushManager.getSubscription())?.endpoint) {
      const subscription = await swr.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBKEY,
      });

      await fetch("/api/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          auth: toBase64(subscription.getKey("auth")),
          p256dh: toBase64(subscription.getKey("p256dh")),
        }),
      });
    }

    new BroadcastChannel("pn_setup_channel").postMessage(true);

    setRegistered(true);
  }, [t]);

  const unregister = useCallback(async () => {
    const swr = await navigator.serviceWorker.getRegistration();

    const sub = await swr?.pushManager.getSubscription();

    if (swr && sub?.endpoint) {
      await Promise.all([
        fetch("/api/push/" + encodeURIComponent(sub.endpoint), {
          method: "DELETE",
        }),
        sub.unsubscribe(),
        swr.unregister(),
      ]);

      new BroadcastChannel("pn_setup_channel").postMessage(false);

      setRegistered(false);
    }
  }, []);

  const [registered, setRegistered] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const swr = await navigator.serviceWorker.getRegistration();

      const sub = await swr?.pushManager.getSubscription();

      setRegistered(Boolean(sub?.endpoint));
    })();
  }, []);

  useEffect(() => {
    const bc = new BroadcastChannel("pn_setup_channel");

    bc.addEventListener("message", (evt) => {
      setRegistered(Boolean(evt.data));
    });
  });

  return [register, unregister, registered] as const;
}
