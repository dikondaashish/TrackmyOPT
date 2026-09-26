/**
 * Central legal & compliance configuration for TrackMyOPT.
 * ATTORNEY REVIEW REQUIRED before production reliance on this copy.
 */

import {
  DEDICATED_ATTORNEY_BENEFIT,
  PLAN_LIMITS,
  PLAN_PRICES,
  PRO_PAID_INTRO,
} from '@/lib/pricing/plan-config';

export const LEGAL_EFFECTIVE_DATE = 'August 26, 2026';
export const LEGAL_VERSION_ID = '2026-08-26';
const PRIVACY_CHOICES_EFFECTIVE_DATE = 'July 26, 2026';
export const PRIVACY_CHOICES_VERSION_ID = '2026-07-26';
export const EXTENSION_PRIVACY_RELEASE_VERSION_ID = '2026-09-25';

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

// The owner authorized the extension rollout. Keep the versioned public policy
// and Store disclosures aligned with the actual prefill behavior.
export const PRIVATE_ANSWER_PREFILL_NOTICE =
  'Clicking Prefill this application loads your saved private answers and fills matching empty supported fields. No separate approval step is required for these answers. Existing answers stay unchanged. Review all filled answers before submitting.';

export const PORTAL_LOGIN_PREFILL_NOTICE =
  'Saved portal login details, including password confirmation, fill when you click Prefill this application on a supported secure login or create-account page. No extra confirmation is required. Existing entries stay unchanged; review them before continuing.';

export const EXTENSION_AUTOFILL_PLAN_NOTICE = `Free includes Step-by-step profile/resume/history prefill, optional skills, saved private answers, and one shared default job-portal login, ${PLAN_LIMITS.free.screeningDraftsPerMonth} AI screening drafts per month, and ${PLAN_LIMITS.free.coverLettersPerMonth} AI cover letter per month. Pro adds Continuous filling, opt-in Guided Autopilot, and ${PLAN_LIMITS.pro.aiWritingActionsPerMonth} shared AI writing actions per month, subject to daily and per-item safety limits.`;

