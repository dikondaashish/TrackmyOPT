"use client";

import { useState, useEffect, useCallback } from "react";

function detectExtensionInDocument(): boolean {
  if (typeof document === "undefined") return false;

  if (document.getElementById("trackmyopt-extension-installed")) return true;

  if (
    document.documentElement?.hasAttribute("data-trackmyopt-extension") ||
    document.body?.hasAttribute("data-trackmyopt-extension")
  ) {
    return true;
  }

  if ((window as unknown as { __TRACKMYOPT_EXTENSION_INSTALLED__?: boolean }).__TRACKMYOPT_EXTENSION_INSTALLED__ === true) {
    return true;
  }

  return false;
}

/**
 * Detects whether the TrackMyOPT Chrome extension is present for this origin.
 * The extension content script sets a hidden marker, `data-trackmyopt-extension` on `<html>`,
 * and dispatches `trackmyopt-extension-loaded` (see apps/extension/src/content.ts).
 */
export function useExtensionDetector() {
  const [isInstalled, setIsInstalled] = useState<boolean | null>(null);

  const runCheck = useCallback(() => {
    setIsInstalled(detectExtensionInDocument());
  }, []);

  useEffect(() => {
    runCheck();

    const onExtensionSignal = () => runCheck();
    window.addEventListener("trackmyopt-extension-loaded", onExtensionSignal);

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "TMO_EXTENSION_PRESENT") {
        runCheck();
      }
    };
    window.addEventListener("message", onMessage);

    const pingId = window.setTimeout(() => {
      try {
        window.postMessage({ type: "TMO_CHECK_EXTENSION" }, window.location.origin);
      } catch {
        /* ignore */
      }
      runCheck();
    }, 100);

    // Content scripts can run after first paint; poll briefly for the marker.
    const pollId = window.setInterval(() => {
      if (detectExtensionInDocument()) {
        setIsInstalled(true);
        window.clearInterval(pollId);
      }
    }, 250);

    const stopPoll = window.setTimeout(() => {
      window.clearInterval(pollId);
      setIsInstalled(detectExtensionInDocument());
    }, 6000);

    const timeoutId = window.setTimeout(() => {
      runCheck();
    }, 2000);

    return () => {
      window.removeEventListener("trackmyopt-extension-loaded", onExtensionSignal);
      window.removeEventListener("message", onMessage);
      window.clearInterval(pollId);
      window.clearTimeout(stopPoll);
      window.clearTimeout(timeoutId);
      window.clearTimeout(pingId);
    };
  }, [runCheck]);

  return {
    isExtensionInstalled: isInstalled === true,
    isLoading: isInstalled === null,
  };
}
