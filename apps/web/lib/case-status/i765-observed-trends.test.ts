import { describe, expect, it } from 'vitest';
import { parseI765ObservedTrends } from './i765-observed-trends';

const sample = {
  form: 'I-765',
  serviceCenter: 'all',
  period: '6m',
  p25: 50,
  median: 100,
  p75: 200,
  totalDecided: 15,
  histogram: Array.from({ length: 13 }, (_, index) => ({
    bucketStart: index * 30,
    bucketEnd: (index + 1) * 30,
    count:
      ({ 1: 1, 3: 2, 5: 3, 11: 4, 12: 5 } as Record<number, number>)[index] ??
      0,
  })),
};

describe('I-765 observed aggregate', () => {
  it('normalizes the broad aggregate without guessing OPT-specific statistics', () => {
    expect(parseI765ObservedTrends(sample)).toEqual({
      medianDays: 100,
      p25Days: 50,
      p75Days: 200,
      decidedCases: 15,
      distribution: [
        { label: 'Under 60d', count: 1 },
        { label: '60–119d', count: 2 },
        { label: '120–179d', count: 3 },
        { label: '180–359d', count: 4 },
        { label: '360d+', count: 5 },
      ],
    });
  });

  it('accepts omitted empty buckets in a sparse histogram', () => {
    const sparse = {
      ...sample,
      histogram: sample.histogram.filter((bucket) => bucket.count > 0),
    };
    expect(parseI765ObservedTrends(sparse)?.decidedCases).toBe(15);
  });

  it.each([
    { ...sample, form: 'I-129' },
    { ...sample, median: 5 },
    { ...sample, totalDecided: 14 },
    { ...sample, histogram: [sample.histogram[0], sample.histogram[2]] },
    { ...sample, histogram: [{ bucketStart: 0, bucketEnd: 59, count: 15 }] },
  ])('rejects inconsistent or out-of-scope source data', (input) => {
    expect(parseI765ObservedTrends(input)).toBeNull();
  });
});
