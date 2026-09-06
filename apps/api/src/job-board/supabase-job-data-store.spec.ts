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
});
