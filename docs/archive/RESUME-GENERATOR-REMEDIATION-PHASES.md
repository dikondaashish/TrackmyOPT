# Resume Generator — Remediation Phases

> **Goal:** Help users pass ATS filters, survive recruiter review, and land interviews — especially at competitive companies and as F-1/OPT students.
>
> **Last updated:** 2026-06-29  
> **Scope:** `apps/web/app/dashboard/career/resume-generator/`, related APIs, job tracker integration, store, templates.

---

## Executive summary

The **AI generation prompts are strong** (keyword extraction, XYZ bullets, title alignment). The product gap is the **closed loop**: users generate once, scan the wrong text, download without a pass/fail gate, and apply with no link back to the job in Job Tracker.

| Phase | Focus | Outcome |
|-------|--------|---------|
| **Phase 1** | Accuracy + filename + ATS scan fix | Scores reflect the PDF users actually download |
| **Phase 2** | Auto-improve loop + apply gate | Users don't apply with a failing resume |

---

## Current state (what works)

- [x] JD-tailored LaTeX generation (`/api/resume-generator/generate`)
- [x] Strong system prompt (`lib/ai/prompts/generate.ts`) — keywords, XYZ bullets, title matching
- [x] Static ATS format checker (`lib/validators/ats-checker.ts`) — images, tables, sections, weak verbs, metrics
- [x] Deep ATS scan API (`/api/resume-generator/scan`) — keyword match, improvements
- [x] Regenerate with user feedback + ATS context (`/api/resume-generator/regenerate`)
- [x] Job Tracker → Resume pre-fill (`?company=&role=` from Application Drawer)
- [x] LaTeX → PDF compile pipeline
- [x] Smart download filename `resume_{Name}_{Role}.pdf` via `lib/resume/build-resume-filename.ts`

---

## Phase 1 — Fix accuracy, scoring & naming

**Objective:** Every score and filename reflects the **generated resume**, not the original upload. Users trust the ATS panel.

### 1.1 Scan the generated resume, not the source upload

| | |
|---|---|
| **Issue** | Deep ATS scan sends original `resumeText` to AI but only uses `latexCode` for format checks. Keyword match scores the **old** resume, not the tailored PDF. |
| **Where** | `editor/page.tsx` → `handleDeepScan` → `/api/resume-generator/scan` |
| **Fix** | Add `lib/resume/latex-to-plain-text.ts` — strip LaTeX commands to plain text. Pass **extracted generated text** (or PDF text) as `resumeText` to scan. Keep `latexCode` for format checks. |
| **Acceptance** | Missing keywords in generated LaTeX appear in scan results; original-only keywords do not inflate score. |

### 1.2 Show ATS score immediately after first generate

| | |
|---|---|
| **Issue** | `/generate` returns `atsCheck` but editor never calls `setAtsAnalysis(data.atsCheck)`. User sees empty ATS panel until manual scan. |
| **Where** | `editor/page.tsx` → `generateResume()` |
| **Fix** | After successful generate: `setAtsAnalysis(data.atsCheck)`. Run deep scan automatically once compile finishes (see 1.3). |
| **Acceptance** | ATS panel populated within seconds of first generation without user clicking "Scan". |

### 1.3 Auto deep-scan after compile (not manual-only)

| | |
|---|---|
| **Issue** | Deep scan is opt-in; most users download without scanning. |
| **Where** | `editor/page.tsx` → after `compilePdf` success |
| **Fix** | Chain: `generate → compile → deepScan(generatedText)`. Show loading state on ATS panel. |
| **Acceptance** | Keyword match % visible before user clicks Download. |

### 1.4 Smart download filename (name + role from JD)

| | |
|---|---|
| **Issue** | Downloads were `resume_Jane_Smith.pdf` — no role. `jobTitle` cleared on every JD keystroke. |
| **Where** | `store/resume-store.ts`, `editor/page.tsx`, `lib/resume/extract-job-title.ts`, `lib/resume/build-resume-filename.ts` |
| **Fix** | *(Partially implemented locally — push & deploy)* |
| | • `extractJobTitle()` from JD labels (`Role:`, `Job Title:`) or first line |
| | • `resolveJobTitle()` — JD first, then stored title, then `\def\role{}` from LaTeX |
| | • Store: don't wipe `jobTitle` on text-only `setJobDescription` |
| | • On JD blur: re-extract and show "Loaded: Senior Data Analyst" |
| **Acceptance** | Download → `resume_Jane_Smith_Senior_Data_Analyst.pdf` |

