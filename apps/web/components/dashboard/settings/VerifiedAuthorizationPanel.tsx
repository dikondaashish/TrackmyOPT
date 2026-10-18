'use client';

import { useState } from 'react';
import { Check, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  VERIFIED_MEANINGS,
  VERIFIED_MEANING_QUESTION,
  verifiedAnswerState,
  type VerifiedAuthorizationAnswers,
  type VerifiedMeaning,
} from '../../../../extension/src/prefill/verified-authorization';

interface Props {
  verified: VerifiedAuthorizationAnswers | null;
  onChange: (next: VerifiedAuthorizationAnswers | null) => void;
}

const SHORT_LABEL: Record<VerifiedMeaning, string> = {
  currentWorkAuthorization: 'Current work authorization',
  currentSponsorship: 'Current sponsorship need',
  futureSponsorship: 'Future sponsorship need',
};

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

/**
 * Applicant-confirmed answers to three separate questions. TrackMyOPT reuses
 * an answer only for an application question with the same meaning, and asks
 * again when the wording changes or the review date passes.
 */
export function VerifiedAuthorizationPanel({ verified, onChange }: Props) {
  const [drafts, setDrafts] = useState<Partial<Record<VerifiedMeaning, { answer: string; reviewBy: string }>>>({});
  const [busy, setBusy] = useState<VerifiedMeaning | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  // Review status is evaluated against the time the panel opened.
  const [now] = useState(() => Date.now());

  const send = async (meaning: VerifiedMeaning, change: Record<string, unknown>, done: string) => {
    setBusy(meaning);
    setMessage(null);
    try {
      const response = await fetch('/api/private-application-answers', {
        method: 'PATCH',
        credentials: 'include',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consent: true, change }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(body?.error || 'Could not save your answer. Please try again.');
        return;
      }
      onChange(body.verifiedAuthorization ?? null);
      setDrafts((current) => ({ ...current, [meaning]: undefined }));
      setMessage(done);
    } catch {
      setMessage('Could not save your answer. Please try again.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <fieldset className="space-y-4 border-t border-border pt-5">
      <legend className="pr-3 text-sm font-semibold">
        Confirmed work authorization answers
      </legend>
      <p className="max-w-prose text-xs leading-5 text-gray-600 dark:text-gray-300">
        Answer each question for yourself. TrackMyOPT does not decide whether
        you are authorized to work or need sponsorship, and these answers are
        not legal advice. They are used only for application questions with
        the same meaning; a question worded differently is shown to you to
        confirm first. The older &ldquo;Work eligibility&rdquo; answers above
        are only offered as suggestions.
      </p>
      {VERIFIED_MEANINGS.map((meaning) => {
        const saved = verified?.[meaning];
        const state = verifiedAnswerState(saved, now);
        const draft = drafts[meaning] ?? { answer: saved?.answer ?? '', reviewBy: saved?.reviewBy ?? '' };
        const groupId = `verified-${meaning}`;
        return (
          <div key={meaning} className="rounded-lg border border-border p-4" role="group" aria-labelledby={`${groupId}-question`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{SHORT_LABEL[meaning]}</p>
            <p id={`${groupId}-question`} className="mt-1 text-sm font-medium">
              {VERIFIED_MEANING_QUESTION[meaning]}
            </p>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-300" aria-live="polite">
              {state === 'missing'
                ? 'Not answered yet.'
                : state === 'due_for_review'
                  ? `Due for review — last confirmed ${formatDate(saved!.confirmedAt)}. Confirm it is still accurate.`
                  : `Confirmed ${formatDate(saved!.confirmedAt)}.`}
            </p>
            <div className="mt-3 flex flex-wrap items-end gap-4">
              <div className="flex gap-4" role="radiogroup" aria-labelledby={`${groupId}-question`}>
                {(['yes', 'no'] as const).map((value) => (
                  <label key={value} className="inline-flex min-h-10 items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name={groupId}
                      value={value}
                      checked={draft.answer === value}
                      onChange={() => setDrafts((current) => ({ ...current, [meaning]: { ...draft, answer: value } }))}
                    />
                    {value === 'yes' ? 'Yes' : 'No'}
                  </label>
                ))}
              </div>
              <label className="grid gap-1 text-xs">
                Review by (optional)
                <input
                  type="date"
                  className="h-10 rounded-md border border-border bg-transparent px-2 text-sm"
                  value={draft.reviewBy}
                  onChange={(event) => setDrafts((current) => ({ ...current, [meaning]: { ...draft, reviewBy: event.target.value } }))}
                />
              </label>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              For example, the end date on your employment authorization card.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                className="h-10"
                disabled={!draft.answer || busy !== null}
                onClick={() => void send(meaning, {
                  action: 'confirm', meaning, answer: draft.answer,
                  reviewBy: draft.reviewBy || null,
                }, `${SHORT_LABEL[meaning]} saved.`)}
              >
                {busy === meaning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                {saved ? 'Confirm answer' : 'Save answer'}
              </Button>
              {saved ? (
                <Button
                  type="button"
                  variant="outline"
                  className="h-10"
                  disabled={busy !== null}
                  onClick={() => void send(meaning, { action: 'clear', meaning }, `${SHORT_LABEL[meaning]} cleared.`)}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Clear
                </Button>
              ) : null}
            </div>
          </div>
        );
      })}
      {message ? <p role="status" className="text-sm">{message}</p> : null}
    </fieldset>
  );
}
