# Extension Job Widget — Fixes & Intelligence Roadmap

> Audit date: 2026-07-15 · Extension `v0.1.11` · Owner: extension team
>
> Scope: the injected job-page widget (`apps/extension/src/content-job-portal.ts`),
> its supporting engines, and the extension-facing API routes in `apps/web`.
> Goal: fix state/consistency bugs, then make the widget genuinely *smart* for
> OPT students — not just a button rack.

---

## How to use this file

- Work top-down: **Phase 1 → 4**. Each phase is shippable on its own.
- Every item lists the files to touch, acceptance criteria, and effort
  (S = ≤half day, M = 1–2 days, L = 3+ days).
- Check items off (`[x]`) as they land; note the PR next to the item.

---

## Phase 1 — Correctness fixes (trust the widget)

Small, independent bugs. No new backend. Ship as one PR.

### 1.1 Plan badge: add Bearer fallback to premium-status fetch — **S** ✅ DONE
- [x] `apps/extension/src/home.ts` — STATUS fetch tries the cookie session first and retries with `Bearer` only when unauthenticated/failed
- **Bug:** `fetch(API_ENDPOINTS.STATUS, { credentials: 'include' })` is
  cookie-only, while the case-status fetch directly below correctly falls back
  to `Authorization: Bearer <idToken>`. JWT-only sessions (dashboard cookies
  cleared) never see their PRO/DEDICATED badge.
- **Fix:** mirror the case-status pattern — try cookies, retry with Bearer.
- **Accept:** signed-in-via-token user sees plan badge in popup home.

### 1.2 Saved-state resets on every page load ("Not saved" lie) — **M** ✅ DONE
- [x] `apps/extension/src/content-job-portal.ts` — lookup-pending guard, `Saved ✓`, and **View in tracker** state
- [x] `apps/extension/src/background.ts` — `CHECK_JOB_SAVED` with Bearer refresh retry
- [x] `apps/web/app/api/extension/job-application/route.ts` — cookie/Bearer `GET` + extension-safe CORS
- [x] `supabase/migrations/20260715190000_job_application_url_dedup.sql` — atomic per-user exact-URL uniqueness
- **Bug:** `savedBadge` is hardcoded to `Not saved` at render; nothing checks
  whether this `job_url` already exists in the tracker. Revisiting a saved job
  misleads the user and invites duplicate saves.
- **Fix:**
  - Web: `GET /api/extension/job-application?job_url=<url>` → `{ saved: boolean, status?: 'Applied'|'Wishlist', saved_at?: string }`. Bearer + cookie auth, CORS headers as in the existing `POST`.
  - Extension: on widget render, ask `background.ts` (new `CHECK_JOB_SAVED`
    message so the token never enters the content script) and paint:
    badge `Saved ✓` (green) + primary button becomes **View in tracker**
    (opens dashboard job tracker) instead of Save.
- **Accept:** save a job, reload the page → badge shows `Saved`, no duplicate
  save possible from the button.

### 1.3 Widget error labels lose their icon/subtext — **S** ✅ DONE
- [x] `apps/extension/src/content-job-portal.ts` — save flow changes only `.tmo-action-label`
- [x] `apps/extension/src/home.ts` — Feedback/Prefill change inner spans and restore after 2.5 s
- **Bug:** transient error paths write `label.textContent = …` onto
  `.tmo-action-label`, which is fine, but the popup home Feedback button and
  older paths replace the whole button text (`feedbackBtn.textContent = …` in
  `apps/extension/src/home.ts`), dropping the icon permanently.
- **Fix:** always target the `.tmo-action-label`/inner span, never the button
  root; restore original label after 2.5 s.
- **Accept:** trigger each error path → icon stays, label restores.

### 1.4 Prefill returns no coverage information — **M** ✅ DONE
- [x] `apps/extension/src/easy-apply-engine.ts` — returns filled/skipped/total + deep jump target
- [x] `apps/extension/src/prefill-coverage.ts` + tests — logical-field counting and radio-group dedupe
- [x] `apps/extension/src/content-job-portal.ts` — result line and **Jump to first** action
- **Bug:** `runPrefill(): Promise<void>` — the engine knows which fields it
  filled/skipped but reports nothing. Users can't tell a 90% fill from a 10%
  fill without scrolling the whole form.
- **Fix:** return `{ filled: number, skipped: number, total: number,
  firstSkippedSelector?: string }`; widget shows a result line under the
  Prefill row ("12 filled · 3 need you — jump to first") and the toast keeps
  its current copy for the frame-only case.
- **Accept:** on a Greenhouse/Lever test form, the count matches reality and
  "jump" scrolls to the first unfilled required field.

---

## Phase 2 — Ship the intelligence that already has a backend ✅ COMPLETE

The differentiators. Backend work is zero (2.1, 2.2) or minimal (2.3).

