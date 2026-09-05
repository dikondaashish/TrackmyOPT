import { describe, expect, it } from 'vitest';
import {
  communityStatsToolType,
  communityChartSegmentSuffix,
  filingCategoryFromJourneyStatus,
  filingCategoryToCaseKind,
  getCommunityCaseKindLabel,
  getFilingCategoryFormMismatch,
  getFilingCategoryLabel,
  getFilingCategoryShortLabel,
  isOptFilingCategory,
  normalizeFilingCategory,
} from './filing-category';
import { inferCaseKind } from '@/lib/community-opt/centers';

describe('filing category helpers', () => {
  it('normalizes labels, journey mappings, and form validation', () => {
    expect(getFilingCategoryLabel('initial_opt')).toBe('Initial OPT (EAD)');
    expect(getFilingCategoryLabel('stem_extension')).toBe(
      'STEM OPT Extension (EAD)'
    );
    expect(getFilingCategoryLabel('h1b')).toBe('H-1B (I-129)');
    expect(getFilingCategoryShortLabel('stem_extension')).toBe('STEM');
    expect(normalizeFilingCategory(null)).toBe('initial_opt');
    expect(normalizeFilingCategory('h4_ead')).toBe('h4_ead');
    expect(normalizeFilingCategory('bogus')).toBe('initial_opt');
    expect(filingCategoryFromJourneyStatus('stem_opt')).toBe('stem_extension');
    expect(filingCategoryToCaseKind('h1b')).toBe('initial_opt');
    expect(isOptFilingCategory('stem_extension')).toBe(true);
    expect(communityStatsToolType('stem_extension')).toBe('stem-apply');
    expect(communityStatsToolType('initial_opt')).toBe('opt-apply');
    expect(getCommunityCaseKindLabel('stem_extension')).toBe(
      'STEM OPT extension'
    );
    expect(
      communityChartSegmentSuffix({
        caseKind: 'stem_extension',
        premiumProcessing: false,
      })
    ).toBe(' · STEM OPT extension · standard processing');
    expect(isOptFilingCategory('h1b')).toBe(false);
    expect(
      inferCaseKind({ caseType: 'I-765', filingCategory: 'stem_extension' })
    ).toBe('stem_extension');
    expect(getFilingCategoryFormMismatch('h1b', 'I-129')).toBeNull();
    expect(getFilingCategoryFormMismatch('h1b', 'I-539')).toMatch(/H-1B/);
  });
});
