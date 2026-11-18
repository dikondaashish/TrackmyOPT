'use client';

import { useEffect, useState } from 'react';
import { Check, Copy, ExternalLink, Lock } from 'lucide-react';
import {
  LATE_CASE_DISCLAIMER,
  buildLateCaseSteps,
  type LateCaseAssessment,
  type LateCaseDetails,
} from '@/lib/case-status/late-case-help';
import { captureClientEvent } from '@/lib/posthog-client';

interface LateCaseHelpProps {
  assessment: LateCaseAssessment;
  details: LateCaseDetails;
  isPro: boolean;
  onUpgrade: () => void;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard
          ?.writeText(text)
          .then(() => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
          })
          .catch(() => setCopied(false));
      }}
      className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5" aria-hidden="true" />
      ) : (
        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

/**
 * Shown when a pending OPT or STEM OPT case has waited longer than the
 * typical community wait. Pro gets the steps, the official links and text to
 * adapt. Free sees which steps exist and can unlock them.
 */
export function LateCaseHelp({
  assessment,
  details,
  isPro,
  onUpgrade,
}: LateCaseHelpProps) {
  const steps = buildLateCaseSteps(details);

  useEffect(() => {
    captureClientEvent('late_case_help_shown', {
      plan_tier: isPro ? 'pro' : 'free',
      level: assessment.level,
    });
  }, [isPro, assessment.level]);

  return (
    <section
      aria-labelledby="late-case-help-title"
      className="rounded-xl border border-amber-300 bg-amber-50 p-4 sm:p-5 dark:border-amber-800 dark:bg-amber-950"
    >
      <h2
        id="late-case-help-title"
        className="text-lg font-semibold text-foreground"
      >
        Your case is past the typical wait
      </h2>
      <p className="mt-1 text-sm text-foreground">
        You are {assessment.daysSinceFiled} days in. The typical reported wait
        for a case like yours is {assessment.medianDays} days.{' '}
        {assessment.level === 'slow_quarter'
          ? 'That is longer than about three in four reported cases.'
          : 'About half of reported cases take longer than that, so this alone does not mean something is wrong.'}
      </p>
      <p className="mt-2 text-sm font-medium text-foreground">
        {isPro
          ? 'These are the steps you can take, in the order they usually make sense.'
          : 'Pro walks you through the steps you can take, with the official links and text you can adapt:'}
      </p>

      {isPro ? (
        <ol className="mt-3 space-y-2">
          {steps.map((step, index) => (
            <li key={step.id}>
              <details className="group rounded-lg border border-border bg-card">
                <summary className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                    {index + 1}
                  </span>
                  {step.title}
                </summary>
                <div className="space-y-3 px-3 pb-3 pl-12 text-sm text-muted-foreground">
                  <p className="leading-relaxed">{step.body}</p>
                  <ul className="flex flex-wrap gap-x-4 gap-y-1">
                    {step.links.map((link) => (
                      <li key={link.href}>
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-9 items-center gap-1 font-medium text-blue-700 underline underline-offset-2 dark:text-blue-300"
                        >
                          {link.label}
                          <ExternalLink
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
                          />
                        </a>
                      </li>
                    ))}
                  </ul>
                  {step.template && (
                    <div className="rounded-lg border border-border bg-muted p-3">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold text-foreground">
                          {step.template.label}
                        </p>
                        <CopyButton text={step.template.text} />
                      </div>
                      <pre className="whitespace-pre-wrap break-words font-sans text-xs leading-relaxed text-foreground">
                        {step.template.text}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            </li>
          ))}
        </ol>
      ) : (
        <>
          <ol className="mt-3 space-y-1.5">
            {steps.map((step, index) => (
              <li
                key={step.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">{step.title}</span>
                <Lock
                  className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
              </li>
            ))}
          </ol>
          <button
            type="button"
            onClick={onUpgrade}
            className="mt-3 inline-flex min-h-11 items-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Unlock the steps with Pro
          </button>
        </>
      )}

      <p className="mt-3 text-xs text-muted-foreground">
        {LATE_CASE_DISCLAIMER}
      </p>
    </section>
  );
}
