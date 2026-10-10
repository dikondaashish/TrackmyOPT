'use client';

import Link from 'next/link';
import { ArrowRight, Bell, Check } from 'lucide-react';
import { PLAN_PRICES } from '@/lib/pricing/plan-config';
import {
  PRO_PAID_INTRO_PRICE,
  PRO_PAID_INTRO_REFUND_DAYS,
  PRO_TRIAL_DAYS,
} from '@/lib/legal/legal-config';
import styles from './CaseMonitoringOffer.module.css';

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
    <div className="max-h-[85dvh] overflow-y-auto p-5">
      <h2
        id="case-monitoring-offer-title"
        tabIndex={0}
        className={`pr-5 text-2xl font-semibold tracking-tight sm:text-3xl ${styles.title}`}
      >
        Your case. Checked daily.
      </h2>
      <p className="mt-2 text-sm leading-5 text-muted-foreground">
        Email when your USCIS status changes. Saved OPT reminders, too.
      </p>
      <div className="my-3 rounded-2xl border border-emerald-600/15 bg-emerald-50/60 p-2 dark:bg-emerald-950/20">
        <div className="mb-2 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
          <Check aria-hidden="true" className={`h-3.5 w-3.5 ${styles.check}`} />
          <span>Daily check</span>
          <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 opacity-50" />
          <span>Email alert</span>
        </div>
        <div
          className={`flex items-center gap-3 rounded-xl border bg-background p-2.5 shadow-sm ${styles.alert}`}
        >
          <div
            aria-hidden="true"
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300 ${styles.bell}`}
          >
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-xs leading-4 text-muted-foreground">
              Sample alert
            </span>
            <p className="mt-0.5 text-sm font-medium">
              Your case status changed
            </p>
          </div>
        </div>
      </div>
      <fieldset disabled={loading} className="grid grid-cols-2 gap-2">
        <legend className="sr-only">Renewal schedule</legend>
        <label
          className={`flex min-h-12 cursor-pointer items-center justify-center rounded-xl border px-2 text-center text-xs transition-colors sm:text-sm ${
            !yearly
              ? 'border-emerald-700 bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200'
              : 'text-muted-foreground'
          }`}
        >
          <input
            className="peer sr-only"
            type="radio"
            name="case-pro-interval"
            checked={!yearly}
            onChange={() => props.onYearlyChange(false)}
          />
          <span className="rounded-sm peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-ring">
            Monthly · ${PLAN_PRICES.pro.month.toFixed(2)}/month
          </span>
        </label>
        <label
          className={`flex min-h-12 cursor-pointer items-center justify-center rounded-xl border px-2 text-center text-xs transition-colors sm:text-sm ${
            yearly
              ? 'border-emerald-700 bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200'
              : 'text-muted-foreground'
          }`}
        >
          <input
            className="peer sr-only"
            type="radio"
            name="case-pro-interval"
            checked={yearly}
            onChange={() => props.onYearlyChange(true)}
          />
          <span className="rounded-sm peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-ring">
            Annual · ${PLAN_PRICES.pro.year.toFixed(2)} billed yearly
          </span>
        </label>
      </fieldset>
      <p className="mt-3 text-center font-semibold" role="status">
        {eligibilityError
          ? 'We could not verify your offer. Close and reopen to retry.'
          : eligible === null
            ? 'Checking your offer…'
            : eligible
              ? (
                <>
                  <span className="text-3xl tracking-tight">{intro}</span>{' '}
                  <span className="text-sm font-normal text-muted-foreground">
                    for {PRO_TRIAL_DAYS} days
                  </span>{' '}
                  <span className="mt-1 block text-xs font-normal text-muted-foreground">
                    Then {renewal} · auto-renews until canceled
                  </span>
                </>
              )
              : `Pro for ${renewal}`}
      </p>
      {eligible !== null && !eligibilityError && (
        <label className="mt-2 flex min-h-11 cursor-pointer items-start gap-3 text-xs leading-[18px] text-muted-foreground">
          <input
            className="mt-1 h-4 w-4 shrink-0"
            type="checkbox"
            checked={consent}
            disabled={loading}
            onChange={(e) => props.onConsentChange(e.target.checked)}
          />
          <span>
            {eligible
              ? `I agree to pay ${intro} today for ${PRO_TRIAL_DAYS} days, then ${renewal} unless canceled before renewal. The ${intro} is refundable within ${PRO_PAID_INTRO_REFUND_DAYS} days; recurring charges are non-refundable except where required by law.`
              : `I agree to pay ${renewal} today, renewing until canceled. No change-of-mind refunds.`}
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
        className={`mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 ${styles.button}`}
      >
        {loading
          ? 'Opening secure checkout…'
          : eligible
            ? `Start Pro — ${intro} for ${PRO_TRIAL_DAYS} days`
            : 'Continue to Pro checkout'}
        {!loading && <ArrowRight aria-hidden="true" className="h-4 w-4" />}
      </button>
      <div className="mt-2 text-center text-xs leading-5 text-muted-foreground">
        Cancel in Settings → Subscription. By continuing, you agree to{' '}
        <Link href="/terms" className="underline">
          Terms
        </Link>
        ,{' '}
        <Link href="/privacy" className="underline">
          Privacy
        </Link>{' '}
        and{' '}
        <Link href="/refund-policy" className="underline">
          Refund Policy
        </Link>
        .
        <span className="mt-1 block">
          Scheduled checks, not real-time. No effect on USCIS processing.
        </span>
      </div>
      <div className="mt-2 flex flex-wrap justify-between gap-3 text-xs">
        <button
          type="button"
          disabled={loading}
          onClick={props.onClose}
          className="min-h-11 text-muted-foreground underline decoration-border underline-offset-4 hover:text-foreground"
        >
          Keep manual checks free
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={props.onCompare}
          className="min-h-11 text-muted-foreground underline decoration-border underline-offset-4 hover:text-foreground"
        >
          Compare all plans
        </button>
      </div>
    </div>
  );
}
