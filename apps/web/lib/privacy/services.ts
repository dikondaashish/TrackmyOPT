/**
 * Registry of every browser-side technology TrackMyOPT uses that stores or
 * reads data on the device or sends visit data to a third party.
 *
 * This is the single source of truth for classification. A non-essential
 * service must be listed here AND loaded only through
 * lib/privacy/integrations.ts or a `useConsent(category)` check.
 * docs/compliance/PRIVACY_CONSENT_ARCHITECTURE.md explains how to add one.
 */

import type { ConsentCategory } from '@/lib/privacy/types';

export interface PrivacyService {
  id: string;
  name: string;
  provider: string;
  category: ConsentCategory;
  /** Plain-English purpose, shown in the settings dialog. */
  purpose: string;
  /** Disclosure is treated as "sale/sharing"/targeted advertising for U.S. opt-outs. */
  saleOrShare?: boolean;
}

export const PRIVACY_SERVICES: readonly PrivacyService[] = [
  {
    id: 'supabase-auth',
    name: 'Sign-in session',
    provider: 'TrackMyOPT (Supabase)',
    category: 'essential',
    purpose: 'Keeps you signed in and protects your account.',
  },
  {
    id: 'privacy-preferences',
    name: 'Privacy choices',
    provider: 'TrackMyOPT',
    category: 'essential',
    purpose: 'Remembers your privacy choices and which privacy rules apply.',
  },
  {
    id: 'sentry',
    name: 'Error monitoring',
    provider: 'Sentry',
    category: 'essential',
    purpose:
      'Filtered error reports so we can fix failures. No cookies, replay, or user identity.',
  },
  {
    id: 'stripe-checkout',
    name: 'Payments',
    provider: 'Stripe',
    category: 'essential',
    purpose: 'Stripe-hosted checkout and billing portal for paid plans.',
  },
  {
    id: 'ui-preferences',
    name: 'Settings you choose',
    provider: 'TrackMyOPT',
    category: 'essential',
    purpose:
      'Remembers settings you pick yourself, such as theme, sidebar, “remember my email”, and saved resume drafts.',
  },
  {
    id: 'referral-attribution',
    name: 'Referral credit',
    provider: 'TrackMyOPT',
    category: 'functional',
    purpose: 'Remembers a referral code from a link so the person who invited you gets credit.',
  },
  {
    id: 'login-method-hint',
    name: 'Sign-in hint',
    provider: 'TrackMyOPT',
    category: 'functional',
    purpose: 'Remembers which sign-in method you used last.',
  },
  {
    id: 'posthog',
    name: 'PostHog',
    provider: 'PostHog',
    category: 'analytics',
    purpose:
      'Product analytics, feature experiments, surveys, and masked session replay.',
  },
  {
    id: 'google-analytics',
    name: 'Google Analytics 4',
    provider: 'Google',
    category: 'analytics',
    purpose: 'Website traffic measurement.',
  },
  {
    id: 'vercel-web-analytics',
    name: 'Vercel Web Analytics',
    provider: 'Vercel',
    category: 'analytics',
    purpose: 'Cookieless, aggregated page-view counts.',
  },
  {
    id: 'vercel-speed-insights',
    name: 'Vercel Speed Insights',
    provider: 'Vercel',
    category: 'analytics',
    purpose: 'Cookieless page-speed measurements.',
  },
  {
    id: 'google-adsense',
    name: 'Google AdSense',
    provider: 'Google',
    category: 'marketing',
    purpose: 'Ads on free articles; Google may use cookies for ad delivery and measurement.',
    saleOrShare: true,
  },
];

export function servicesInCategory(category: ConsentCategory): PrivacyService[] {
  return PRIVACY_SERVICES.filter((service) => service.category === category);
}
