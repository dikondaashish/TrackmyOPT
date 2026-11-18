'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { ArrowRight, Ticket } from 'lucide-react';
import * as Sentry from '@sentry/nextjs';
import { getCasePassConsentLabel } from '@/lib/legal/legal-config';
import { captureClientEvent } from '@/lib/posthog-client';
import { CASE_PASS } from '@/lib/pricing/plan-config';

/**
 * One-time alternative shown under the plan comparison: Pro for a fixed term,
 * one payment, no renewal. Checkout cannot start until the consent box is
 * ticked; pressing the button first prompts for it.
 */
export function CasePassOffer({ source }: { source: string }) {
  const id = useId();
  const consentRef = useRef<HTMLInputElement>(null);
  const [consent, setConsent] = useState(false);
  const [consentPrompt, setConsentPrompt] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const price = `$${CASE_PASS.price.toFixed(2)}`;
  const showConsentPrompt = consentPrompt && !consent;

  useEffect(() => {
    captureClientEvent('case_pass_offer_viewed', { source });
  }, [source]);

  const buy = async () => {
    if (!consent) {
      setConsentPrompt(true);
      consentRef.current?.focus();
      captureClientEvent('case_pass_consent_prompted', { source });
      return;
    }
    captureClientEvent('case_pass_offer_clicked', { source });
    setLoading(true);
    setError(null);
    let status: number | 'none' = 'none';
    try {
      const response = await fetch('/api/premium/case-pass/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ nonRefundableAccepted: true, source }),
      });
      status = response.status;
      const payload = await response.json().catch(() => ({}));
      if (response.ok && typeof payload?.url === 'string') {
        window.location.href = payload.url;
        return;
      }
      setError(
        typeof payload?.error === 'string'
          ? payload.error
          : 'Could not start checkout. Please try again.'
      );
      // Expected refusals (signed out, already Pro, rate limit) are not failures.
      if (response.status >= 500)
        Sentry.captureException(
          new Error(`Case Pass checkout failed (status=${response.status})`)
        );
    } catch {
      Sentry.captureException(
        new Error(`Case Pass checkout request failed (status=${status})`)
      );
      setError(
        'Could not start checkout. Check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      aria-labelledby={`${id}-title`}
      className="mx-4 mb-3 rounded-xl border border-border bg-card p-4 sm:mx-5 md:mx-4"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 md:max-w-[55%]">
          <h3
            id={`${id}-title`}
            className="flex items-center gap-2 text-sm font-semibold text-foreground"
          >
            <Ticket className="h-4 w-4 text-violet-600" aria-hidden="true" />
            Prefer to pay once? Get the Case Pass
          </h3>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {price}{' '}
            <span className="text-sm font-medium text-muted-foreground">
              once · Pro for {CASE_PASS.durationLabel}
            </span>
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Everything in Pro for {CASE_PASS.durationDays} days, long enough
            for most OPT and STEM OPT waits. One payment. It does not renew,
            so there is nothing to cancel.
          </p>
        </div>

        <div className="min-w-0 md:w-[42%]">
          <label
            className={`flex min-h-11 cursor-pointer items-start gap-2.5 rounded-lg border p-2.5 text-[11px] leading-snug text-muted-foreground ${
              showConsentPrompt
                ? 'border-red-500 ring-2 ring-red-500'
                : consent
                  ? 'border-violet-500 bg-violet-50 dark:bg-violet-950'
                  : 'border-border'
            }`}
          >
            <input
              ref={consentRef}
              type="checkbox"
              className="mt-0.5 h-4 w-4 shrink-0 rounded accent-violet-600"
              checked={consent}
              disabled={loading}
              aria-describedby={
                showConsentPrompt ? `${id}-consent-prompt` : undefined
              }
              onChange={(event) => setConsent(event.target.checked)}
            />
            <span>{getCasePassConsentLabel()}</span>
          </label>
          {showConsentPrompt && (
            <p
              id={`${id}-consent-prompt`}
              role="alert"
              className="mt-1 text-xs font-medium text-red-700 dark:text-red-400"
            >
              Tick the box above to continue.
            </p>
          )}
          {error && (
            <p role="alert" className="mt-1 text-xs text-destructive">
              {error}
            </p>
          )}
          <button
            type="button"
            onClick={() => void buy()}
            disabled={loading}
            className="mt-2 flex min-h-10 w-full items-center justify-center gap-1.5 rounded-lg border border-violet-600 px-4 text-xs font-semibold text-violet-700 transition-colors hover:bg-violet-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60 dark:text-violet-300 dark:hover:bg-violet-950"
          >
            {loading
              ? 'Opening secure checkout…'
              : `Get the Case Pass for ${price}`}
            {!loading && (
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
