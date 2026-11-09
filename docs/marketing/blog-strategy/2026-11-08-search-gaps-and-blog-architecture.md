# Blog growth research: search gaps, what converts, and the content architecture

**Date:** 2026-11-08. **Status:** executed November 8 to 9, 2026; see "Delivery status" at the end.

Sources: Google Search Console (`sc-domain:trackmyopt.com`, web search, last 3 months, 2026-08-07 to 2026-11-07, 1,000-row query and page exports read in the UI), PostHog server-side `user_signed_up` events (last 60 days) joined to each person's first pageview, Google autocomplete for 30 seed terms, the production sitemap (288 URLs, 196 blog posts), and competitor SERP checks.

## 1. What the numbers say

| Metric (3 months) | Value |
| --- | ---: |
| Clicks | 35.8K |
| Impressions | 1.65M |
| Average CTR | 2.2% |
| Average position | 6.6 |
| Blog share of clicks | 82% (30.0K of 36.5K page-level clicks) |
| Blog pages with impressions | 280, of which 92 had zero clicks |
| Traffic by country | US 84% of clicks, India 5%, then Philippines, Canada, Dominican Republic, Bangladesh, Pakistan, UK |

Traffic is flat week to week (chart shows the same weekly cycle for 13 weeks). Growth therefore has to come from new query coverage and CTR, not from more of the same.

### Query themes (1,000 queries grouped)

| Theme | Queries | Clicks | Impressions | What it means |
| --- | ---: | ---: | ---: | --- |
| Visa bulletin (EN + Spanish) | 151 | 3,499 | 194,548 | Huge impressions, CTR 1.8%, position 6 to 9. Zero attributable sign-ups. |
| OPT processing / timeline / tracker | 263 | 8,694 | 122,627 | Core intent. Converts. |
| I-140 status / tracker | 66 | 429 | 38,795 | One post at position 5.6 with 1% CTR. Big CTR gap. |
| EAD status / I-765 tracking | 98 | 451 | 23,226 | No dedicated "EAD card status" page. |
| H-4 EAD status | 29 | 138 | 9,717 | One post, position 4 to 5, low CTR. |
| USCIS case status generic | 52 | 190 | 9,460 | Guide ranks 8.5 on 88K impressions. |
| Unemployment days | 30 | 126 | 5,508 | Covered, ranks 3 to 5. |
| SEVIS / SEVP / DSO / ISSS / PDSO | 7 | 11 | 4,405 | Ranks 5 to 9 with no dedicated page. |
| Premium processing | 30 | 59 | 3,280 | Covered, position 4 to 7. |
| H-1B, CIP/STEM list, CPT, E-Verify, grace period, green card | 8 to 15 each | 13 to 44 | 1,300 to 1,800 each | Small but cheap to improve. |
| Tax, travel | 8 | 31 | 344 | Weak coverage of what should be seasonal traffic. |

### What converts (sign-ups by first page viewed, last 60 days)

| Landing page | Sign-ups |
| --- | ---: |
| / (homepage) | 108 |
| /blog/opt-processing-time-2026 | 64 |
| /blog/stem-opt-processing-time-2026 | 38 |
| /features/case-status | 27 |
| /blog/uscis-case-status-tracking-guide | 21 |
| /blog/opt-premium-processing-timeline-2026 | 21 |
| /blog/i-140-case-status-tracking | 5 |
| /blog/opt-ead-pending-processing-delays-2026 | 4 |
| /blog/volunteer-work-opt-employment-rules | 4 |
| All visa bulletin posts combined | 0 |

The pattern is unambiguous: **people who are waiting on USCIS sign up**. Processing time, case status, premium processing, EAD delay and I-140 pages produce almost every blog sign-up. Visa bulletin posts produce 3,500 clicks a month and no sign-ups because the product has nothing for a priority-date reader. Rules and lifestyle posts (unemployment days, grace period, tax, car, apartment) produce traffic and authority but few sign-ups.

Implication for the plan below: prioritise "waiting on USCIS" topics for sign-ups, keep the monthly visa bulletin series for reach and domain authority but give it a conversion path, and treat everything else as supporting content.

