/**
 * What to do once an OPT or STEM OPT case is approved.
 *
 * Until now the case page went quiet at approval, and most approved accounts
 * never used the rest of the product: of 1,453 accounts with an approved case
 * on 2026-11-18, 217 had saved EAD dates and 49 had recorded a job. These
 * steps point at the tools that matter next. They are free on every plan.
 *
 * Rules stated here: post-completion OPT allows up to 90 days of unemployment
 * in total and the STEM extension brings the total to 150; employer changes
 * are reported within 10 days; a STEM extension can be filed up to 90 days
 * before the current OPT EAD ends. Each step tells the person to confirm
 * with their DSO, who controls what applies to them.
 */

import type { JourneyPhase } from '@/lib/community-opt/stages';

export function isAfterApprovalPhase(phase: JourneyPhase): boolean {
  return (
    phase === 'approved' || phase === 'card_produced' || phase === 'delivered'
  );
}

export type AfterApprovalStep = {
  id: 'ead_dates' | 'unemployment_clock' | 'employment' | 'jobs' | 'stem_window';
  title: string;
  body: string;
  href: string;
  cta: string;
  /** True once the account has done it; undefined when it cannot be known. */
  done?: boolean;
};

export function buildAfterApprovalSteps(args: {
  stemExtension: boolean;
  hasEadDates: boolean;
  hasEmployment: boolean;
}): AfterApprovalStep[] {
  const { stemExtension, hasEadDates, hasEmployment } = args;
  const steps: AfterApprovalStep[] = [
    {
      id: 'ead_dates',
      title: 'Save the dates printed on your EAD',
      body: 'Your unemployment count and reminders run from the start and end dates on the card, not from the approval date.',
      href: '/dashboard/opt-dates',
      cta: hasEadDates ? 'Review my dates' : 'Save my EAD dates',
      done: hasEadDates,
    },
    {
      id: 'unemployment_clock',
      title: stemExtension
        ? 'Watch your 150 unemployment days'
        : 'Watch your 90 unemployment days',
      body: stemExtension
        ? 'With the STEM extension you may be unemployed for up to 150 days in total, counting the days already used on your first OPT.'
        : 'On post-completion OPT you may be unemployed for up to 90 days in total. The count starts on your EAD start date.',
      href: stemExtension
        ? '/dashboard/opt-tools/stem-clock'
        : '/dashboard/opt-tools/opt-clock',
      cta: 'Open my unemployment clock',
    },
    {
      id: 'employment',
      title: 'Add your job when you start',
      body: 'Report a new employer to your DSO or in the SEVP Portal within 10 days. Saving it here stops your unemployment count on the right day.',
      href: '/dashboard/opt-dates#employment',
      cta: hasEmployment ? 'Review my employment' : 'Add my employer',
      done: hasEmployment,
    },
    {
      id: 'jobs',
      title: 'Find jobs at employers with an H-1B record',
      body: 'Browse current openings with each employer\u2019s H-1B petition history and E-Verify status, and keep your applications in one list.',
      href: '/dashboard/career/jobs',
      cta: 'See verified jobs',
    },
  ];
  if (!stemExtension)
    steps.push({
      id: 'stem_window',
      title: 'Check whether you can extend with STEM OPT',
      body: 'If your degree is on the STEM list, you can apply for a 24-month extension up to 90 days before your OPT EAD ends.',
      href: '/dashboard/opt-tools/stem-apply',
      cta: 'Check my STEM window',
    });
  return steps;
}

export const AFTER_APPROVAL_DISCLAIMER =
  'General information, not legal advice. Your EAD, your I-20 and your DSO control your dates and reporting duties.';

/** Link people share with a friend who is still waiting. No reward is attached. */
export const SHARE_URL =
  'https://www.trackmyopt.com/?utm_source=share&utm_medium=referral&utm_campaign=after_approval';
