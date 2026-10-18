import 'server-only';
import { revalidatePath } from 'next/cache';
import { blogPosts } from '@/app/blog/blog-index-data';
import { researchArticleBySlug } from '@/data/blog-series';
import { generateAiContent } from '@/lib/ai/google-ai';
import {
  buildPolicyNewsArticlePrompt,
  POLICY_NEWS_RESPONSE_SCHEMA,
} from '@/lib/ai/prompts/policy-news-article';
import { submitIndexNow } from '@/lib/seo/indexnow';
import { easternDate, PolicyNewsResponseSchema, slugify, toResearchArticle } from './article';
import { coverPath, generateCover } from './cover';
import { reportPolicyNews } from './monitoring';
import { collectCandidates, loadSourceText, SOURCE_PUBLISHERS } from './sources';
import {
  autoSlugExists,
  claimItems,
  finishItem,
  insertAutoPost,
  loadRecentAutoPosts,
  MAX_ATTEMPTS,
  PolicyNewsStoreError,
  recordCandidates,
  type PolicyNewsItem,
} from './store';

// One cron run: collect official notices, then write, illustrate and publish
// up to MAX_ARTICLES_PER_RUN of them. Published without editorial review; an
// admin can review a post later in Settings to give it the standard byline.

const SITE = 'https://www.trackmyopt.com';
/**
 * An article is one long text call plus one image call; one per run keeps a
 * worst case (both text models timing out) inside the route's 300 s budget.
 */
export const MAX_ARTICLES_PER_RUN = 1;
const RECENT_POSTS_WINDOW_MS = 60 * 86_400_000;

export class PolicyNewsError extends Error {
  constructor(readonly code: string) {
    super(`Policy news article failed: ${code}`);
    this.name = 'PolicyNewsError';
  }
}

export type PolicyNewsRunSummary = {
  candidates: number;
  sourceFailures: string[];
  published: string[];
  skipped: number;
  failed: string[];
};

type ItemOutcome = { status: 'published'; slug: string; title: string } | { status: 'skipped' };

const staticSlugs = new Set([...blogPosts.map((post) => post.slug), ...researchArticleBySlug.keys()]);
const staticTitles = new Map(blogPosts.map((post) => [post.slug, post.title]));

async function availableSlug(base: string): Promise<string> {
  for (let n = 1; ; n += 1) {
    const candidate = n === 1 ? base : `${base}-${n}`;
    if (!staticSlugs.has(candidate) && !(await autoSlugExists(candidate))) return candidate;
  }
}

async function writeArticle(
  item: PolicyNewsItem,
  now: Date,
  recent: Array<{ slug: string; title: string }>
): Promise<ItemOutcome> {
  const sourceText = await loadSourceText(item);
  const relatedTitles = new Map([...staticTitles, ...recent.map((post) => [post.slug, post.title] as const)]);
  const prompt = buildPolicyNewsArticlePrompt({
    source: SOURCE_PUBLISHERS[item.source],
    documentType: item.documentType,
    title: item.title,
    url: item.url,
    publishedAt: item.publishedAt,
    sourceText,
    today: easternDate(now),
    recentAutoPostTitles: recent.map((post) => post.title),
    relatedCandidates: [...relatedTitles].map(([slug, title]) => ({ slug, title })),
  });

  let raw: string;
  try {
    const response = await generateAiContent({
      task: 'policy_news_article',
      contents: prompt,
      config: { responseMimeType: 'application/json', responseJsonSchema: POLICY_NEWS_RESPONSE_SCHEMA },
    });
    raw = response.text ?? '';
  } catch {
    throw new PolicyNewsError('generation_failed');
  }

  let parsed: ReturnType<typeof PolicyNewsResponseSchema.parse>;
  try {
    parsed = PolicyNewsResponseSchema.parse(JSON.parse(raw));
  } catch {
    throw new PolicyNewsError('invalid_model_output');
  }
  if (!parsed.relevant || !parsed.article) {
    await finishItem(item.id, { status: 'skipped' });
    return { status: 'skipped' };
  }

  const slug = await availableSlug(slugify(parsed.article.title));
  const article = toResearchArticle({ generated: parsed.article, candidate: item, slug, now, relatedTitles });
  // A missing cover falls back to the site's default image; still publish.
  let cover: Buffer | null = null;
  try {
    cover = await generateCover(parsed.article.imagePrompt);
    article.image = coverPath(slug);
  } catch (error) {
    reportPolicyNews('cron', 'cover_generation_failed', 'warning', { source: item.source, error });
  }
  await insertAutoPost(article, item.id, now, cover);
  await finishItem(item.id, { status: 'published', slug });
  return { status: 'published', slug, title: article.title };
}

function errorCode(error: unknown): string {
  return error instanceof PolicyNewsError || error instanceof PolicyNewsStoreError ? error.code : 'unexpected_error';
}

export async function runPolicyNewsBlog(now: Date): Promise<PolicyNewsRunSummary> {
  const { candidates, failures } = await collectCandidates(now);
  for (const failure of failures) {
    reportPolicyNews('cron', 'source_fetch_failed', 'warning', { source: failure.source, status: failure.status });
  }
  await recordCandidates(candidates);

  const summary: PolicyNewsRunSummary = {
    candidates: candidates.length,
    sourceFailures: failures.map((failure) => failure.source),
    published: [],
    skipped: 0,
    failed: [],
  };
  const items = await claimItems(MAX_ARTICLES_PER_RUN, now);
  if (!items.length) return summary;

  const recent = await loadRecentAutoPosts(new Date(now.getTime() - RECENT_POSTS_WINDOW_MS));
  for (const item of items) {
    try {
      const outcome = await writeArticle(item, now, recent);
      if (outcome.status === 'published') {
        summary.published.push(outcome.slug);
        recent.unshift({ slug: outcome.slug, title: outcome.title });
      } else {
        summary.skipped += 1;
      }
    } catch (error) {
      const code = errorCode(error);
      const final = item.attempts >= MAX_ATTEMPTS;
      await finishItem(item.id, { status: final ? 'failed' : 'pending', errorCode: code });
      reportPolicyNews('cron', code, final ? 'error' : 'warning', { source: item.source, error });
      summary.failed.push(code);
    }
  }

  if (summary.published.length) {
    revalidatePath('/blog');
    revalidatePath('/sitemap.xml');
    for (const slug of summary.published) revalidatePath(`/blog/${slug}`);
    try {
      const status = await submitIndexNow([`${SITE}/blog`, ...summary.published.map((slug) => `${SITE}/blog/${slug}`)]);
      if (status !== 200 && status !== 202) reportPolicyNews('cron', 'indexnow_rejected', 'warning', { status });
    } catch {
      reportPolicyNews('cron', 'indexnow_failed', 'warning');
    }
  }
  return summary;
}
