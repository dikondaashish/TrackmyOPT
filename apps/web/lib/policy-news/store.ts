import 'server-only';
import { cache } from 'react';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import type { ResearchArticle } from '@/data/blog-series/types';
import { presentAutoPost } from './article';
import { reportPolicyNews } from './monitoring';
import type { PolicyNewsCandidate, PolicyNewsSource } from './sources';

// Supabase access for policy_news_items and auto_blog_posts (service role only).

export const MAX_ATTEMPTS = 3;
/** A claim that never finished (crashed or timed-out run) may be retried after this long. */
const STALE_CLAIM_MS = 15 * 60_000;
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export class PolicyNewsStoreError extends Error {
  constructor(readonly code: string) {
    super(`Policy news store failed: ${code}`);
    this.name = 'PolicyNewsStoreError';
  }
}

export type PolicyNewsItem = PolicyNewsCandidate & { id: number; attempts: number };

type ItemRow = {
  id: number;
  source: PolicyNewsSource;
  external_id: string;
  title: string;
  url: string;
  document_type: string | null;
  published_at: string | null;
  summary: string;
  full_text_url: string | null;
  attempts: number;
};

const ITEM_COLUMNS =
  'id, source, external_id, title, url, document_type, published_at, summary, full_text_url, attempts';

function configured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function db() {
  return getSupabaseAdminClient();
}

function isArticle(value: unknown): value is ResearchArticle {
  const article = value as Partial<ResearchArticle> | null;
  return Boolean(
    article &&
      typeof article.slug === 'string' &&
      typeof article.title === 'string' &&
      Array.isArray(article.sections) &&
      Array.isArray(article.sources)
  );
}

// ---- Reads used by the blog pages and sitemap -------------------------------

type PostRow = { article: unknown; reviewed_at: string | null };

function present(row: PostRow): ResearchArticle | null {
  return isArticle(row.article) ? presentAutoPost(row.article, row.reviewed_at !== null) : null;
}

const validSlug = (slug: string) => SLUG_PATTERN.test(slug) && slug.length <= 120;

/**
 * Published automatic posts, newest first, with their current byline
 * (`byline: 'automated'` until reviewed). Empty when unconfigured or unreadable.
 */
export const loadPublishedAutoPosts = cache(async (): Promise<ResearchArticle[]> => {
  if (!configured()) return [];
  const { data, error } = await db()
    .from('auto_blog_posts')
    .select('article, reviewed_at')
    .is('unpublished_at', null)
    .order('published_at', { ascending: false })
    .limit(500);
  if (error) {
    reportPolicyNews('read', 'list_failed', 'error');
    return [];
  }
  return ((data ?? []) as PostRow[]).map(present).filter((article) => article !== null);
});

export const loadAutoPost = cache(async (slug: string): Promise<ResearchArticle | null> => {
  if (!configured() || !validSlug(slug)) return null;
  const { data, error } = await db()
    .from('auto_blog_posts')
    .select('article, reviewed_at')
    .eq('slug', slug)
    .is('unpublished_at', null)
    .maybeSingle();
  if (error) {
    reportPolicyNews('read', 'post_read_failed', 'error');
    return null;
  }
  return data ? present(data as PostRow) : null;
});

/** WebP bytes of a published post's cover, or null. */
export async function loadCoverImage(slug: string): Promise<Buffer | null> {
  if (!configured() || !validSlug(slug)) return null;
  const { data, error } = await db()
    .from('auto_blog_posts')
    .select('cover_image')
    .eq('slug', slug)
    .is('unpublished_at', null)
    .not('cover_image', 'is', null)
    .maybeSingle();
  if (error) {
    reportPolicyNews('read', 'cover_read_failed', 'error');
    return null;
  }
  const hex = (data as { cover_image?: unknown } | null)?.cover_image;
  // PostgREST returns bytea as "\x" + hex.
  return typeof hex === 'string' && hex.startsWith('\\x') ? Buffer.from(hex.slice(2), 'hex') : null;
}

// ---- Admin review (Settings) ------------------------------------------------

export type AdminAutoPost = {
  slug: string;
  title: string;
  publishedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
};

export async function listAutoPostsForAdmin(): Promise<AdminAutoPost[]> {
  const { data, error } = await db()
    .from('auto_blog_posts')
    .select('slug, article->>title, published_at, reviewed_at, reviewed_by')
    .is('unpublished_at', null)
    .order('published_at', { ascending: false })
    .limit(200);
  if (error) throw new PolicyNewsStoreError('admin_list_failed');
  return ((data ?? []) as unknown as Array<{
    slug: string; title: string | null; published_at: string; reviewed_at: string | null; reviewed_by: string | null;
  }>).map((row) => ({
    slug: row.slug,
    title: row.title ?? row.slug,
    publishedAt: row.published_at,
    reviewedAt: row.reviewed_at,
    reviewedBy: row.reviewed_by,
  }));
}

