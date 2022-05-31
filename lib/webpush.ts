import webpush from "web-push";

export { webpush };

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT as string,
  process.env.NEXT_PUBLIC_VAPID_PUBKEY as string,
  process.env.VAPID_PVTKEY as string
);
