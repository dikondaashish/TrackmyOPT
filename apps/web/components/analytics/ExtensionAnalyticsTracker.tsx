"use client";

import { useEffect, useRef } from "react";
import { useExtensionDetector } from "@/hooks/useExtensionDetector";
import { captureExtensionDetected } from "@/lib/posthog-client";

const EXTENSION_DETECTED_SESSION_KEY = "tmo:extension_detected_captured";

function resolveExtensionVersion(): string | null {
  if (typeof document === "undefined") return null;

  const attr = document.documentElement?.getAttribute("data-trackmyopt-extension");
  if (attr && attr !== "true") return attr;

  try {
    return localStorage.getItem("tmo_extension_version");
  } catch {
    return null;
  }
}

/** Fires `extension_detected` once per browser session when the Chrome extension is present. */
export function ExtensionAnalyticsTracker() {
  const { isExtensionInstalled, isLoading } = useExtensionDetector();
  const trackedRef = useRef(false);

  useEffect(() => {
    if (isLoading || !isExtensionInstalled || trackedRef.current) return;
    if (sessionStorage.getItem(EXTENSION_DETECTED_SESSION_KEY)) return;

    trackedRef.current = true;
    sessionStorage.setItem(EXTENSION_DETECTED_SESSION_KEY, "1");
    captureExtensionDetected({ version: resolveExtensionVersion() });
  }, [isExtensionInstalled, isLoading]);

  return null;
}
