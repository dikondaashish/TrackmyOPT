import { describe, expect, it } from 'vitest';
import { buildOptComplianceActions } from './opt-compliance-actions';

describe('buildOptComplianceActions', () => {
  it('never invents completed compliance work', () => {
    const actions = buildOptComplianceActions({});
    expect(actions.every((action) => action.status !== 'done')).toBe(true);
  });

  it('anchors the STEM annual evaluation to the STEM start date', () => {
    const actions = buildOptComplianceActions({
      stemStartDate: '2026-07-01',
      stemEndDate: '2028-06-30',
    });
    const annual = actions.find(
      (action) => action.id === 'stem-annual-evaluation'
    );
    const final = actions.find(
      (action) => action.id === 'stem-final-evaluation'
    );

    expect(annual?.dueDate).toBe('2027-07-11');
    expect(final?.dueDate).toBe('2028-07-10');
  });

  it('does not derive employment reporting deadlines from the USCIS filing date', () => {
    const actions = buildOptComplianceActions({ uscisFiledDate: '2026-04-01' });
    const employment = actions.find(
      (action) => action.id === 'report-employment-change'
    );
    expect(employment?.dueDate).toBeUndefined();
  });
  it('calculates all four STEM validation dates, not undefined timestamp parses', () => {
    const actions = buildOptComplianceActions({ stemStartDate: '2026-07-01' });
    const validations = actions.filter((a) => a.id.includes('validation'));
    expect(validations).toHaveLength(4);
    expect(
      validations.every((a) => /^\d{4}-\d{2}-\d{2}$/.test(a.dueDate ?? ''))
    ).toBe(true);
    expect(
      validations.find((a) => a.id === 'stem-six-month-validation')?.dueDate
    ).toBe('2027-01-15');
  });
  it('keeps a deadline open throughout its calendar day', () => {
    const actions = buildOptComplianceActions({
      employmentChangeDate: '2026-08-01',
      now: new Date(2026, 7, 11, 23, 59),
    });
    expect(actions[0].dueDate).toBe('2026-08-11');
    expect(actions[0].status).toBe('open');
  });
  it('does not shift dates across daylight-saving transitions', () => {
    expect(
      buildOptComplianceActions({ employmentChangeDate: '2026-03-01' })[0]
        .dueDate
    ).toBe('2026-03-11');
  });
});
