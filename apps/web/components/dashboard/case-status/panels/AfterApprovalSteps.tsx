'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, CheckCircle2, Copy } from 'lucide-react';
import {
  AFTER_APPROVAL_DISCLAIMER,
  SHARE_URL,
  buildAfterApprovalSteps,
} from '@/lib/case-status/after-approval';
import { captureClientEvent } from '@/lib/posthog-client';
import { requestNpsSurvey } from '@/lib/posthog/nps-survey';

interface AfterApprovalStepsProps {
  stemExtension: boolean;
  isPro: boolean;
  /** Free accounts only: opens the upgrade offer. */
  onUpgrade?: () => void;
}

type SavedState = { hasEadDates: boolean; hasEmployment: boolean };

/**
 * Next steps once a case is approved: EAD dates, the unemployment count, the
 * first job, sponsor-friendly jobs and the STEM window. Free on every plan.
 * It also asks, at this moment and not at sign-up, how likely the person is
 * to recommend TrackMyOPT, and offers a link to pass on.
 */
export function AfterApprovalSteps({
  stemExtension,
  isPro,
  onUpgrade,
}: AfterApprovalStepsProps) {
  const [saved, setSaved] = useState<SavedState>({
    hasEadDates: false,
    hasEmployment: false,
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/me', { credentials: 'include', signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((body) => {
        if (!body || controller.signal.aborted) return;
        const status = body.optStatus ?? null;
        setSaved({
          hasEadDates: Boolean(
            stemExtension
              ? status?.stem_start_date || status?.stem_ead_end_date
              : status?.opt_start_date && status?.opt_ead_end_date
          ),
          hasEmployment:
            Array.isArray(body.employmentSpans) &&
            body.employmentSpans.length > 0,
        });
      })
      // The steps still work without the "done" marks.
      .catch(() => undefined);
    return () => controller.abort();
  }, [stemExtension]);

  useEffect(() => {
    captureClientEvent('after_approval_steps_shown', {
      plan_tier: isPro ? 'pro' : 'free',
      case_kind: stemExtension ? 'stem_extension' : 'initial_opt',
    });
    requestNpsSurvey({
      trigger: 'case_approved_viewed',
      planTier: isPro ? 'pro' : 'free',
    });
  }, [isPro, stemExtension]);

  const steps = buildAfterApprovalSteps({ stemExtension, ...saved });

  return (
    <section
      id="after-approval"
      aria-labelledby="after-approval-title"
      className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 sm:p-5 dark:border-emerald-800 dark:bg-emerald-950"
    >
      <h2
        id="after-approval-title"
        className="text-lg font-semibold text-foreground"
      >
        Approved. Here is what to do next
      </h2>
      <p className="mt-1 text-sm text-foreground">
        New dates to track. These tools are free.
      </p>

      <ol className="mt-3 space-y-2">
        {steps.map((step, index) => (
          <li
            key={step.id}
            className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center"
          >
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                step.done
                  ? 'bg-emerald-600 text-white'
                  : 'bg-muted text-foreground'
              }`}
            >
              {step.done ? (
                <>
                  <Check className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">Done</span>
                </>
              ) : (
                index + 1
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">
                {step.title}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </div>
            <Link
              href={step.href}
              onClick={() =>
                captureClientEvent('after_approval_step_clicked', {
                  step: step.id,
                  plan_tier: isPro ? 'pro' : 'free',
                })
              }
              className="inline-flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs font-semibold text-foreground hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {step.cta}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ol>

      {!isPro && onUpgrade && (
        <p className="mt-3 text-xs text-muted-foreground">
          Pro emails your unemployment days and deadlines each morning.{' '}
          <button
            type="button"
            onClick={onUpgrade}
            className="min-h-9 font-semibold text-primary underline underline-offset-4"
          >
            See Pro
          </button>
        </p>
      )}

      <div className="mt-3 flex flex-col gap-2 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-foreground">
          Know someone still waiting? Send them the free tracker.
        </p>
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard
              ?.writeText(SHARE_URL)
              .then(() => {
                setCopied(true);
                captureClientEvent('share_link_copied', {
                  source: 'after_approval',
                });
                window.setTimeout(() => setCopied(false), 2000);
              })
              .catch(() => setCopied(false));
          }}
          className="inline-flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs font-semibold text-foreground hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {copied ? (
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          {copied ? 'Link copied' : 'Copy the link'}
        </button>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        {AFTER_APPROVAL_DISCLAIMER}
      </p>
    </section>
  );
}