### 2.1 Visa-sponsorship signal on the job card 🟢🔴⚪ — **S–M** ⭐ ✅ DONE
- [x] `apps/extension/src/sponsorship-signal.ts` — pure `classifySponsorship()` w/ negation guard + sentence-bounded gaps
- [x] `apps/extension/src/content-job-portal.ts` — pill on job card, painted at mount + 1.4s refresh for late-loading JD
- [x] `apps/extension/tests/sponsorship-signal.test.ts` — 31 cases (incl. negated citizenship/clearance requirements and "authorized ≠ exclusion")
- **Why:** our users are OPT students; whether a posting sponsors is *the*
  make-or-break fact, and the JD text is already extracted in memory
  (`chooseJobDescriptionCandidate` in `job-description.ts`). Zero backend,
  zero AI cost, no competitor widget does it.
- **Build:** classifier over the JD text →
  `'sponsors' | 'no_sponsorship' | 'unclear'`:
  - **no_sponsorship** phrases: "will not sponsor", "unable to sponsor",
    "without the need for sponsorship", "must be authorized to work … without
    sponsorship", "no visa sponsorship", "citizens/permanent residents only",
    "US citizenship required", "must possess … security clearance".
  - **sponsors** phrases: "visa sponsorship available", "will sponsor",
    "H-1B", "H1B transfer", "OPT", "CPT", "STEM OPT welcome",
    "immigration support".
  - Negation guard: a *sponsors* keyword inside a *no_sponsorship* phrase
    (e.g. "no H-1B sponsorship") must classify as `no_sponsorship`.
  - Everything else → `unclear` (never guess).
- **UI:** pill on the job card next to the saved badge —
  🟢 `Mentions sponsorship` / 🔴 `No sponsorship` / ⚪ `Not stated`,
  with a tooltip quoting the matched sentence.
- **Accept:** unit tests cover ≥20 real-world phrasings incl. negations;
  `unclear` shown when JD < 200 chars.

### 2.2 Real "Analyze with AI" (remove the SOON pill) — **M–L** ⭐ ✅ DONE
- [x] `apps/extension/src/content-job-portal.ts` — live analysis modal, score ring, matched/missing chips, summary, and guidance states
- [x] `apps/extension/src/background.ts` + `job-fit.ts` — Bearer-isolated analysis and normalized response contract
- [x] `apps/web/app/api/resume-generator/analyze-gap/route.ts` — shared ATS quota with friendly 402/429 handling
- [x] Resume chain forwards analyzed missing keywords through `/generate` with a no-fabrication prompt constraint
- **Why:** the backend is already live and CORS-ready:
  `POST /api/resume-generator/analyze-gap` (`{ resumeText, jobDescription }` →
  gap analysis) and `POST /api/resume-generator/scan` (ATS keyword scan with
  usage limits). The widget button is fake-disabled on a finished pipeline.
- **Build:**
  1. Click → background fetches base resume text (reuse the resume-generator
     base-resume path used by `LIST_SAVED_RESUMES`/`GENERATE_RESUME`) +
     extension token.
  2. Send extracted JD + resume text to `analyze-gap`.
  3. Render an in-widget panel (same pattern as `openResumeChooser`):
     **fit-score ring**, *matched keywords* chips (green), *missing keywords*
     chips (amber), summary line.
  4. Chain: "Add these to a tailored resume →" button opens the existing
     Generate-custom-resume chooser, pre-noting the missing keywords.
  5. Respect the scan usage limit — surface quota responses as a friendly upgrade
     prompt, not an error.
- **Accept:** signed-in user with a base resume gets score + chips in-widget
  on a live posting; no base resume → same guidance panel the resume flow
  already shows; SOON pill removed.

### 2.3 Persist salary + JD snapshot on save — **M** ✅ DONE
- [x] `apps/extension/src/content-job-portal.ts` + `background.ts` — bounded salary/JD snapshot in manual and automatic save payloads
- [x] `apps/web/app/api/extension/job-application/route.ts` — request cap, HTML stripping, normalization, and persistence
- [x] `supabase/migrations/20260715200000_job_application_snapshots.sql` — columns plus database length constraints
- [x] `apps/web/components/career/job-tracker/ApplicationDrawer.tsx` — compensation and readable saved-description detail, reused by Tailor Resume
- [x] Extension + web unit tests cover original-context preservation, markup stripping, empty values, and the 15,000-character cap
- **Why:** the widget already extracts `salary_text` and the full JD, then
  throws both away at save. Persisting the JD makes every later feature
  possible (tailor a resume from the dashboard days later, dedupe, analytics).
- **Accept:** saved job row contains salary + JD; dashboard job detail shows
  them; no payload-size regression on the API (cap + strip HTML).

---

## Phase 3 — Smart flows (connect the loop) ✅ COMPLETE

Turn four isolated actions into *Analyze → Generate → Prefill → Save* with
memory. Depends on Phase 2.

### 3.1 Post-save next-step suggestion — **S** ✅ DONE
- [x] `content-job-portal.ts` shows the one-line next step after a successful
      save and opens the existing resume chooser.
- [x] The suggestion is keyboard accessible, dismissible, and persisted before
      display so it is never shown twice for the same normalized job URL.
