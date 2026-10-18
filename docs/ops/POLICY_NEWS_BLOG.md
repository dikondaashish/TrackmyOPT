# Automatic policy-news blog

`/api/cron/policy-news-blog` (Vercel Cron, `40 */2 * * *`) turns new official
OPT / STEM OPT notices into blog posts and publishes them **without editorial
review**, at the owner's request (2026-10-18).

## How a run works

1. **Collect** notices from the last 7 days:
   - Federal Register API: documents from DHS, USCIS, ICE, DOL and State that
     mention "practical training", "F-1 students" or "Student and Exchange
     Visitor".
   - USCIS alerts RSS (`https://www.uscis.gov/news/rss-feed/22984`) and the
     Study in the States RSS (`https://studyinthestates.dhs.gov/rss.xml`),
     kept only when the title or summary mentions an OPT-related term.
2. **Record** each new notice once in `policy_news_items` (unique per source
   and ID), status `pending`.
3. **Write** up to 2 pending notices per run. Gemini (`policy_news_article`
   task: Gemini 3.8 Flash, 3.7 Flash fallback) reads the document text (first
   60,000 characters) and either skips it as not relevant or returns an
   article. The output is schema-validated; the official source link, dates,
   slug and byline are set in code.
4. **Publish** the article to `auto_blog_posts`. It is served at
   `/blog/<slug>` by `app/blog/[slug]` and listed under "Latest OPT & STEM OPT
   Policy Updates" on `/blog` and in `sitemap.xml`. The run revalidates those
   pages and submits the URLs to IndexNow.

A failing item returns to `pending` and is retried on the next runs; after the
third attempt it becomes `failed`. Posts carry the "TrackMyOPT News Desk"
byline and state that they were generated automatically and not reviewed by an
editor. They are not added to the Google News sitemap.

## Operations

| Task | How |
|------|-----|
| Stop publishing | Set `POLICY_NEWS_BLOG_DISABLED=true` in Vercel production env and redeploy |
| Take a post down | `UPDATE auto_blog_posts SET unpublished_at = now() WHERE slug = '<slug>';` — the page 404s and leaves the index within an hour |
| Re-run a failed notice | `UPDATE policy_news_items SET status = 'pending', attempts = 0, error_code = NULL WHERE id = <id>;` |
| See what was skipped and why | `SELECT source, title, status, error_code, article_slug FROM policy_news_items ORDER BY created_at DESC;` |

Requires the `20261018190000_auto_policy_news_blog.sql` migration, the
existing Vertex AI environment (`GOOGLE_CLOUD_PROJECT`,
`GOOGLE_SERVICE_ACCOUNT_JSON`), Supabase service-role env and `CRON_SECRET`.
Error reporting is described in `docs/ops/SENTRY.md`.
