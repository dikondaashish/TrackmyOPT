'use client';

import Link from 'next/link';
import { ArrowRight, Bell, CalendarCheck, Clock3, Zap } from 'lucide-react';
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
    <div
      className={`max-h-[92dvh] overflow-y-auto px-4 pb-3 pt-10 sm:px-6 sm:pb-2 sm:pt-8 ${styles.offer}`}
    >
      <h2
        id="case-monitoring-offer-title"
        tabIndex={0}
        className={`px-5 text-center text-2xl font-bold tracking-tight sm:text-3xl ${styles.title}`}
      >
        {eligible ? 'Special one-time offer' : 'Upgrade to Pro'}
      </h2>
      <p className="mt-1 text-center text-sm text-slate-800">
        Let Pro handle your daily USCIS checks.
      </p>
      <div
        className={`my-3 rounded-3xl bg-white px-5 py-3 text-slate-900 shadow-lg sm:px-6 ${styles.ticket}`}
      >
        <div className="flex items-center justify-center gap-2 text-sm font-semibold">
          <Zap
            aria-hidden="true"
            className={`h-5 w-5 fill-amber-400 text-amber-500 ${styles.spark}`}
          />
          <span>TrackMyOPT Pro</span>
          <span className="rounded-lg bg-amber-300 px-2 py-1 text-xs font-bold">
            {eligible ? `${PRO_TRIAL_DAYS} DAYS` : yearly ? 'ANNUAL' : 'MONTHLY'}
          </span>
        </div>
        <div className="mt-3 text-center" role="status">
          {eligibilityError ? (
            <span className="block py-4 text-sm">
              We could not verify your offer. Close and reopen to retry.
            </span>
          ) : eligible === null ? (
            <span className="block py-4 text-sm">Checking your offer…</span>
          ) : eligible ? (
            <>
              <span className="block text-xs text-slate-500">Just</span>{' '}
              <span className="block text-6xl font-bold tracking-tighter">
                {intro}
              </span>{' '}
              <span className="mt-1 block text-xs text-slate-600">
                for {PRO_TRIAL_DAYS} days
              </span>{' '}
              <span className="mt-1 block text-xs text-slate-600">
                Then {renewal} · auto-renews until canceled
              </span>
            </>
          ) : (
            <span className="block py-4 text-2xl font-bold">
              Pro for {renewal}
            </span>
          )}
        </div>
        <ul className="mt-4 grid grid-cols-3 gap-2 border-t-2 border-dashed border-slate-200 pt-3 text-center text-xs text-slate-700">
          <li>
            <CalendarCheck
              aria-hidden="true"
              className={`mx-auto mb-1 h-5 w-5 text-violet-700 ${styles.check}`}
            />
            Daily checks
          </li>
          <li>
            <Bell
              aria-hidden="true"
              className={`mx-auto mb-1 h-5 w-5 text-violet-700 ${styles.bell}`}
            />
            Email alerts
          </li>
          <li>
            <Clock3
              aria-hidden="true"
              className={`mx-auto mb-1 h-5 w-5 text-violet-700 ${styles.reminder}`}
            />
            OPT reminders
          </li>
        </ul>
        <fieldset disabled={loading} className="mt-3 grid grid-cols-2 gap-2">
          <legend className="sr-only">Renewal schedule</legend>
          <label
            className={`flex min-h-11 cursor-pointer items-center justify-center rounded-xl border px-2 text-center text-xs transition-colors ${
              !yearly
                ? 'border-violet-600 bg-violet-50 text-violet-900'
                : 'border-slate-200 text-slate-600'
            }`}
          >
            <input
              className="peer sr-only"
              type="radio"
              name="case-pro-interval"
              checked={!yearly}
              onChange={() => props.onYearlyChange(false)}
            />
            <span className="rounded-sm peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-violet-600">
              Monthly · ${PLAN_PRICES.pro.month.toFixed(2)}/month
            </span>
          </label>
          <label
            className={`flex min-h-11 cursor-pointer items-center justify-center rounded-xl border px-2 text-center text-xs transition-colors ${
              yearly
                ? 'border-violet-600 bg-violet-50 text-violet-900'
                : 'border-slate-200 text-slate-600'
            }`}
          >
            <input
              className="peer sr-only"
              type="radio"
              name="case-pro-interval"
              checked={yearly}
              onChange={() => props.onYearlyChange(true)}
            />
            <span className="rounded-sm peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-violet-600">
              Annual · ${PLAN_PRICES.pro.year.toFixed(2)} billed yearly
            </span>
          </label>
        </fieldset>
      </div>
      {eligible !== null && !eligibilityError && (
        <label className="flex min-h-11 cursor-pointer items-start gap-3 text-xs leading-[18px] text-slate-700">
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
        <p role="alert" className="mt-3 text-sm text-red-900">
          {props.error}
        </p>
      )}
      <button
        type="button"
        disabled={loading || !consent || eligible === null || eligibilityError}
        onClick={props.onContinue}
        className={`mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#5846d9] px-4 text-base font-semibold text-white transition-colors hover:bg-[#4935c4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-800 disabled:cursor-not-allowed disabled:bg-[#7565c7] ${styles.button}`}
      >
        {loading
          ? 'Opening secure checkout…'
          : eligible
            ? `Start ${PRO_TRIAL_DAYS} days for ${intro}`
            : 'Continue to Pro checkout'}
        {!loading && <ArrowRight aria-hidden="true" className="h-4 w-4" />}
      </button>
      <div className="mt-2 text-center text-xs leading-5 text-slate-700">
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
      <div className="flex flex-wrap justify-between gap-2 text-xs">
        <button
          type="button"
          disabled={loading}
          onClick={props.onClose}
          className="min-h-11 text-slate-700 underline decoration-slate-700/30 underline-offset-4 hover:text-slate-950"
        >
          Keep manual checks free
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={props.onCompare}
          className="min-h-11 text-slate-700 underline decoration-slate-700/30 underline-offset-4 hover:text-slate-950"
        >
          Compare all plans
        </button>
      </div>
    </div>
  );
}