## 2. Gaps and opportunities, ranked

### A. Fix CTR on pages that already rank (fastest wins, no new posts)

| Page | Impressions | Clicks | CTR | Position | Fix |
| --- | ---: | ---: | ---: | ---: | --- |
| / for "opt tracker" | 41,568 | 2,092 | 5.0% | 4.4 | Title and description should say "OPT tracker" and "case status" explicitly; add FAQ schema. |
| /blog/september-2026-visa-bulletin-opt-workers | 159,252 | 1,369 | 0.9% | 8.2 | Readers want the bulletin dates. Put the Final Action and Dates for Filing tables first, title "September 2026 Visa Bulletin: dates, chart, what changed". |
| /blog/uscis-case-status-tracking-guide | 88,110 | 1,516 | 1.7% | 8.5 | Split "IOE receipt number", "ELIS case status" and "case status A-number" into their own sections with anchors. |
| /blog/i-140-case-status-tracking | 49,665 | 626 | 1.3% | 5.7 | Title "I-140 Tracker: check status, processing times and alerts". Add a status-code table. |
| /blog/opt-premium-processing-fee-increase-1780 | 46,772 | 495 | 1.1% | 5.4 | Rename to "OPT premium processing fee 2026: $1,780 cost, timeline, worth it?" |
| /blog/90-day-unemployment-rule-opt | 43,924 | 526 | 1.2% | 4.7 | Add a calculator embed and "how to check your count in SEVP portal". |
| /blog/is-my-degree-stem-eligible-cip-code | 21,345 | 155 | 0.7% | 6.5 | Add the 2026 CIP list as a searchable table; targets "stem cip codes", "cip code lookup", "dhs stem designated degree program list 2026". |
| /blog/sevp-portal-guide-opt | 18,070 | 25 | 0.1% | 7.8 | Nearly zero CTR. Rewrite title around "SEVP portal login, unemployment counter, update employer". |
| /blog/60-day-grace-period-f1-students | 16,468 | 115 | 0.7% | 6.8 | Target "opt grace period after graduation / after expiration" phrasing. |
| /blog/how-to-answer-sponsorship-question | 8,120 | 29 | 0.4% | 6.8 | Add sample answers; title mismatch with query. |
| /blog/cpt-complete-guide | 6,996 | 13 | 0.2% | 8.6 | Refresh with the 2026 CPT lawsuit and Day 1 CPT sections. |
| /e-verify-employer-search (tool) | ~800 | 15 | ~2% | 8.4 | Add explainer text: "e verify employer search", "is e-verify number same as EIN". |

### B. Recurring series (write on a schedule)

1. **December 2026 Visa Bulletin predictions** (write now, before the State Department release around Nov 14 to 18). Autocomplete already shows "december 2026 visa bulletin predictions", "... india", "... eb2". Competitors at position 2 to 8: visa-bulletin.us, shusterman.com, reddyesq.com, mygcvisa.com. Our October and November prediction posts ranked 6 to 7. Add per-category sections (EB-1 India, EB-2 India, EB-3 India, F4) because those long-tail queries appear separately.
2. **December 2026 Visa Bulletin: what it means for OPT workers** (the day it is released).
3. **Spanish version: "Boletín de visas diciembre 2026: predicciones y fechas"**. Spanish queries ("boletin de visas octubre 2026" and variants) produced 7,748 + 1,948 + 1,322 + 950 + 912 impressions at position 7 to 9 with no Spanish page. Dominican Republic and Mexico are already in the top 10 countries. Publish at `/blog/es/...` or `/es/blog/...` with `hreflang`.
4. **Monthly "OPT and STEM OPT timelines reported by TrackMyOPT users"** data post. Targets "opt megathread", "stem opt megathread", "opt timeline reddit 2026", "opt processing time 2026 reddit" (about 1,700 impressions combined, positions 6 to 9). This is content only TrackMyOPT can write from its own tracker data, and it links straight to the case-status feature.
5. **Monthly OPT/EAD processing-time update** already exists (`monthly-opt-ead-processing-times-receipt-date`). Keep it, add the month to the title.

