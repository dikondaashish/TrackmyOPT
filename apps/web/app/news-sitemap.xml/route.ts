import { currentUpdateArticles } from '@/data/blog-series/current-updates';

const BASE_URL = 'https://www.trackmyopt.com';
const NEWS_PUBLICATION_NAME = 'TrackMyOPT';
const NEWS_LANGUAGE = 'en';
const NEWS_RETENTION_MS = 2 * 24 * 60 * 60 * 1000;

// Keep the two-day inclusion window accurate without creating meaningful load.
export const revalidate = 300;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function publishedWithinNewsWindow(publishedAtValue: string, now: Date): boolean {
  const publishedAt = new Date(publishedAtValue);
  const publishedAtTime = publishedAt.getTime();

  return (
    Number.isFinite(publishedAtTime) &&
    publishedAtTime <= now.getTime() &&
    now.getTime() - publishedAtTime <= NEWS_RETENTION_MS
  );
}

export function GET(): Response {
  const now = new Date();
  const articles = currentUpdateArticles.filter(
    (article) =>
      article.newsSitemapEligible === true &&
      publishedWithinNewsWindow(
        article.newsPublishedAt ?? `${article.publishedDate}T00:00:00.000Z`,
        now
      )
  );

  const urls = articles
    .map(
      (article) => `  <url>
    <loc>${BASE_URL}/blog/${encodeURIComponent(article.slug)}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(NEWS_PUBLICATION_NAME)}</news:name>
        <news:language>${NEWS_LANGUAGE}</news:language>
      </news:publication>
      <news:publication_date>${article.newsPublishedAt ?? article.publishedDate}</news:publication_date>
      <news:title>${escapeXml(article.title)}</news:title>
    </news:news>
  </url>`
    )
    .join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls}
</urlset>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=300',
    },
  });
}
