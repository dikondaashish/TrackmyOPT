'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Cookie, ShieldCheck, X } from 'lucide-react';
import {
  getStoredCookieConsent,
  OPEN_PRIVACY_CHOICES_EVENT,
  setStoredCookieConsent,
  type CookieConsentStatus,
} from '@/lib/cookie-consent';
import { setPostHogAnalyticsConsent } from '@/lib/posthog/posthog-browser';
import { loadAdSense } from '@/lib/adsense';

const GA_ID = 'G-LD9XN0RHXH';

type GoogleConsentWindow = Window & {
  gtag?: (...args: unknown[]) => void;
};

function loadGA4() {
  try {
    if (document.getElementById('ga4-script')) return;
    const script = document.createElement('script');
    script.id = 'ga4-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);
    const init = document.createElement('script');
    init.id = 'ga4-init';
    init.textContent = `try{window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');}catch(e){console.warn('Third-party init failed: GA4',e);}`;
    document.head.appendChild(init);
  } catch (error) {
    console.warn('Third-party init failed: GA4', error);
  }
}

function denyGoogleBrowserTracking() {
  const googleWindow = window as GoogleConsentWindow;
  googleWindow.gtag?.('consent', 'update', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
  });
}

function isDashboardPath(pathname: string | null): boolean {
  return pathname?.startsWith('/dashboard') ?? false;
}

interface CookieConsentProps {
  reloadPage?: () => void;
}

export function CookieConsent({
  reloadPage = () => window.location.reload(),
}: CookieConsentProps = {}) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [consent, setConsent] = useState<CookieConsentStatus>(null);
  const onDashboard = isDashboardPath(pathname);

  useEffect(() => {
    const stored = getStoredCookieConsent();
    setConsent(stored);
    if (stored === 'accepted') {
      try {
        setPostHogAnalyticsConsent(true);
      } catch (error) {
        console.warn('Third-party init failed: PostHog consent', error);
      }
      loadAdSense();
      loadGA4();
    } else if (stored === 'declined') {
      try {
        setPostHogAnalyticsConsent(false);
      } catch (error) {
        console.warn('Third-party init failed: PostHog consent', error);
      }
    }
    if (stored === null) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const openPanel = () => setVisible(true);
    window.addEventListener(OPEN_PRIVACY_CHOICES_EVENT, openPanel);
    return () => window.removeEventListener(OPEN_PRIVACY_CHOICES_EVENT, openPanel);
  }, []);

  const handleAccept = useCallback(() => {
    setStoredCookieConsent('accepted');
    setConsent('accepted');
    setVisible(false);
    try {
      setPostHogAnalyticsConsent(true);
    } catch (error) {
      console.warn('Third-party init failed: PostHog consent', error);
    }
    loadAdSense();
    loadGA4();
  }, []);

  const handleDecline = useCallback(() => {
    const previouslyAccepted = consent === 'accepted';
    setStoredCookieConsent('declined');
    setConsent('declined');
    setVisible(false);
    setPostHogAnalyticsConsent(false);
    denyGoogleBrowserTracking();

    // Google and advertising scripts may already be active after Accept All.
    // Reload once so the page restarts without loading any optional browser tags.
    if (previouslyAccepted) reloadPage();
  }, [consent, reloadPage]);

  const handleDismiss = useCallback(() => {
    if (consent === null) {
      handleDecline();
      return;
    }
    setVisible(false);
  }, [consent, handleDecline]);

  if (!visible) {
    if (consent === null || onDashboard) return null;

    return (
      <button
        type="button"
        onClick={() => setVisible(true)}
        className="fixed bottom-4 right-4 z-[9998] inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white/95 text-gray-700 shadow-lg backdrop-blur transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-zinc-700 dark:bg-zinc-900/95 dark:text-gray-200 dark:hover:bg-zinc-800 dark:focus:ring-offset-zinc-950"
        aria-label="Open privacy choices"
        title="Privacy choices"
      >
        <ShieldCheck
          className="h-5 w-5 text-blue-600 dark:text-blue-400"
          aria-hidden
        />
      </button>
    );
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9999] p-4 sm:p-6 animate-in slide-in-from-bottom-5 duration-500"
      role="region"
      aria-label="Privacy choices"
    >
      <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/30 p-6">
        <div className="flex items-start gap-4">
          <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex-shrink-0">
            <Cookie className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
              Your privacy choices
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              TrackMyOPT uses necessary technology for login, security, and core
              features. With your permission, we also use browser-based product
              analytics (PostHog and Google Analytics) and advertising cookies
              (AdSense) to support free content. Essential Only prevents those
              optional browser tools from loading. Limited server-side events
              may still be processed for security, billing, reliability, and
              core features.{' '}
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
            {consent !== null ? (
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                Current choice:{' '}
                <strong className="font-semibold text-gray-700 dark:text-gray-200">
                  {consent === 'accepted' ? 'Accept All' : 'Essential Only'}
                </strong>
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="flex-shrink-0 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800"
            aria-label={
              consent === null ? 'Use Essential Only' : 'Close privacy choices'
            }
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
