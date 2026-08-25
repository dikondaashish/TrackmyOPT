'use client';

import {
  ArrowRight,
  BarChart3,
  BellRing,
  LockKeyhole,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PRO_PAID_INTRO, PLAN_PRICES } from '@/lib/pricing/plan-config';
import { CASE_STATUS_MESSAGING } from '@/lib/messaging/product-copy';

type CaseInsightUpgradeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpgrade: () => void;
  introEligible: boolean;
  daysSinceFiled?: number;
  typicalWaitDays?: number;
  cohortSize?: number;
};

const BENEFITS = [
  {
    icon: BarChart3,
    title: 'See your likely decision window',
    body: 'Compare your filing date with completed community timelines similar to yours.',
  },
  {
    icon: RefreshCw,
    title: 'Stop checking USCIS manually',
    body: 'Pro checks your saved case every day, even when you do not open TrackMyOPT.',
  },
  {
    icon: BellRing,
    title: 'Know when your status changes',
    body: 'Get an email after our daily check detects a new USCIS status.',
  },
] as const;

export function CaseInsightUpgradeDialog({
  open,
  onOpenChange,
  onUpgrade,
  introEligible,
  daysSinceFiled = 0,
  typicalWaitDays,
  cohortSize,
}: CaseInsightUpgradeDialogProps) {
  const hasCommunityHeadline =
    daysSinceFiled > 0 &&
    typeof typicalWaitDays === 'number' &&
    typicalWaitDays > 0 &&
    typeof cohortSize === 'number' &&
    cohortSize > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby="case-insight-upgrade-description"
        className="max-w-xl overflow-hidden rounded-2xl border-violet-200 p-0 dark:border-violet-900"
      >
        <div className="bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 px-5 pb-6 pt-7 text-white sm:px-7">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em]">
            <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />
            Pro case intelligence
          </div>
          <DialogHeader className="pr-7 text-left">
            <DialogTitle className="text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl">
              {CASE_STATUS_MESSAGING.caseInsightHeadline}
            </DialogTitle>
            <DialogDescription
              id="case-insight-upgrade-description"
              className="mt-2 text-sm leading-relaxed text-violet-50 sm:text-base"
            >
              {hasCommunityHeadline
                ? `You are ${daysSinceFiled} days in. The typical reported wait across ${cohortSize.toLocaleString()} comparable community cases is ${typicalWaitDays} days. Pro shows the deeper range and watches USCIS for changes.`
                : CASE_STATUS_MESSAGING.caseInsightBody}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-5 px-5 py-6 sm:px-7">
          <div className="space-y-4">
            {BENEFITS.map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-900 dark:bg-violet-950/40">
            <p className="text-sm font-bold text-violet-950 dark:text-violet-100">
              {introEligible
                ? `$${PRO_PAID_INTRO.price.toFixed(2)} for your first ${PRO_PAID_INTRO.durationDays} days`
                : `Pro starts at $${PLAN_PRICES.pro.month.toFixed(2)}/month`}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-violet-800 dark:text-violet-200">
              {introEligible
                ? 'Then your selected monthly or annual Pro price renews automatically unless you cancel before the introductory period ends.'
                : 'Choose monthly or annual billing at checkout. Subscriptions renew automatically until canceled.'}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row-reverse">
            <Button
              type="button"
              onClick={onUpgrade}
              className="h-11 cursor-pointer bg-violet-600 px-5 text-white hover:bg-violet-700 sm:flex-1"
            >
              {CASE_STATUS_MESSAGING.caseInsightCta}
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="h-11 cursor-pointer sm:px-5"
            >
              Keep checking manually
            </Button>
          </div>

          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Community estimates help with planning; they are not USCIS
            predictions or guarantees. TrackMyOPT cannot speed up or influence a
            USCIS decision.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
