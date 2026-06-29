# TrackMyOPT — Full Audit & Remediation Phases

**Created:** June 29, 2026  
**Scope:** `apps/web` — SEO, Google Search guidelines, security, legal/compliance, production health  
**Verify script:** `node apps/web/scripts/verify-post-deploy-seo.mjs`

---

## Executive summary

| Area | Score | Status |
|------|-------|--------|
| Production SEO (deployed fixes) | 92/100 | Verify script passes on production |
| Technical SEO (codebase) | 72/100 | Duplicate content + schema conflicts remain |
| Security | 68/100 | 2 critical API issues |
| Legal / compliance | 62/100 | Disclaimers + cookie policy gaps |
| Content integrity | 75/100 | Strong content, weak disclaimers |

**Bottom line:** Recent GSC fixes (404 redirects, `/api/me` crawler block, sitemap auto-discovery) are live and verified. **Phases 1–4 were implemented in codebase on June 29, 2026** (see status below).

---

## Implementation status (2026-06-29)

| Phase | Code status | Manual / external remaining |
|-------|-------------|----------------------------|
| **Phase 1** Security | ✅ Implemented | Confirm `CRON_SECRET` + `ADMIN_SECRET` in Vercel |
| **Phase 2** Legal | ✅ Implemented | External legal counsel review of updated policies |
| **Phase 3** SEO | ✅ Implemented | GSC validate fix; Rich Results Test after deploy |
| **Phase 4** Polish | ✅ Mostly implemented | Delete redirect-source blog dirs after 30 days; verify `referrals` RLS in prod |

---

## Already shipped (do not re-do)

These were implemented and verified on production as of June 29, 2026:

- [x] JSON-LD Safari crash fix (`lib/safe-json-ld.ts`)
- [x] React hydration fixes (dashboard widgets, banners)
- [x] `removeChild` download crash fix
- [x] Case status `status_history` hardening + error boundary
- [x] Cross-origin script error resilience (GA4, PostHog, AdSense)
- [x] GSC 404 drilldown — 13 URLs → 301 redirects + internal link fixes
- [x] USCIS cluster SEO (meta, canonical, blog consolidation redirect)
- [x] Blog → product CTAs with PostHog tracking
- [x] Sitemap auto-discovery (`lib/blog-routes.ts`, 45 blog URLs)
- [x] `robots.txt` — `Disallow: /api/` for all search/AI bots
- [x] `X-Robots-Tag: noindex` on all `/api/*` responses
- [x] Middleware — 403 + noindex for crawlers on `/api/*`
- [x] Internal links updated to canonical `-2026` blog slugs (guides, compare, answers data)

**Production verify (all pass):**

```bash
node apps/web/scripts/verify-post-deploy-seo.mjs
```

---

## Phase 1 — Security critical (Week 1)

> **Goal:** Close exploitable endpoints before scaling traffic.  
> **Effort:** ~1–2 days  
> **Owner:** Engineering

### 1.1 Email enumeration — `/api/auth/check-user`

**Severity:** CRITICAL  
**File:** `app/api/auth/check-user/route.ts`

**Problem:** Unauthenticated `POST` calls `supabase.auth.admin.listUsers()` and scans all users to check if one email exists. Enables account probing and can DoS auth admin APIs.

**Tasks:**

- [ ] Replace `listUsers()` with a targeted lookup (Supabase admin `getUserByEmail` or RPC)
- [ ] Add IP rate limiting (e.g. 10 req/min per IP)
- [ ] Return generic responses (do not confirm existence if possible, or rate-limit heavily)
- [ ] Audit all callers — remove endpoint if unused

### 1.2 CRON secret fail-closed

**Severity:** CRITICAL  
**Files:** All `app/api/cron/*/route.ts`, `app/api/case-status/check/route.ts`

**Problem:** If `CRON_SECRET` env var is unset, `Bearer ${undefined}` === `Bearer undefined` can authenticate cron routes.

**Tasks:**

- [ ] Create shared helper `lib/api/verify-cron-auth.ts`:

  ```ts
  export function verifyCronAuth(req: NextRequest): NextResponse | null {
    if (!process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Cron not configured' }, { status: 503 });
    }
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return null; // OK
  }
  ```

