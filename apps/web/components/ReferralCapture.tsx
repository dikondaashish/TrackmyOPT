"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { safeStorageGet, safeStorageSet } from "@/lib/safe-storage";

/**
 * Captures ?ref= query param from the URL, stores it in localStorage,
 * and fires a click-tracking event to the API.
 * 
 * Usage: Place this component inside any page that might receive referral traffic.
 * It renders nothing — purely side-effect based.
 */
export function ReferralCapture() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (!ref || ref.length > 50) return;

    // Sanitize: only allow alphanumeric, hyphens, underscores
    const sanitized = ref.replace(/[^a-zA-Z0-9_-]/g, "").toLowerCase();
    if (!sanitized) return;

    // Don't overwrite an existing referral (first touch attribution)
    if (safeStorageGet("trackmyopt_ref")) return;

    // Store for later use during signup. Attribution is best-effort — when
    // storage is unavailable the click below is still tracked.
    safeStorageSet("trackmyopt_ref", sanitized);

    // Track the click (fire-and-forget)
    fetch("/api/referral/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: sanitized }),
    }).catch(() => {
      // Silently ignore tracking failures
    });
  }, [searchParams]);

  return null;
}
