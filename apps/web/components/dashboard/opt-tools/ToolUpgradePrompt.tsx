'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Bell,
  ChartNoAxesCombined,
  CalendarCheck,
} from 'lucide-react';
import { toolButtonClass, toolThemes, type ToolSlug } from './tool-config';

export type ToolAudience = 'unknown' | 'guest' | 'free' | 'premium';
const headlines: Record<ToolSlug, string> = {
  'opt-apply': 'When could your OPT decision arrive?',
  'opt-clock': 'Know your next move, not just your days left.',
  'stem-apply': 'Waiting on STEM OPT? Get the bigger picture.',
  'stem-clock': 'Stay ahead of your next STEM milestone.',
};

export function ToolUpgradePrompt({
  slug,
  audience,
}: {
  slug: ToolSlug;
  audience: ToolAudience;
}) {
  if (audience !== 'guest' && audience !== 'free') return null;
  const theme = toolThemes[slug];
  return (
    <section
      aria-label="Explore TrackMyOPT Pro"
      className={`rounded-2xl border p-4 sm:p-5 ${theme.surface}`}
    >
      <p
        className={`text-xs font-semibold uppercase tracking-wide ${theme.text}`}
      >
        Go further with TrackMyOPT Pro
      </p>
      <h3 className="mt-2 text-xl font-semibold leading-snug tracking-tight">
        {headlines[slug]}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Turn a date calculation into a plan you can follow.
      </p>
      <ul className="my-4 space-y-3 text-sm">
        <li className="flex gap-2">
          <ChartNoAxesCombined
            aria-hidden="true"
            className={`mt-0.5 h-4 w-4 shrink-0 ${theme.text}`}
          />
          <span>See how your wait compares with similar reported cases.</span>
        </li>
        <li className="flex gap-2">
          <Bell
            aria-hidden="true"
            className={`mt-0.5 h-4 w-4 shrink-0 ${theme.text}`}
          />
          <span>
            Track USCIS updates with automatic checks and email alerts.
          </span>
        </li>
        <li className="flex gap-2">
          <CalendarCheck
            aria-hidden="true"
            className={`mt-0.5 h-4 w-4 shrink-0 ${theme.text}`}
          />
          <span>Connect your OPT dates with deadline reminders.</span>
        </li>
      </ul>
      <Link href="/pricing" className={`${toolButtonClass(slug)} w-full`}>
        {audience === 'guest' ? 'Explore Pro tracking' : 'Unlock Pro tracking'}
        <ArrowRight aria-hidden="true" className="h-4 w-4" />
      </Link>
      {audience === 'guest' && (
        <Link
          href="/login?redirect=%2Fdashboard%2Fcase-status"
          className={`mt-1 inline-flex min-h-11 w-full items-center justify-center text-sm font-medium underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 ${theme.focus}`}
        >
          Start with a free account
        </Link>
      )}
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        Your calculator stays free. Comparisons depend on available reports, not
        exact approval dates or approval odds.
      </p>
    </section>
  );
}