### C. New posts for queries with no dedicated page

Ordered by expected sign-ups first, traffic second. Impressions are 3-month totals for the matching query family.

| # | Working title | Target queries (impressions) | Why it fits |
| --- | --- | --- | --- |
| 1 | EAD card status: how to check it, what each status means, and when the card ships | ead status check (4,846), ead status (3,991), ead tracker (969), ead application status (968), ead card status (624), check ead status (211) | 23K impressions with no dedicated page. Direct case-status conversion. |
| 2 | I-765 processing time after biometrics (2026) | i-765 processing time after biometrics (550), how long after biometrics to get work permit 2026 (220), how long does it take to get opt after biometrics (56) | Waiting-on-USCIS intent. Links to biometrics post. |
| 3 | IOE receipt numbers and ELIS case status explained | ioe case status (242, pos 11.7), ioe (141), elis case status (44), uscis case status a number (188, pos 11.6), i797 tracking (110) | Case-status cluster; we rank 11 to 12 with no page. |
| 4 | H-1B case status tracker: how to track an H-1B petition after OPT | h1b case status tracker (198), opt to h1b (488, pos 9.9), opt to h1b change of status (68) | Extends the tracker to the next step every OPT user takes. |
| 5 | I-485 and green card status tracking | uscis green card tracking (105), green card status tracker (27), i-140 tracking by company (29) | Same feature, later life stage. |
| 6 | H-4 extension (I-539) status and timeline | h4 extension status (303), h4 case status (484), h4 status check (600) | H-4 cluster is 9.7K impressions and one post. |
| 7 | OPT approval rate and denial rate 2026 (from tracker data) | opt approval rate (66), opt denial reasons (82), reasons for opt denial (58), can opt be denied (38) | Data post, unique to TrackMyOPT. |
| 8 | ISSS, DSO and PDSO: who they are and when to contact each | isss (1,806), pdso (991), sevis pdso (29) | 2.8K impressions at position 5 to 8 with no page. Glossary-style, quick to write. |
| 9 | Where to find your SEVIS ID (and what it is used for) | sevis id (895), sevis unemployment counter (72), sevp login (641) | Pairs with the SEVP portal rewrite. |
| 10 | "H-1B or STEM OPT candidates": what that job posting line means | h1-b or stem opt (853, pos 2.8), h1-b or stem opt candidates meaning (181) | Already ranking without a page; a page will take position 1 and feeds the job tracker. |
| 11 | How to answer "Explain how this job relates to your degree" (sample answers) | explain how this job relates to the degree ... (59 + 45), opt job related to degree (existing post) | Add as a section with 8 sample answers by major, or a standalone post. |
| 12 | C03B, C03A, C03C: OPT EAD category codes explained | c03b visa category (144), c03b (95) | Ranks 1.1 already from a glossary page; a short post locks it in and links to the EAD guide. |
| 13 | Choosing your OPT start date (and what happens if USCIS misses it) | opt start date (147), ead start date (91), opt 14 month rule (31) | Decision-window tool already exists. |
| 14 | Premium processing: 15 business days or calendar days? | is premium processing 30 business days or calendar days (29), how long is premium processing for opt (45) | Short FAQ post. |
| 15 | OPT RFE: common reasons, the shortened response window, and how to reply | rfe (247, pos 25), opt rfe (41), opt noid (54), "uscis is issuing requests for evidence with shortened response periods" (460, pos 3.8) | Waiting-on-USCIS intent, converts. |
| 16 | OPT denied after the grace period: options and timelines | opt denied how long can i stay (57), opt pending after grace period (33), opt denied what are my options (26) | Existing denial post is broad; this is the specific worry. |
| 17 | OPT tax calculator and tax percentage (FICA exemption, federal, state) | autocomplete: opt tax calculator, opt tax percentage, opt tax exemption, opt taxes in texas | Tax cluster is only 216 impressions now; seasonal spike Jan to Apr. Tax-filing feature exists. |
| 18 | OPT to green card without H-1B: EB-2 NIW, EB-1A, marriage, employer PERM | autocomplete: opt to green card without h1b, opt to green card timeline; eb2 india (92), eb1 india (214) | Pillar page linking the existing NIW and PERM posts. |
| 19 | STEM OPT extension: grace period, requirements and fee 2026 | autocomplete: stem opt extension grace period / requirements / fee; stem opt extension (70, pos 16.4) | The generic "stem opt extension" head term ranks 16; the guide needs a refresh and a cleaner title. |
| 20 | OPT travel signature: validity, how to get one, what if it expired | autocomplete: opt travel signature, opt travel signature validity | Travel cluster is thin (128 impressions). |