/** Separate paragraphs keep the public disclosure readable. */
export const EXTENSION_AUTOFILL_PRIVACY_PARAGRAPHS = [
  'When you click Prefill this application, the Chrome extension reads the open application form and may place eligible information from your dedicated job-portal prefill profile and the active job-scoped generated resume into empty supported fields. The dedicated profile may include contact information, address, LinkedIn, GitHub, and website details and is separate from your normal TrackMyOPT account profile. A generated resume artifact is kept in extension session storage for up to 30 minutes and is invalidated when the normalized job URL, company, or role changes.',
  `You may optionally save work-authorization, visa, sponsorship, citizenship, annual or hourly compensation, in-person/relocation/start/transportation/accommodation preferences, date-of-birth, sex/gender, race/ethnicity, veteran, disability, and EEO answers in a separate server-side record protected with authenticated encryption. ${PRIVATE_ANSWER_PREFILL_NOTICE} A saved date of birth can fill an ordinary supported date-of-birth question; it is not used as a password or verification code. Private answers are fetched on your Prefill click, not merely by opening the sidebar. If enabled, Continuous filling may reuse those loaded answers on supported steps of the same application. Changing to a different job or reloading the page requires another Prefill click. Eligible private answers may also be passed to supported application frames for the requested fill; portal credentials are excluded from that payload.`,
  'On an explicit Prefill click, eligible non-sensitive screening questions may be answered using a previously saved matching answer or a new AI draft grounded in the active job-scoped generated resume. New drafts send the screening question, current job description, and generated-resume snapshot to our AI provider. Drafts can be inserted into eligible empty fields and are marked for your review; check and edit them before continuing or submitting. New AI drafts are not generated merely by loading a page or by Continuous filling. Choosing Remember my answer stores the question and current answer in your account for later matching reuse; this is separate from the encrypted private-answer record. AI cover-letter generation also sends job and resume information to our AI provider and requires review before attachment. Saved private answers and portal credentials are not used to prompt these AI features. Information you include yourself in a resume, job description, or screening answer may still be processed as part of that content.',
  `You may also save one default job-portal login in the encrypted private-data record. The same default email address and password may be offered across third-party employer and applicant-tracking portals, regardless of hostname. ${PORTAL_LOGIN_PREFILL_NOTICE} Portal credentials are fetched only for an explicit Prefill click on a supported HTTPS top-level page. They are not reused by Continuous filling or delivered to application frames. The extension uses password-type controls and never displays the saved password in its status messages. Reusing one login across unrelated portals increases the potential impact if any one portal is compromised. The extension never uses this credential on TrackMyOPT pages or places it in browser sync storage. Because TrackMyOPT's server must decrypt a saved portal password to provide autofill, this is not end-to-end encryption. Do not save your TrackMyOPT password or a primary password used for sensitive accounts. Credential filling skips password-change, security-answer, financial, SSN, date-of-birth, authentication-code, OTP, MFA, PIN, and uncertain password-type fields. It never clicks Login, Continue, Next, Create Account, or Submit.`,
  'Filling an answer or credential discloses it to the employer or applicant-tracking system operating the page, which may read fields before you submit. Saving private application data is optional and requires consent when saving. The encrypted record is retained while you keep it in your account; edit or delete it on the Chrome Job Prefill page. Private answers and credentials are not included in autofill logs or analytics. Autofill analytics use bounded counts, feature states, adapter and mode identifiers, navigation outcomes, and content-free error categories, not resume, answer, field, employer, school, job-title, URL, hash, file content, credentials, or private application answers.',
  'The extension does not replace non-empty fields or existing files, answer Social Security number questions, or retrieve verification codes from an email inbox. Enter OTP, MFA, and other verification codes yourself. Unsupported or uncertain controls may remain blank. Opt-in Guided Autopilot may click narrowly allowlisted non-submit Next, Continue, or Done controls after required fields are complete; it pauses for unresolved or review-needed answers and stops before Review, Submit, Apply, Finish, or another final application action. Press Escape or Stop to stop an active run. TrackMyOPT never submits an application; review every field and attachment yourself.',
] as const;

export const EXTENSION_AUTOFILL_PRIVACY_DISCLOSURE =
  EXTENSION_AUTOFILL_PRIVACY_PARAGRAPHS.join(' ');

export const EXTENSION_AUTOFILL_SUPPORT_NOTICE = `${PRIVATE_ANSWER_PREFILL_NOTICE} Saved private answers are encrypted separately and are not guessed or sent to AI for generation. ${PORTAL_LOGIN_PREFILL_NOTICE} Credential filling itself never clicks Login, Continue, Next, Create Account, or Submit. AI screening drafts may fill eligible empty fields on your Prefill click and must be reviewed and edited before you continue. Continuous filling may reuse loaded private answers within the same application; another job or page reload requires a new Prefill click. Guided Autopilot pauses for unresolved or review-needed answers and stops before Review and final submission. The extension does not retrieve codes from your inbox; enter verification codes yourself. Press Escape or Stop to stop an active run. TrackMyOPT never submits an application.`;

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
  privacy_policy: EXTENSION_PRIVACY_RELEASE_VERSION_ID,
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
  pro: PLAN_PRICES.pro,
  dedicated: PLAN_PRICES.dedicated,
} as const;

/** Stripe uses a trial period technically, but customers pay $0.99 upfront. */
export const PRO_TRIAL_DAYS = PRO_PAID_INTRO.durationDays;
export const PRO_PAID_INTRO_PRICE = PRO_PAID_INTRO.price;
export const PRO_PAID_INTRO_REFUND_DAYS = PRO_PAID_INTRO.durationDays;
export const DEDICATED_MONEY_BACK_DAYS = 3;
export const DEDICATED_CONSULTATION_MINUTES =
  DEDICATED_ATTORNEY_BENEFIT.durationMinutes;
