"use client";

import { useState } from "react";
import { BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

type WebPushEnableButtonProps = {
  disabled?: boolean;
};

export function WebPushEnableButton({ disabled }: WebPushEnableButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "enabled" | "unsupported" | "error">(
    "idle"
  );

  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  const enablePush = async () => {
    if (!vapidKey || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
      return;
    }

    try {
      setStatus("loading");
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("error");
        return;
      }

      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      const json = subscription.toJSON();
      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: json.endpoint,
          keys: json.keys,
        }),
      });

      if (!response.ok) {
        setStatus("error");
        return;
      }

      setStatus("enabled");
    } catch {
      setStatus("error");
    }
  };

  if (!vapidKey) return null;

  if (status === "enabled") {
    return (
      <p className="text-xs text-emerald-600 dark:text-emerald-400">
        Browser notifications enabled for this device.
      </p>
    );
  }

  if (status === "unsupported") {
    return (
      <p className="text-xs text-muted-foreground">
        Browser push is not supported on this device.
      </p>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={disabled || status === "loading"}
      onClick={enablePush}
      className="gap-2"
    >
      <BellRing className="w-4 h-4" />
      {status === "loading" ? "Enabling…" : "Enable browser alerts"}
    </Button>
  );
}
