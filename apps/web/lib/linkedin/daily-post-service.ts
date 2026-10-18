import 'server-only';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { listServerJobs } from '@/lib/job-board/server-job-store';
import {
  createOrganizationTextPost,
  LinkedInApiError,
  refreshLinkedInToken,
  type LinkedInAppConfig,
} from './api';
import { LINKEDIN_SITE_ORIGIN } from './config';
import {
  composeDailyPost,
  selectDailyJobs,
  type CandidateJob,
  type PostItem,
} from './daily-post';
import { decryptLinkedInToken, encryptLinkedInToken } from './token-crypto';

// Server-side orchestration of the daily post: the stored page connection,
// draft building from the Oracle job API, and publishing.

const CANDIDATE_WINDOW_HOURS = 72;
const CANDIDATE_PAGES_PER_ROLE = 6;
const REFRESH_AHEAD_MS = 24 * 3_600_000;
/** A publish attempt that never finished may be retried after this long. */
export const STALE_PUBLISHING_MS = 10 * 60_000;

export class LinkedInPostError extends Error {
  constructor(readonly code: string) {
    super(`LinkedIn daily post failed: ${code}`);
    this.name = 'LinkedInPostError';
  }
}

export type PageConnection = {
  organizationUrn: string;
  organizationName: string | null;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string | null;
  hasRefreshToken: boolean;
  connectedByEmail: string;
  connectedAt: string;
  autoPublish: boolean;
  enabled: boolean;
};

type ConnectionRow = {
  organization_urn: string;
  organization_name: string | null;
  encrypted_access_token: string;
  access_token_expires_at: string;
  encrypted_refresh_token: string | null;
  refresh_token_expires_at: string | null;
  connected_by_email: string;
  connected_at: string;
  auto_publish: boolean;
  enabled: boolean;
};

export type DailyPost = {
  postDate: string;
  status: 'draft' | 'publishing' | 'published' | 'failed';
  commentary: string;
  items: PostItem[];
  shownCount: number;
  linkedinPostUrn: string | null;
  errorCode: string | null;
  publishedAt: string | null;
  publishedBy: string | null;
  updatedAt: string;
};

type PostRow = {
  post_date: string;
  status: DailyPost['status'];
  commentary: string;
  items: unknown;
  shown_count: number;
  linkedin_post_urn: string | null;
  error_code: string | null;
  published_at: string | null;
  published_by: string | null;
  updated_at: string;
};

const CONNECTION_COLUMNS =
  'organization_urn, organization_name, encrypted_access_token, access_token_expires_at, encrypted_refresh_token, refresh_token_expires_at, connected_by_email, connected_at, auto_publish, enabled';
const POST_COLUMNS =
  'post_date, status, commentary, items, shown_count, linkedin_post_urn, error_code, published_at, published_by, updated_at';

function db() {
  return getSupabaseAdminClient();
}

function toConnection(row: ConnectionRow): PageConnection {
  return {
    organizationUrn: row.organization_urn,
    organizationName: row.organization_name,
    accessTokenExpiresAt: row.access_token_expires_at,
    refreshTokenExpiresAt: row.refresh_token_expires_at,
    hasRefreshToken: Boolean(row.encrypted_refresh_token),
    connectedByEmail: row.connected_by_email,
    connectedAt: row.connected_at,
    autoPublish: row.auto_publish,
    enabled: row.enabled,
  };
}

function postItems(value: unknown): PostItem[] {
  return Array.isArray(value) ? (value as PostItem[]) : [];
}

function toPost(row: PostRow): DailyPost {
  return {
    postDate: row.post_date,
    status: row.status,
    commentary: row.commentary,
    items: postItems(row.items),
    shownCount: row.shown_count,
    linkedinPostUrn: row.linkedin_post_urn,
    errorCode: row.error_code,
    publishedAt: row.published_at,
    publishedBy: row.published_by,
    updatedAt: row.updated_at,
  };
}

async function loadConnectionRow(): Promise<ConnectionRow | null> {
  const { data, error } = await db().from('linkedin_page_connection').select(CONNECTION_COLUMNS).eq('id', true).maybeSingle();
  if (error) throw new LinkedInPostError('connection_read_failed');
  return (data as ConnectionRow | null) ?? null;
}

export async function loadPageConnection(): Promise<PageConnection | null> {
  const row = await loadConnectionRow();
  return row ? toConnection(row) : null;
}