- [ ] Apply to all ~10 cron routes
- [ ] Confirm `CRON_SECRET` is set in Vercel production + preview
- [ ] Document in `docs/CRON_SETUP.md`

### 1.3 Insurance eligibility IDOR

**Severity:** HIGH  
**File:** `app/api/insurance-eligibility/route.ts`

**Problem:** `GET ?user_id=<uuid>` returns DOB, income, visa type for any user via service role — no session check.

**Tasks:**

- [ ] `GET`: require authenticated session; `user_id` must match session user (or omit param, use session only)
- [ ] `POST`: require auth or add CAPTCHA + strict rate limit; tighten RLS (`WITH CHECK (auth.uid() = user_id)`)
- [ ] Review migration `supabase/migrations/20241208_insurance_eligibility_table.sql`

### 1.4 IndexNow proxy lockdown

**Severity:** HIGH  
**File:** `app/api/indexnow/route.ts`

**Problem:** Unauthenticated `POST` submits arbitrary URLs to IndexNow with server key.

**Tasks:**

- [ ] Require `ADMIN_SECRET` or restrict to server-side only (remove public POST)
- [ ] Add rate limiting if endpoint must stay public

### 1.5 Auth endpoint hardening

**Severity:** HIGH  
**Files:** `app/api/auth/reset-password/route.ts`, `app/api/auth/check-blocked/route.ts`

**Tasks:**

- [ ] Rate limit reset-password (5 req/hour per IP + per email)
- [ ] Generic error messages (no email enumeration)
- [ ] Rate limit or remove `check-blocked` probe endpoint

### 1.6 Admin route protection

**Severity:** HIGH  
**Files:** `middleware.ts`, `app/admin/**`

**Tasks:**

- [ ] Add `/admin/:path*` to middleware matcher
- [ ] Redirect unauthenticated users to `/login` OR add `robots: { index: false }` + env-gated access
- [ ] Confirm `ADMIN_SECRET` on all admin API routes

### Phase 1 exit criteria

- [ ] No unauthenticated endpoint calls `auth.admin.listUsers()`
- [ ] All cron routes return 503 if `CRON_SECRET` missing
- [ ] Insurance eligibility requires session ownership
- [ ] `/api/indexnow` POST requires auth
- [ ] Manual smoke test of login, cron (with secret), extension `/api/me`

---

## Phase 2 — Legal & compliance (Week 1–2)

> **Goal:** Align public content and cookie/analytics behavior with stated policies.  
> **Effort:** ~2–3 days  
> **Owner:** Engineering + legal review

### 2.1 Shared immigration disclaimer

**Severity:** CRITICAL (legal)  
**Files:** New component + layout integration

**Problem:** 100+ answer pages and ~49 blog posts publish immigration guidance with no “not legal advice” disclaimer. Only `blog/day-1-cpt-vs-opt` has one.

**Tasks:**

- [ ] Create `components/legal/ImmigrationContentDisclaimer.tsx` (short footer block + link to `/disclaimer`)
- [ ] Add to `app/blog/layout.tsx` (all blog posts)
- [ ] Add to `app/answers/[slug]/page.tsx` (above or below content)
- [ ] Soften answers layout copy: “Expert Q&A” → “Educational Q&A” or similar
- [ ] Add disclaimer qualifier to FAQ JSON-LD `text` fields where feasible

### 2.2 Cookie & analytics policy alignment

**Severity:** CRITICAL (legal)  
**Files:** `app/cookie-policy/page.tsx`, `app/privacy/page.tsx`, `app/layout.tsx`, `components/CookieConsent.tsx`, `lib/legal/legal-config.ts`

**Problem:**

| What policy says | What code does |
|------------------|----------------|
| No ad cookies | AdSense loads on cookie accept |
| Lists PostHog, Vercel Analytics | GA4 loads unconditionally (no consent) |
| No Google Ads | `google-adsense-account` meta in layout |

**Tasks:**

- [ ] Gate GA4 behind `CookieConsent` (same pattern as PostHog)
- [ ] Update cookie policy §2 — disclose AdSense, GA4, Vercel Analytics/Speed Insights
- [ ] Update privacy policy §2 — add Google Analytics + AdSense data processing
- [ ] Add AdSense to `THIRD_PARTY_SERVICES` in `lib/legal/legal-config.ts`
- [ ] Consider granular consent (Analytics vs Ads toggles) — optional stretch

