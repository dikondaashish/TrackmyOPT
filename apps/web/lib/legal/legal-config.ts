/**
 * Central legal & compliance configuration for TrackMyOPT.
 * ATTORNEY REVIEW REQUIRED before production reliance on this copy.
 */

export const LEGAL_EFFECTIVE_DATE = 'May 31, 2026';
export const LEGAL_VERSION_ID = '2026-05-31';
const PRIVACY_CHOICES_EFFECTIVE_DATE = 'July 26, 2026';
export const PRIVACY_CHOICES_VERSION_ID = '2026-07-26';

export const COMPANY = {
  legalName: 'Zyene, Inc.',
  productName: 'TrackMyOPT',
  stateOfIncorporation: 'Delaware',
  headquarters: 'San Francisco, California',
  website: 'https://www.trackmyopt.com',
} as const;

export const LEGAL_CONTACT = {
  support: 'support@trackmyopt.com',
  privacy: 'privacy@trackmyopt.com',
  security: 'security@trackmyopt.com',
} as const;

/** Use wherever USCIS case-status API/features are described. Not product "USCIS approval." */
export const USCIS_API_DISCLOSURE =
  'TrackMyOPT retrieves case-status information using USCIS Case Status API access. TrackMyOPT is independent software and is not affiliated with, endorsed by, or operated by USCIS, DHS, SEVP, ICE, or any U.S. government agency. Case-status information is provided for convenience and should be verified with official USCIS notices and accounts.';

export const USCIS_API_DISCLOSURE_SHORT =
  'Case-status information is retrieved using USCIS Case Status API access. TrackMyOPT is independent software and is not affiliated with USCIS or any government agency.';

export const CASE_STATUS_DISCLAIMER =
  'Case status information is provided for convenience and may be delayed, incomplete, unavailable, or different from official USCIS notices. Always verify important updates through official USCIS channels, your DSO, employer, or a licensed immigration attorney.';

export const CASE_STATUS_ALERT_DISCLAIMER =
  'Alerts are convenience notifications only and may not reflect every USCIS update. You remain responsible for monitoring your official USCIS account, paper notices, DSO/employer requirements, and deadlines.';

export const EXTENSION_PRIVACY_SHORT =
  'Designed to minimize data collection. Depending on how you use TrackMyOPT, we may process account, usage, case-status, notification, billing, and optional analytics data as described in our Privacy Policy.';

export const EXTENSION_FEATURE_DISCLAIMER =
  'The extension is a convenience tool for accessing TrackMyOPT workflows. It is not a government service, does not provide legal advice, and does not guarantee immigration outcomes.';

// ATTORNEY REVIEW REQUIRED before publishing this new autofill disclosure or
// treating it as a versioned policy update. The policy version/effective date
// intentionally remain unchanged until the owner approves that release step.
export const EXTENSION_AUTOFILL_PRIVACY_DISCLOSURE =
  "When you explicitly choose Prefill, Continuous, or Guided Autopilot, the Chrome extension may read the open application form and place eligible information from your dedicated job-portal prefill profile and the active job-scoped generated resume into empty fields. The dedicated profile may include job-application contact information, address, LinkedIn, GitHub, and website details and is separate from your normal TrackMyOPT account profile. A generated resume artifact is kept in extension session storage for up to 30 minutes and is invalidated when the normalized job URL, company, or role changes. Optional AI screening drafts and cover letters send the current job description and the active generated-resume snapshot to our AI provider; drafts require your review and are never generated for sensitive questions. You may optionally save work-authorization, visa, sponsorship, citizenship, annual or hourly compensation, in-person/relocation/start/transportation/accommodation preferences, date-of-birth, sex/gender, race/ethnicity, veteran, disability, and EEO answers in a separate server-side record protected with authenticated encryption. You may also save one default job-portal login in that encrypted record. The same default email address and password are made available for your review across third-party employer and applicant-tracking portals, regardless of hostname. Reusing one login across unrelated portals increases the potential impact if any one portal is compromised. The extension never uses this credential on TrackMyOPT pages, never places it in browser sync storage, and keeps the password masked in its review panel. Because TrackMyOPT's server must decrypt a saved portal password to provide the autofill feature, this credential storage is not end-to-end encryption and should not be used for your TrackMyOPT password or a primary password used for sensitive accounts. Credentials and private answers are never guessed or sent to AI, logs, or analytics. The extension loads saved private data into a review panel, and it cannot use it until you approve it for the current application. Approval is cleared when the application or page changes. When filled, the selected credential or answer is disclosed to the employer or applicant-tracking system operating that page. You can edit or delete saved private data on the Chrome Job Prefill page. Guided Autopilot may click narrowly allowlisted non-submit Next, Continue, or Done controls after required fields are complete, but it stops at Review and never clicks Submit, Apply, Finish, or another final application action. Login credentials never trigger Login, Continue, Next, Create Account, or Submit. The extension does not replace non-empty fields or existing files, fill password-change, security-answer, financial, SSN, date-of-birth, authentication-code, OTP, MFA, PIN, or other uncertain password-type fields, or answer Social Security number questions. Autofill analytics contain only bounded counts, feature states, adapter and mode identifiers, navigation outcomes, and content-free error categories—not resume, answer, field, employer, school, job-title, URL, hash, file content, credentials, or private application answers.";

