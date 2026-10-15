'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import {
  hasConsent,
  openPrivacySettings,
  startPrivacyManager,
} from '@/lib/privacy/privacy-manager';
import { CookieBanner } from '@/components/privacy/CookieBanner';
import { PrivacySettingsDialog } from '@/components/privacy/PrivacySettingsDialog';
import { usePrivacy } from '@/components/privacy/use-privacy';

/**
 * Vercel's scripts keep this callback after the component unmounts, so a
 * revoked visitor's queued events are dropped too.
 */
function dropUnlessAnalyticsAllowed<T>(event: T): T | null {
  return hasConsent('analytics') ? event : null;
}

/**
 * Mounted once in the root layout, so it persists across client navigation.
 * Owns the consent UI and the consent-gated Vercel components.
 */
export function PrivacyProvider() {
  const privacy = usePrivacy();
  const pathname = usePathname();
  const onDashboard = pathname?.startsWith('/dashboard') ?? false;

  useEffect(() => {
    startPrivacyManager();
  }, []);

  const showShortcut =
    privacy.status === 'ready' &&
    privacy.hasDecision &&
    !privacy.needsBanner &&
    !privacy.settingsOpen &&
    !onDashboard;

  return (
    <>
      {privacy.status === 'ready' && privacy.choices.analytics ? (
        <>
          <Analytics beforeSend={dropUnlessAnalyticsAllowed} />
          <SpeedInsights beforeSend={dropUnlessAnalyticsAllowed} />
        </>
      ) : null}
      {privacy.needsBanner ? <CookieBanner hidden={privacy.settingsOpen} /> : null}
      <PrivacySettingsDialog />
      {showShortcut ? (
        <button
          type="button"
          onClick={openPrivacySettings}
          className="fixed bottom-4 right-4 z-[9998] inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white/95 text-gray-700 shadow-lg backdrop-blur transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-zinc-700 dark:bg-zinc-900/95 dark:text-gray-200 dark:hover:bg-zinc-800 dark:focus-visible:ring-offset-zinc-950"
          aria-label="Open privacy choices"
          title="Privacy choices"
        >
          <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden />
        </button>
      ) : null}
    </>
  );
}
