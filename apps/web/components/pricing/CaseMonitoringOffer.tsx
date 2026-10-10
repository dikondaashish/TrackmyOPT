'use client';

import Link from 'next/link';
import { PLAN_PRICES } from '@/lib/pricing/plan-config';
import {
  getPricingModalProConsentLabel,
  PRO_PAID_INTRO_PRICE,
  PRO_TRIAL_DAYS,
} from '@/lib/legal/legal-config';

type Props = {
  eligible: boolean | null;
  eligibilityError: boolean;
  yearly: boolean;
  consent: boolean;
  loading: boolean;
  error: string | null;
  onYearlyChange: (yearly: boolean) => void;
  onConsentChange: (accepted: boolean) => void;
  onContinue: () => void;
  onCompare: () => void;
  onClose: () => void;
};

export function CaseMonitoringOffer(props: Props) {
  const { eligible, yearly, consent, loading, eligibilityError } = props;
  const renewal = yearly
    ? `$${PLAN_PRICES.pro.year.toFixed(2)}/year`
    : `$${PLAN_PRICES.pro.month.toFixed(2)}/month`;
  const intro = `$${PRO_PAID_INTRO_PRICE.toFixed(2)}`;
  return (
    <div className="max-h-[85vh] overflow-y-auto p-6 sm:p-8">
      <h2
        id="case-monitoring-offer-title"
        tabIndex={0}
        className="pr-7 text-2xl font-semibold tracking-tight focus:outline-none"
      >
        Let TrackMyOPT check your case daily
      </h2>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        Keep manual checks free, or let Pro check USCIS daily and email you when
        your status changes.
      </p>
      <ul className="mt-5 space-y-2 text-sm">
        <li>Daily automatic USCIS checks for your saved case</li>
        <li>Email when a scheduled check detects a change</li>
        <li>Deadline reminders for the OPT trackers you set up</li>
      </ul>
      <div className="my-5 rounded-xl border bg-muted/30 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Sample alert — illustration only
        </p>
        <p className="mt-2 text-sm font-medium">
          Your USCIS case status changed
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Open your tracker to review the latest status and confirm details with
          USCIS.
        </p>
      </div>
      <fieldset disabled={loading} className="space-y-2">
        <legend className="mb-2 text-sm font-medium">
          Choose your renewal schedule
        </legend>
        <label className="flex min-h-11 items-center gap-3 rounded-lg border p-3 text-sm">
          <input
            type="radio"
            name="case-pro-interval"
            checked={!yearly}
            onChange={() => props.onYearlyChange(false)}
          />
          Monthly · ${PLAN_PRICES.pro.month.toFixed(2)}/month
        </label>
        <label className="flex min-h-11 items-center gap-3 rounded-lg border p-3 text-sm">
          <input
            type="radio"
            name="case-pro-interval"
            checked={yearly}
            onChange={() => props.onYearlyChange(true)}
          />
          Annual · ${PLAN_PRICES.pro.year.toFixed(2)} billed yearly
        </label>
      </fieldset>
      <p className="mt-5 font-semibold" aria-live="polite">
        {eligibilityError
          ? 'We could not verify your offer. Close and reopen to retry.'
          : eligible === null
            ? 'Checking your offer…'
            : eligible
              ? `${intro} for ${PRO_TRIAL_DAYS} days, then ${renewal}`
              : `Pro for ${renewal}`}
      </p>
      {eligible !== null && !eligibilityError && (
        <label className="mt-4 flex items-start gap-3 text-xs leading-5 text-muted-foreground">
          <input
            className="mt-1 h-4 w-4 shrink-0"
            type="checkbox"
            checked={consent}
            disabled={loading}
            onChange={(e) => props.onConsentChange(e.target.checked)}
          />
          <span>
            {eligible
              ? getPricingModalProConsentLabel({
                  interval: yearly ? 'year' : 'month',
                  monthlyPrice: PLAN_PRICES.pro.month,
                  yearlyPrice: PLAN_PRICES.pro.year,
                  includeIntro: true,
                })
              : `I agree to pay ${renewal} today. Pro renews automatically until canceled. Change-of-mind refunds are not available; see the Refund Policy.`}
          </span>
        </label>
      )}
      {props.error && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {props.error}
        </p>
      )}
      <button
        type="button"
        disabled={loading || !consent || eligible === null || eligibilityError}
        onClick={props.onContinue}
        className="mt-5 min-h-12 w-full rounded-xl bg-emerald-600 px-4 font-semibold text-white disabled:opacity-50"
      >
        {loading
          ? 'Opening secure checkout…'
          : eligible
            ? `Start Pro — ${intro} for ${PRO_TRIAL_DAYS} days`
            : 'Continue to Pro checkout'}
      </button>
      <p className="mt-3 text-xs leading-5 text-muted-foreground">
        Cancel future renewal in Settings → Subscription. By continuing, you
        agree to our{' '}
        <Link href="/terms" className="underline">
          Terms
        </Link>
        ,{' '}
        <Link href="/privacy" className="underline">
          Privacy Policy
        </Link>{' '}
        and{' '}
        <Link href="/refund-policy" className="underline">
          Refund Policy
        </Link>
        . Monitoring does not speed up USCIS decisions. Alerts follow scheduled
        checks, not real-time updates.
      </p>
      <div className="mt-4 flex flex-wrap justify-between gap-3 text-sm">
        <button
          type="button"
          disabled={loading}
          onClick={props.onClose}
          className="min-h-11 underline"
        >
          Keep checking manually
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={props.onCompare}
          className="min-h-11 underline"
        >
          Compare all plans
        </button>
      </div>
    </div>
  );
}
