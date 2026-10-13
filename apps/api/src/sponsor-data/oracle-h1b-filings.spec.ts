import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  H1B_FILING_COLUMNS,
  buildH1bFilingsDdl,
  buildH1bFilingsMergeSql,
  buildH1bFilingsVerifySql,
  comparableFiling,
  filingBindDefinitions,
  normaliseTimestamp,
  toFilingBinds,
} from './oracle-h1b-filings';

function sourceRow(overrides: Record<string, unknown> = {}) {
  const row: Record<string, unknown> = Object.fromEntries(
    H1B_FILING_COLUMNS.map(([name]) => [name, null]),
  );
  return {
    ...row,
    id: '0b6f3f0e-1d2c-4c8e-9a39-6a3b1c7d9e10',
    case_number: 'I-200-24001-000001',
    employer_name: 'Example Corp',
    received_date: '2024-01-02',
    total_workers: 1,
    wage_rate_from: 125000.5,
    created_at: '2026-01-14T12:34:56.123456+00:00',
    ...overrides,
  };
}

describe('Oracle h1b_filings copy', () => {
  it('mirrors all 98 Supabase columns', () => {
    expect(H1B_FILING_COLUMNS).toHaveLength(98);
    expect(new Set(H1B_FILING_COLUMNS.map(([name]) => name)).size).toBe(98);
  });

  it('keeps the committed operator SQL in sync with the column list', () => {
    const sql = readFileSync(
      join(__dirname, '../../sql/oracle/h1b-filings-schema.sql'),
      'utf8',
    );
    expect(sql).toContain(buildH1bFilingsDdl());
  });

  it('builds a MERGE that binds and inserts every column once', () => {
    const sql = buildH1bFilingsMergeSql();
    for (const [name] of H1B_FILING_COLUMNS) {
      expect(sql).toContain(`:${name}`);
      expect(sql).toContain(`s.${name}`);
    }
    expect(sql).not.toContain('t.id = s.id,');
    expect(sql).toContain("TO_DATE(:received_date, 'YYYY-MM-DD')");
  });

  it('converts a row into typed binds', () => {
    const binds = toFilingBinds(sourceRow({ total_workers: '3' }));
    expect(binds.total_workers).toBe(3);
    expect(binds.wage_rate_from).toBe(125000.5);
    expect(binds.received_date).toBe('2024-01-02');
    expect(binds.created_at).toBe('2026-01-14T12:34:56.123456+00:00');
    expect(binds.status).toBeNull();
    expect(Object.keys(binds)).toHaveLength(98);
  });

  it('rejects rows that would lose data', () => {
    expect(() => toFilingBinds(sourceRow({ case_number: null }))).toThrow(
      'missing case_number',
    );
    expect(() => toFilingBinds(sourceRow({ total_workers: 1.5 }))).toThrow(
      'not an integer',
    );
    expect(() =>
      toFilingBinds(sourceRow({ received_date: '01/02/2024' })),
    ).toThrow('not a date');
    expect(() =>
      toFilingBinds(sourceRow({ job_title: 'x'.repeat(501) })),
    ).toThrow('exceeds 500');
  });

  it('normalises Supabase timestamp variants for the Oracle FF mask', () => {
    expect(normaliseTimestamp('2026-01-14T12:34:56+00:00')).toBe(
      '2026-01-14T12:34:56.0+00:00',
    );
    expect(normaliseTimestamp('2026-01-14T12:34:56.5Z')).toBe(
      '2026-01-14T12:34:56.5+00:00',
    );
    expect(normaliseTimestamp('2026-01-14T12:34:56.5+05')).toBe(
      '2026-01-14T12:34:56.5+05:00',
    );
    expect(() => normaliseTimestamp('yesterday')).toThrow();
  });

  it('defines numeric and string bind types', () => {
    const defs = filingBindDefinitions({ STRING: 'S', NUMBER: 'N' });
    expect(defs.total_workers).toEqual({ type: 'N' });
    expect(defs.job_title).toEqual({ type: 'S', maxSize: 2000 });
  });

  it('compares a Supabase row and its Oracle text projection as equal', () => {
    const supabase = sourceRow();
    const oracle = Object.fromEntries(
      Object.entries(supabase).map(([name, value]) => [
        name.toUpperCase(),
        value,
      ]),
    );
    oracle.CREATED_AT = '2026-01-14T12:34:56Z';
    oracle.WAGE_RATE_FROM = 125000.5;
    expect(comparableFiling(oracle)).toEqual(comparableFiling(supabase));
    expect(buildH1bFilingsVerifySql(2)).toContain('IN (:id0, :id1)');
  });
});