export async function savePageConnection(input: {
  organizationUrn: string;
  organizationName: string | null;
  accessToken: string;
  accessTokenExpiresAt: Date;
  refreshToken: string | null;
  refreshTokenExpiresAt: Date | null;
  scopes: string | null;
  connectedByEmail: string;
}): Promise<void> {
  // Reconnecting keeps the admin's publish settings.
  const existing = await loadConnectionRow();
  const { error } = await db()
    .from('linkedin_page_connection')
    .upsert(
      {
        id: true,
        organization_urn: input.organizationUrn,
        organization_name: input.organizationName,
        encrypted_access_token: encryptLinkedInToken(input.accessToken),
        access_token_expires_at: input.accessTokenExpiresAt.toISOString(),
        encrypted_refresh_token: input.refreshToken ? encryptLinkedInToken(input.refreshToken) : null,
        refresh_token_expires_at: input.refreshTokenExpiresAt?.toISOString() ?? null,
        scopes: input.scopes,
        connected_by_email: input.connectedByEmail,
        connected_at: new Date().toISOString(),
        auto_publish: existing?.auto_publish ?? false,
        enabled: existing?.enabled ?? true,
      },
      { onConflict: 'id' },
    );
  if (error) throw new LinkedInPostError('connection_save_failed');
}

export async function updatePageSettings(settings: { autoPublish?: boolean; enabled?: boolean }): Promise<void> {
  const patch: Record<string, boolean> = {};
  if (typeof settings.autoPublish === 'boolean') patch.auto_publish = settings.autoPublish;
  if (typeof settings.enabled === 'boolean') patch.enabled = settings.enabled;
  if (Object.keys(patch).length === 0) return;
  const { error } = await db().from('linkedin_page_connection').update(patch).eq('id', true);
  if (error) throw new LinkedInPostError('settings_save_failed');
}

export async function deletePageConnection(): Promise<void> {
  const { error } = await db().from('linkedin_page_connection').delete().eq('id', true);
  if (error) throw new LinkedInPostError('connection_delete_failed');
}

/** A usable access token, refreshed when it expires within a day. */
async function validAccessToken(app: LinkedInAppConfig, row: ConnectionRow, now: Date): Promise<string> {
  const accessExpiry = Date.parse(row.access_token_expires_at);
  if (accessExpiry - now.getTime() > REFRESH_AHEAD_MS) return decryptLinkedInToken(row.encrypted_access_token);

  const refreshExpiry = row.refresh_token_expires_at ? Date.parse(row.refresh_token_expires_at) : 0;
  if (!row.encrypted_refresh_token || refreshExpiry <= now.getTime()) {
    if (accessExpiry > now.getTime()) return decryptLinkedInToken(row.encrypted_access_token);
    throw new LinkedInPostError('reconnect_required');
  }

  const tokens = await refreshLinkedInToken(app, decryptLinkedInToken(row.encrypted_refresh_token), { now });
  const { error } = await db()
    .from('linkedin_page_connection')
    .update({
      encrypted_access_token: encryptLinkedInToken(tokens.accessToken),
      access_token_expires_at: tokens.accessTokenExpiresAt.toISOString(),
      // LinkedIn keeps the original refresh-token lifetime; store what it returns.
      ...(tokens.refreshToken
        ? {
            encrypted_refresh_token: encryptLinkedInToken(tokens.refreshToken),
            refresh_token_expires_at: tokens.refreshTokenExpiresAt?.toISOString() ?? row.refresh_token_expires_at,
          }
        : {}),
    })
    .eq('id', true);
  if (error) throw new LinkedInPostError('token_save_failed');
  return tokens.accessToken;
}

export async function loadDailyPost(postDate: string): Promise<DailyPost | null> {
  const { data, error } = await db().from('linkedin_daily_posts').select(POST_COLUMNS).eq('post_date', postDate).maybeSingle();
  if (error) throw new LinkedInPostError('post_read_failed');
  return data ? toPost(data as PostRow) : null;
}

export async function listRecentPosts(limit: number): Promise<DailyPost[]> {
  const { data, error } = await db()
    .from('linkedin_daily_posts')
    .select(POST_COLUMNS)
    .order('post_date', { ascending: false })
    .limit(limit);
  if (error) throw new LinkedInPostError('post_read_failed');
  return ((data as PostRow[] | null) ?? []).map(toPost);
}

