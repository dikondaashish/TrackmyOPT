'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  Clock,
  Puzzle,
  FileText,
  Shield,
  Users,
} from 'lucide-react';
import { captureClientEvent } from '@/lib/posthog-client';

export type BlogProductCtaVariant =
  | 'case-status'
  | 'uscis-tracking'
  | 'opt-timeline'
  | 'unemployment'
  | 'sponsors'
  | 'resume'
  | 'community'
  | 'extension';

const VARIANTS: Record<
  BlogProductCtaVariant,
  {
    icon: typeof Bell;
    title: string;
    description: string;
    href: string;
    cta: string;
  }
> = {
  'uscis-tracking': {
    icon: Bell,
    title: 'Keep your USCIS case in one place',
    description:
      'Save your receipt for free manual checks. Pro adds daily USCIS checks and email alerts when we detect a status change.',
    href: '/dashboard/case-status',
    cta: 'Save my case',
  },
  // Primary destination is the free case tracker (account required), as it was
  // before Oct 5, 2026. Sending this CTA to the guest decision-window tool
  // added a step before signup; signups fell about a third and new paid
  // subscriptions stopped. The tool stays one click away as the secondary link.
  'case-status': {
    icon: Bell,
    title: 'Know your USCIS status — and when a decision may come',
    description:
      'Add your receipt number once. See plain-English status updates, refresh free anytime, and add daily checks with email alerts on Pro.',
    href: '/dashboard/case-status',
    cta: 'Check my status free',
  },
  'opt-timeline': {
    icon: Clock,
    title: 'See your OPT timeline in one dashboard',
    description:
      'Track processing milestones, unemployment days, and deadlines alongside your case status.',
    href: '/tools/opt-clock',
    cta: 'Open OPT timeline',
  },
  unemployment: {
    icon: Shield,
    title: 'Count your OPT unemployment days',
    description:
      'Avoid the 90-day limit — live counter synced to your OPT dates with compliance reminders.',
    href: '/tools/opt-clock',
    cta: 'Check unemployment days',
  },
  sponsors: {
    icon: BriefcaseBusiness,
    title: 'Research employers with real filing history',
    description:
      'Compare H-1B filing history, entry-level signals, common roles, and verified career links before spending hours on an application.',
    href: '/dashboard/career/h1b-sponsors',
    cta: 'Search H-1B sponsors',
  },
  resume: {
    icon: FileText,
    title: 'Turn this guidance into a stronger application',
    description:
      'Build an ATS-friendly U.S. resume, tailor it to a job description, and keep your search organized alongside your OPT timeline.',
    href: '/dashboard/career/resume-generator',
    cta: 'Build my resume',
  },
  extension: {
    icon: Puzzle,
    title: 'Save jobs to your tracker while you browse',
    description:
      'The free TrackMyOPT Chrome extension saves postings from LinkedIn, Indeed, and many ATS portals to your job tracker, flags explicit sponsorship wording, and never submits an application for you.',
    href: '/features/extension',
    cta: 'Get the extension',
  },
  community: {
    icon: Users,
    title: 'Plan with community timelines—not rumors',
    description:
      'Compare anonymized OPT milestones, record your own case, and keep official USCIS status separate from community planning estimates.',
    href: '/tools/opt-decision-window',
    cta: 'Explore community data',
  },
};

type BlogProductCTAProps = {
  variant: BlogProductCtaVariant;
  /** Page path for PostHog, e.g. /blog/opt-processing-time-2026 */
  sourcePage: string;
};

export function BlogProductCTA({ variant, sourcePage }: BlogProductCTAProps) {
  const config = VARIANTS[variant];
  const Icon = config.icon;

  const handleClick = () => {
    captureClientEvent('blog_product_cta_clicked', {
      variant,
      source_page: sourcePage,
    });
  };

  return (
    <div className="not-prose my-10 rounded-xl border border-ink-border bg-ink p-6 text-ink-foreground shadow-elevated sm:p-7">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
          <Icon className="h-6 w-6" aria-hidden />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-bold text-ink-foreground">
            {config.title}
          </p>
          <p className="mt-1 text-sm text-ink-muted leading-relaxed">
            {config.description}
          </p>
          <p className="mt-2 text-xs text-ink-muted">
            Also see{' '}
            <Link
              href={
                variant === 'sponsors'
                  ? '/features/sponsors'
                  : variant === 'resume'
                    ? '/features/resume-ai'
                    : variant === 'community'
                      ? '/features/community'
                      : variant === 'case-status'
                        ? '/tools/opt-decision-window'
                        : '/features/case-status'
              }
              className="text-blue-300 hover:text-blue-200 hover:underline font-medium"
              onClick={() =>
                captureClientEvent('blog_product_cta_clicked', {
                  variant:
                    variant === 'case-status'
                      ? 'decision-window-link'
                      : 'features-link',
                  source_page: sourcePage,
                })
              }
            >
              {variant === 'sponsors'
                ? 'H-1B sponsor research features'
                : variant === 'resume'
                  ? 'resume and job-search features'
                  : variant === 'community'
                    ? 'community timeline methodology'
                    : variant === 'case-status'
                      ? 'a free decision-window estimate (no account needed)'
                      : 'USCIS case status tracker features'}
            </Link>
          </p>
          {variant === 'case-status' && (
            <p className="mt-1.5 text-[10px] leading-snug text-ink-muted">
              Decision windows are community planning estimates — not legal
              advice or a USCIS-guaranteed decision date.{' '}
              <Link
                href="/disclaimer"
                className="underline underline-offset-2 hover:text-ink-foreground"
              >
                Terms
              </Link>
            </p>
          )}
        </div>
        <Link
          href={config.href}
          onClick={handleClick}
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-button transition-colors hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
        >
          {config.cta}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
