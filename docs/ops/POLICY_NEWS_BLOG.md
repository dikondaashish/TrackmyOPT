# Automatic policy-news blog

`/api/cron/policy-news-blog` (Vercel Cron, `40 */2 * * *`) turns new official
OPT / STEM OPT notices into blog posts with AI cover images and publishes them
**without review first**, at the owner's request (2026-10-18). An admin can
review a post afterwards in Settings to give it the standard Vinay Kumar byline.

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
3. **Write** one pending notice per run. Gemini (`policy_news_article` task:
   Gemini 3.8 Flash, 3.7 Flash fallback) reads the document text (first 60,000
   characters) and either skips it as not relevant or returns an article plus a
   cover scene. The output is schema-validated; the official source link,
   dates, slug and byline are set in code.
4. **Illustrate**: Imagen (`imagen-4.0-generate-001`, override with
   `POLICY_NEWS_IMAGE_MODEL`) paints the scene in the house style of the
   October 2026 news covers; it is cropped to a 1200x630 WebP, stored in
   `auto_blog_posts.cover_image` and served at `/blog-covers/<slug>.webp`. If
   the image fails, the post is still published with the default cover.
5. **Publish** to `auto_blog_posts`. The post is served at `/blog/<slug>` by
   `app/blog/[slug]` with the same layout as the hand-written news posts
   ("Developing news" badge, contents, FAQ, sources), listed first under "All
   Guides" on `/blog` and included in `sitemap.xml`. The run revalidates those
   pages and submits the URLs to IndexNow.

A failing item returns to `pending` and is retried on the next runs; after the
third attempt it becomes `failed`. Posts are not added to the Google News
sitemap.

## Bylines and review

| State | Author box | Review label |
|-------|------------|--------------|
| New (unreviewed) | "TrackMyOPT News Desk — Generated automatically from the official government document cited above." | "Based on the official <publisher> document" |
| Reviewed in Settings | Standard "Written by Vinay Kumar … reviewed for accuracy by the TrackMyOPT team" | Standard "Reviewed against primary government sources" |

Review: **Dashboard → Settings → Profile → Automatic blog posts → Review
posts**. The popup lists each post with its link and dates. Read the post,
then set its dropdown to **Written by Vinay Kumar**; this records
`reviewed_at` / `reviewed_by` and refreshes the post and `/blog`. Choosing
**TrackMyOPT News Desk** reverts it. Only `BLOG_ADMIN_EMAILS` (default
`dikondaashish@gmail.com`) sees the section. The `/blog` editorial note reads
"exclusively authored by Vinay Kumar" whenever every automatic post is reviewed.

## Operations

| Task | How |
|------|-----|
| Stop publishing | Set `POLICY_NEWS_BLOG_DISABLED=true` in Vercel production env and redeploy |
| Take a post down | `UPDATE auto_blog_posts SET unpublished_at = now() WHERE slug = '<slug>';` — the page 404s and leaves the index within an hour |
| Re-run a failed notice | `UPDATE policy_news_items SET status = 'pending', attempts = 0, error_code = NULL WHERE id = <id>;` |
| See what was skipped and why | `SELECT source, title, status, error_code, article_slug FROM policy_news_items ORDER BY created_at DESC;` |

Requires the `20261018190000_auto_policy_news_blog.sql` migration, the
existing Vertex AI environment (`GOOGLE_CLOUD_PROJECT`,
`GOOGLE_SERVICE_ACCOUNT_JSON`) with access to the Imagen model, Supabase
service-role env and `CRON_SECRET`. Error reporting is described in
`docs/ops/SENTRY.md`.