export const DEDICATED_CONSULTATIONS_PER_ACCOUNT =
  DEDICATED_ATTORNEY_BENEFIT.consultationsPerAccount;
export const DEDICATED_CONSULTATION_WAIT_DAYS =
  DEDICATED_ATTORNEY_BENEFIT.minimumContinuousPlanDays;

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
  options?: { includeProIntro?: boolean }
) {
  const amount = PLAN_DISPLAY_PRICES[planId][interval];
  const frequencyLabel = getBillingFrequencyLabel(interval);
  const cancelMethod =
    'Dashboard → Settings → Subscription → Cancel subscription (opens Stripe billing portal)';

  if (planId === 'pro' && options?.includeProIntro) {
    return {
      amountLabel: formatUsd(amount),
      frequencyLabel,
      introDays: PRO_TRIAL_DAYS,
      introPriceLabel: formatUsd(PRO_PAID_INTRO_PRICE),
      moneyBackDays: PRO_PAID_INTRO_REFUND_DAYS,
      autoRenewLine: `${formatUsd(PRO_PAID_INTRO_PRICE)} is charged today for your first ${PRO_TRIAL_DAYS} days. After that, your subscription automatically renews at ${formatUsd(amount)} ${frequencyLabel} unless you cancel before the introductory period ends.`,
      cancelMethod,
    };
  }

  if (planId === 'dedicated') {
    return {
      amountLabel: formatUsd(amount),
      frequencyLabel,
      introDays: null,
      introPriceLabel: null,
      moneyBackDays: DEDICATED_MONEY_BACK_DAYS,
      autoRenewLine: `You are charged ${formatUsd(amount)} ${frequencyLabel} today. Your subscription renews automatically until you cancel.`,
      cancelMethod,
    };
  }

  if (planId === 'pro') {
    return {
      amountLabel: formatUsd(amount),
      frequencyLabel,
      introDays: null,
      introPriceLabel: null,
      moneyBackDays: null,
      autoRenewLine: `You are charged ${formatUsd(amount)} ${frequencyLabel} today. Your subscription renews automatically until you cancel.`,
      cancelMethod,
    };
  }

  return {
    amountLabel: formatUsd(amount),
    frequencyLabel,
    introDays: null,
    introPriceLabel: null,
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
  includeIntro: boolean;
}): string {
  const price =
    params.interval === 'year'
      ? `$${params.yearlyPrice.toFixed(2)}/year`
      : `$${params.monthlyPrice.toFixed(2)}/month`;

  if (params.includeIntro) {
    return `I agree to pay $${PRO_PAID_INTRO_PRICE.toFixed(2)} today for my first ${PRO_TRIAL_DAYS} days. After that, Pro renews at ${price} unless I cancel before the introductory period ends. The $${PRO_PAID_INTRO_PRICE.toFixed(2)} charge is refundable only during those first ${PRO_PAID_INTRO_REFUND_DAYS} days; recurring charges are non-refundable except where required by law.`;
  }
  return `I agree Pro is charged today at ${price} and renews until canceled. This account has already used its introductory offer, and change-of-mind refunds are not available.`;
}

/** Inline consent copy on PricingModal Dedicated card (charged today, not after money-back window). */
export function getPricingModalDedicatedConsentLabel(params: {
  interval: BillingInterval;
  monthlyPrice: number;
  yearlyPrice: number;
}): string {
  if (params.interval === 'year') {
    return `I agree Dedicated is charged today at $${params.yearlyPrice.toFixed(2)}/year, renews annually until canceled, includes a ${DEDICATED_MONEY_BACK_DAYS}-day money-back guarantee on the first paid term, and unlocks one complimentary ${DEDICATED_CONSULTATION_MINUTES}-minute initial attorney consultation per account after ${DEDICATED_CONSULTATION_WAIT_DAYS} continuous days on Dedicated, subject to the Terms.`;
  }
  return `I agree Dedicated is charged today at $${params.monthlyPrice.toFixed(2)}/month, renews monthly until canceled, includes a ${DEDICATED_MONEY_BACK_DAYS}-day money-back guarantee on the first Dedicated subscription charge, and unlocks one complimentary ${DEDICATED_CONSULTATION_MINUTES}-minute initial attorney consultation per account after ${DEDICATED_CONSULTATION_WAIT_DAYS} continuous days on Dedicated, subject to the Terms.`;
}

