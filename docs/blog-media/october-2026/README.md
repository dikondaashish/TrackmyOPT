# October 11, 2026 news batch

Two original articles cover the October 8 OPT fee proposal and October 5 CPT
lawsuit. Existing H-1B fee and Duration of Status articles provide supporting
internal links; this batch avoids duplicate articles for those topics.

## Editorial checks

- Primary phrases: **OPT fee proposal 2026** and **CPT lawsuit October 2026**.
  Related phrases target payer, STEM transition, comment deadline, internship
  authorization, academic credit, and later OPT eligibility. These are editorial
  selections; no search-volume or ranking metrics are claimed.
- Each post has a direct answer, contents links, dated legal-status note,
  section-level citations, three explicitly fictional student examples,
  action checklist, visible FAQs, canonical links, author bio, and the shared
  immigration disclaimer. No attorney review is claimed.
- The source notice sets **November 9** for rule comments and **December 7** for
  the separate information collection. Proposed implementation is conditional
  on a future final rule. Existing OPT history does not imply a $30,000 first
  STEM payment under the proposed transition.
- CPT plaintiff allegations and requests are labeled. A requested injunction
  is not a granted order. MIT's notice is evidence of its own school response.
- Cover images are AI-generated conceptual illustrations of fictional people.
  Optimized 1200 × 630 WebP files are saved in the public blog asset directory.
- Flow figures are nine-second GIFs with static PNG posters. The existing
  BlogFlowFigure starts static, has explicit Play/Pause, retains text steps,
  and reports unexpected image-load failures to Sentry without applicant data.
  Cover failures also use a fixed Sentry diagnostic and the existing fallback illustration. Existing error boundaries and privacy filters remain applicable.

## Reproduce the flows

The two subdirectories contain complete HyperFrames compositions. They use
GSAP 3.14.2 and bundled Lato / Playfair Display fonts. From either directory:

```bash
npx --yes hyperframes@0.8.149 check
npx --yes hyperframes@0.8.149 preview --background
npx --yes hyperframes@0.8.149 render --format gif --fps 24 --workers 2 --output /tmp/flow.gif
npx --yes hyperframes@0.8.149 snapshot --at 1,4,7 --no-end --output /tmp/flow-proof
```

Inspect all three stages. Use the first rendered frame as the PNG poster and
compress the GIF with FFmpeg (10 fps, 64-color palette, no dithering) and Gifsicle 1.96 (-O3), then save the GIF and poster under `apps/web/public/blog/october-2026/`. Captures,
render reports, caches, and temporary videos are not production source assets.

## Publication and maintenance

The articles are included in `currentUpdateArticles`, so the existing blog
index, dynamic static routes, main sitemap, metadata, and News sitemap consume
them. News eligibility uses an actual publication timestamp and expires after
48 hours; the main sitemap retains the pages. Do not reset a publication date
just to re-enter the News window. Google decides whether and when to index.

After live HTTP 200 checks, submit both canonical URLs to IndexNow. IndexNow
covers participating engines, not Google. Verify the main sitemap and Google
Search Console property; request Google indexing through URL Inspection when
account access is available. Never use Google's job/broadcast-video Indexing
API for ordinary blog posts or claim a request guarantees indexing.

When new official documents appear, update the affected status note, examples,
FAQ answers, visual captions and frame text together, plus `modifiedDate`.
For OPT, check final text, deadlines, payer, effective date, and transition.
For CPT, check actual orders and their scope, not only plaintiff updates.
Retain the original publication date, fictional-example disclosures and links.
