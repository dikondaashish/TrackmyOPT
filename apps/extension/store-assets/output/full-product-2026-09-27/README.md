# Full-product Chrome Web Store draft — September 27, 2026

Existing production item: `hfljbefkccdmlnhclfojlafipjnjbajm`, Zyene, Inc.

[Asset gallery](index.html) · [Full description](../../LISTING-FULL-PRODUCT-2026-09-27.txt) · [Generation prompts](prompts.json)

## Scope

Reposition the listing around the full F-1 student journey: OPT/STEM dates, unemployment tools, case status, career preparation, application assistance, and the connected student dashboard. Explicitly identify dashboard-only capabilities. Preserve accurate prefill, credential, privacy and plan-limit disclosures.

The description has 8,114 characters, within the 16,000-character field. Natural search terms and direct question/answer sections explain audience, use, account requirements, and tool location. No rankings, employment outcomes, government affiliation, or AI-search visibility are promised.

The package-derived title remains TrackMyOPT and the package summary is unchanged. They are read-only on the listing form. Category remains Tools; language remains English (United States). No new extension version or ZIP is part of this listing-only task.

## Assets

| File | Dimensions | Purpose |
| --- | --- | --- |
| screenshots/01-product-overview.png | 1280 × 800 | Full-product positioning |
| screenshots/02-opt-stem-timeline.png | 1280 × 800 | Four OPT/STEM tools |
| screenshots/03-resume-career.png | 1280 × 800 | Resumes, job fit, screening, cover letters |
| screenshots/04-prefill-control.png | 1280 × 800 | Profile, Prefill, Continuous, Guided Autopilot |
| screenshots/05-connected-dashboard.png | 1280 × 800 | Job tracking plus broader dashboard |
| promos/promo-small-440x280.png | 440 × 280 | Brand promotional tile |
| promos/promo-marquee-1400x560.png | 1400 × 560 | Brand marquee |

All seven exports are opaque 3-channel RGB PNGs, downsampled without enlargement from generated masters. The original 128 × 128 store icon is retained. Source UI comes from the packaged fictional product tour in the existing 0.2.1 assets, not live customer records. The final artwork is AI-assisted marketing composition, not an unedited screen capture.

## Feature evidence

Paths are relative to the repository root.

- Extension OPT/STEM tools: `apps/extension/src/pages/opt-apply.ts`, `clock-tracker.ts`, `stem-apply.ts`, `stem-clock-tracker.ts`.
- Extension home and case status: `apps/extension/src/home.ts`, `config.ts`.
- Job prefill, Continuous and Guided Autopilot: `apps/extension/src/easy-apply-engine.ts`, `continuous-prefill.ts`, `guided-autopilot.ts`.
- Resume, job fit, screening, cover letter and tracker evidence: see [previous feature evidence](../launch-campaign-v2/README.md).
- Timeline and case dashboard: `apps/web/app/dashboard/opt-dates/page.tsx`, `case-status/page.tsx`.
- Automatic case checking: `apps/web/app/api/cron/check-case-status/route.ts`; availability is qualified by plan.
- Document Vault: `apps/web/app/dashboard/documents/page.tsx`.
- H-1B sponsor research: `apps/web/app/dashboard/career/h1b-sponsors/page.tsx`.
- ATS review and resume templates: `apps/web/app/dashboard/career/ats-scanner/page.tsx`, `resume-generator/templates/page.tsx`.
- Networking and available work email: `apps/web/app/dashboard/career/networking/page.tsx`; the email-finder route redirects here.
- Insurance resources: `apps/web/app/dashboard/opt-health-insurance-finder/page.tsx`.
- Tax resources: `apps/web/app/dashboard/tax-filing/page.tsx`.
- Student offers: `apps/web/app/dashboard/offers/page.tsx`.

## Research and validation

Reviewed the open [Simplify listing](https://chromewebstore.google.com/detail/simplify-copilot-autofill/pbanhockgagggenencehbnadejlgchfc) and [Jobright listing](https://chromewebstore.google.com/detail/jobright-autofill-%E2%80%93-insta/odcnpipkhjegpefkfplmedhmkmmhmoko). Their clear benefit headings and focused product panels informed the layout; no competitor artwork, logos, metrics or testimonial claims were reused.

Checked [Chrome image requirements](https://developer.chrome.com/docs/webstore/images): maximum five screenshots, 1280 × 800 exports, 440 × 280 small tile, 1400 × 560 marquee. Website, contact and privacy URLs returned HTTP 200.

Visually reviewed all generated images and final small-tile crop; used OCR to check the corrected dashboard footer. No application tests are needed for this static listing/assets change.

## Dashboard save status

The full description, five screenshots (01–05 in order), and both promotional tiles were uploaded and saved to the existing production item's draft on September 27, 2026. Chrome Web Store confirmed “Item saved.” After reloading the listing, the description matched the local 8,114-character source exactly; all seven replacement images persisted and were visually checked in their intended slots. No image validation errors appeared. The original icon, category, language, website and support links remain unchanged.

The user explicitly approved removing the seven old images before replacement. Their original local files remain preserved. No Submit for review action was taken. This is a saved draft, not a published update or a completed extension release test.

## Final editorial cross-check

See [the final content audit](CONTENT-AUDIT.md) for verified claims, SEO/AEO corrections, Store state, and the limits of this review. The description and single-purpose wording were corrected and saved again; the seven images were retained after a second visual and format review.