### D. Language expansion (test, low cost)

- Spanish bulletin series (above). Also "tiempo de procesamiento OPT 2026" as a test.
- Korean queries ("2026년 9월 영주권 문호", "ead 카드 걸리는 시간 2026") already rank 1.0 to 1.6 by accident. A one-page Korean summary of the monthly bulletin would test demand from South Korea (currently 5.9K impressions, 86 clicks).

## 3. Blog architecture

Today: 196 posts under a flat `/blog/<slug>` with 50+ free-text category labels, three storage mechanisms (hand-written `page.tsx`, structured `data/blog-series`, automated policy-news posts in the database) and no hub pages. Readers and Google both see a flat list.

Proposed structure (URLs stay flat to avoid redirects; hubs are new index pages that link down):

```
/blog                         index, featured + latest
/blog/hub/processing-times    "Waiting on USCIS" hub   (conversion hub)
/blog/hub/case-status         I-765, I-140, H-4 EAD, I-485, H-1B, receipt numbers
/blog/hub/visa-bulletin       monthly predictions + releases, EN + ES
/blog/hub/opt-rules           unemployment, grace period, employment rules, SEVP portal
/blog/hub/stem-opt            I-983, employers, extension, validation reports
/blog/hub/after-opt           H-1B, cap gap, green card paths, TN/O-1/L-1
/blog/hub/money-and-life      tax, insurance, SSN, credit, housing, car
/blog/hub/policy-news         automated + reviewed news (keeps the 48-hour news sitemap)
/blog/es/...                  Spanish posts, hreflang-linked to the English original
```

Rules that go with it:

1. **One canonical category per post** from a fixed list of eight (the hub names). Map the 50 existing labels to these in `blog-index-posts-*.ts` and `data/blog-series`. The category badge, breadcrumbs and `BreadcrumbSchema` use the hub.
2. **Every post declares a `cta` matching its hub.** Processing-time and case-status hubs always end on the case-status sign-up CTA (the one that converts, see the Oct 2026 regression note in memory). Rules and life posts use the OPT-clock or job-tracker CTA. Bulletin posts get a new "priority date alert" email capture or, until that exists, the case-status CTA aimed at I-140/I-485 readers.
3. **Pillar + cluster linking.** Each hub page links to its 8 to 15 posts; each post links up to its hub and sideways to 3 related posts (the `related` field already exists in `ResearchArticle`).
4. **Series posts carry the month in the slug and a stable "latest" URL.** For example `/blog/visa-bulletin-predictions` redirects to the current month. Same for the processing-time monthly update.
5. **All new posts use the structured `ResearchArticle` format** (`data/blog-series`), not hand-written `page.tsx`. It already gives direct answer, key takeaways, FAQ schema, sources, related links and the CTA variant, and it is what the policy-news pipeline emits, so one renderer serves everything.
6. **Data posts** (monthly user timelines, approval rate) read from the tracker database through a build-time script and store a snapshot in the article so the page stays static.

## 4. Images, generated with code

Three kinds of visuals, all reproducible from the repo:

1. **Cover illustrations (1200x630 WebP).** Reuse `lib/policy-news/cover.ts`: Gemini image generation with the house-style prompt (painterly, green/navy/cream, no text), resized with sharp. Add a small CLI (`scripts/blog-cover.ts <slug> "<scene>"`) so a manual post gets the same cover pipeline as the automated ones. Fallback for posts without an AI cover: a programmatic SVG cover (title, hub colour, icon) rendered to PNG by sharp.
2. **In-article figures as SVG rendered from data.** A `scripts/blog-figures/` generator that takes a small JSON spec and emits SVG (and a PNG poster via sharp) for the four shapes these topics need:
   - timeline (receipt → biometrics → card produced → card mailed, with median days from tracker data),
   - decision flow (e.g. "OPT denied: what now"),
   - comparison table card (premium vs regular, OPT vs CPT),
   - bar/line chart (monthly processing-time medians, approval rate) following the `dataviz` skill palette.
   Figures are committed under `public/blog/figures/<slug>/` and referenced from the article's `visual` or image fields; the existing `BlogFlowFigure` component plays the animated version and shows the poster.
3. **Social/OG cards** generated from the same SVG template so every post has a share image without manual work.

## 5. First 30 days (proposed order)

| Week | Work |
| --- | --- |
| 1 | December 2026 bulletin predictions (EN + ES). CTR fixes on homepage, September bulletin, I-140, USCIS case status guide, SEVP portal guide. |
| 2 | New: EAD card status guide; I-765 after biometrics; IOE/ELIS receipt numbers. Hub pages for processing-times and case-status with category mapping. |
| 3 | December bulletin release post (EN + ES). New: H-1B case status; H-4 extension; ISSS/DSO/PDSO; SEVIS ID. First "timelines reported by users" data post. |
| 4 | New: OPT RFE guide; approval-rate data post; "H-1B or STEM OPT candidates"; C03B codes. Remaining hubs. OPT tax calculator post queued for January. |

## 6. How to measure

- Search Console: compare clicks and CTR for the fixed pages 28 days after the change; track new posts' first impressions within 7 days of IndexNow submission.
- PostHog: rerun the sign-up-by-first-pageview query (below) monthly and compare blog-attributed sign-ups, which were about 190 of 390 in the last 60 days.
- Stripe: subscription creations in the same window (see memory note on the October 2026 regression; do not change the case-status CTA without checking it).

```sql
WITH signups AS (
  SELECT person_id, min(timestamp) AS signed_at
  FROM events
  WHERE event = 'user_signed_up' AND timestamp >= now() - INTERVAL 60 DAY
  GROUP BY person_id
)
SELECT landing, count() AS signups
FROM (
  SELECT e.person_id AS person_id,
         argMin(replaceRegexpAll(e.properties.$pathname, '\\?.*$', ''), e.timestamp) AS landing
  FROM events AS e
  WHERE e.event = '$pageview'
    AND e.timestamp >= now() - INTERVAL 90 DAY
    AND e.person_id IN (SELECT person_id FROM signups)
  GROUP BY e.person_id
)
GROUP BY landing
ORDER BY signups DESC
LIMIT 40
```

## Appendix: top 40 queries by impressions (3 months)

