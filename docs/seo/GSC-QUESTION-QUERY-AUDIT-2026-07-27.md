# GSC Question-Query Audit — July 27, 2026

## Scope

- Property: `trackmyopt.com`
- Source: user-provided Google Search Console Performance CSV exports
- Search type: Web
- Date range: April 26–July 25, 2026
- Query filter: Matches regex
  `^(who|what|when|where|why|how|which|whose|whom|is|are|am|can|could|do|does|did|will|would|should|has|have|had)\b`
- Collection date: July 27, 2026

This is a question-intent slice, not total organic performance. Query-level analysis uses the 1,000 rows included in `Queries.csv`; Google may omit anonymized or low-volume queries, and totals from different GSC dimensions are not expected to add together.

## Performance summary

| Metric | Full 91 days | First 45 days | Last 46 days |
|---|---:|---:|---:|
| Clicks | 255 | 84 | 171 |
| Impressions | 10,464 | 4,082 | 6,382 |
| CTR | 2.44% | 2.06% | 2.68% |
| Impression-weighted position | 11.00 | 12.37 | 10.12 |

The most recent 28 days produced 112 clicks from 4,278 impressions, versus 90 clicks from 3,422 impressions in the prior 28 days. Clicks increased 24.4%, impressions increased 25.0%, CTR was effectively flat (2.62% versus 2.63%), and average position improved from 10.73 to 10.06.

## Demand clusters

| Cluster | Queries | Impressions | Clicks | CTR | Avg. position | Interpretation |
|---|---:|---:|---:|---:|---:|---|
| OPT processing/approval | 241 | 4,685 | 218 | 4.65% | 4.14 | Established winner; protect and refresh |
| OPT unemployment | 40 | 1,562 | 13 | 0.83% | 15.49 | Large page-two opportunity |
| STEM OPT | 58 | 1,453 | 7 | 0.48% | 10.14 | Strong impressions, weak snippet capture |
| USCIS case status | 92 | 639 | 3 | 0.47% | 22.03 | Consolidation and intent alignment needed |
| I-983/training plan | 16 | 575 | 0 | 0.00% | 10.42 | Highest-confidence CTR opportunity |
| Work/employer questions | 84 | 620 | 3 | 0.48% | 11.24 | Mixed intent; improve specific pages |
| OPT denial | 7 | 113 | 0 | 0.00% | 6.41 | Page-one zero-click opportunity |
| CPT | 5 | 44 | 0 | 0.00% | 9.16 | Exact-question snippet opportunity |
| SEVIS | 9 | 36 | 0 | 0.00% | 9.42 | Exact-definition snippet opportunity |
| Travel | 10 | 35 | 0 | 0.00% | 16.66 | Page-two content and accuracy gap |
| Sponsorship | 4 | 26 | 0 | 0.00% | 8.85 | Page-one zero-click opportunity |

## Page findings

| Page | Clicks | Impressions | CTR | Position | Action |
|---|---:|---:|---:|---:|---|
| `/blog/opt-processing-time-2026` | 212 | 4,975 | 4.26% | 4.77 | Maintain freshness and factual accuracy |
| `/blog/90-day-unemployment-rule-opt` | 14 | 1,699 | 0.82% | 15.44 | Retarget question phrasing and strengthen internal links |
| `/blog/uscis-case-status-tracking-guide` | 9 | 1,556 | 0.58% | 19.13 | Consolidate duplicate URLs and answer exact tracking questions |
| `/blog/i-983-training-plan-guide` | 0 | 609 | 0.00% | 10.61 | Align title, direct answer, visible FAQ, and schema |
| `/blog/opt-application-denied` | 0 | 142 | 0.00% | 5.86 | Rewrite snippet and correct contradictory legal guidance |
| `/answers/what-is-sevis` | 0 | 42 | 0.00% | 10.02 | Shorten title and align exact definition query |
| `/blog/how-to-answer-sponsorship-question` | 0 | 53 | 0.00% | 5.62 | Improve exact-query title, direct answer, and visible FAQ |
| `/blog/cpt-12-month-rule-opt-eligibility` | 0 | 39 | 0.00% | 8.97 | Directly answer the 11-month CPT query |
| `/blog/can-you-travel-on-opt-complete-guide` | 0 | 63 | 0.00% | 12.56 | Correct travel guidance and target with/without-job intent |

## Implemented

The preceding pillar update (`09c1dcb`) already aligned processing-time, unemployment, USCIS tracking, I-983, and STEM OPT pages with the largest GSC clusters and consolidated duplicate answer/blog URLs.

This audit adds the remaining high-confidence work:

- Rewrites title, description, H1, visible FAQs, and FAQ schema for denial, travel, sponsorship, and CPT pages.
- Uses one shared FAQ data source per page so visible answers and structured data cannot drift apart.
- Corrects OPT-denial motion and status guidance using current USCIS sources.
- Corrects OPT travel guidance using ICE re-entry rules, including pending OPT, employment evidence, EAD/I-20 requirements, visa exceptions, and the 60-day grace period.
- Removes the incorrect claim that Mexico and most EU countries are F-1 visa-exempt.
- Replaces risky CPT “364/365-day” advice with the official “one year or more of full-time CPT” standard and directs students to their DSO's records.
- Clarifies that initial OPT work authorization and a STEM OPT extension impose different employer obligations.
- Shortens the SEVIS answer title and aligns it with exact SEVIS/SEVIS-ID searches.
- Normalizes the CPT canonical URL to the `www.trackmyopt.com` host.

## Device and market notes

- Mobile: 147 clicks, 4,547 impressions, 3.23% CTR, position 6.94.
- Desktop: 107 clicks, 5,871 impressions, 1.82% CTR, position 14.18.
- United States: 210 clicks, 9,098 impressions, 2.31% CTR, position 11.44.

Desktop has more impressions but materially weaker position and CTR. The current change set prioritizes snippet relevance and scannable direct answers; a follow-up should compare desktop Core Web Vitals and rendered SERP titles before assuming content alone explains the gap.

## Measurement plan

1. Deploy and request indexing for the changed URLs.
2. Preserve this export as the baseline; do not compare it with an unfiltered property-wide report.
3. After 28 complete days, export the same search type and identical regex filter.
4. Compare clicks, impressions, CTR, and position for each changed page and exact query cluster.
5. Primary success signal: higher CTR without a material position decline.
6. Secondary signal: denial, CPT, sponsorship, and SEVIS queries moving from zero clicks to sustained clicks.
7. Revisit the unemployment, I-983, and case-status clusters after enough post-deployment data has accumulated; their prior changes are too recent to judge from this export.

## Data not available

This export does not include conversions, revenue, backlinks, competitor rankings, or AI citations. Those metrics are intentionally not estimated.
