# TrackMyOPT feature launch campaign v2

Created September 26, 2026. Product behavior checked against extension 0.2.1, release commit `89d81205d458af0a000e0c0458fa0604ee4eec90`.

[Open the campaign gallery](index.html) · [Full prompt set](prompts.json)

## Direction

**Your next chapter, in focus.** Cinematic directional lighting, cobalt blue, warm ivory, deep ink shadows, tactile documents and dimensional interface details. Each major feature gets its own composition and benefit-led headline. The earlier tour-derived Store images remain preserved in `../0.2.1/`.

These are generated **illustrative campaign images**, not exact captures of the extension UI. Alex Taylor, Example Corp, and example.test are fictional. The illustrations intentionally omit real customer records, credentials, quantitative performance claims, immigration eligibility dates, and promises of hiring or immigration outcomes.

## Assets and feature evidence

All 14 PNG masters are **1586 × 992 pixels**, opaque RGB. Source paths below are relative to `apps/extension/`.

| Image | Feature | Implementation |
| --- | --- | --- |
| [01-prefill.png](01-prefill.png) | Smart Prefill | `src/easy-apply-engine.ts`; `src/prefill-contact-source.ts` |
| [02-tailored-resume.png](02-tailored-resume.png) | Tailored résumés | `src/background-tailored-resume.ts`; `src/sidepanel.ts` |
| [03-job-fit.png](03-job-fit.png) | Job-fit analysis | `src/job-fit.ts`; `src/job-portal-ai-result-ui.ts` |
| [04-screening-answers.png](04-screening-answers.png) | Screening answers | `src/background-screening.ts`; `src/screening-question-drafts.ts` |
| [05-cover-letter.png](05-cover-letter.png) | Cover letters | `src/background-cover-letter.ts`; `src/cover-letter-review.ts` |
| [06-job-tracker.png](06-job-tracker.png) | Job tracker | `src/background-job-tracker.ts`; `src/job-tracker-review.ts` |
| [07-guided-autopilot.png](07-guided-autopilot.png) | Guided Autopilot | `src/guided-autopilot.ts` |
| [08-continuous-prefill.png](08-continuous-prefill.png) | Continuous Prefill | `src/continuous-prefill.ts`; `src/autofill-plan-entitlements.ts` |
| [09-private-answers.png](09-private-answers.png) | Saved private answers | `src/sensitive-autofill.ts`; `src/private-application-delivery.ts` |
| [10-portal-login.png](10-portal-login.png) | Portal login prefill | `src/portal-login-prefill.ts` |
| [11-opt-tools.png](11-opt-tools.png) | OPT tools | `src/pages/opt-apply.ts`; `src/pages/clock-tracker.ts` |
| [12-stem-opt-tools.png](12-stem-opt-tools.png) | STEM OPT tools | `src/pages/stem-apply.ts`; `src/pages/stem-clock-tracker.ts` |
| [13-resume-templates.png](13-resume-templates.png) | Résumé templates | `src/agent/panel-templates.ts` |
| [14-application-profile.png](14-application-profile.png) | Application profile | `src/prefill-contact-source.ts`; `src/tour-content.ts` |

## Proposed Store story

1. Smart Prefill: the primary application benefit.
2. Tailored résumés: prepare for a specific role.
3. Job tracker: retain the opportunity and context.
4. Guided Autopilot: supported progression with a review pause.
5. OPT tools: connect job search with the student timeline.

The other nine images support feature pages, launch announcements, and social campaigns. Google permits up to five Store screenshots; see the [official listing guide](https://developer.chrome.com/docs/webstore/cws-dashboard-listing).

These masters are not the final 1280 × 800 Store exports. A Store-specific pass should pair the chosen campaign direction with truthful captures of the shipped UI. The submitted 0.2.1 listing, package, and pending review were not changed by this artwork task.

## Validation

- Visually inspected every generated image for main text, clipping, demo information, and feature claims.
- Reworked the first prefill concept to remove unnecessary desk props and use a digital form.
- Corrected the template image to remove malformed tiny headings and a headshot-like decoration; all six résumé sheets use single-column representations.
- Checked all PNG dimensions and signatures, all gallery links, feature-source paths, prompt JSON, and Git whitespace.
- Fictional email only; password and private-answer examples are masked.
- Guided Autopilot illustration pauses at Review; portal sign-in remains user-initiated.
- OPT/STEM captions refer to saved dates and DSO confirmation, without a legal conclusion.
- No application code or build configuration changed; extension tests were not rerun for static artwork.

## Generation

Used the **built-in image_gen tool**, one image per feature, followed by a targeted correction to image 13. No API/CLI fallback. `prompts.json` contains the complete original prompts and the final correction prompt. Images were copied into this repository from the tool output and were not enlarged.

Reference research: [Wispr Flow's rebrand article](https://wisprflow.ai/rebrand) and [media kit](https://wisprflow.ai/media-kit) informed the product-launch brief. No Wispr logo, image, or product claim is incorporated.
