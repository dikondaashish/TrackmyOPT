import { z } from 'zod';

// This feed is a broad I-765 aggregate. It is not an OPT/STEM cohort or an
// official USCIS processing-time publication. Keep it out of the OPT dataset.
const observedSchema = z.object({
  form: z.literal('I-765'),
  serviceCenter: z.literal('all'),
  period: z.literal('6m'),
  p25: z.number().int().nonnegative().finite(),
  median: z.number().int().nonnegative().finite(),
  p75: z.number().int().nonnegative().finite(),
  totalDecided: z.number().int().positive().finite(),
  histogram: z
    .array(
      z.object({
        bucketStart: z.number().int().nonnegative().finite(),
        bucketEnd: z.number().int().positive().finite(),
        count: z.number().int().nonnegative().finite(),
      })
    )
    .min(1)
    .max(120),
});

export type I765ObservedTrends = {
  medianDays: number;
  p25Days: number;
  p75Days: number;
  decidedCases: number;
  distribution: Array<{ label: string; count: number }>;
};

const GROUPS = [
  { label: 'Under 60d', start: 0, end: 60 },
  { label: '60–119d', start: 60, end: 120 },
  { label: '120–179d', start: 120, end: 180 },
  { label: '180–359d', start: 180, end: 360 },
  { label: '360d+', start: 360, end: Infinity },
] as const;

export function parseI765ObservedTrends(
  input: unknown
): I765ObservedTrends | null {
  const parsed = observedSchema.safeParse(input);
  if (!parsed.success) return null;
  const data = parsed.data;
  if (data.p25 > data.median || data.median > data.p75) return null;

  let previousEnd = 0;
  for (const bucket of data.histogram) {
    if (
      bucket.bucketStart < previousEnd ||
      bucket.bucketStart % 30 !== 0 ||
      bucket.bucketEnd - bucket.bucketStart !== 30
    )
      return null;
    previousEnd = bucket.bucketEnd;
  }
  if (
    data.histogram.reduce((sum, bucket) => sum + bucket.count, 0) !==
    data.totalDecided
  )
    return null;

  const distribution = GROUPS.map(({ label, start, end }) => ({
    label,
    count: data.histogram.reduce((sum, bucket) => {
      // The upstream buckets are 30-day intervals. Never split a bucket or
      // imply precision below the granularity the source actually supplies.
      return (
        sum +
        (bucket.bucketStart >= start && bucket.bucketEnd <= end
          ? bucket.count
          : 0)
      );
    }, 0),
  }));
  if (
    distribution.reduce((sum, group) => sum + group.count, 0) !==
    data.totalDecided
  )
    return null;

  return {
    medianDays: data.median,
    p25Days: data.p25,
    p75Days: data.p75,
    decidedCases: data.totalDecided,
    distribution,
  };
}
