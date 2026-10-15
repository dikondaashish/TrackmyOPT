import type { ConfigService } from '@nestjs/config';
import { JobVisaSignalService } from './job-visa-signal.service';

type Rows = Record<string, unknown[]>;

/** Supabase stub: serves sponsor identity tables and rejects job tables. */
function supabaseStub(rows: Rows) {
  const tables: string[] = [];
  const from = jest.fn((table: string) => {
    tables.push(table);
    if (!(table in rows)) throw new Error(`unexpected Supabase table ${table}`);
    const result = { data: rows[table], error: null };
    const query = {
      select: () => query,
      in: () => query,
      not: () => query,
      then: (resolve: (value: typeof result) => unknown) => resolve(result),
    };
    return query;
  });
  return { client: { from }, tables };
}

function setup(rows: Rows = {}) {
  const config = {
    get: (key: string) =>
      ({
        NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
        SUPABASE_SERVICE_ROLE_KEY: 'test',
      })[key],
  } as unknown as ConfigService;
  const store = {
    replaceVisaSignals: jest.fn().mockResolvedValue(undefined),
    listVisaSignals: jest.fn().mockResolvedValue([]),
  };
  const service = new JobVisaSignalService(config, store as never);
  const supabase = supabaseStub(rows);
  (service as unknown as { supabase: unknown }).supabase = supabase.client;
  return { service, store, supabase };
}

describe('JobVisaSignalService', () => {
  it('writes posting and sponsor-history evidence only to the Oracle job store', async () => {
    const { service, store, supabase } = setup({
      employer_matches: [
        {
          id: 'match-1',
          canonical_h1b_sponsor_id: 'sponsor-1',
          review_status: 'confirmed',
        },
      ],
      h1b_sponsors: [
        {
          id: 'sponsor-1',
          name: 'Example Corp',
          total_approvals: 12,
          approvals_2025: 3,
        },
      ],
    });

    await service.syncSource('source-1', [
      {
        id: 'job-1',
        description: 'We will provide visa sponsorship for this role.',
        jobUrl: 'https://example.com/job-1',
        employerMatchId: 'match-1',
      },
    ]);

    expect(store.replaceVisaSignals).toHaveBeenCalledTimes(1);
    const [jobIds, signals] = store.replaceVisaSignals.mock.calls[0] as [
      string[],
      { job_id: string; source: string }[],
    ];
    expect(jobIds).toEqual(['job-1']);
    expect(signals.map((signal) => signal.source).sort()).toEqual([
      'employer_posting',
      'sponsor_history_db',
    ]);
    expect(supabase.tables).toEqual(['employer_matches', 'h1b_sponsors']);
  });

  it('replaces evidence for the jobs even when no signal is detected', async () => {
    const { service, store, supabase } = setup();
    await service.syncSource('source-1', [
      {
        id: 'job-1',
        description: 'No visa language here.',
        jobUrl: 'https://example.com/job-1',
        employerMatchId: null,
      },
    ]);
    expect(store.replaceVisaSignals).toHaveBeenCalledWith(['job-1'], []);
    expect(supabase.tables).toEqual([]);
  });

  it('reads evidence from the Oracle job store, never Supabase', async () => {
    const { service, store, supabase } = setup();
    const signal = {
      jobId: 'job-1',
      signalType: 'future_sponsorship_stated',
      evidenceSnippet: 'We will provide visa sponsorship',
      sourceUrl: 'https://example.com/job-1',
      observedDate: '2026-10-15',
      confidence: 0.9,
      source: 'employer_posting',
    };
    store.listVisaSignals.mockResolvedValue([signal]);

    await expect(service.listForJobs(['job-1'])).resolves.toEqual([signal]);
    await expect(service.listForJobs([])).resolves.toEqual([]);
    expect(store.listVisaSignals).toHaveBeenCalledTimes(1);
    expect(supabase.tables).toEqual([]);
  });
});