- [x] `smart-flow.ts` keeps the seen-job history bounded and its behavior is
      covered by unit tests.

### 3.2 Duplicate-application warning — **M** ✅ DONE
- [x] The Phase 1.2 `GET` checks the exact URL first, then fuzzy-matches the
      user's recent applications by normalized company and similar role title.
- [x] `application-match.ts` handles company suffixes, punctuation, common
      engineering-role aliases, and seniority without matching unrelated roles.
- [x] The application-status dialog shows the prior role, company, and date as
      a non-blocking warning, with web and extension unit coverage.

### 3.3 OPT-clock context nudge — **M** ✅ DONE
- [x] `/api/opt/calculator` derives the current initial/STEM OPT unemployment
      clock from employment spans and returns only an active, valid clock.
- [x] The background worker authenticates with the extension Bearer token and
      caches the validated response (including no-data responses) in
      `chrome.storage.session` once per UTC day.
- [x] The widget renders a quiet footer line when data exists and stays hidden
      for missing, inactive, pre-start, or completed OPT periods.

### 3.4 Prefill + analyze awareness of the generated resume — **S** ✅ DONE
- [x] Analyze remembers the baseline score only for the current job; direct
      generation computes a baseline when one is not already available.
- [x] Generation re-runs the ATS `/scan` against the final generated LaTeX and
      returns normalized before/after scores without exposing auth tokens.
- [x] The generated-resume result displays the comparison (for example,
      "62 → 89" and "+27 after tailoring") and preserves the finished PDF when
      score scanning is unavailable or usage-limited.
- [x] `/scan` accepts the extension CORS/Bearer flow; automated tests and an
      end-to-end browser fixture cover the smart-flow states.

---

## Phase 4 — Polish & platform ✅ COMPLETE

### 4.1 Widget dark mode — **M** ✅ DONE
- [x] Scoped widget tokens mirror the popup's light/dark surfaces, borders,
      text, focus, overlays, and semantic status colors.
- [x] Theme resolution honors `prefers-color-scheme` and detects an opaque dark
      host-page background, including dialogs rendered outside the widget root.
- [x] Reduced-motion rules, readable controls, modal overlays, sponsorship
      states, OPT context, and generated-resume results work in both themes.

### 4.2 Design-token consolidation for the widget — **M** ✅ DONE
- [x] `widget-platform.ts` owns `WIDGET_TOKENS` and generates the isolated CSS
      custom properties used by the card, settings, menus, dialogs, and panels.
- [x] Neutral and semantic widget surfaces now reference tokens instead of
      duplicating light-only color literals.
- [x] Unit tests lock the light/dark token values and generated media rules.

### 4.3 Popup tool-page bodies restyle — **M** ✅ DONE
- [x] All eight popup tool pages use the shared `toolSurfaceCard()` language
      for date, countdown, reminder, information, and status panels.
- [x] Saturated gradients remain only on primary action buttons; body cards use
      quiet blue/green/orange/red surfaces with theme-aware inputs and calendars.
- [x] The popup stylesheet defines matching light/dark tone tokens, and legacy
      emoji action artwork was replaced with the existing SVG icon set.

### 4.4 Analytics on widget actions — **S** ✅ DONE
- [x] PostHog events cover widget shown, sponsorship classification, job save,
      prefill coverage, AI analysis, and resume generation outcomes.
- [x] The content script sends only normalized low-cardinality properties to
      the background worker; Bearer credentials and the PostHog key never enter
      third-party job pages.
- [x] `/api/extension/widget-event` authenticates, rate-limits, size-limits, and
      revalidates an explicit event/property allowlist before server capture.
- [x] URLs, job descriptions, company names, role titles, keyword text, and
      unknown properties are excluded; extension and web tests cover the guard.

---

## Sequencing at a glance

| Order | Item | Effort | New backend? |
|------:|------|:------:|:------------:|
| 1 | 1.1 Plan-badge Bearer fallback | S | no |
| 2 | 2.1 Sponsorship signal ⭐ | S–M | no |
| 3 | 1.2 Saved-state check | M | tiny (GET) |
| 4 | 2.2 Real Analyze with AI ⭐ | M–L | no (exists) |
| 5 | 1.4 Prefill coverage report | M | no |
| 6 | 2.3 Persist salary + JD | M | migration |
| 7 | 3.1 → 3.4 Smart flows | S–M each | minor |
| 8 | 4.x Polish | M | no |

**Definition of done for every item:** `tsc --noEmit` clean · `npm run build`
clean · unit tests pass (`npm test`) · manual check on one LinkedIn posting
and one Greenhouse posting · no new permissions added to `manifest.json`.

---

## Non-goals (explicitly out of scope for now)

- Auto-submitting applications (we prefill only — compliance stance).
- Scraping salary from third-party sources not on the page.
- Chrome Side Panel API migration (separate decision; popup redesign shipped
  2026-07-15).
- Bulk-apply / mass-targeting features.