### 1.5 Persist `jobTitle` in saved resume structured data

| | |
|---|---|
| **Issue** | History reload lost role; saved as random `Generated Resume - modern #4821`. |
| **Where** | `editor/page.tsx` (auto-save, handleSave), `history/page.tsx`, `saved-resumes/page.tsx` |
| **Fix** | *(Partially implemented locally)* Save `jobTitle` in `structuredData`; restore on load with `setJobDescription(text, jobTitle)`. |
| **Acceptance** | Reloading from history preserves role and correct download filename. |

### 1.6 Wire pre-generation gap analysis (dead API)

| | |
|---|---|
| **Issue** | `/api/resume-generator/analyze-gap` exists but is **never called** from UI. Users generate blind. |
| **Where** | New UI on `resume-generator/page.tsx` before template selection |
| **Fix** | Add "Analyze fit" button (or auto on JD blur): call `analyze-gap`, show missing keywords + match % **before** spending a generation credit. |
| **Acceptance** | User sees "Missing: Python, AWS, SQL" before clicking Generate. |

### 1.7 Template ATS labels & default

| | |
|---|---|
| **Issue** | `modern.tex` uses table-based skills layout. Checker warns but user can still pick it unknowingly. |
| **Where** | `templates/page.tsx`, `templates/latex/*.tex` |
| **Fix** | Tag templates: **ATS-Safe** (`professional`, `executive`) vs **Design** (`creative`, `modern`). Default new users to ATS-Safe. Show warning badge on Design templates. |
| **Acceptance** | Template picker shows ATS rating; international-student default is single-column. |

### Phase 1 checklist

```
- [x] 1.1 latex-to-plain-text + scan uses generated text
- [x] 1.2 setAtsAnalysis on first generate
- [x] 1.3 auto deep-scan after compile
- [x] 1.4 smart filename (push local changes)
- [x] 1.5 jobTitle in structuredData + history reload
- [x] 1.6 gap analysis UI before generate
- [x] 1.7 ATS-Safe template labels + default
```

### Phase 1 files to touch

| File | Changes |
|------|---------|
| `lib/resume/latex-to-plain-text.ts` | **New** — LaTeX → plain text for scanning |
| `lib/resume/extract-job-title.ts` | Done locally |
| `lib/resume/build-resume-filename.ts` | Done locally |
| `store/resume-store.ts` | Done locally |
| `app/dashboard/career/resume-generator/editor/page.tsx` | Scan target, auto-scan, setAtsAnalysis |
| `app/api/resume-generator/scan/route.ts` | Accept `generatedText` field |
| `app/dashboard/career/resume-generator/page.tsx` | Gap analysis UI |
| `app/dashboard/career/resume-generator/templates/page.tsx` | ATS badges |
| `app/dashboard/career/history/page.tsx` | Restore jobTitle |
| `app/dashboard/career/saved-resumes/page.tsx` | Restore jobTitle |

---

## Phase 2 — Auto-improve loop, apply gate & job linkage

**Objective:** Treat resume generation like CI — **generate → test → fix → retest → ready to apply**. Tie every PDF to a job application.

### 2.1 Auto-regenerate when ATS score < 75

| | |
|---|---|
| **Issue** | Single generate; user must manually regenerate with feedback. |
| **Where** | `editor/page.tsx` after deep scan |
| **Fix** | If `score < 75` and `missingKeywords.length > 0`: auto-call `/regenerate` with prompt built from missing keywords + improvements (max **2 retries**, show progress). |
| **Acceptance** | Score improves or user sees "Could not reach 75 — review manually" with specific gaps. |

### 2.2 Download / apply readiness gate

