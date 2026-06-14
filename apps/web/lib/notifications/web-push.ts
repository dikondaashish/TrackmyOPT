/**
 * Web Push helpers for case status alerts (requires VAPID keys in env).
 */

import webpush from "web-push";

export type PushSubscriptionPayload = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

function configureWebPush(): boolean {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:support@trackmyopt.com";

  if (!publicKey || !privateKey) return false;

  webpush.setVapidDetails(subject, publicKey, privateKey);
  return true;
}

export function isWebPushConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY
  );
}

export async function sendCaseStatusPush(
  subscription: PushSubscriptionPayload,
  payload: { title: string; body: string; url?: string }
): Promise<void> {
  if (!configureWebPush()) return;

  await webpush.sendNotification(
    {
      endpoint: subscription.endpoint,
      keys: subscription.keys,
    },
    JSON.stringify({
      title: payload.title,
      body: payload.body,
      url: payload.url ?? "/dashboard/case-status",
    })
  );
}