export const EXTENSION_AUTOFILL_SUPPORT_NOTICE =
  'Free includes Step-by-step profile/resume/history prefill, optional skills, review-required private answers and one shared default job-portal login, 5 AI screening drafts per month, and 1 AI cover letter per month. Pro adds Continuous filling, opt-in Guided Autopilot, and higher daily AI access. Optional private application data is encrypted separately, never guessed or processed by AI, and requires approval in the extension for every application before filling. The same default portal login may be offered on different third-party job portals after per-application review and approval. It remains masked in the extension panel and is skipped on password-change, security-answer, financial, SSN, date-of-birth, authentication-code, OTP, MFA, PIN, uncertain password-type, and TrackMyOPT pages. Guided Autopilot can advance safe Next/Continue/Done steps for application fields, pauses for required or review-needed answers, and always stops before final submission. Credential filling itself never clicks Login, Continue, Next, Create Account, or Submit. Press Escape or Stop at any time. TrackMyOPT never submits an application; review every field and attachment yourself.';

/** Phrases that must not appear in customer-facing product copy (tests scan for these). */
export const RISKY_MARKETING_PHRASES = [
  'uscis approved',
  'approved by uscis',
  'government approved',
  'official uscis partner',
  'uscis partner',
  'endorsed by uscis',
  'guaranteed approval',
  'guaranteed opt',
  'zero personal data',
  'no personal data',
  'no analytics',
  'bank-grade',
  'soc 2 type ii',
  'soc 2 certified',
  'end-to-end encryption',
  'encrypted end-to-end',
  'official government app',
  'official uscis app',
  'official uscis api',
  'official uscis case status',
  'authorized access',
  'authorized uscis',
  'powered by uscis',
  'real-time uscis',
  'instant uscis',
  'accurate uscis status',
  'instant status change alerts',
  'instant status change',
  'real-time status',
  'personalized strategy plan',
] as const;

/** Policy version IDs (YYYY-MM-DD). Bump when copy changes materially. */
export const LEGAL_POLICY_VERSIONS = {
  privacy_policy: PRIVACY_CHOICES_VERSION_ID,
  terms_of_service: LEGAL_VERSION_ID,
  refund_policy: LEGAL_VERSION_ID,
  disclaimer: LEGAL_VERSION_ID,
  cookie_policy: PRIVACY_CHOICES_VERSION_ID,
  subscription_billing_terms: LEGAL_VERSION_ID,
  security_page: LEGAL_VERSION_ID,
} as const;

export type LegalPolicyType = keyof typeof LEGAL_POLICY_VERSIONS;

export const LEGAL_FOOTER_LINKS = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Refund Policy', href: '/refund-policy' },
  { label: 'Disclaimer', href: '/disclaimer' },
  { label: 'Cookie Policy', href: '/cookie-policy' },
  { label: 'Security', href: '/security' },
  { label: 'Contact', href: '/contact' },
] as const;