| | |
|---|---|
| **Issue** | User can download a score-40 resume and apply immediately. |
| **Where** | `editor/page.tsx` → `handleDownload` |
| **Fix** | Pre-download modal if `score < 75` or CRITICAL format issues: |
| | • **"Fix automatically"** → trigger regenerate loop |
| | • **"Download anyway"** → secondary action (logged in PostHog) |
| | • **"Ready to apply"** badge when score ≥ 75 and no CRITICAL issues |
| **Acceptance** | Download blocked (soft) until user acknowledges low score or fixes. |

### 2.3 Keyword placement map

| | |
|---|---|
| **Issue** | ATS rewards keywords in **Skills AND Experience**. Scan shows missing list but not placement. |
| **Where** | Extend scan response + `AtsScorePanel.tsx` |
| **Fix** | For each JD keyword, report: `Skills ✓ | Experience ✗ | Summary ✗`. Highlight keywords only in one section. |
| **Acceptance** | Panel shows "Python — Skills only (add to Experience bullet 2)". |

### 2.4 PDF text extraction smoke test

| | |
|---|---|
| **Issue** | LaTeX compiles but PDF text may be garbled (fonts, encoding) — ATS can't parse. |
| **Where** | After `compilePdf` in editor or new `/api/resume-generator/verify-pdf` |
| **Fix** | Extract text from compiled PDF blob client-side (`pdf.js` or send to server). If extracted length < 500 chars or missing candidate name → flag **"ATS parse risk"**. |
| **Acceptance** | Warning shown when PDF text extraction fails quality check. |

### 2.5 Per-job resume versioning (Job Tracker link)

| | |
|---|---|
| **Issue** | No link between Job Tracker application and generated PDF. Random save filenames. |
| **Where** | `structuredData`, job tracker DB, Application Drawer |
| **Fix** | |
| | • Pass `applicationId` query param from Job Tracker → resume flow |
| | • Save: `{ applicationId, company, role, atsScore, latexCode, pdfS3Key, filename }` |
| | • Application Drawer: show "Resume v2 — Score 82 — Download" |
| | • Status: **Draft → Ready → Applied** |
| **Acceptance** | Each job card shows linked resume version and ATS score. |

### 2.6 Use smart filename everywhere (not just download)

| | |
|---|---|
| **Issue** | S3/history still uses `Generated Resume - modern #4821`. |
| **Where** | `autoSaveResume`, `handleSave`, proxy resume save |
| **Fix** | Use `buildResumePdfFilename()` for `filename` field on save. Upload compiled PDF to S3 with same name. |
| **Acceptance** | History list shows `resume_Jane_Smith_Senior_Data_Analyst.pdf`. |

### 2.7 Plain-text export for paste-based applications

| | |
|---|---|
| **Issue** | Some company portals require paste, not PDF upload. |
| **Where** | Editor actions bar |
| **Fix** | "Copy plain text" button using `latex-to-plain-text.ts` output. |
| **Acceptance** | One click copies ATS-friendly plain text to clipboard. |

### 2.8 Pre-flight checklist UI

| | |
|---|---|
| **Issue** | No single "am I ready?" view. |
| **Where** | New component `ApplyReadinessChecklist.tsx` in editor sidebar |
| **Fix** | Checklist items (auto-checked): |
| | • ATS score ≥ 75 |
| | • No CRITICAL format issues |
| | • Target role in summary / `\def\role` |
| | • ≥ 60% bullets with metrics |
| | • Filename includes name + role |
| | • PDF text extraction passed |
| **Acceptance** | Green "Ready to apply" only when all checks pass. |

### Phase 2 checklist

```
- [x] 2.1 auto-regenerate loop (score < 75, max 2 retries)
- [x] 2.2 download / apply readiness gate
- [x] 2.3 keyword placement map in ATS panel
- [x] 2.4 PDF text extraction smoke test
- [x] 2.5 per-job resume versioning + Job Tracker link
- [x] 2.6 smart filename on S3 save + history
- [x] 2.7 plain-text export
- [x] 2.8 pre-flight checklist UI
```

### Phase 2 files to touch

