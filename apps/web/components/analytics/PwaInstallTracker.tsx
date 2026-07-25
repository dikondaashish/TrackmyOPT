"use client";

import { useEffect, useRef } from "react";
import { capturePwaInstalled } from "@/lib/posthog-client";

const PWA_INSTALLED_KEY = "tmo:pwa_installed_captured";

/**
 * Phase 4: capture `pwa_installed` when the browser fires `appinstalled`.
 * Also listens for `beforeinstallprompt` so we know install eligibility (no UI yet).
 */
export function PwaInstallTracker() {
  const capturedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const markInstalled = () => {
      if (capturedRef.current) return;
      try {
        if (localStorage.getItem(PWA_INSTALLED_KEY) === "1") {
          capturedRef.current = true;
          return;
        }
        localStorage.setItem(PWA_INSTALLED_KEY, "1");
      } catch {
        /* ignore */
      }
      capturedRef.current = true;
      capturePwaInstalled({ source: "appinstalled" });
    };

    window.addEventListener("appinstalled", markInstalled);

    // Already running as installed PWA (standalone / iOS home screen).
    try {
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        // @ts-expect-error iOS Safari
        Boolean(window.navigator.standalone);
      if (standalone) markInstalled();
    } catch {
      /* ignore */
    }

    return () => {
      window.removeEventListener("appinstalled", markInstalled);
    };
  }, []);

  return null;
}
