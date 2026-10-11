# Search-intent blog release — October 11, 2026

This release implements the six content gaps identified in the blog audit,
refreshes three existing guides and the RFE answer, and corrects the related
D/S policy update. It does not promise search rankings, indexing, case approval,
or paid conversions.

## Keyword and reader-intent map

| Canonical blog slug | Main search intent | Reader's next action |
| --- | --- | --- |
| `i-140-case-status-tracking` | I-140 case status / tracking | Check the correct receipt; coordinate notices with the petitioner |
| `uscis-myprogress-taking-longer-than-expected-opt` | OPT myProgress / taking longer than expected | Read notices and check official inquiry eligibility |
| `h4-ead-case-status-tracking` | H-4 EAD status / tracking | Separate I-765 from related receipts; verify work authorization |
| `opt-receipt-number-not-working` | Invalid OPT receipt / missing receipt notice | Verify identifier, submission records, and official help route |
| `moving-while-opt-pending-ead-delivery` | Pending OPT address change / EAD delivery | Update USCIS and student records separately |
| `find-cap-exempt-h1b-employers` | Cap-exempt H-1B employers / OPT job search | Verify legal employer, specific role, and sponsorship willingness |

The new posts contain roughly 1,000–1,200 words each, including FAQs and
checklists. Keywords describe real reader questions; no search-volume or
ranking claims are invented. Each has an original generated WebP cover,
descriptive alternative text, a direct answer, contents links, primary sources,
a clearly labeled fictional example, related articles, and an appropriate tool
CTA. The generic USCIS-tracking CTA avoids routing I-140/H-4 readers to the
OPT-only community estimate.

## Refreshed content and factual corrections

- `opt-premium-processing-fee-increase-1780`: additional $1,780 fee,
  **30 business days**, action rather than approval guarantee, RFE/NOID restart,
  delivery distinction, and the separate TrackMyOPT subscription.
- `i-983-training-plan-guide`: real training goals, employer oversight,
  fictional draft example, evaluations, and material changes.
- `spring-graduates-opt-application-timing-2026`: original canonical retained;
  May and December calendars added. The pre-rule 60-day filing window is
  explicitly tied to the court postponement, rather than inferred from current
  codified text alone.
- `/answers/what-is-rfe-uscis`: the actual notice controls the deadline;
  removed the universal 87-day claim and approval prediction.
- `september-2026-f1-fixed-admission-rule-opt`: replaced the old scheduled-rule
  guidance with a dated explanation of the September 14 postponement. The
  [court order](https://storage.courtlistener.com/recap/gov.uscourts.mad.305059/gov.uscourts.mad.305059.51.0.pdf)
  is primary authority. The plaintiff's
  [current litigation page](https://www.presidentsalliance.org/duration-of-status-litigation/)
  reports the continuing block and appeal; a party's update is identified as such.
- Relocation, general tracking, and H-4 overview pages link contextually to the
  new guides. USPS forwarding and automatic F-2-to-H-4 claims are corrected.

Original publication dates remain unchanged on refreshed pages. Modification
dates reflect this substantive edit. Structured articles use editorial dates
in the sitemap, rather than the deployment clock. Blog cards are deduplicated
by canonical slug.

## Media

Six new cover illustrations are optimized to 1200 × 630 WebP. They are
illustrations, not official USCIS screenshots or customer testimonials.

Three 1200 × 600 process GIFs have four two-second states and static PNG posters:
case monitoring, EAD delivery, and address changes. Each is below 180 KB.
The renderer starts static, requires explicit play, supports pause, and retains
the steps as accessible HTML. Image failures retain those steps and report a
fixed, applicant-data-free exception through the existing Sentry SDK.

HyperFrames 0.8.149 authored and checked the diagrams for runtime, layout,
and contrast issues at 1, 3, 5, and 7 seconds. Sources are in
`docs/seo/blog-flow-sources/`. To reproduce, scaffold a temporary HyperFrames
project, copy one source to `index.html`, run `hyperframes check`, and capture
those four timestamps using `hyperframes snapshot --at 1,3,5,7 --no-end`.
Assemble the PNGs into a looping GIF with two-second frames. The covers were
generated separately with the image tool; they are not altered by that process.

## Validation and search submission

Run from the repository root:

```sh
pnpm --filter web exec tsc --noEmit
pnpm --filter web lint
pnpm --filter web test
pnpm --filter web build
pnpm --filter web exec playwright test e2e/blog-guides.spec.ts
```

The shared structured-article renderer also has scoped heading, list, and
paragraph styles; its previous typography utility names had no installed
plugin behind them. Paragraphs are left-aligned for easier reading.

The new tests check canonical route/card uniqueness, internal links, asset
existence, publication-date preservation, CTA compatibility, explicit
play/pause, readable failure handling, and mobile reduced-motion behavior.
Production validation must confirm HTTP 200, canonical URL, article and
breadcrumb JSON-LD, image response, and sitemap discovery for the actual merge.

After production is healthy, submit all changed canonical URLs through
`node scripts/submit-urls-indexnow.js` with repeated `--slug` arguments or full
paths. A 200/202 means the submission was accepted; it does not mean indexed.
**IndexNow does not notify Google.** Use Google Search Console URL Inspection
and request indexing separately where available. Google controls the outcome;
FAQ markup does not guarantee a rich result.

Measure complete Search Console windows and blog-to-tool activation after
recrawl. Evaluate paid starts using Stripe-verified events, not pageviews alone.
Do not infer conversion uplift from publication or from immature cohorts.