/** Third parties actually used in the product (keep in sync with codebase). */
export const THIRD_PARTY_SERVICES = [
  {
    name: 'Supabase',
    purpose: 'Authentication, database, and file storage',
    privacyUrl: 'https://supabase.com/privacy',
  },
  {
    name: 'Stripe',
    purpose:
      'Payment processing and subscription billing (we do not store full card numbers)',
    privacyUrl: 'https://stripe.com/privacy',
  },
  {
    name: 'Google OAuth',
    purpose: 'Optional sign-in with Google',
    privacyUrl: 'https://policies.google.com/privacy',
  },
  {
    name: 'Email delivery (SMTP)',
    purpose:
      'Transactional emails (e.g. ZeptoMail, Resend, or other configured SMTP provider)',
    privacyUrl: null,
  },
  {
    name: 'PostHog',
    purpose:
      'Optional browser analytics with consent, plus limited server-side service events for security, billing, reliability, and core feature operation',
    privacyUrl: 'https://posthog.com/privacy',
  },
  {
    name: 'Google Analytics (GA4)',
    purpose:
      'Website analytics when you accept analytics cookies in the cookie banner',
    privacyUrl: 'https://policies.google.com/privacy',
  },
  {
    name: 'Google AdSense',
    purpose:
      'Advertising on free content pages when you accept cookies in the cookie banner',
    privacyUrl: 'https://policies.google.com/privacy',
  },
  {
    name: 'Vercel Analytics & Speed Insights',
    purpose: 'Aggregated site performance and usage metrics',
    privacyUrl: 'https://vercel.com/legal/privacy-policy',
  },
  {
    name: 'Google Gemini',
    purpose:
      'Optional AI features (e.g. resume tools) when you use those features',
    privacyUrl: 'https://policies.google.com/privacy',
  },
  {
    name: 'USCIS Case Status API',
    purpose:
      'Case status lookups using receipt numbers you provide (USCIS Case Status API access)',
    privacyUrl: 'https://www.uscis.gov',
  },
] as const;

// --- Subscription billing (also used at checkout) ---

export type PaidPlanId = 'pro' | 'dedicated';
export type BillingInterval = 'month' | 'year';

export const PLAN_DISPLAY_PRICES = {
  pro: { month: 4.99, year: 49.99 },
  dedicated: { month: 14.99, year: 149.99 },
} as const;

export const PRO_TRIAL_DAYS = 7;
export const DEDICATED_MONEY_BACK_DAYS = 3;

