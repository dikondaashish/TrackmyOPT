import { describe, expect, it } from 'vitest';
import { calculateEligibility, FPL_2026 } from '../state-eligibility';

const adult = { age: 26, isPregnant: false, visaType: 'OPT' };

describe('calculateEligibility', () => {
  it('uses the 2026 poverty guideline', () => {
    expect(FPL_2026.single.fpl100).toBe(15960);
    expect(FPL_2026.single.fpl200).toBe(31920);
  });

  it('keeps NY Essential Plan eligibility at or below 200% FPL', () => {
    expect(calculateEligibility({ ...adult, stateCode: 'NY', annualIncome: 31920 }).status).toBe('ELIGIBLE');
    expect(calculateEligibility({ ...adult, stateCode: 'NY', annualIncome: 35000 }).status).toBe('NOT_ELIGIBLE');
  });

  it('treats Oregon as covering adults on student visas', () => {
    const result = calculateEligibility({ ...adult, stateCode: 'OR', annualIncome: 20000 });
    expect(result.status).toBe('ELIGIBLE');
    expect(result.showStateProgram).toBe(true);
  });

  it('shows Massachusetts subsidies ending Dec 31, 2026 for adults', () => {
    const result = calculateEligibility({ ...adult, stateCode: 'MA', annualIncome: 30000 });
    expect(result.status).toBe('PROGRAM_ENDING');
    expect(result.stateConfig.endingLabel).toContain('Dec 31, 2026');
  });

  it.each(['WA', 'CA', 'CO', 'VT'])('does not offer %s state coverage to non-pregnant adults', (stateCode) => {
    expect(calculateEligibility({ ...adult, stateCode, annualIncome: 10000 }).status).toBe('NOT_ELIGIBLE');
  });

  it('routes children and pregnant people to the state child/pregnancy program', () => {
    const child = calculateEligibility({ ...adult, age: 16, stateCode: 'NY', annualIncome: 0 });
    expect(child.status).toBe('ELIGIBLE');
    expect(child.stateConfig.programName).toBe('Medicaid / Child Health Plus');

    const pregnant = calculateEligibility({ ...adult, isPregnant: true, stateCode: 'CO', annualIncome: 20000 });
    expect(pregnant.status).toBe('ELIGIBLE');
    expect(pregnant.stateConfig.programName).toBe('Health First Colorado / CHP+');
  });

  it('returns emergency-only for states without state-funded adult coverage', () => {
    expect(calculateEligibility({ ...adult, stateCode: 'TX', annualIncome: 10000 }).status).toBe('EMERGENCY_ONLY');
  });
});
