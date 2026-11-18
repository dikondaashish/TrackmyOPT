import { describe, expect, it } from 'vitest';
import {
  assessLateCase,
  buildCongressLetterText,
  buildLateCaseSteps,
  buildUscisInquiryText,
} from './late-case-help';

const pending = {
  daysSinceFiled: 120,
  medianDays: 96,
  phase: 'filed' as const,
  currentStatus: 'Case Was Received',
  premiumProcessing: false,
  estimatesAvailable: true,
};
const details = {
  receiptNumber: 'IOE0000000001',
  filedDate: '2026-07-01',
  daysSinceFiled: 120,
  stemExtension: false,
};

describe('assessLateCase', () => {
  it('flags a pending case past the typical wait', () => {
    expect(assessLateCase(pending)).toEqual({
      level: 'past_typical',
      daysSinceFiled: 120,
      medianDays: 96,
      daysPastTypical: 24,
    });
    expect(assessLateCase({ ...pending, phase: 'biometrics_done' })?.level).toBe(
      'past_typical'
    );
  });

  it('only claims the slow quarter when the Pro range says so', () => {
    expect(assessLateCase({ ...pending, p75Days: 110 })?.level).toBe(
      'slow_quarter'
    );
    expect(assessLateCase({ ...pending, p75Days: 130 })?.level).toBe(
      'past_typical'
    );
    expect(assessLateCase({ ...pending, p75Days: null })?.level).toBe(
      'past_typical'
    );
  });

  it.each([
    ['still inside the typical wait', { daysSinceFiled: 96 }],
    ['no filing date', { daysSinceFiled: null }],
    ['no community median', { medianDays: null }],
    ['a zero median', { medianDays: 0 }],
    ['premium processing', { premiumProcessing: true }],
    ['a non-OPT filing', { estimatesAvailable: false }],
    ['an approved case', { phase: 'approved' as const }],
    ['a card in production', { phase: 'card_produced' as const }],
    ['a denial', { currentStatus: 'Case Was Denied' }],
    ['an evidence request', { currentStatus: 'Request for Additional Evidence Was Sent' }],
  ])('stays hidden for %s', (_label, override) => {
    expect(assessLateCase({ ...pending, ...override })).toBeNull();
  });
});

describe('late-case steps', () => {
  it('lists the official routes in order, without fees or promises', () => {
    const steps = buildLateCaseSteps(details);
    expect(steps.map((step) => step.id)).toEqual([
      'inquiry_date',
      'ask_uscis',
      'premium',
      'congress',
      'ombudsman',
      'dso',
    ]);
    const text = JSON.stringify(steps);
    expect(text).not.toMatch(/\$\d|guarantee|will be approved/i);
    expect(text).toContain('30 business days');
    expect(text).toContain('last 90 days');
    expect(text).toContain('at least 60 days');
    for (const step of steps)
      for (const link of step.links)
        expect(link.href).toMatch(
          /^https:\/\/(egov\.uscis\.gov|www\.uscis\.gov|www\.dhs\.gov|studyinthestates\.dhs\.gov|www\.house\.gov|www\.senate\.gov)\//
        );
  });

  it('gives a STEM extension its own DSO step', () => {
    const stem = buildLateCaseSteps({ ...details, stemExtension: true });
    expect(stem.at(-1)!.body).toContain('STEM OPT');
    expect(buildUscisInquiryText({ ...details, stemExtension: true })).toContain(
      'Form I-765 (STEM OPT extension)'
    );
  });

  it('fills the templates with the case and leaves the rest as blanks', () => {
    const inquiry = buildUscisInquiryText(details);
    expect(inquiry).toContain(
      'Form I-765 (F-1 OPT), receipt number IOE0000000001, received by USCIS on 2026-07-01 and pending for 120 days'
    );
    const letter = buildCongressLetterText({ ...details, filedDate: null });
    expect(letter).toContain('received by USCIS on [filing date]');
    expect(letter).toContain('privacy release');
    expect(letter).toContain('[Full name]');
  });
});
