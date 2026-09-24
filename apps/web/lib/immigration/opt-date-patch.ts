export const OPT_DATE_FIELDS = [
  'program_end_date',
  'dso_recommendation_date',
  'opt_start_date',
  'opt_ead_end_date',
  'stem_start_date',
  'stem_dso_recommendation_date',
  'stem_ead_end_date',
] as const;

/** Validate actual calendar dates, without timezone conversion or overflow. */
export function parseCalculatorDate(value: unknown): string | null {
  if (value === null || value === '') return null;
  if (typeof value !== 'string') throw new Error('Date must be MM/DD/YYYY');
  const match = value.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) throw new Error('Date must be MM/DD/YYYY');
  const [, month, day, year] = match;
  const iso = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  const date = new Date(`${iso}T00:00:00Z`);
  if (
    Number(year) < 1 ||
    !Number.isFinite(date.getTime()) ||
    date.toISOString().slice(0, 10) !== iso
  ) {
    throw new Error('Invalid calendar date');
  }
  return iso;
}

export function calculatorDatePatch(body: unknown) {
  if (!body || typeof body !== 'object' || Array.isArray(body))
    throw new Error('Invalid request');
  const input = body as Record<string, unknown>;
  const patch: Partial<
    Record<(typeof OPT_DATE_FIELDS)[number], string | null>
  > = {};
  for (const field of OPT_DATE_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(input, field))
      patch[field] = parseCalculatorDate(input[field]);
  }
  const fields = Object.keys(patch);
  if (!fields.length) throw new Error('At least one date field is required');
  const lastUpdatedField =
    typeof input._lastModifiedField === 'string' &&
    fields.includes(input._lastModifiedField)
      ? input._lastModifiedField
      : fields[fields.length - 1];
  return { ...patch, last_updated_field: lastUpdatedField };
}

export function formatCalculatorDate(
  iso: string | null | undefined
): string | null {
  if (!iso) return null;
  const [year, month, day] = iso.slice(0, 10).split('-');
  return `${month}/${day}/${year}`;
}