### 2.3 AuthorBio & marketing claims

**Severity:** HIGH  
**Files:** `components/blog/AuthorBio.tsx`, landing pages, `lib/seo-schemas.ts`

**Problem:** “Former F-1 Students & **Immigration Experts**”, badge “**USCIS Data Verified**”, conflicting user counts (2,500+ vs 15,000+).

**Tasks:**

- [ ] Change AuthorBio to “Former F-1 Students” (remove “Immigration Experts”)
- [ ] Remove or reword “USCIS Data Verified” badge
- [ ] Standardize user count to one substantiated number across site + schema
- [ ] Audit `docs/LEGAL_BILLING_COMPLIANCE_QA.md` checklist items — mark done as fixed
- [ ] Remove internal note from `LegalPageShell.tsx`: “U.S. counsel should review before launch” (or hide in dev only)

### 2.4 USCIS product disclaimers on blog CTAs

**Severity:** MEDIUM  
**Files:** `components/blog/BlogProductCTA.tsx`, `components/legal/UscisCaseStatusDisclaimer.tsx`

**Tasks:**

- [ ] Add brief disclaimer or link to `/disclaimer` on `case-status` variant of `BlogProductCTA`
- [ ] Reuse existing `UscisCaseStatusDisclaimer` pattern from dashboard

### 2.5 Missing AuthorBio on 11 posts

**Severity:** MEDIUM  
**Files:** Form I-765, I-983, I-9, startup guides, policy posts (see audit list)

**Tasks:**

- [ ] Add `<AuthorBio />` to all 11 posts missing it

### Phase 2 exit criteria

- [ ] Every blog post and answer page shows immigration disclaimer
- [ ] GA4 only loads after analytics consent
- [ ] Cookie + privacy policies match actual third-party scripts
- [ ] AuthorBio claims reviewed and softened
- [ ] Legal counsel sign-off on updated policies (external)

---

## Phase 3 — SEO structure & Google guidelines (Week 2–3)

> **Goal:** Fix duplicate content, schema conflicts, and crawl inefficiency.  
> **Effort:** ~2–3 days  
> **Owner:** Engineering + SEO

### 3.1 Travel blog consolidation

**Severity:** CRITICAL (SEO)  
**Files:** `next.config.js`, `lib/blog-routes.ts`, `app/blog/page.tsx`, `app/blog/can-you-travel-on-opt/`

**Problem:** Two full pages — `/blog/can-you-travel-on-opt` (canonical → complete-guide) and `/blog/can-you-travel-on-opt-complete-guide` — both in sitemap.

**Tasks:**

- [ ] Add 301: `/blog/can-you-travel-on-opt` → `/blog/can-you-travel-on-opt-complete-guide`
- [ ] Add slug to `BLOG_REDIRECT_SLUGS` in `lib/blog-routes.ts`
- [ ] Remove short slug from `app/blog/page.tsx`
- [ ] Update 2 stale links in `lib/answers/*.ts` to complete-guide URL
- [ ] Optionally delete redirect-source page directory after 301 is stable

### 3.2 AggregateRating deduplication

**Severity:** CRITICAL (SEO)  
**Files:** `app/layout.tsx`, `lib/seo-schemas.ts`, `app/page.tsx`, `app/success-stories/page.tsx`, `app/pricing/page.tsx`

**Problem:** Conflicting ratings (4.8/127 vs 4.9/1500 vs 4.9/2500) on same product. Duplicate `SoftwareApplication` on homepage.

**Tasks:**

- [ ] **Option A (recommended):** Remove all `aggregateRating` until real on-page reviews exist with `Review` schema
- [ ] **Option B:** Single source of truth in `lib/seo-schemas.ts`; remove from layout + other pages
- [ ] Deduplicate homepage JSON-LD — layout OR page, not both
- [ ] Use `@id` graph linking if multiple schemas needed: `"@id": "https://www.trackmyopt.com/#software"`

### 3.3 SearchAction — fix or remove

**Severity:** CRITICAL (SEO)  
**File:** `app/layout.tsx`, `app/answers/page.tsx`

**Problem:** `WebSite.potentialAction` points to `/answers?q={search_term_string}` but `/answers` does not filter by `?q=`.

**Tasks:**