| Query | Clicks | Impressions | Position |
| --- | ---: | ---: | ---: |
| visa bulletin september 2026 | 354 | 70,246 | 8.8 |
| opt tracker | 3,116 | 41,831 | 2.6 |
| september visa bulletin 2026 | 109 | 19,364 | 9.1 |
| september 2026 visa bulletin | 74 | 11,027 | 8.8 |
| visa bulletin october 2026 predictions | 570 | 8,625 | 6.3 |
| visa bulletin october 2026 | 244 | 7,941 | 6.9 |
| boletin de visas octubre 2026 | 188 | 7,748 | 7.2 |
| us visa bulletin september 2026 | 64 | 5,930 | 7.5 |
| opt timeline | 168 | 5,800 | 7.1 |
| i140 tracker | 71 | 5,508 | 6.8 |
| i140 case status | 26 | 5,394 | 5.4 |
| stem opt tracker | 526 | 5,103 | 3.3 |
| ead status check | 9 | 4,846 | 6.4 |
| stem opt timeline | 149 | 4,815 | 5.6 |
| stem opt premium processing fee | 59 | 4,470 | 4.5 |
| stem opt processing time | 373 | 4,312 | 5.0 |
| october visa bulletin 2026 | 115 | 4,280 | 7.0 |
| visa bulletin november 2026 predictions | 178 | 4,073 | 6.9 |
| rrb ntpc ug 2026 cbt 2 exam date (noise) | 67 | 4,016 | 1.0 |
| ead status | 3 | 3,991 | 6.1 |
| i140 tracking | 34 | 3,726 | 6.4 |
| visa bulletin september 2026 predictions | 74 | 3,681 | 6.9 |
| uscis visa bulletin september 2026 | 24 | 3,468 | 9.1 |
| opt processing time | 293 | 3,326 | 2.7 |
| opt premium processing fee | 42 | 3,237 | 5.0 |
| october 2026 visa bulletin | 67 | 2,977 | 8.0 |
| opt pulse tracker | 24 | 2,784 | 6.9 |
| i140 status | 30 | 2,782 | 4.5 |
| h4 ead status check | 17 | 2,770 | 4.7 |
| visa bulletin november 2026 | 69 | 2,730 | 4.2 |
| i140 status check | 22 | 2,665 | 5.4 |
| visa bulletin for september 2026 | 27 | 2,535 | 7.4 |
| i-140 status check | 14 | 2,462 | 5.6 |
| visa bulletin sep 2026 | 17 | 2,170 | 8.2 |
| uscis receipt number | 3 | 2,007 | 7.3 |
| opt unemployment days | 33 | 1,997 | 3.2 |
| boletín de visas octubre 2026 | 37 | 1,948 | 7.0 |
| opt status | 30 | 1,937 | 4.8 |
| october 2026 visa bulletin predictions | 156 | 1,929 | 7.7 |
| i-140 tracking | 11 | 1,898 | 6.6 |

Note: the "rrb ntpc" query is unrelated Indian railway exam traffic landing on a page by accident; ignore it.

## Delivery status (2026-11-09)

Shipped in PRs #155 to #159 and the topic-label PR that follows them.

| Plan item | Status |
| --- | --- |
| 2A. Twelve CTR fixes | Done (homepage, September bulletin, I-140, USCIS case status, SEVP portal, 90-day rule, grace period, CIP code page with a searchable list of all 540 STEM codes, sponsorship answers, CPT guide, premium fee post, E-Verify tool) |
| 2B. December bulletin predictions (EN + ES) | Done |
| 2B. December bulletin release post (EN + ES) | **Waiting** for the State Department to publish the December 2026 bulletin; rewrite both December posts with the official tables and update `blog-latest-redirects.js` when January predictions go up |
| 2B. Monthly user timelines data post | Done for November; next month uses `scripts/community-snapshot.ts` (receipt-month cohorts included) |
| 2B. Monthly processing-time update title | Done |
| 2C. Twenty new posts | Done (all twenty, including the OPT tax guide written ahead of January) |
| 2D. Spanish bulletin, Spanish processing time, Korean bulletin summary | Done (hreflang both ways) |
| 3. Eight hubs | Done |
| 3. One topic label per post | Done as a display mapping (`data/blog-categories.ts`): the eight hub names plus "Careers" for job-search posts, which no hub covers |
| 3. Hub CTAs | Done (hubs end on the case-status CTA) |
| 3. Priority-date alert capture for bulletin readers | **Not built.** It needs a new table, and the repo rules require the owner's explicit approval for database migrations. Bulletin posts use the USCIS tracking CTA meanwhile |
| 3. Stable "latest" URLs | Done (`/blog/visa-bulletin-predictions`, `/blog/boletin-de-visas-predicciones`, `/blog/opt-timelines-latest`) |
| 3. Spanish path | Done with flat slugs plus hreflang instead of `/blog/es/...`, to avoid a second route tree |
| 3. Data posts from a script | Done (`scripts/community-snapshot.ts`, aggregates only) |
| 4. Covers | Done with code (`scripts/blog-covers/render-cover.mjs`), SVG plus PNG, instead of the Gemini CLI |
| 4. In-article figures | Done (`scripts/blog-figures/render-figure.mjs`) |
| 6. Measurement | **Due around 2026-12-06**: compare CTR on the fixed pages 28 days after the change, rerun the sign-up-by-first-page query, check Stripe |
| Google indexing | **Owner action**: request indexing in Search Console for the new URLs (IndexNow covers Bing and Yandex only) |

