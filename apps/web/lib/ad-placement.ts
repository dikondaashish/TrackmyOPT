/**
 * Where in-article ads go on blog posts.
 *
 * Structured posts (components/blog/ResearchArticlePage.tsx) place their
 * units in JSX and mark the article with `data-explicit-ads`. Hand-written
 * posts under app/blog/<slug>/page.tsx have no slots of their own; the
 * client component components/blog/AutoArticleAds.tsx asks this module for
 * anchors and inserts units before them, between sections of the article
 * text, never inside a call-to-action box, navigation or another aside.
 */

/**
 * Pages that bring most sign-ups (Nov 2026 plan). They keep the ads they
 * have today and get no extra units, so nothing competes with the sign-up
 * box.
 */
export const NO_EXTRA_ADS_SLUGS = new Set([
  'opt-processing-time-2026',
  'stem-opt-processing-time-2026',
  'uscis-case-status-tracking-guide',
  'opt-premium-processing-timeline-2026',
]);

/** Fewest article headings before a post gets an ad. */
export const MIN_HEADINGS_FOR_AD = 3;
/** Headings needed before a second ad is added. */
export const MIN_HEADINGS_FOR_SECOND_AD = 6;
/** Shortest article text, in characters, that gets an ad. */
export const MIN_TEXT_FOR_AD = 2500;

/**
 * Heading positions (0-based) to place an ad before, given how many
 * eligible headings the article has: after the first section, and for long
 * articles again about two thirds of the way down.
 */
export function adHeadingIndexes(headingCount: number): number[] {
  if (headingCount < MIN_HEADINGS_FOR_AD) return [];
  const indexes = [1];
  if (headingCount >= MIN_HEADINGS_FOR_SECOND_AD) {
    indexes.push(Math.max(4, Math.round(headingCount * 0.65)));
  }
  return indexes.filter((index) => index < headingCount);
}

/** Path of a single blog post, or null for the index, hubs and other pages. */
export function blogPostSlug(pathname: string): string | null {
  const match = /^\/blog\/([a-z0-9-]+)\/?$/.exec(pathname);
  return match ? match[1]! : null;
}

const EXCLUDED_ANCESTORS =
  '.not-prose, nav, aside, header, footer, form, details, [data-no-ads]';

/**
 * The elements to insert ads before, inside `article`. Only headings in the
 * article's prose are used. Each anchor is the outermost wrapper that starts
 * with the heading, so an ad lands between sections rather than inside a
 * styled section box.
 */
export function findAdAnchors(article: Element): Element[] {
  const prose = [...article.querySelectorAll('.prose')].filter(
    (el) => !el.parentElement?.closest('.prose')
  );
  const textLength = prose.reduce(
    (sum, el) => sum + (el.textContent?.trim().length ?? 0),
    0
  );
  if (textLength < MIN_TEXT_FOR_AD) return [];

  const headings = prose.flatMap((container) =>
    [...container.querySelectorAll('h2')].filter((heading) => {
      const excluded = heading.closest(EXCLUDED_ANCESTORS);
      return !excluded || !container.contains(excluded);
    })
  );

  return adHeadingIndexes(headings.length).map((index) => {
    let anchor: Element = headings[index]!;
    while (
      anchor.parentElement &&
      !anchor.parentElement.classList.contains('prose') &&
      anchor.parentElement.firstElementChild === anchor
    ) {
      anchor = anchor.parentElement;
    }
    return anchor;
  });
}
