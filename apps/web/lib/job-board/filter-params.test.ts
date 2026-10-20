import { describe, expect, it } from 'vitest';
import { EMPTY_JOB_FILTERS } from './filters';
import { hasJobFilterParams, jobSearchParams, readJobSearchParams, toUrlSearchParams } from './filter-params';

describe('job board filter params', () => {
  it('round-trips a search and leaves defaults out of the URL', () => {
    const filters = { ...EMPTY_JOB_FILTERS, query: 'data, ML', company: 'Anyscale, Inc.', places: ['state:CA', 'remote:us'], tracker: 'saved' as const, date: '7d' as const };
    const params = jobSearchParams({ filters, page: 3, resumeId: 'resume-1' });
    expect(params.has('workplace')).toBe(false);
    expect(readJobSearchParams(params)).toEqual({ filters, page: 3, resumeId: 'resume-1' });
  });

  it('falls back to defaults for unknown or malformed values', () => {
    const { filters, page, resumeId } = readJobSearchParams(new URLSearchParams('page=-2&workplace=moon&date=99d&place=nowhere'));
    expect(filters).toEqual(EMPTY_JOB_FILTERS);
    expect(page).toBe(1);
    expect(resumeId).toBeNull();
  });

  it('tells a filtered link from a bare page visit', () => {
    expect(hasJobFilterParams(new URLSearchParams('page=2&resumeId=none'))).toBe(false);
    expect(hasJobFilterParams(toUrlSearchParams({ place: ['state:CA'], page: '1' }))).toBe(true);
  });
});