// The API's engineering and data role filters miss titles such as "Network
// Administrator" or "Penetration Tester", so a few title searches add them.
const CANDIDATE_QUERIES: ReadonlyArray<{ query: Record<string, string>; pages: number }> = [
  { query: { role: 'engineering' }, pages: CANDIDATE_PAGES_PER_ROLE },
  { query: { role: 'data' }, pages: CANDIDATE_PAGES_PER_ROLE },
  ...['network', 'administrator', 'cyber', 'infrastructure', 'cloud', 'penetration', 'programmer'].map((term) => ({
    query: { query: term, searchScope: 'title' },
    pages: 1,
  })),
];

/** Recent open US tech jobs from the Oracle job API (may repeat a job). */
async function loadCandidateJobs(now: Date): Promise<CandidateJob[]> {
  const postedAfter = new Date(now.getTime() - CANDIDATE_WINDOW_HOURS * 3_600_000).toISOString();
  const candidates: CandidateJob[] = [];
  for (const { query, pages } of CANDIDATE_QUERIES) {
    for (let page = 1; page <= pages; page += 1) {
      const result = await listServerJobs({
        ...query,
        page,
        pageSize: 100,
        country: 'us',
        listingStatus: 'open',
        postedAfter,
        sortBy: 'posted_at',
      });
      const signals = new Map<string, string[]>();
      for (const signal of result.visaSignals ?? []) {
        signals.set(signal.jobId, [...(signals.get(signal.jobId) ?? []), signal.signalType]);
      }
      for (const row of result.rows) {
        candidates.push({
          id: row.id,
          title: row.title,
          companyName: row.companyName,
          location: row.location,
          description: row.description,
          jobUrl: row.jobUrl,
          postedAt: row.postedAt,
          firstSeenAt: row.firstSeenAt,
          signalTypes: signals.get(row.id) ?? [],
        });
      }
      if (result.rows.length < 100) break;
    }
  }
  return candidates;
}

/**
 * Jobs in posts published on earlier days, so posts never repeat a job. The
 * candidate window is 72 hours, so two weeks of posts is plenty.
 */
async function previouslyPublishedJobIds(postDate: string): Promise<Set<string>> {
  const since = new Date(Date.parse(`${postDate}T00:00:00Z`) - 14 * 86_400_000).toISOString().slice(0, 10);
  const { data, error } = await db()
    .from('linkedin_daily_posts')
    .select('items')
    .eq('status', 'published')
    .lt('post_date', postDate)
    .gte('post_date', since);
  if (error) throw new LinkedInPostError('featured_read_failed');
  return new Set(
    ((data as Array<{ items: unknown }> | null) ?? []).flatMap((row) => postItems(row.items).map((item) => item.jobId)),
  );
}

/**
 * Builds (or rebuilds) the draft for a day. A day that is already published
 * or mid-publish is returned unchanged.
 */
export async function buildDailyDraft(postDate: string, now = new Date()): Promise<DailyPost> {
  const existing = await loadDailyPost(postDate);
  if (existing && (existing.status === 'published' || existing.status === 'publishing')) return existing;

  const [candidates, excluded] = await Promise.all([loadCandidateJobs(now), previouslyPublishedJobIds(postDate)]);
  const items = selectDailyJobs(candidates, { now, excludeJobIds: excluded });
  if (items.length === 0) throw new LinkedInPostError('no_jobs_found');

  const { error: linkError } = await db()
    .from('linkedin_job_links')
    .upsert(
      items.map((item) => ({
        code: item.code,
        job_id: item.jobId,
        title: item.title.slice(0, 300),
        company_name: item.companyName.slice(0, 200),
        location: item.location?.slice(0, 500) ?? null,
        job_url: item.jobUrl.slice(0, 2000),
        domain: item.domain,
        posted_at: item.postedAt,
        first_featured_on: postDate,
      })),
      // A job from an unpublished draft can be picked again on a later day;
      // its page then links back to that later day's list.
      { onConflict: 'job_id' },
    );
  if (linkError) throw new LinkedInPostError('link_save_failed');

  const post = composeDailyPost(items, { postDate, siteOrigin: LINKEDIN_SITE_ORIGIN });
  const draft = {
    status: 'draft' as const,
    commentary: post.commentary,
    items,
    shown_count: post.shownCount,
    linkedin_post_urn: null,
    error_code: null,
    published_at: null,
    published_by: null,
  };
  if (!existing) {
    const { data, error } = await db()
      .from('linkedin_daily_posts')
      .insert({ post_date: postDate, ...draft })
      .select(POST_COLUMNS)
      .single();
    if (!error && data) return toPost(data as PostRow);
    // Another request created the day first; fall through to the update.
    if (error?.code !== '23505') throw new LinkedInPostError('draft_save_failed');
  }
  // Only a draft or failed day is rewritten, never one being published.
  const { data, error } = await db()
    .from('linkedin_daily_posts')
    .update(draft)
    .eq('post_date', postDate)
    .in('status', ['draft', 'failed'])
    .select(POST_COLUMNS);
  if (error) throw new LinkedInPostError('draft_save_failed');
  const rows = (data as PostRow[] | null) ?? [];
  if (rows.length > 0) return toPost(rows[0]);
  const current = await loadDailyPost(postDate);
  if (!current) throw new LinkedInPostError('draft_save_failed');
  return current;
}

