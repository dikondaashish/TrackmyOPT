/**
 * "My case is late" help: when to show it, and the steps it lists.
 *
 * The steps follow the official pages checked on 2026-11-18:
 * - USCIS case inquiries start from the Case Processing Times tool, which
 *   gives either the date you may ask or a link to ask
 *   (egov.uscis.gov/processing-times, /processing-times/processing-times-faqs).
 * - USCIS does not consider ordinary expedite requests where premium
 *   processing is available (uscis.gov/forms/filing-guidance/expedite-requests).
 * - Premium processing on a pending case is requested with Form I-907; the
 *   I-765 timeframe is 30 business days.
 * - The CIS Ombudsman requires contact with USCIS in the last 90 days and at
 *   least 60 days for USCIS to resolve it (dhs.gov/case-assistance).
 *
 * Nothing here predicts or speeds up a decision. Keep fees out of the copy;
 * they change, and the USCIS Fee Schedule is the source.
 */

import type { JourneyPhase } from '@/lib/community-opt/stages';

export type LateCaseLevel = 'past_typical' | 'slow_quarter';

export type LateCaseAssessment = {
  level: LateCaseLevel;
  daysSinceFiled: number;
  medianDays: number;
  daysPastTypical: number;
};

/**
 * A pending OPT or STEM OPT case that has waited longer than the typical
 * community wait. `slow_quarter` needs the Pro range (p75); Free has only the
 * median, so it never gets a claim about where the case sits in the spread.
 */
export function assessLateCase(args: {
  daysSinceFiled: number | null | undefined;
  medianDays: number | null | undefined;
  p75Days?: number | null;
  phase: JourneyPhase;
  currentStatus: string | null | undefined;
  premiumProcessing: boolean;
  estimatesAvailable: boolean;
}): LateCaseAssessment | null {
  const days = args.daysSinceFiled ?? 0;
  const median = args.medianDays ?? 0;
  if (!args.estimatesAvailable || args.premiumProcessing) return null;
  if (args.phase !== 'filed' && args.phase !== 'biometrics_done') return null;
  const status = (args.currentStatus ?? '').toLowerCase();
  // A decision closes the wait; an evidence request puts the next move on the applicant.
  if (/denied|rejected|withdraw|revoked|terminated|evidence/.test(status))
    return null;
  if (!Number.isFinite(days) || !Number.isFinite(median)) return null;
  if (median <= 0 || days <= median) return null;
  return {
    level:
      typeof args.p75Days === 'number' && days > args.p75Days
        ? 'slow_quarter'
        : 'past_typical',
    daysSinceFiled: days,
    medianDays: median,
    daysPastTypical: days - median,
  };
}

export type LateCaseStep = {
  id:
    | 'inquiry_date'
    | 'ask_uscis'
    | 'premium'
    | 'congress'
    | 'ombudsman'
    | 'dso';
  title: string;
  body: string;
  links: Array<{ label: string; href: string }>;
  /** Text the person can copy and adapt. */
  template?: { label: string; text: string };
};

export type LateCaseDetails = {
  receiptNumber: string;
  /** ISO filing date, or null when unknown. */
  filedDate: string | null;
  daysSinceFiled: number;
  stemExtension: boolean;
};

function caseLine(details: LateCaseDetails): string {
  const form = details.stemExtension
    ? 'Form I-765 (STEM OPT extension)'
    : 'Form I-765 (F-1 OPT)';
  const filed = details.filedDate
    ? `received by USCIS on ${details.filedDate}`
    : 'received by USCIS on [filing date]';
  return `${form}, receipt number ${details.receiptNumber}, ${filed} and pending for ${details.daysSinceFiled} days`;
}

export function buildUscisInquiryText(details: LateCaseDetails): string {
  return [
    `I am asking about my ${caseLine(details)}.`,
    'The Case Processing Times tool shows that I can now ask about this case.',
    'Please tell me whether anything is needed from me and when I can expect a decision.',
    '[Add your work start date or program end date if a deadline is close.]',
  ].join('\n');
}