export function buildCheckoutDisclosures(params: {
  planId: PaidPlanId;
  interval: BillingInterval;
  includeProIntro: boolean;
}) {
  const summary = getPlanBillingSummary(params.planId, params.interval, {
    includeProIntro: params.includeProIntro,
  });

  return {
    policyVersions: LEGAL_POLICY_VERSIONS,
    headline: 'This is an auto-renewing subscription.',
    amountLine: `Plan: ${params.planId === 'dedicated' ? 'Dedicated' : 'Pro'}. Price: ${summary.amountLabel} billed ${summary.frequencyLabel}.`,
    renewalLine: summary.autoRenewLine,
    introLine:
      summary.introDays != null && summary.introPriceLabel != null
        ? `Paid introductory period: ${summary.introPriceLabel} today for ${summary.introDays} days. This is not a free trial.`
        : null,
    dedicatedRefundLine:
      params.planId === 'dedicated' && summary.moneyBackDays != null
        ? `Dedicated: ${summary.moneyBackDays}-day money-back guarantee on your first Dedicated subscription charge only (see Refund Policy).`
        : null,
    proRefundLine:
      params.planId === 'pro' && params.includeProIntro
        ? `Pro: the ${formatUsd(PRO_PAID_INTRO_PRICE)} introductory charge is refundable only during the first ${PRO_PAID_INTRO_REFUND_DAYS} days. Recurring charges after that are non-refundable except where required by law or stated in the Refund Policy.`
        : null,
    dedicatedConsultationLine:
      params.planId === 'dedicated'
        ? `Dedicated includes one complimentary ${DEDICATED_CONSULTATION_MINUTES}-minute initial consultation per account after ${DEDICATED_CONSULTATION_WAIT_DAYS} continuous days on Dedicated, subject to attorney availability, conflict checks, acceptance, and the Terms.`
        : null,
    cancelLine: `How to cancel: ${summary.cancelMethod}. Cancellation stops future charges only; you keep access through the end of your current paid period.`,
    noRefundAfterWindow:
      params.planId === 'pro' && params.includeProIntro
        ? `After the ${PRO_TRIAL_DAYS}-day paid introductory period, we do not offer refunds for change of mind. See our Refund Policy for legally required exceptions.`
        : params.planId === 'dedicated'
          ? `After the ${DEDICATED_MONEY_BACK_DAYS}-day window on the first Dedicated subscription charge, we do not offer refunds for change of mind. See our Refund Policy for exceptions.`
          : 'Pro recurring charges are non-refundable for change of mind. See our Refund Policy for legally required exceptions.',
    consentLabel:
      'I agree this is an auto-renewing subscription and authorize recurring charges as described. I have read the Terms of Service, Refund Policy, and Privacy Policy.',
  };
}

export const MATERIAL_CHANGE_NOTICE =
  'We will email active subscribers before material changes to price, renewal, cancellation, or refund terms take effect.';

export function formatPolicyVersionLabel(policyType: LegalPolicyType): string {
  const version = LEGAL_POLICY_VERSIONS[policyType];
  const effectiveDate =
    version === EXTENSION_PRIVACY_RELEASE_VERSION_ID
      ? 'September 25, 2026'
      : version === PRIVACY_CHOICES_VERSION_ID
      ? PRIVACY_CHOICES_EFFECTIVE_DATE
      : LEGAL_EFFECTIVE_DATE;
  return `${effectiveDate} · Version ${version}`;
}
