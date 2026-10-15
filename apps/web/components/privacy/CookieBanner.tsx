'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Cookie } from 'lucide-react';
import {
  acceptAllOptional,
  openPrivacySettings,
  rejectAllOptional,
} from '@/lib/privacy/privacy-manager';

/** Keeps the banner out of the largest-contentful-paint window. */
const BANNER_DELAY_MS = 1500;

const choiceButton =
  'min-h-11 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900';
// Accept and Reject share one style so neither choice is visually favored.
const primaryChoice = `${choiceButton} bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500`;
const secondaryChoice = `${choiceButton} border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 focus-visible:ring-gray-400 dark:border-zinc-600 dark:bg-zinc-900 dark:text-gray-100 dark:hover:bg-zinc-800`;

/**
 * First-layer notice for opt-in jurisdictions. Non-modal: the site stays
 * usable, and nothing optional runs while it is open. It stays mounted
 * (hidden) while Customize is open so the dialog can restore focus to it.
 */
export function CookieBanner({ hidden = false }: { hidden?: boolean }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), BANNER_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      hidden={hidden}
      className="fixed bottom-0 left-0 right-0 z-[9999] p-3 sm:p-6 animate-in slide-in-from-bottom-5 duration-500"
      role="region"
      aria-label="Privacy choices"
      aria-describedby="privacy-banner-description"
    >
      <div className="mx-auto max-w-4xl rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl shadow-black/10 dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-black/30 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="hidden h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30 sm:flex">
            <Cookie className="h-6 w-6 text-blue-600 dark:text-blue-400" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="mb-1 text-base font-semibold text-gray-900 dark:text-white">
              Your privacy choices
            </h2>
            <p
              id="privacy-banner-description"
              className="text-sm leading-relaxed text-gray-600 dark:text-gray-300"
            >
              We use essential cookies to keep TrackMyOPT working and secure.
              With your permission, we&apos;d also like to measure how the site
              is used and show ads on free articles. You can change this any
              time from &ldquo;Your Privacy Choices&rdquo;.{' '}
              <Link
                href="/cookie-policy"
                className="font-medium text-blue-700 underline-offset-2 hover:underline dark:text-blue-300"
              >
                Cookie Policy
              </Link>
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
              <button type="button" onClick={acceptAllOptional} className={primaryChoice}>
                Accept all
              </button>
              <button type="button" onClick={rejectAllOptional} className={primaryChoice}>
                Reject non-essential
              </button>
              <button type="button" onClick={openPrivacySettings} className={secondaryChoice}>
                Customize
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