- [ ] **Option A:** Implement search on `/answers` (read `searchParams.q`, filter `getAllAnswers()`)
- [ ] **Option B:** Remove `potentialAction` / `SearchAction` until search ships
- [ ] Do not reintroduce `/search` without working UI

### 3.4 Answers sitemap + canonical alignment

**Severity:** HIGH  
**Files:** `app/sitemap.ts`, `app/answers/[slug]/page.tsx`

**Problem:** `/answers/how-to-track-uscis-case-status` in sitemap but canonical → blog URL.

**Tasks:**

- [ ] Exclude `ANSWER_CANONICAL_OVERRIDES` slugs from sitemap `answerPages`
- [ ] Set `openGraph.url` to match `alternates.canonical` in `generateMetadata`

### 3.5 Stale internal links in answers

**Severity:** HIGH  
**Files:** `lib/answers/opt-basics.ts`, `uscis-immigration.ts`, `work-employment.ts`, `tax-finance.ts`, `h1b-career.ts`

**Problem:** ~27 links to pre-redirect slugs (`opt-application-checklist`, `opt-processing-time`, `can-you-travel-on-opt`).

**Tasks:**

- [ ] Replace `/blog/opt-application-checklist` → `/blog/opt-application-checklist-2026` (~27 occurrences)
- [ ] Replace `/blog/opt-processing-time` → `/blog/opt-processing-time-2026` (~8 occurrences)
- [ ] Replace `/blog/can-you-travel-on-opt` → `/blog/can-you-travel-on-opt-complete-guide` (~2 occurrences)

### 3.6 I-983 guide consolidation

**Severity:** HIGH  
**Files:** `blog/form-i983-stem-opt-training-plan-guide/`, `blog/i-983-training-plan-guide/`

**Tasks:**

- [ ] Pick canonical URL (recommend `i-983-training-plan-guide` — existing GSC traffic)
- [ ] 301 the other slug
- [ ] Update blog index + cross-links
- [ ] Add redirect slug to `BLOG_REDIRECT_SLUGS`

### 3.7 Host canonicalization — `zyene.com`

**Severity:** HIGH  
**File:** `middleware.ts`, `next.config.js`

**Problem:** `zyene.com` → `www.trackmyopt.com` redirect only runs for `/api`, `/dashboard`, `/login`. Marketing URLs on `zyene.com` are not redirected.

**Tasks:**

- [ ] Expand middleware matcher to all paths OR add host redirect in `next.config.js` for `zyene.com` / `www.zyene.com`

### Phase 3 exit criteria

- [ ] No duplicate indexed URLs for same content (travel, I-983)
- [ ] Single consistent JSON-LD product schema on homepage
- [ ] SearchAction removed or functional
- [ ] Sitemap URLs match canonical tags
- [ ] Zero internal links to redirect-source blog slugs in `lib/answers/`
- [ ] Re-run verify script + Rich Results Test on homepage

---

## Phase 4 — Polish & monitoring (Week 3–4)

> **Goal:** Clean up medium/low issues and establish ongoing monitoring.  
> **Effort:** ~2 days + ongoing  
> **Owner:** Engineering

### 4.1 Schema & metadata cleanup

**Tasks:**

- [ ] Fix logo URL space in `layout.tsx` JSON-LD → use `/logo.png` or encode `%20`
- [ ] Fix relative breadcrumb URLs in `blog/second-masters-opt-eligibility/page.tsx`
- [ ] Remove redundant `CanonicalURL` client component where server `metadata.alternates.canonical` exists
- [ ] Consolidate `guides/f1-tax-filing` metadata (layout vs page)
- [ ] Add `robots: { index: false }` to `app/premium/page.tsx` or server-side redirect
- [ ] Add Twitter cards to `compare/layout.tsx`
- [ ] Add explicit canonical to `blog/second-masters-opt-eligibility/page.tsx`

### 4.2 Redirect-source page cleanup

**Tasks:**

- [ ] After 301s stable 30+ days, delete page dirs for redirect-only blogs:
  - `f1-student-tax-filing-guide`
  - `opt-health-insurance-guide`
  - `ats-resume-international-students`
  - `how-to-track-uscis-case-status-guide`
- [ ] Align any remaining in-page schema URLs on those pages before deletion

### 4.3 Security medium backlog

**Tasks:**