/**
 * Publishes a day's draft to the company page once. The status moves to
 * 'publishing' first, so a second click or cron fire cannot post twice.
 */
export async function publishDailyPost(
  app: LinkedInAppConfig,
  postDate: string,
  publishedBy: string,
  now = new Date(),
): Promise<DailyPost> {
  const connection = await loadConnectionRow();
  if (!connection) throw new LinkedInPostError('not_connected');

  let post = await loadDailyPost(postDate);
  if (!post) post = await buildDailyDraft(postDate, now);
  if (post.status === 'published') return post;

  const staleBefore = new Date(now.getTime() - STALE_PUBLISHING_MS).toISOString();
  const { data: claimed, error: claimError } = await db()
    .from('linkedin_daily_posts')
    .update({ status: 'publishing', error_code: null })
    .eq('post_date', postDate)
    .or(`status.in.(draft,failed),and(status.eq.publishing,updated_at.lt.${staleBefore})`)
    .select(POST_COLUMNS);
  if (claimError) throw new LinkedInPostError('publish_claim_failed');
  const claimedRow = (claimed as PostRow[] | null)?.[0];
  if (!claimedRow) throw new LinkedInPostError('already_publishing');
  // Post the text as claimed, even if a preview refresh raced the read above.
  post = toPost(claimedRow);

  try {
    const accessToken = await validAccessToken(app, connection, now);
    const postUrn = await createOrganizationTextPost(app, accessToken, connection.organization_urn, post.commentary);
    const { data, error } = await db()
      .from('linkedin_daily_posts')
      .update({
        status: 'published',
        linkedin_post_urn: postUrn || null,
        published_at: new Date().toISOString(),
        published_by: publishedBy.slice(0, 320),
      })
      .eq('post_date', postDate)
      .select(POST_COLUMNS)
      .single();
    // The post is live on LinkedIn even if this bookkeeping write fails.
    if (error || !data) throw new LinkedInPostError('published_save_failed');
    return toPost(data as PostRow);
  } catch (error) {
    let code =
      error instanceof LinkedInApiError || error instanceof LinkedInPostError ? error.code : 'publish_failed';
    // LinkedIn may have created the post before the connection dropped.
    if (code === 'post_create_failed_network') code = 'post_uncertain';
    if (code !== 'published_save_failed') {
      await db().from('linkedin_daily_posts').update({ status: 'failed', error_code: code }).eq('post_date', postDate);
    }
    throw error instanceof LinkedInPostError ? error : new LinkedInPostError(code);
  }
}

/** Public data for a featured job's short link, or null. */
export async function loadJobLink(code: string) {
  if (!/^[A-Za-z0-9]{7}$/.test(code)) return null;
  const { data, error } = await db()
    .from('linkedin_job_links')
    .select('code, job_id, title, company_name, location, job_url, domain, posted_at, first_featured_on')
    .eq('code', code)
    .maybeSingle();
  if (error) throw new LinkedInPostError('link_read_failed');
  return data as {
    code: string;
    job_id: string;
    title: string;
    company_name: string;
    location: string | null;
    job_url: string;
    domain: PostItem['domain'];
    posted_at: string | null;
    first_featured_on: string;
  } | null;
}
