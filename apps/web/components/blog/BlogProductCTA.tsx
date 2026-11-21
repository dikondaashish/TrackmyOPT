'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  BriefcaseBusiness,
  CalendarClock,
  ClipboardList,
  Clock,
  FileText,
  FolderLock,
  GraduationCap,
  HeartPulse,
  LayoutDashboard,
  Puzzle,
  Receipt,
  Shield,
  Users,
} from 'lucide-react';
import { captureClientEvent } from '@/lib/posthog-client';

export type BlogProductCtaVariant =
  | 'case-status'
  | 'uscis-tracking'
  | 'green-card'
  | 'opt-timeline'
  | 'opt-apply'
  | 'unemployment'
  | 'stem-opt'
  | 'stem-unemployment'
  | 'e-verify'
  | 'sponsors'
  | 'resume'
  | 'job-tracker'
  | 'extension'
  | 'tax'
  | 'health-insurance'
  | 'documents'
  | 'community'
  | 'dashboard';

type SecondaryLink = { href: string; label: string };

const CASE_STATUS_FEATURES: SecondaryLink = {
  href: '/features/case-status',
  label: 'USCIS case status tracker features',
};

/**
 * One box per product feature. Each blog post shows the box that matches its
 * topic, so the copy here must stay true to what the linked page does and to
 * what is free (lib/pricing/plan-features.ts).
 */
const VARIANTS: Record<
  BlogProductCtaVariant,
  {
    icon: typeof Bell;
    title: string;
    description: string;
    href: string;
    cta: string;
    secondary: SecondaryLink;
  }