- [ ] Verify `referrals` table RLS in production Supabase
- [ ] Require `EMAIL_LINK_SIGNING_SECRET` in production (fail boot if missing)
- [ ] Tighten CSP: remove `unsafe-eval` if possible; document why `unsafe-inline` needed
- [ ] Rate limit `partnerships`, `extension/uninstall-feedback` POST routes
- [ ] Gate localhost CORS reflection to `NODE_ENV === 'development'` only

### 4.4 BlogPostSchema improvements

**File:** `components/blog/BlogPostSchema.tsx`

**Tasks:**

- [ ] Add `url`, `image`, `mainEntityOfPage` to `BlogPosting`
- [ ] Fix author entity type (Organization vs Person mismatch)

### 4.5 GSC ongoing monitoring

**Tasks:**

- [ ] Validate fix in GSC for: 404, 401, Page with redirect
- [ ] Export “Crawled – currently not indexed” drilldown → map URLs
- [ ] Weekly: check USCIS blog CTR, `blog_product_cta_clicked` in PostHog
- [ ] Monthly: run `verify-post-deploy-seo.mjs` after each deploy

**PostHog dashboard:** https://us.posthog.com/dashboard/1775072

---

## Google Search Console alignment

| GSC issue | Phase | Status |
|-----------|-------|--------|
| Not found (404) — 13 URLs | Shipped | Validate fix in GSC |
| Blocked due to unauthorized request (401) — `/api/me` | Shipped | Validate fix in GSC |
| Page with redirect | Phase 3.5 | Update answers links |
| Crawled – currently not indexed | Phase 4.5 | Export drilldown |
| Rich results / empty Search appearance | Phase 3.2, 3.3 | Fix schema conflicts |
| Duplicate content (travel blog) | Phase 3.1 | 301 consolidation |

---

## Verification checklist (run after each phase)

```bash
# Production SEO
node apps/web/scripts/verify-post-deploy-seo.mjs

# Typecheck
pnpm exec tsc --noEmit -p apps/web/tsconfig.json

# Manual
# - Rich Results Test: https://search.google.com/test/rich-results
# - GSC → Page indexing → Validate fix (per issue type)
# - Cookie banner: Accept / Decline → confirm GA4 + PostHog + AdSense behavior
# - curl -A Googlebot https://www.trackmyopt.com/api/me → expect 403
```

---

## File reference index

| Topic | Key files |
|-------|-----------|
| Robots / crawlers | `app/robots.ts`, `middleware.ts`, `lib/is-search-crawler.ts` |
| Sitemap | `app/sitemap.ts`, `lib/blog-routes.ts` |
| Redirects | `next.config.js` |
| JSON-LD | `lib/safe-json-ld.ts`, `lib/seo-schemas.ts`, `app/layout.tsx` |
| Answers SEO | `app/answers/[slug]/page.tsx`, `lib/answers/*.ts` |
| Legal pages | `lib/legal/legal-config.ts`, `app/disclaimer/page.tsx` |
| Cookie consent | `components/CookieConsent.tsx`, `lib/cookie-consent.ts` |
| Cron auth | `app/api/cron/*/route.ts`, `docs/CRON_SETUP.md` |
| Compliance QA | `docs/LEGAL_BILLING_COMPLIANCE_QA.md` |

---

## Phase timeline (suggested)

```
Week 1   Phase 1 (Security critical) + Phase 2.1–2.2 (Disclaimer + cookies)
Week 2   Phase 2.3–2.5 (Claims + AuthorBio) + Phase 3.1–3.4 (SEO critical)
Week 3   Phase 3.5–3.7 (Links + I-983 + host redirect) + Phase 4.1–4.2
Week 4   Phase 4.3–4.5 (Security backlog + monitoring) + GSC validation
Ongoing  Weekly GSC + PostHog; monthly verify script
```

---

## Related docs

- [LEGAL_BILLING_COMPLIANCE_QA.md](./LEGAL_BILLING_COMPLIANCE_QA.md)
- [CRON_SETUP.md](./CRON_SETUP.md)
- [CORS_POLICY.md](./CORS_POLICY.md)
- [USCIS_API_AGREEMENT_REVIEW_CHECKLIST.md](./USCIS_API_AGREEMENT_REVIEW_CHECKLIST.md)

---

*This document consolidates the June 29, 2026 full codebase audit. Update checkboxes as phases complete.*