| File | Changes |
|------|---------|
| `editor/page.tsx` | Auto-regen loop, download gate |
| `editor/components/AtsScorePanel.tsx` | Placement map, readiness badge |
| `editor/components/ApplyReadinessChecklist.tsx` | **New** |
| `editor/components/DownloadGateModal.tsx` | **New** |
| `lib/resume/latex-to-plain-text.ts` | Reuse for export + scan |
| `lib/resume/apply-readiness.ts` | **New** — checklist logic |
| `app/api/resume-generator/scan/route.ts` | Keyword placement in response |
| `components/career/job-tracker/ApplicationDrawer.tsx` | Show linked resume + score |
| `app/dashboard/career/job-tracker/actions.ts` | Store resume version on application |

---

## Future phases (backlog — not in Phase 1/2)

These help but are lower priority than closing the generate→test→fix loop.

### Phase 3 — Recruiter & F-1 edge

| Item | Why |
|------|-----|
| Cover letter generator (same JD) | Many apps require both documents |
| F-1 / OPT mode | Work authorization line, visa-safe wording |
| H-1B sponsor hint from sponsor DB | "Company filed 200+ H-1Bs" context in prompt |
| One-click bullet rewrite per keyword | Inject missing skill without full regen |
| PDF embedded metadata (`hypersetup`) | Low ATS impact; minor polish |

### Phase 4 — Analytics & quality

| Item | Why |
|------|-----|
| PostHog: download blocked vs download anyway | Measure gate effectiveness |
| PostHog: score at apply time | Correlate score with interview outcomes |
| A/B: auto-regen vs manual | Tune retry threshold |
| Consolidate duplicate prompts (`lib/prompts/` vs `lib/ai/prompts/`) | Reduce drift |

---

## Known bugs (fix in Phase 1)

| Bug | Root cause | Fix |
|-----|------------|-----|
| Filename missing role | `setJobDescription(text)` cleared `jobTitle` | Store + extract-job-title *(local)* |
| ATS score misleading | Scan uses original resume text | 1.1 |
| Empty ATS panel on load | `setAtsAnalysis` not called after generate | 1.2 |
| Gap API unused | Never wired to UI | 1.6 |
| Upload JD uses filename as title | `setJobDescription(result.text, result.filename)` | `isLikelyFilename()` + extract *(local)* |

---

## What NOT to prioritize

| Item | Reason |
|------|--------|
| PDF embedded metadata | Recruiters/ATS rarely read Properties; filename matters more |
| More design templates | Without ATS scoring per template, hurts more than helps |
| More AI models | Prompt loop broken; fix workflow first |
| Keyword stuffing | Prompts already forbid fabrication; need validation not more generation |

---

## Target user flow (after Phase 1 + 2)

```
Job Tracker: Add "Google — Senior Data Analyst"
    ↓
Resume Generator: JD pre-filled (?company=&role=)
    ↓
Gap Analysis: "Missing 8 keywords — Python, AWS, …"
    ↓
Pick ATS-Safe template (professional)
    ↓
Generate → Compile → Auto-scan GENERATED text
    ↓
Score < 75? → Auto-regenerate (max 2×) with missing keywords
    ↓
Pre-flight checklist: all green
    ↓
Download: resume_Jane_Smith_Senior_Data_Analyst.pdf
    ↓
Save version linked to job application → "Ready to apply"
```

---

## Testing plan

| Test | Phase |
|------|-------|
| Paste JD with `Role: Senior Data Analyst` → filename includes role | 1 |
| Generate → ATS panel shows score without manual scan | 1 |
| Scan missing keyword that exists only in generated LaTeX, not source | 1 |
| Replace entire JD → role updates on blur | 1 |
| Score 62 → download shows gate modal | 2 |
| Auto-regen improves score or exits after 2 retries | 2 |
| Job Tracker card shows linked resume + score | 2 |
| Plain-text copy includes experience bullets | 2 |

---

## Related docs

- `apps/web/lib/ai/prompts/generate.ts` — generation system prompt
- `apps/web/lib/ai/prompts/ats-scan.ts` — deep scan prompt
- `apps/web/lib/validators/ats-checker.ts` — static format checks
- `docs/archive/FULL-AUDIT-REMEDIATION-PHASES.md` — site-wide SEO/security phases
