'use client';

import { useEffect, useState } from 'react';
import { Check, Coins, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { RESUME_CREDIT_PACK } from '@/lib/pricing/plan-config';
import {
  creditsForPackQuantity,
  isAllowedResumeCreditPackQuantity,
  RESUME_CREDIT_MAX_DOLLARS,
  RESUME_CREDIT_MIN_DOLLARS,
} from '@/lib/resume-credits/config';
import type { ResumeUsageData } from '@/components/dashboard/resume/ResumeUsageStats';

type LiveUsage = Pick<
  ResumeUsageData,
  'resumeUsage' | 'resumeLimit' | 'resumeCreditBalance'
>;

export function ResumeCreditTopUpModal({
  open,
  onClose,
  currentBalance,
  resumeUsage,
  resumeLimit,
  onUsageUpdated,
}: {
  open: boolean;
  onClose: () => void;
  currentBalance: number;
  resumeUsage?: number;
  resumeLimit?: number;
  onUsageUpdated?: (usage: ResumeUsageData) => void;
}) {
  const [amountInput, setAmountInput] = useState('5');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [liveUsage, setLiveUsage] = useState<LiveUsage | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setIsRefreshing(true);

    (async () => {
      try {
        const response = await fetch('/api/user/usage', {
          credentials: 'include',
          cache: 'no-store',
        });
        if (!response.ok || cancelled) return;

        const data = await response.json();
        const next: LiveUsage = {
          resumeUsage: Number(data.resumeUsage) || 0,
          resumeLimit: Number(data.resumeLimit) || 0,
          resumeCreditBalance: Number(data.resumeCreditBalance) || 0,
        };
        if (cancelled) return;

        setLiveUsage(next);
        onUsageUpdated?.({
          resumeUsage: next.resumeUsage,
          resumeLimit: next.resumeLimit,
          resumeCreditBalance: next.resumeCreditBalance,
          canBuyResumeCredits: data.canBuyResumeCredits === true,
        });
      } catch {
        // Fall back to props below.
      } finally {
        if (!cancelled) setIsRefreshing(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, onUsageUpdated]);

  const usage = liveUsage?.resumeUsage ?? resumeUsage ?? 0;
  const limit = liveUsage?.resumeLimit ?? resumeLimit ?? 0;
  const balance = liveUsage?.resumeCreditBalance ?? currentBalance;
  const monthlyRemaining = Math.max(0, limit - usage);
  const monthlyExhausted = limit > 0 && usage >= limit;

  const amount = Number(amountInput);
  const isValidAmount = isAllowedResumeCreditPackQuantity(amount);
  const credits = isValidAmount ? creditsForPackQuantity(amount) : 0;

  const startCheckout = async () => {
    if (!isValidAmount) {
      setError(
        `Enter a whole-dollar amount from $${RESUME_CREDIT_MIN_DOLLARS} to $${RESUME_CREDIT_MAX_DOLLARS}.`
      );
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/resume-credits/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ amount }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || typeof payload.url !== 'string') {
        throw new Error(
          typeof payload.error === 'string'
            ? payload.error
            : 'Unable to start checkout. Please try again.'
        );
      }
      window.location.assign(payload.url);
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : 'Unable to start checkout. Please try again.'
      );
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="max-w-lg overflow-hidden p-0">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-6 py-6 text-white">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
            <Coins className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2 className="mt-4 text-2xl font-bold">
            {monthlyExhausted ? 'Keep generating resumes' : 'Load resume credits'}
          </h2>
          <p className="mt-1 text-sm text-blue-100">
            {monthlyExhausted
              ? 'Your monthly allowance is used. Add credits without changing your subscription.'
              : 'Preload credits now. They are used automatically after your monthly allowance runs out.'}
          </p>
        </div>

        <div className="space-y-5 p-6">
          <div className="space-y-2 rounded-xl bg-gray-50 px-4 py-3 text-sm dark:bg-gray-900">
            <div className="flex items-center justify-between gap-3">
              <span className="text-gray-600 dark:text-gray-300">
                Monthly allowance
              </span>
              <span className="font-semibold text-gray-950 dark:text-white">
                {isRefreshing && !liveUsage ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : limit > 0 ? (
                  `${usage} / ${limit} used`
                ) : (
                  '—'
                )}
              </span>
            </div>
            {limit > 0 && !monthlyExhausted && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {monthlyRemaining} included resume{monthlyRemaining === 1 ? '' : 's'} left this month
              </p>
            )}
            <div className="flex items-center justify-between gap-3 border-t border-gray-200 pt-2 dark:border-gray-800">
              <span className="text-gray-600 dark:text-gray-300">
                Loaded credits
              </span>
              <span className="font-bold text-gray-950 dark:text-white">
                {isRefreshing && !liveUsage ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  balance
                )}
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-end gap-3">
              <label className="flex-1" htmlFor="resume-credit-amount">
                <span className="mb-1.5 block text-sm font-semibold text-gray-900 dark:text-white">
                  Choose an amount
                </span>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-500">
                    $
                  </span>
                  <Input
                    id="resume-credit-amount"
                    type="number"
                    inputMode="numeric"
                    min={RESUME_CREDIT_MIN_DOLLARS}
                    max={RESUME_CREDIT_MAX_DOLLARS}
                    step="1"
                    value={amountInput}
                    onChange={(event) => {
                      setAmountInput(event.target.value);
                      setError(null);
                    }}
                    disabled={isLoading}
                    className="h-11 pl-7 text-base font-semibold tabular-nums"
                  />
                </div>
              </label>
              <div className="pb-2 text-right">
                <span className="block text-lg font-bold text-gray-950 dark:text-white">
                  {credits || '—'} credits
                </span>
                <span className="text-xs text-gray-500">10 per $1</span>
              </div>
            </div>
            <div
              className="mt-3 flex flex-wrap gap-2"
              aria-label="Suggested amounts"
            >
              {RESUME_CREDIT_PACK.suggestedDollarAmounts.map(
                (suggestedAmount) => (
                  <button
                    key={suggestedAmount}
                    type="button"
                    onClick={() => {
                      setAmountInput(String(suggestedAmount));
                      setError(null);
                    }}
                    disabled={isLoading}
                    className="min-h-9 rounded-full border border-blue-200 bg-blue-50 px-3 text-xs font-semibold text-blue-700 transition-colors hover:border-blue-400 hover:bg-blue-100 disabled:cursor-wait disabled:opacity-60 dark:border-blue-900/70 dark:bg-blue-950/40 dark:text-blue-300"
                  >
                    ${suggestedAmount} ·{' '}
                    {creditsForPackQuantity(suggestedAmount)} credits
                  </button>
                )
              )}
            </div>
          </div>

          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <li className="flex gap-2">
              <Check className="mt-0.5 h-4 w-4 text-emerald-600" />
              10 credits for every $1
            </li>
            <li className="flex gap-2">
              <Check className="mt-0.5 h-4 w-4 text-emerald-600" />1 new resume
              uses 1 credit
            </li>
            <li className="flex gap-2">
              <Check className="mt-0.5 h-4 w-4 text-emerald-600" />A
              regeneration uses 0.5 credit
            </li>
          </ul>

          {error && (
            <p role="alert" className="text-sm font-medium text-red-600">
              {error}
            </p>
          )}

          <Button
            className="w-full"
            onClick={startCheckout}
            disabled={isLoading || !isValidAmount}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />{' '}
                Opening secure checkout…
              </>
            ) : (
              <>
                Buy {credits} credits for $
                {isValidAmount ? amount.toFixed(2) : '—'}
              </>
            )}
          </Button>

          <p className="text-xs leading-5 text-gray-500 dark:text-gray-400">
            One-time payment. No automatic renewal. Purchased credits require an
            active Pro or Dedicated subscription.
          </p>

          <Button variant="outline" className="w-full" onClick={onClose}>
            Not now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
