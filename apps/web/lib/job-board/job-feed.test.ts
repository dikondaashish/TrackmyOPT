// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EMPTY_JOB_FILTERS } from './filters';
import type { ServerJobRecord } from './server-job-store';

const listServerJobs = vi.fn();
const captureException = vi.fn();
const tables: Record<string, { data: unknown[] | null; error: unknown }> = {};

vi.mock('server-only', () => ({}));
vi.mock('@sentry/nextjs', () => ({ captureException }));
vi.mock('./server-job-store', () => ({ listServerJobs }));
vi.mock('@/lib/supabase/admin', () => ({
  getSupabaseAdminClient: () => ({
    from: (table: string) => ({ select: () => ({ in: async () => tables[table] }) }),
  }),
}));

const { loadJobFeed, RESUME_RANKING_POOL } = await import('./job-feed');

function row(index: number, overrides: Partial<ServerJobRecord> = {}): ServerJobRecord {
  return {
    id: `job-${index}`, sourceId: 's', sourceAts: 'greenhouse', boardToken: 'b', externalJobId: String(index),
    title: 'Retail Associate', companyName: 'Acme', location: 'Austin, TX', department: null,
    description: 'Store work.', jobUrl: `https://jobs.test/${index}`, postedAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '', optEligible: null, stemOptEligible: null, cptEligible: null, h1bSponsorStatus: null,
    createdAt: '', firstSeenAt: '2026-10-01T00:00:00.000Z', lastConfirmedAt: '2026-10-01T00:00:00.000Z',
    listingStatus: 'open', employerBoardName: null, sourceTrustTier: 'verified_ats', employerMatchId: null,
    missingSinceAt: null, removedAt: null, ...overrides,
  };
}

const profile = {
  schemaVersion: 1 as const, roleTitles: ['Software Engineer'], skills: ['TypeScript'],
  certifications: [], education: [], yearsExperience: 2,
};

beforeEach(() => {
  listServerJobs.mockReset();
  captureException.mockReset();
  tables.employer_matches = { data: [], error: null };
  tables.h1b_sponsors = { data: [], error: null };
});

describe('loadJobFeed', () => {
  it('ranks the newest pool by resume score, so a strong match on a later store page comes first', async () => {
    const pool = Array.from({ length: RESUME_RANKING_POOL }, (_, index) => row(index));
    pool[250] = row(250, { title: 'Senior Software Engineer', description: 'TypeScript and React.' });
    listServerJobs.mockImplementation(async ({ page, pageSize }: { page: number; pageSize: number }) => ({
      rows: pool.slice((page - 1) * pageSize, page * pageSize), total: 900, visaSignals: [],
    }));

    const feed = await loadJobFeed({ filters: EMPTY_JOB_FILTERS, page: 1, trackerEntries: [], resumeProfile: profile });
    expect(feed.jobs[0].id).toBe('job-250');
    expect(feed.jobs[0].resume_match?.score).toBeGreaterThan(feed.jobs[1].resume_match?.score ?? 0);
    expect(feed).toMatchObject({ total: 900, rankedCount: RESUME_RANKING_POOL, pageSize: 50 });
    expect(listServerJobs).toHaveBeenCalledTimes(3);
    // Only the first pool page counts the matches.
    expect(listServerJobs.mock.calls.filter(([query]) => query.withTotal === 'false')).toHaveLength(2);

    listServerJobs.mockClear();
    await loadJobFeed({ filters: EMPTY_JOB_FILTERS, page: 7, trackerEntries: [], resumeProfile: profile });
    expect(listServerJobs).toHaveBeenCalledWith(expect.objectContaining({ page: 7, pageSize: 50 }));
  });

  it('falls back to date order when the ranking reads fail', async () => {
    listServerJobs.mockImplementation(async ({ pageSize }: { pageSize: number }) => {
      if (pageSize === 100) throw new Error('The operation was aborted due to timeout');
      return { rows: [row(1)], total: 1, visaSignals: [] };
    });
    const feed = await loadJobFeed({ filters: EMPTY_JOB_FILTERS, page: 1, trackerEntries: [], resumeProfile: profile });
    expect(feed).toMatchObject({ total: 1, rankedCount: 0 });
    expect(feed.jobs[0].resume_match).not.toBeNull();
    expect(captureException).toHaveBeenCalledTimes(1);
  });

  it('adds employer logos on every page and keeps loading when the logo read fails', async () => {
    listServerJobs.mockResolvedValue({ rows: [row(1, { employerMatchId: 'm1' })], total: 1, visaSignals: [] });
    tables.employer_matches = { data: [{ id: 'm1', canonical_h1b_sponsor_id: 'sp1', confidence: 1, review_status: 'confirmed' }], error: null };
    tables.h1b_sponsors = { data: [{ id: 'sp1', website: 'https://acme.test' }], error: null };
    const feed = await loadJobFeed({ filters: EMPTY_JOB_FILTERS, page: 2, trackerEntries: [], resumeProfile: null });
    expect(feed.jobs[0].company_website).toBe('https://acme.test');

    tables.h1b_sponsors = { data: null, error: { message: 'down' } };
    const degraded = await loadJobFeed({ filters: EMPTY_JOB_FILTERS, page: 2, trackerEntries: [], resumeProfile: null });
    expect(degraded.jobs[0].company_website).toBeNull();
    expect(captureException).toHaveBeenCalledTimes(1);
  });

  it('matches saved jobs the way the tracker badge does', async () => {
    listServerJobs.mockResolvedValue({ rows: [], total: 0, visaSignals: [] });
    const trackerEntries = [
      { job_url: 'https://jobs.test/1/#apply', company_name: 'Acme', role_title: 'Role', status: 'Wishlist', is_archived: false },
      { job_url: 'https://jobs.test/2', company_name: 'Acme', role_title: 'Role', status: 'Applied', is_archived: true },
    ];
    await loadJobFeed({ filters: { ...EMPTY_JOB_FILTERS, tracker: 'saved' }, page: 1, trackerEntries, resumeProfile: null });
    const urls = listServerJobs.mock.calls[0][0].includeJobUrls;
    expect(urls).toEqual(expect.arrayContaining(['https://jobs.test/1', 'https://jobs.test/1/']));
    expect(urls).not.toContain('https://jobs.test/2');

    listServerJobs.mockClear();
    const none = await loadJobFeed({ filters: { ...EMPTY_JOB_FILTERS, tracker: 'applied' }, page: 1, trackerEntries, resumeProfile: null });
    expect(none.total).toBe(0);
    expect(listServerJobs).not.toHaveBeenCalled();
  });
});
