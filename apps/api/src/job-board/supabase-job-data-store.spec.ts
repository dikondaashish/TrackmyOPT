import {
  mapSupabaseJobRow,
  SUPABASE_JOB_COLUMNS,
  SupabaseJobDataStore,
} from './supabase-job-data-store';

const LIVE_JOBS_COLUMNS = [
  'id',
  'source_id',
  'source_ats',
  'board_token',
  'external_job_id',
  'title',
  'company_name',
  'location',
  'department',
  'description',
  'job_url',
  'posted_at',
  'updated_at',
  'opt_eligible',
  'stem_opt_eligible',
  'cpt_eligible',
  'h1b_sponsor_status',
  'created_at',
  'first_seen_at',
  'last_confirmed_at',
  'listing_status',
  'employer_board_name',
  'source_trust_tier',
  'employer_match_id',
  'missing_since_at',
  'removed_at',
];

describe('Supabase job-store projection', () => {
  it('matches the live jobs schema exactly', () => {
    expect(SUPABASE_JOB_COLUMNS.split(', ')).toEqual(LIVE_JOBS_COLUMNS);
    expect(SUPABASE_JOB_COLUMNS).not.toContain('cpt_opt_eligible');
  });

  it('selects and maps cpt_eligible into the existing contract field', () => {
    const row = {
      id: 'job-1',
      source_id: 'source-1',
      source_ats: 'greenhouse',
      board_token: 'example',
      external_job_id: 'external-1',
      title: 'Software Engineer',
      company_name: 'Example',
      location: null,
      department: null,
      description: null,
      job_url: null,
      posted_at: null,
      updated_at: '2026-09-04T00:00:00.000Z',
      opt_eligible: true,
      stem_opt_eligible: false,
      cpt_eligible: true,
      h1b_sponsor_status: null,
      created_at: '2026-09-04T00:00:00.000Z',
      first_seen_at: '2026-09-04T00:00:00.000Z',
      last_confirmed_at: '2026-09-04T00:00:00.000Z',
      listing_status: 'open',
      employer_board_name: null,
      source_trust_tier: 'verified_ats',
      employer_match_id: null,
      missing_since_at: null,
      removed_at: null,
    };

    expect(mapSupabaseJobRow(row)).toMatchObject({
      cptEligible: true,
      optEligible: true,
      stemOptEligible: false,
    });
  });

  it('treats a terminal PostgREST range as an empty source page', async () => {
    const query = {
      select: () => query,
      eq: () => query,
      order: () => query,
      range: () =>
        Promise.resolve({
          data: null,
          count: null,
          error: {
            code: 'PGRST103',
            message: 'Requested range not satisfiable',
          },
        }),
    };
    const store = new SupabaseJobDataStore({
      from: () => query,
    } as never);

    await expect(
      store.listSourceJobsPage('source-1', 100, 100),
    ).resolves.toEqual({ rows: [], total: 100 });
  });

  it('uses a CLOB-free projection for live ingestion reconciliation', async () => {
    let projection = '';
    const query = {
      select: (value: string) => {
        projection = value;
        return query;
      },
      eq: () => query,
      order: () => query,
      range: () =>
        Promise.resolve({
          data: [
            {
              id: 'job-1',
              external_job_id: 'external-1',
              company_name: 'Example',
              opt_eligible: true,
              stem_opt_eligible: false,
              cpt_eligible: null,
              h1b_sponsor_status: null,
              created_at: '2026-09-04T00:00:00.000Z',
              first_seen_at: '2026-09-04T00:00:00.000Z',
              employer_match_id: null,
              listing_status: 'open',
              missing_since_at: null,
            },
          ],
          error: null,
        }),
    };
    const store = new SupabaseJobDataStore({ from: () => query } as never);

    await expect(store.listSourceJobsForIngestion('source-1')).resolves.toEqual(
      [
        expect.objectContaining({
          id: 'job-1',
          externalJobId: 'external-1',
          listingStatus: 'open',
        }),
      ],
    );
    expect(projection).not.toContain('description');
    expect(projection).toContain('listing_status');
  });

  it('keeps source reconciliation lifecycle-only and CLOB-free', async () => {
    const projections: string[] = [];
    const query = {
      select: (value: string) => {
        projections.push(value);
        return query;
      },
      eq: () => query,
      order: () => query,
      range: () =>
        Promise.resolve({
          data: [
            {
              id: 'job-1',
              external_job_id: 'missing-job',
              listing_status: 'open',
              missing_since_at: null,
            },
          ],
          error: null,
        }),
      update: (value: Record<string, unknown>) => {
        void value;
        return query;
      },
      in: () => Promise.resolve({ error: null }),
    };
    const store = new SupabaseJobDataStore({ from: () => query } as never);

    await store.reconcileSource('source-1', ['seen-job']);

    expect(projections).toEqual([
      'id, external_job_id, listing_status, missing_since_at',
    ]);
    expect(projections.join(',')).not.toContain('description');
  });

  it('recovers from a broad-search statement timeout without returning a 500', async () => {
    let attempts = 0;
    const searchPredicates: string[] = [];
    const query = {
      select: () => query,
      eq: () => query,
      or: (predicate: string) => {
        searchPredicates.push(predicate);
        return query;
      },
      order: () => query,
      range: () => {
        attempts += 1;
        if (attempts < 3) {
          return Promise.resolve({
            data: null,
            count: null,
            error: {
              code: '57014',
              message: 'canceling statement due to statement timeout',
            },
          });
        }
        return Promise.resolve({
          data: [{ id: 'job-1' }],
          count: 1,
          error: null,
        });
      },
    };
    const store = new SupabaseJobDataStore({ from: () => query } as never);

    await expect(
      store.listJobs({ page: 1, pageSize: 1, query: 'react' }),
    ).resolves.toMatchObject({ total: 1, rows: [{ id: 'job-1' }] });
    expect(attempts).toBe(3);
    expect(searchPredicates[0]).toContain('description.ilike.%react%');
    expect(searchPredicates.at(-1)).toBe('title.ilike.%react%');
  });
});