> = {
  'uscis-tracking': {
    icon: Bell,
    title: 'Keep your USCIS case in one place',
    description:
      'Save your receipt for free manual checks. Pro adds daily USCIS checks and email alerts when we detect a status change.',
    href: '/dashboard/case-status',
    cta: 'Save my case',
    secondary: CASE_STATUS_FEATURES,
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
    secondary: {
      href: '/tools/opt-decision-window',
      label: 'a free decision-window estimate (no account needed)',
    },
  },
  'green-card': {
    icon: Bell,
    title: 'Track your I-140 or I-485 status',
    description:
      'Save your receipt number and check your status free. Pro adds daily USCIS checks and email alerts when it changes.',
    href: '/dashboard/case-status',
    cta: 'Track my case free',
    secondary: CASE_STATUS_FEATURES,
  },
  'opt-timeline': {
    icon: Clock,
    title: 'See your OPT timeline in one dashboard',
    description:
      'Track processing milestones, unemployment days, and deadlines alongside your case status.',
    href: '/tools/opt-clock',
    cta: 'Open OPT timeline',
    secondary: CASE_STATUS_FEATURES,
  },
  'opt-apply': {
    icon: CalendarClock,
    title: 'Find your OPT filing window',
    description:
      'Free filing-window calculator and Form I-765 checklist for F-1 students. No account needed.',
    href: '/tools/opt-apply',
    cta: 'Calculate my window',
    secondary: {
      href: '/features/compliance',
      label: 'OPT deadline and compliance features',
    },
  },
  unemployment: {
    icon: Shield,
    title: 'Count your OPT unemployment days',
    description:
      'Avoid the 90-day limit — live counter synced to your OPT dates with compliance reminders.',
    href: '/tools/opt-clock',
    cta: 'Check unemployment days',
    secondary: CASE_STATUS_FEATURES,
  },
  'stem-opt': {
    icon: GraduationCap,
    title: 'Plan your STEM OPT extension',
    description:
      'Free filing-window calculator with Form I-983 reminders and E-Verify planning steps. No account needed.',
    href: '/tools/stem-apply',
    cta: 'Open STEM OPT planner',
    secondary: {
      href: '/tools/stem-clock',
      label: 'the STEM OPT unemployment calculator',
    },
  },
  'stem-unemployment': {
    icon: Shield,
    title: 'Count your STEM OPT unemployment days',
    description:
      'Track your days against the 150-day combined limit in a free calculator. No account needed.',
    href: '/tools/stem-clock',
    cta: 'Check my days',
    secondary: {
      href: '/tools/stem-apply',
      label: 'the STEM OPT filing-window calculator',
    },
  },
  'e-verify': {
    icon: BadgeCheck,
    title: 'Check if an employer is in E-Verify',
    description:
      'Search the official E-Verify employer list free before you accept a STEM OPT offer.',
    href: '/e-verify-employer-search',
    cta: 'Search employers',
    secondary: {
      href: '/tools/stem-apply',
      label: 'the STEM OPT filing-window calculator',
    },
  },
  sponsors: {
    icon: BriefcaseBusiness,
    title: 'Research employers with real filing history',
    description:
      'Compare H-1B filing history, entry-level signals, common roles, and verified career links before spending hours on an application.',
    href: '/dashboard/career/h1b-sponsors',
    cta: 'Search H-1B sponsors',
    secondary: {
      href: '/features/sponsors',
      label: 'H-1B sponsor research features',
    },
  },
  resume: {
    icon: FileText,
    title: 'Turn this guidance into a stronger application',
    description:
      'Build an ATS-friendly U.S. resume, tailor it to a job description, and keep your search organized alongside your OPT timeline.',
    href: '/dashboard/career/resume-generator',
    cta: 'Build my resume',
    secondary: {
      href: '/features/resume-ai',
      label: 'resume and job-search features',
    },
  },
  'job-tracker': {
    icon: ClipboardList,
    title: 'Keep your job search in one tracker',
    description:
      'Track applications, interviews and offers free, next to your OPT unemployment days.',
    href: '/dashboard/career/job-tracker',
    cta: 'Track my applications',
    secondary: {
      href: '/features/job-tracker',
      label: 'job tracker features',
    },
  },
  extension: {
    icon: Puzzle,
    title: 'Save jobs to your tracker while you browse',
    description:
      'The free TrackMyOPT Chrome extension saves postings from LinkedIn, Indeed, and many ATS portals to your job tracker, flags explicit sponsorship wording, and never submits an application for you.',
    href: '/features/extension',
    cta: 'Get the extension',
    secondary: CASE_STATUS_FEATURES,
  },
  tax: {
    icon: Receipt,
    title: 'File your F-1 taxes without guessing',
    description:
      'Free guide to the forms you need, including Form 8843 and Form 1040-NR, with deadlines and nonresident filing options.',
    href: '/dashboard/tax-filing',
    cta: 'Open tax guide',
    secondary: {
      href: '/features/tax-filing',
      label: 'tax filing features',
    },
  },
  'health-insurance': {
    icon: HeartPulse,
    title: 'Find health insurance for OPT',
    description:
      'Check the plans open to you by state in the free Health Insurance Finder. No SSN needed.',
    href: '/dashboard/opt-health-insurance-finder',
    cta: 'Check my options',
    secondary: {
      href: '/features/health-insurance',
      label: 'health insurance features',
    },
  },
  documents: {
    icon: FolderLock,
    title: 'Keep your immigration documents in one place',
    description:
      'Store your I-20, EAD and USCIS notices in the Document Vault, with a passcode lock and expiry reminders. Included in Pro.',
    href: '/dashboard/documents',
    cta: 'Open Document Vault',
    secondary: {
      href: '/features/compliance',
      label: 'OPT deadline and compliance features',
    },
  },
  community: {
    icon: Users,
    title: 'Plan with community timelines—not rumors',
    description:
      'Compare anonymized OPT milestones, record your own case, and keep official USCIS status separate from community planning estimates.',
    href: '/tools/opt-decision-window',
    cta: 'Explore community data',
    secondary: {
      href: '/features/community',
      label: 'community timeline methodology',
    },
  },
  dashboard: {
    icon: LayoutDashboard,
    title: 'Your OPT dates, deadlines and case in one place',
    description:
      'A free account gives you an OPT timeline, an unemployment-day count, USCIS case status and a job tracker.',
    href: '/login',
    cta: 'Start free',
    secondary: {
      href: '/features',
      label: 'everything TrackMyOPT does',
    },
  },
};

type BlogProductCTAProps = {
  variant: BlogProductCtaVariant;
  /** Page path for PostHog, e.g. /blog/opt-processing-time-2026 */
  sourcePage: string;
  /** Where on the page this box sits, for PostHog. */
  placement?: 'top' | 'bottom';
};

export function BlogProductCTA({
  variant,
  sourcePage,
  placement,
}: BlogProductCTAProps) {
  const config = VARIANTS[variant];
  const Icon = config.icon;

  const capture = (clicked: string) => {
    captureClientEvent('blog_product_cta_clicked', {
      variant: clicked,
      source_page: sourcePage,
      ...(placement ? { placement } : {}),
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
              href={config.secondary.href}
              className="text-blue-300 hover:text-blue-200 hover:underline font-medium"
              onClick={() =>
                capture(
                  variant === 'case-status'
                    ? 'decision-window-link'
                    : 'features-link'
                )
              }
            >
              {config.secondary.label}
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
          onClick={() => capture(variant)}
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-button transition-colors hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
        >
          {config.cta}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
