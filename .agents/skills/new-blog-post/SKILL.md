---
name: new-blog-post
description: >-
  TrackMyOPT workflow for creating a new blog post and submitting it to search
  engines. Use when the user asks to create/write/publish a new blog article,
  add a blog post, or after completing blog content changes that need IndexNow
  and SEO checklist (sitemap, canonical, AuthorBio, disclaimers). Runs
  submit-urls-indexnow after deploy.
version: "1.0.0"
metadata:
  tags:
    - blog
    - seo
    - indexnow
    - trackmyopt
  triggers:
    - "new blog post"
    - "create blog"
    - "write blog article"
    - "publish blog"
    - "submit indexnow"
    - "index new blog"
---

# New Blog Post — TrackMyOPT

End-to-end checklist when adding `apps/web/app/blog/{slug}/page.tsx`.

## Quick workflow

Copy and track:

```
- [ ] 1. Create page + metadata + schema
- [ ] 2. Add to blog index (app/blog/page.tsx)
- [ ] 3. Internal links use canonical slugs (no redirect chains)
- [ ] 4. Typecheck passes
- [ ] 5. Deploy to production
- [ ] 6. Submit URL to IndexNow (script below)
- [ ] 7. Optional: GSC URL Inspection (Google)
```

---

## Step 1 — Create the blog page

**Path:** `apps/web/app/blog/{slug}/page.tsx`

Required on every post:

| Item | Pattern |
|------|---------|
| `metadata` | `title`, `description`, `alternates.canonical` → `https://www.trackmyopt.com/blog/{slug}` |
| `BlogPostSchema` | `publishedDate`, `modifiedDate`, optional `canonicalUrl` |
| `BreadcrumbSchema` | **Absolute** URLs (`https://www.trackmyopt.com/...`) |
| `AuthorBio` | Import from `@/components/blog/AuthorBio` |
| Immigration disclaimer | Auto via `app/blog/layout.tsx` — no extra work |

**Do not** use redirect-source slugs in internal links. Prefer final URLs:

- `*-2026` tax/health/ATS posts
- `can-you-travel-on-opt-complete-guide` (not `can-you-travel-on-opt`)
- `i-983-training-plan-guide` (not `form-i983-stem-opt-training-plan-guide`)

**If replacing an old slug:** add 301 in `next.config.js` + slug to `BLOG_REDIRECT_SLUGS` in `lib/blog-routes.ts` — do not list both in `blog/page.tsx`.

---

## Step 2 — Blog index

Add one entry to `blogPosts` in `apps/web/app/blog/page.tsx` (no duplicate slugs).

**Sitemap:** auto-discovered via `getPublicBlogRoutes()` — new folder = auto-included unless in `BLOG_REDIRECT_SLUGS`.

---

## Step 3 — Validate before deploy

From repo root:

```bash
pnpm exec tsc --noEmit -p apps/web/tsconfig.json
node apps/web/scripts/verify-post-deploy-seo.mjs   # after deploy only
```

---

## Step 4 — Submit to IndexNow (after production deploy)

**Preferred — single new post (no secrets):**

```bash
pnpm submit:indexnow:url -- --slug YOUR-SLUG
```

Or multiple URLs:

```bash
node scripts/submit-urls-indexnow.js --slug post-a --slug post-b
node scripts/submit-urls-indexnow.js /blog/post-a /pricing
```

Success = HTTP 200/202 from IndexNow API.

**Alternative — production API** (requires deploy + `CRON_SECRET` in env, never commit secret):

```bash
curl -X POST "https://www.trackmyopt.com/api/indexnow" \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"urlList":["https://www.trackmyopt.com/blog/YOUR-SLUG"]}'
```

**Full site re-index** (all hardcoded URLs in bulk script):

```bash
pnpm run submit:indexnow
```

---

## Step 5 — Google (manual)

IndexNow does **not** ping Google. After deploy, remind user:

- [Google Search Console](https://search.google.com/search-console) → URL Inspection → Request indexing for `https://www.trackmyopt.com/blog/{slug}`

---

## Agent rules

1. **Always run** `pnpm submit:indexnow:url -- --slug {slug}` after user confirms deploy (or if URL returns 200 live).
2. **Never** print or commit `CRON_SECRET` — use env var only.
3. **Never** add redirect-only slugs to sitemap or blog index without 301 consolidation plan.
4. For USCIS/product posts, include `BlogProductCTA` where relevant (see existing top posts).
5. Report IndexNow result + remind about GSC for Google.

---

## Related files

| File | Purpose |
|------|---------|
| `scripts/submit-urls-indexnow.js` | Submit one or more URLs |
| `scripts/submit-to-indexnow.js` | Bulk submit (~38 URLs) |
| `lib/blog-routes.ts` | Sitemap discovery + redirect exclusions |
| `docs/FULL-AUDIT-REMEDIATION-PHASES.md` | SEO/security conventions |