export function buildCongressLetterText(details: LateCaseDetails): string {
  return [
    'Dear [Representative / Senator] [Name],',
    '',
    'I live in your [district / state] and I am asking for help with a delayed USCIS application.',
    '',
    `My case: ${caseLine(details)}.`,
    'I asked USCIS about it on [date] (service request number [number]) and have not had a resolution.',
    '[One or two sentences on why the delay matters: job start date, end of your grace period, an expiring EAD.]',
    '',
    'Could your office ask USCIS for the status of my case? I can sign your privacy release form.',
    '',
    'Thank you,',
    '[Full name]',
    '[Address in the district or state]',
    '[Phone and email]',
  ].join('\n');
}

export function buildLateCaseSteps(details: LateCaseDetails): LateCaseStep[] {
  return [
    {
      id: 'inquiry_date',
      title: 'Check whether USCIS will take a question yet',
      body: 'Open the USCIS Case Processing Times tool, choose Form I-765 and your category, and enter your receipt date. It shows either the date you can ask about your case or a link to ask now. Until that date, USCIS treats the case as inside normal processing.',
      links: [
        {
          label: 'USCIS Case Processing Times',
          href: 'https://egov.uscis.gov/processing-times',
        },
      ],
    },
    {
      id: 'ask_uscis',
      title: 'Ask USCIS about your case',
      body: 'Once the tool allows it, submit a case inquiry online or call the USCIS Contact Center at 800-375-5283. Write down the date and the service request number: later steps ask for them.',
      links: [
        {
          label: 'Ask about the processing of your case',
          href: 'https://egov.uscis.gov/e-request/ccpt',
        },
      ],
      template: {
        label: 'Message you can adapt',
        text: buildUscisInquiryText(details),
      },
    },
    {
      id: 'premium',
      title: 'Consider premium processing',
      body: 'For F-1 OPT and STEM OPT, USCIS accepts Form I-907 to add premium processing to a pending I-765. USCIS then takes action within 30 business days of receiving it, such as an approval, a denial or a request for evidence. USCIS does not consider ordinary expedite requests for forms that have premium processing, so this is the paid way to speed up. Check eligibility and the current fee before you file.',
      links: [
        {
          label: 'Form I-907 on USCIS',
          href: 'https://www.uscis.gov/i-907',
        },
        {
          label: 'How premium processing works',
          href: 'https://www.uscis.gov/forms/all-forms/how-do-i-request-premium-processing',
        },
      ],
    },
    {
      id: 'congress',
      title: 'Ask your member of Congress to inquire',
      body: 'Offices of U.S. Representatives and Senators have caseworkers who can ask USCIS about a delayed case for people living in their district or state. Most ask you to sign a privacy release. It helps to have already asked USCIS yourself.',
      links: [
        {
          label: 'Find your Representative',
          href: 'https://www.house.gov/representatives/find-your-representative',
        },
        {
          label: 'Find your Senators',
          href: 'https://www.senate.gov/senators/senators-contact.htm',
        },
      ],
      template: {
        label: 'Letter you can adapt',
        text: buildCongressLetterText(details),
      },
    },
    {
      id: 'ombudsman',
      title: 'Ask the CIS Ombudsman for case assistance',
      body: 'The CIS Ombudsman is an office in the Department of Homeland Security, separate from USCIS, and its help is free. It asks that you contacted USCIS in the last 90 days and gave USCIS at least 60 days to resolve the problem, and it generally cannot help while the case is still inside normal processing.',
      links: [
        {
          label: 'How to submit a case assistance request',
          href: 'https://www.dhs.gov/case-assistance',
        },
      ],
    },
    {
      id: 'dso',
      title: 'Tell your DSO if a deadline is close',
      body: details.stemExtension
        ? 'If your current OPT EAD has expired or is about to, ask your DSO how the automatic extension for a timely filed STEM OPT application applies to you, and what your employer needs for Form I-9.'
        : 'If your requested OPT start date, your job start date, or the end of your grace period is close, tell your DSO now. Your DSO can explain your options and what you may and may not do while the application is pending.',
      links: [
        {
          label: 'Study in the States: OPT',
          href: 'https://studyinthestates.dhs.gov/students/training-opportunities-in-the-united-states',
        },
      ],
    },
  ];
}

export const LATE_CASE_DISCLAIMER =
  'General information, not legal advice. None of these steps guarantees a faster decision. Your USCIS notices and your DSO control what applies to you.';
