'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  acceptAllOptional,
  openPrivacySettings,
  rejectAllOptional,
} from '@/lib/privacy/privacy-manager';

/** Keeps the banner out of the largest-contentful-paint window. */
const BANNER_DELAY_MS = 1500;

const choiceButton =
  'min-h-11 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-card';
// Accept and Reject share one style so neither choice is visually favored.
const primaryChoice = `${choiceButton} bg-primary text-primary-foreground shadow-button hover:bg-primary-hover focus-visible:ring-ring`;
const secondaryChoice = `${choiceButton} border border-input bg-background text-foreground shadow-card hover:bg-muted focus-visible:ring-ring`;

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
      <div className="mx-auto max-w-4xl rounded-xl border border-border bg-card p-5 shadow-elevated sm:p-6">
        <div className="flex items-start gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="mb-1 text-base font-semibold text-foreground">
              Your privacy choices
            </h2>
            <p
              id="privacy-banner-description"
              className="text-sm leading-relaxed text-muted-foreground"
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
