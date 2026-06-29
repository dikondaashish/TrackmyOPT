"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";
import {
  getStoredCookieConsent,
  setStoredCookieConsent,
  type CookieConsentStatus,
} from "@/lib/cookie-consent";
import { setPostHogAnalyticsConsent } from "@/lib/posthog/posthog-browser";

function loadAdSense() {
  try {
    if (document.getElementById("adsense-script")) return;
    const script = document.createElement("script");
    script.id = "adsense-script";
    script.async = true;
    script.src =
      "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4262248775973692";
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);
  } catch (error) {
    console.warn("Third-party init failed: AdSense", error);
  }
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [consent, setConsent] = useState<CookieConsentStatus>(null);

  useEffect(() => {
    const stored = getStoredCookieConsent();
    setConsent(stored);
    if (stored === "accepted") {
      try {
        setPostHogAnalyticsConsent(true);
      } catch (error) {
        console.warn("Third-party init failed: PostHog consent", error);
      }
      loadAdSense();
    } else if (stored === "declined") {
      try {
        setPostHogAnalyticsConsent(false);
      } catch (error) {
        console.warn("Third-party init failed: PostHog consent", error);
      }
    }
    if (stored === null) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = useCallback(() => {
    setStoredCookieConsent("accepted");
    setConsent("accepted");
    setVisible(false);
    try {
      setPostHogAnalyticsConsent(true);
    } catch (error) {
      console.warn("Third-party init failed: PostHog consent", error);
    }
    loadAdSense();
  }, []);

  const handleDecline = useCallback(() => {
    setStoredCookieConsent("declined");
    setConsent("declined");
    setVisible(false);
    setPostHogAnalyticsConsent(false);
  }, []);

  if (!visible || consent !== null) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 sm:p-6 animate-in slide-in-from-bottom-5 duration-500">
      <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/30 p-6">
        <div className="flex items-start gap-4">
          <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex-shrink-0">
            <Cookie className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
              We value your privacy
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              We use essential cookies to keep TrackMyOPT running. With your
              consent, we also use product analytics (PostHog) to improve the app
              and advertising cookies (AdSense) to support free content. Choose
              Essential Only to skip analytics and ads.{" "}
              <Link
                href="/cookie-policy"
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Cookie Policy
              </Link>
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-4">
              <button
                onClick={handleAccept}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
              >
                Accept All
              </button>
              <button
                onClick={handleDecline}
                className="px-6 py-2.5 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
              >
                Essential Only
              </button>
              <Link
                href="/cookie-policy"
                className="px-6 py-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm font-medium text-center transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
          <button
            onClick={handleDecline}
            className="flex-shrink-0 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800"
            aria-label="Dismiss cookie banner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
