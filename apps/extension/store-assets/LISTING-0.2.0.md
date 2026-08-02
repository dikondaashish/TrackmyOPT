# Chrome Web Store listing — v0.2.0

Copy below is written to match what the extension **actually does** as of this
build. Do not add claims beyond this without checking the code first — Chrome
Web Store rejects listings whose description overstates functionality.

Package to upload: `apps/extension/trackmyopt-0.2.0.zip`

---

## Name (max 75 chars)

```
TrackMyOPT — OPT Tracker & Job Application Assistant
```
*51 chars. Unchanged from the current listing; no reason to churn brand recognition.*

## Short description (max 132 chars)

Current value in `manifest.json` (95 chars), still accurate:

```
Manage OPT and job applications with review-first prefill and job tracking. Never auto-submits.
```

Optional alternative if you want the new surface mentioned (128 chars):

```
Track OPT days, tailor ATS-ready resumes, and prefill applications from a side panel. Review-first — never auto-submits.
```

## Detailed description

```
TrackMyOPT helps F-1 students on OPT and STEM OPT stay compliant while
applying for jobs, without ever taking an action you did not approve.

WHAT IT DOES

• OPT & STEM OPT clock — track unemployment days used and remaining against
  the 90-day and 150-day limits.

• Job detection — recognises postings on LinkedIn, Indeed, Glassdoor,
  Handshake and major applicant tracking systems including Workday,
  Greenhouse, Lever, iCIMS, Ashby, SmartRecruiters and Taleo, as well as
  company career pages.

• Save to tracker — add a role to your TrackMyOPT job tracker in one click,
  with company, title and URL captured from the page.

• Review-first prefill — fills application fields from your saved profile and
  résumé. Every value is shown to you before submission, and the extension
  never clicks Submit. Guided navigation stops at review and final-submit
  steps and hands control back to you.

• Tailored résumés — generate an ATS-safe résumé matched to the job
  description, using single-column templates with standard fonts and
  recruiter-standard section order. Choose from six templates.

• Job fit analysis — see how your résumé scores against a posting and which
  keywords are missing.

• Screening question drafts — AI-drafted answers you review and edit before
  anything is entered.

NEW IN 0.2.0

• Side panel — long-running work now happens in a Chrome side panel that
  survives page navigation, so tailoring a résumé no longer restarts when you
  click around.

• Visible, stoppable progress — résumé tailoring shows each step as it runs
  and can be stopped at any point.

• Keyboard accessibility — the on-page panel is now fully operable by
  keyboard, with visible focus and screen-reader announcements.

• Consistent light and dark themes across every surface.

PRIVACY

The extension never auto-submits an application. Your data stays in your
TrackMyOPT account; the extension reads a page only to detect a job posting
and to fill fields you have asked it to fill.
```

---

## Permission justifications (required at submission)

Chrome Web Store asks for a written justification per permission. These
reflect actual use in the code:

| Permission | Justification |
|---|---|
| `storage` | Persists the user's session token, widget visibility preferences, and per-site opt-outs. |
| `tabs` | Reads the active tab's URL to detect job postings and to target the side panel at the correct tab. |
| `notifications` | Notifies the user when an OPT unemployment-day threshold is approaching. |
| `scripting` | Injects the prefill routine into same-origin application iframes, which ATS vendors use for form steps. |
| `activeTab` | Reads the current job posting only when the user invokes the extension. |
| `sidePanel` | **NEW in 0.2.0.** Hosts long-running résumé tailoring so it survives page navigation. |

### Broad host access — expect reviewer questions

The content script declares **495 match patterns**, of which **46 are generic
wildcards** (`*://*/careers/*`, `*://*/jobs/*`, `*://*/apply/*`, …). Reviewers
treat that as near-broad host access.

Justification to give:

> Job applications are hosted on tens of thousands of company career pages and
> white-labelled ATS domains, not a fixed list of sites. The extension matches
> common career-page URL paths so it can detect a posting and offer prefill.
> It reads page content only to identify a job posting and to fill fields the
> user explicitly requests. It never transmits page content except the job
> description the user asks to analyse, and it never submits a form.

### Data-usage disclosures you must complete yourself

The submission form requires certifying how data is handled. Answer these
from your own knowledge of the backend — I have not audited the server side:

- Does the extension collect personally identifiable information? (It handles
  name, email, phone, résumé content for prefill.)
- Is data sold or transferred to third parties?
- Is data used for purposes unrelated to the core function?
- Confirm compliance with the Developer Program Policies.

---

## Pre-submission checklist

- [x] Version bumped to 0.2.0 in `manifest.json` and `package.json`
- [x] Production build produced (`npm run build`)
- [x] Package created: `trackmyopt-0.2.0.zip`
- [ ] **Loaded unpacked and smoke-tested in Chrome** — see below
- [ ] Screenshots re-rendered if UI changed materially
- [ ] Permission justifications entered
- [ ] Data-usage disclosures completed

### Smoke test before submitting

Load `apps/extension/dist` via `chrome://extensions` → Developer mode → Load
unpacked, then verify:

1. Open a job posting — the on-page panel appears and detects the role.
2. Open the side panel — it shows the parsed job.
3. Press Tab — focus reaches the panel's controls; Enter/Space activates them.
4. Start a résumé tailoring run, then press **Stop** mid-run — it must halt,
   not complete.
5. Switch the OS to dark mode — no white boxes in the panel or widget.

Items 2–5 exercise code that has passed types and unit tests but has never run
in a browser.

### Known packaging issue

`icons/logo.gif` is 6.5 MB and accounts for essentially the entire 6.4 MB
package. It is a web-accessible resource. Converting it to an optimised PNG or
WebP would cut the package by ~99% and speed up installs. Not a blocker for
this release.
