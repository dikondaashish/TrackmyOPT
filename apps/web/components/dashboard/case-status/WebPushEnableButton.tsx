"use client";

import { useState } from "react";
import { BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  className?: string;
};

export function WebPushEnableButton({ disabled, className }: WebPushEnableButtonProps) {
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
      <Button
        type="button"
        variant="outline"
        disabled
        className={cn(
          "flex items-center justify-center gap-2 w-full sm:w-auto",
          className
        )}
      >
        <BellRing className="w-4 h-4" />
        Browser Alerts On
      </Button>
    );
  }

  if (status === "unsupported") {
    return (
      <Button
        type="button"
        variant="outline"
        disabled
        className={cn(
          "flex items-center justify-center gap-2 w-full sm:w-auto opacity-60",
          className
        )}
      >
        <BellRing className="w-4 h-4" />
        Browser alerts unavailable
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      disabled={disabled || status === "loading"}
      onClick={enablePush}
      className={cn(
        "flex items-center justify-center gap-2 w-full sm:w-auto",
        className
      )}
    >
      <BellRing className="w-4 h-4" />
      {status === "loading" ? "Enabling…" : "Enable browser alerts"}
    </Button>
  );
}