function formatUsd(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function getBillingFrequencyLabel(interval: BillingInterval): string {
  return interval === 'year' ? 'every year' : 'every month';
}

function getPlanBillingSummary(
  planId: PaidPlanId,
  interval: BillingInterval,
  options?: { includeProTrial?: boolean }
) {
  const amount = PLAN_DISPLAY_PRICES[planId][interval];
  const frequencyLabel = getBillingFrequencyLabel(interval);
  const cancelMethod =
    'Dashboard → Settings → Subscription → Cancel subscription (opens Stripe billing portal)';

  if (planId === 'pro' && options?.includeProTrial) {
    return {
      amountLabel: formatUsd(amount),
      frequencyLabel,
      trialDays: PRO_TRIAL_DAYS,
      moneyBackDays: null,
      autoRenewLine: `After your ${PRO_TRIAL_DAYS}-day free trial, your card will be charged ${formatUsd(amount)} ${frequencyLabel} unless you cancel before the trial ends.`,
      cancelMethod,
    };
  }

  if (planId === 'dedicated') {
    return {
      amountLabel: formatUsd(amount),
      frequencyLabel,
      trialDays: null,
      moneyBackDays: DEDICATED_MONEY_BACK_DAYS,
      autoRenewLine: `You are charged ${formatUsd(amount)} ${frequencyLabel} today. Your subscription renews automatically until you cancel.`,
      cancelMethod,
    };
  }

  return {
    amountLabel: formatUsd(amount),
    frequencyLabel,
    trialDays: null,
    moneyBackDays: null,
    autoRenewLine: `You will be charged ${formatUsd(amount)} ${frequencyLabel}. Your subscription renews automatically until you cancel.`,
    cancelMethod,
  };
}

/** Inline consent copy on PricingModal paid plan cards (before Stripe). */
export function getPricingModalProConsentLabel(params: {
  interval: BillingInterval;
  monthlyPrice: number;
  yearlyPrice: number;
  includeTrial: boolean;
}): string {
  const price =
    params.interval === 'year'
      ? `$${params.yearlyPrice.toFixed(2)}/year`
      : `$${params.monthlyPrice.toFixed(2)}/month`;

  if (params.includeTrial) {
    return `I agree Pro starts with a 7-day free trial, then renews at ${price} unless I cancel before the trial ends.`;
  }
  return `I agree Pro renews at ${price} unless I cancel.`;
}

/** Inline consent copy on PricingModal Dedicated card (charged today, not after money-back window). */
export function getPricingModalDedicatedConsentLabel(params: {
  interval: BillingInterval;
  monthlyPrice: number;
  yearlyPrice: number;
}): string {
  if (params.interval === 'year') {
    return `I agree Dedicated is charged today at $${params.yearlyPrice.toFixed(2)}/year, renews annually until canceled, and the 3-day money-back guarantee applies only to the first paid term.`;
  }
  return `I agree Dedicated is charged today at $${params.monthlyPrice.toFixed(2)}/month, renews monthly until canceled, and the 3-day money-back guarantee applies only to the first paid month.`;
}

export function buildCheckoutDisclosures(params: {
  planId: PaidPlanId;
  interval: BillingInterval;
  includeProTrial: boolean;
}) {
  const summary = getPlanBillingSummary(params.planId, params.interval, {
    includeProTrial: params.includeProTrial,
  });

  return {
    policyVersions: LEGAL_POLICY_VERSIONS,
    headline: 'This is an auto-renewing subscription.',
    amountLine: `Plan: ${params.planId === 'dedicated' ? 'Dedicated' : 'Pro'}. Price: ${summary.amountLabel} billed ${summary.frequencyLabel}.`,
    renewalLine: summary.autoRenewLine,
    trialLine:
      summary.trialDays != null
        ? `Free trial: ${summary.trialDays} days. You will not be charged if you cancel before the trial ends.`
        : null,
    dedicatedRefundLine:
      summary.moneyBackDays != null
        ? `Dedicated: ${summary.moneyBackDays}-day money-back guarantee on your first paid month only (see Refund Policy).`
        : null,
    cancelLine: `How to cancel: ${summary.cancelMethod}. Cancellation stops future charges only; you keep access through the end of your current paid period.`,
    noRefundAfterWindow:
      params.planId === 'pro' && params.includeProTrial
        ? 'After the trial, we do not offer refunds for change of mind. See our Refund Policy for exceptions.'
        : params.planId === 'dedicated'
          ? `After the ${DEDICATED_MONEY_BACK_DAYS}-day first-month window, we do not offer refunds for change of mind. See our Refund Policy for exceptions.`
          : 'We do not offer refunds for change of mind after purchase. See our Refund Policy for exceptions.',
    consentLabel:
      'I agree this is an auto-renewing subscription and authorize recurring charges as described. I have read the Terms of Service, Refund Policy, and Privacy Policy.',
  };
}

export const MATERIAL_CHANGE_NOTICE =
  'We will email active subscribers before material changes to price, renewal, cancellation, or refund terms take effect.';

export function formatPolicyVersionLabel(policyType: LegalPolicyType): string {
  const version = LEGAL_POLICY_VERSIONS[policyType];
  const effectiveDate =
    version === PRIVACY_CHOICES_VERSION_ID
      ? PRIVACY_CHOICES_EFFECTIVE_DATE
      : LEGAL_EFFECTIVE_DATE;
  return `${effectiveDate} · Version ${version}`;
}
