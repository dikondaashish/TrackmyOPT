import { describe, expect, it } from 'vitest';
import {
  SHARE_URL,
  buildAfterApprovalSteps,
  isAfterApprovalPhase,
} from './after-approval';

describe('isAfterApprovalPhase', () => {
  it('is true from approval onwards and false while pending', () => {
    expect(isAfterApprovalPhase('approved')).toBe(true);
    expect(isAfterApprovalPhase('card_produced')).toBe(true);
    expect(isAfterApprovalPhase('delivered')).toBe(true);
    expect(isAfterApprovalPhase('filed')).toBe(false);
    expect(isAfterApprovalPhase('biometrics_done')).toBe(false);
  });
});

describe('buildAfterApprovalSteps', () => {
  const none = { hasEadDates: false, hasEmployment: false };

  it('gives initial OPT the 90-day clock and the STEM window', () => {
    const steps = buildAfterApprovalSteps({ stemExtension: false, ...none });
    expect(steps.map((step) => step.id)).toEqual([
      'ead_dates',
      'unemployment_clock',
      'employment',
      'jobs',
      'stem_window',
    ]);
    const clock = steps[1]!;
    expect(clock.title).toContain('90');
    expect(clock.href).toBe('/dashboard/opt-tools/opt-clock');
    expect(steps[0]!.cta).toBe('Save my EAD dates');
    expect(steps[2]!.cta).toBe('Add my employer');
  });

  it('gives a STEM extension the 150-day clock and no STEM window step', () => {
    const steps = buildAfterApprovalSteps({ stemExtension: true, ...none });
    expect(steps.map((step) => step.id)).toEqual([
      'ead_dates',
      'unemployment_clock',
      'employment',
      'jobs',
    ]);
    expect(steps[1]!.title).toContain('150');
    expect(steps[1]!.href).toBe('/dashboard/opt-tools/stem-clock');
  });

  it('marks what the account has already saved', () => {
    const steps = buildAfterApprovalSteps({
      stemExtension: false,
      hasEadDates: true,
      hasEmployment: true,
    });
    expect(steps[0]).toMatchObject({ done: true, cta: 'Review my dates' });
    expect(steps[2]).toMatchObject({
      done: true,
      cta: 'Review my employment',
    });
    // Steps that cannot be known stay unmarked.
    expect(steps[1]!.done).toBeUndefined();
    expect(steps[3]!.done).toBeUndefined();
  });

  it('links only to dashboard pages and makes no promise about outcomes', () => {
    const text = JSON.stringify([
      ...buildAfterApprovalSteps({ stemExtension: false, ...none }),
      ...buildAfterApprovalSteps({ stemExtension: true, ...none }),
    ]);
    expect(text).not.toMatch(/guarantee|will sponsor|\$\d/i);
    for (const step of buildAfterApprovalSteps({
      stemExtension: false,
      ...none,
    }))
      expect(step.href).toMatch(/^\/dashboard\//);
  });

  it('shares a tagged link to the home page', () => {
    const url = new URL(SHARE_URL);
    expect(url.origin).toBe('https://www.trackmyopt.com');
    expect(url.searchParams.get('utm_campaign')).toBe('after_approval');
  });
});