/** Mark a post reviewed by `reviewer` (Vinay Kumar byline), or back to unreviewed with null. */
export async function setAutoPostReview(slug: string, reviewer: string | null, now: Date): Promise<boolean> {
  if (!validSlug(slug)) return false;
  const { data, error } = await db()
    .from('auto_blog_posts')
    .update({ reviewed_at: reviewer ? now.toISOString() : null, reviewed_by: reviewer })
    .eq('slug', slug)
    .is('unpublished_at', null)
    .select('slug');
  if (error) throw new PolicyNewsStoreError('review_update_failed');
  return Boolean(data?.length);
}

// ---- Writes used by the cron ----------------------------------------------

/** Store new candidates; ones already seen are left untouched. */
export async function recordCandidates(candidates: PolicyNewsCandidate[]): Promise<void> {
  if (!candidates.length) return;
  const rows = candidates.map((candidate) => ({
    source: candidate.source,
    external_id: candidate.externalId.slice(0, 500),
    title: candidate.title.slice(0, 1000),
    url: candidate.url,
    document_type: candidate.documentType?.slice(0, 100) ?? null,
    published_at: candidate.publishedAt,
    summary: candidate.summary.slice(0, 20000),
    full_text_url: candidate.fullTextUrl,
  }));
  const { error } = await db()
    .from('policy_news_items')
    .upsert(rows, { onConflict: 'source,external_id', ignoreDuplicates: true });
  if (error) throw new PolicyNewsStoreError('candidate_write_failed');
}

/** Atomically claim up to `limit` items that are pending or stuck in processing. */
export async function claimItems(limit: number, now: Date): Promise<PolicyNewsItem[]> {
  const staleBefore = new Date(now.getTime() - STALE_CLAIM_MS).toISOString();
  const { data, error } = await db()
    .from('policy_news_items')
    .select(ITEM_COLUMNS)
    .or(`status.eq.pending,and(status.eq.processing,claimed_at.lt."${staleBefore}")`)
    .order('created_at', { ascending: true })
    .limit(limit);
  if (error) throw new PolicyNewsStoreError('claim_read_failed');

  const claimed: PolicyNewsItem[] = [];
  for (const row of (data ?? []) as ItemRow[]) {
    // A run that keeps dying mid-item must not retry it forever.
    if (row.attempts >= MAX_ATTEMPTS) {
      await finishItem(row.id, { status: 'failed', errorCode: 'too_many_attempts' });
      continue;
    }
    // `attempts` doubles as the optimistic lock between overlapping runs.
    const { data: won, error: claimError } = await db()
      .from('policy_news_items')
      .update({ status: 'processing', claimed_at: now.toISOString(), attempts: row.attempts + 1 })
      .eq('id', row.id)
      .eq('attempts', row.attempts)
      .select('id');
    if (claimError) throw new PolicyNewsStoreError('claim_write_failed');
    if (!won?.length) continue;
    claimed.push({
      id: row.id,
      source: row.source,
      externalId: row.external_id,
      title: row.title,
      url: row.url,
      documentType: row.document_type,
      publishedAt: row.published_at,
      summary: row.summary,
      fullTextUrl: row.full_text_url,
      attempts: row.attempts + 1,
    });
  }
  return claimed;
}

export async function finishItem(
  id: number,
  outcome:
    | { status: 'published'; slug: string }
    | { status: 'skipped' }
    | { status: 'pending' | 'failed'; errorCode: string }
): Promise<void> {
  const { error } = await db()
    .from('policy_news_items')
    .update({
      status: outcome.status,
      claimed_at: null,
      article_slug: outcome.status === 'published' ? outcome.slug : null,
      error_code: 'errorCode' in outcome ? outcome.errorCode.slice(0, 120) : null,
    })
    .eq('id', id);
  if (error) throw new PolicyNewsStoreError('item_update_failed');
}

/** Titles and slugs of automatic posts published since `since`. */
export async function loadRecentAutoPosts(since: Date): Promise<Array<{ slug: string; title: string }>> {
  const { data, error } = await db()
    .from('auto_blog_posts')
    .select('slug, article->>title')
    .gte('published_at', since.toISOString())
    .order('published_at', { ascending: false })
    .limit(50);
  if (error) throw new PolicyNewsStoreError('recent_posts_read_failed');
  return (data ?? []).map((row) => ({ slug: row.slug as string, title: String((row as { title?: unknown }).title ?? '') }));
}

export async function autoSlugExists(slug: string): Promise<boolean> {
  const { data, error } = await db().from('auto_blog_posts').select('slug').eq('slug', slug).maybeSingle();
  if (error) throw new PolicyNewsStoreError('slug_read_failed');
  return Boolean(data);
}

export async function insertAutoPost(
  article: ResearchArticle,
  itemId: number,
  now: Date,
  coverImage: Buffer | null
): Promise<void> {
  const { error } = await db().from('auto_blog_posts').insert({
    slug: article.slug,
    article,
    source_item_id: itemId,
    published_at: now.toISOString(),
    cover_image: coverImage ? `\\x${coverImage.toString('hex')}` : null,
  });
  if (error) throw new PolicyNewsStoreError(error.code === '23505' ? 'slug_conflict' : 'post_write_failed');
}
