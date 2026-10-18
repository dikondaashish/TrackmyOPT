# Google Search Console — pending operations

The TrackMyOPT property is already in use; historical audit documents contain
GSC impressions and issue exports. Initial property creation instructions were
removed.

## Immediate validation

- [ ] Submit or resubmit `https://www.trackmyopt.com/sitemap.xml` after the
  documentation/SEO release.
- [ ] Confirm the canonical property is `https://www.trackmyopt.com`.
- [ ] Validate the deployed fixes for 404, 401, and “Page with redirect.”
- [ ] Export “Crawled — currently not indexed” and map each URL to:
  keep/improve, redirect, canonicalize, noindex, or remove.
- [ ] Inspect representative URLs from homepage, pricing, features, tools,
  blogs, and answers.
- [ ] Run Rich Results Test/schema validation for homepage, pricing, five
  representative blogs, and answer pages.
- [ ] Confirm email alerts for coverage, security, and manual actions reach the
  current owner.

## Monthly monitoring

- [ ] Review indexed versus submitted URLs.
- [ ] Review Core Web Vitals and mobile usability.
- [ ] Review top queries/pages, CTR changes, and branded versus non-branded
  traffic.
- [ ] Investigate new exclusions, redirects, soft 404s, and blocked resources.
- [ ] Run the repository post-deploy SEO verification script.
- [ ] Record important findings and an owner/action date.

## Useful production URLs

- Sitemap: `https://www.trackmyopt.com/sitemap.xml`
- Robots: `https://www.trackmyopt.com/robots.txt`
- IndexNow verification:
  `https://www.trackmyopt.com/300fa2533a6f482aa589db8617927d1c.txt`

## Security

- Give Search Console access to named accounts with the minimum necessary
  role.
- Remove former team members promptly.
- Never commit Search Console API credentials.

## Checkpoint log

| Date | Coverage/CWV result | Important query/page change | Action/owner |
|------|---------------------|-----------------------------|--------------|
| 2026-10-18 | 511 not indexed / 322 indexed (data as of 2026-10-11). CWV: 0 poor mobile URLs. | 423 of 426 "Crawled - currently not indexed" were `/_next/static` JS/CSS chunks (`?dpl=` per deploy); 3 were fresh blog posts. 404/redirect/noindex/robots rows are old slugs already redirected, junk URLs, or intentionally private `/dashboard` and `/login`. `news-sitemap.xml` reported "Missing XML tag" because it is empty without recent news. | Added `X-Robots-Tag: noindex` for `/_next/static/*`, real sitemap `lastmod` (`pnpm seo:lastmod`), de-duplicated answer title brand, removed the news sitemap from robots.txt. Owner: re-run "Validate fix" for 404 and redirect rows; remove the news sitemap entry in Search Console. |

## Keeping sitemap lastmod accurate

`app/sitemap.ts` reads `apps/web/data/seo/page-lastmod.json`, which holds the last
git commit date of each page. After adding or materially editing a page, run
`pnpm --filter web seo:lastmod` from a full (non-shallow) clone and commit the
result. Pages missing from the file get no `<lastmod>` rather than a false one.
