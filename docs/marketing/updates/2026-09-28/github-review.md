# GitHub review for the September 28 email

Repository: [dikondaashish/TrackmyOPT](https://github.com/dikondaashish/TrackmyOPT).

Snapshot: [`449ca9d`](https://github.com/dikondaashish/TrackmyOPT/commit/449ca9dc71988be248480703696e4244e5d66e00). Window: September 15 at 00:00 through September 25 at 00:00, America/New_York, exclusive at the end. This covers ten calendar dates and includes changes through the September 24 snapshot, not future work before Monday.

There are **51 first-parent commits** in the window, all dated September 23–24. One of these is the first draft of this email, so **50 are product, operations, or repository updates**. Feature branch and merge duplicates are not counted twice. This is an activity count, not 50 distinct features. The September 23 squash release includes work implemented earlier but merged during this window. The preceding main commit is September 13 and is outside the window. The complete diff from that predecessor through the snapshot touches **593 product/repository files** after excluding this campaign, including **183 extension files**.

GitHub CI for `c2aa5a0` completed successfully, and GitHub's Production deployment `6650093470` for that SHA reported `success`. At the later `449ca9d` snapshot, CI was still in progress, while the preceding `40e2d0d` CI run had failed. GitHub's Production deployment `6650708046` for `449ca9d` reported `success`. These observations do not establish every authenticated flow or a Chrome Web Store release. No customer claim in the email depends on an unverified deployment outcome.

## What customers will read

| Theme | Verified work | Primary release evidence | Treatment in email |
| --- | --- | --- | --- |
| Chrome extension | First-install tour; stable side panel; job-specific resume restore; explicit profile/private-answer and supported login prefill; review-marked AI screening drafts; Undo last Prefill; portal handling, tracker review, and safer guided navigation | [`adc1ea2`](https://github.com/dikondaashish/TrackmyOPT/commit/adc1ea2), [extension README](../../../../apps/extension/README.md), [saved resumes](../../../EXTENSION_SAVED_JOB_RESUMES.md), [portal verification](../../../EXTENSION_PORTAL_COMPATIBILITY.md) | Lead section. State that code was merged and store rollout is unverified. Never imply automatic job submission or full portal compatibility. |
| OPT Dates and tools | Refreshed summary and compact layout; clearer saved/unsaved states; preserved date patches; STEM date synchronization; employer suggestions, websites, and logos; improved deadline/clock calculations | [`adc1ea2`](https://github.com/dikondaashish/TrackmyOPT/commit/adc1ea2), [`cfa819a`](https://github.com/dikondaashish/TrackmyOPT/commit/cfa819a), [`1ecf653`](https://github.com/dikondaashish/TrackmyOPT/commit/1ecf653), [`c2400a5`](https://github.com/dikondaashish/TrackmyOPT/commit/c2400a5) | Clearer dates and saved-state feedback. No new legal deadline or eligibility claims. |
| Case view and comparisons | Monitoring health, visible milestones, user-confirmed biometrics, four comparison panels, historical/community versus official context, interactive charts and accessible data tables, source quality filtering, corrected premium clock behavior | [`79e3a85`](https://github.com/dikondaashish/TrackmyOPT/commit/79e3a85), [`d196274`](https://github.com/dikondaashish/TrackmyOPT/commit/d196274), [`f1aad73`](https://github.com/dikondaashish/TrackmyOPT/commit/f1aad73), [`a60db3c`](https://github.com/dikondaashish/TrackmyOPT/commit/a60db3c), [`933ec02`](https://github.com/dikondaashish/TrackmyOPT/commit/933ec02) | Understand the case and compare history, without approval predictions. |
| Notices, journey tasks, and reminders | Private document references, confirmed deadlines, calendar exports, completion, saved DSO tasks, opt-in deadline emails and weekly digests, schedule/worker/delivery status | [`07aa119`](https://github.com/dikondaashish/TrackmyOPT/commit/07aa119), [`f0601bf`](https://github.com/dikondaashish/TrackmyOPT/commit/f0601bf), [`22a0702`](https://github.com/dikondaashish/TrackmyOPT/commit/22a0702) | Part of the case section. Email reminders/digests are labeled for paid members and opt-in. |
| Document Vault | Compact layout; mobile improvements; download state and retry; preview recovery; drag/drop and upload completion; clearer expiry editing; reminder drafts; focus and keyboard improvements; action/reset hardening | [`68985f0`](https://github.com/dikondaashish/TrackmyOPT/commit/68985f0), [`1703da4`](https://github.com/dikondaashish/TrackmyOPT/commit/1703da4), [`5f11f16`](https://github.com/dikondaashish/TrackmyOPT/commit/5f11f16), [`440c958`](https://github.com/dikondaashish/TrackmyOPT/commit/440c958) | Easier everyday file actions. Explicitly labeled paid-plan. No security certification claims. |
| Career networking | Work-email lookup from a LinkedIn profile, personal email/LinkedIn drafts, saved application context; corrected role wording; browser-based provider requests and recovery; optional outreach-bundle discovery workflow | [`3132892`](https://github.com/dikondaashish/TrackmyOPT/commit/3132892), [`1088b54`](https://github.com/dikondaashish/TrackmyOPT/commit/1088b54), [`6b567fd`](https://github.com/dikondaashish/TrackmyOPT/commit/6b567fd), [`a53dd9a`](https://github.com/dikondaashish/TrackmyOPT/commit/a53dd9a), [`c2aa5a0`](https://github.com/dikondaashish/TrackmyOPT/commit/c2aa5a0), [`40e2d0d`](https://github.com/dikondaashish/TrackmyOPT/commit/40e2d0d) | New Networking workspace. Bundles explicitly called a pilot; no guaranteed contact/email results or automatic sending. |

## Chrome extension work checked in detail

The first draft reduced this to a note because store publication was unverified. The user asked for **work pushed to GitHub**. The revised customer email therefore leads with the extension while accurately describing its release state.

| Work area | Code and documentation checked | Safe customer meaning |
| --- | --- | --- |
| Onboarding | `apps/extension/src/onboarding.ts`, `tour.ts`, `tour-content.ts`, and [README tour section](../../../../apps/extension/README.md#first-install-product-tour) | A guided first-run tour has been built and packaged for the next extension version. |
| Prefill and review | `content-job-portal.ts`, `private-prefill-request.ts`, `portal-login-prefill.ts`, `smart-answers.ts`, and [privacy release record](../../../compliance/EXTENSION_PRIVACY_RELEASE_REVIEW.md) | Explicit Prefill can use supported saved fields and prepare review-marked screening drafts. It does not submit an application. |
| Undo | `prefill-undo.ts`, `prefill-undo-ui.ts`, `background-prefill-undo.ts`, and [README Undo section](../../../../apps/extension/README.md#undo-last-prefill) | The last Prefill can be rolled back where supported; later user edits are protected, and unsupported uploads/custom controls need review. |
| Job-specific resume | `background-resume-artifact.ts`, `saved-job-resume.ts`, and [saved resume record](../../../EXTENSION_SAVED_JOB_RESUMES.md) | A tailored resume can be restored for the matching job. Account storage is bounded to 30 days and 50 recent jobs. |
| Portal handling | `ats-prefill-adapters.ts`, `smart-dropdown.ts`, `easy-apply-attachments.ts`, `guided-autopilot.ts`, and [portal verification](../../../EXTENSION_PORTAL_COMPATIBILITY.md) | Several portal controls were made more conservative and reliable; coverage is not universal. |
| Sidebar and tracker | `content-job-portal.ts`, `job-portal-sidebar-shell.ts`, `job-tracker-review.ts`, and [extension README](../../../../apps/extension/README.md) | The sidebar better survives same-job navigation and job saves ask for review. |
| OPT/STEM in the extension | `apps/extension/src/pages/` and [STEM sync handoff](../../../STEM_DATE_SYNC_RELEASE.md) | Date loading/saving and tool behavior were improved. Installed-version verification is still needed. |

## Work reviewed but not promoted as a broadly available new feature

- **Chrome Web Store publication:** still unverified. The email covers concrete extension code shipped to GitHub while clearly saying that an installed extension may not have these features yet. The [draft store listing](../../../../apps/extension/store-assets/LISTING-0.2.0.md) and [privacy release record](../../../compliance/EXTENSION_PRIVACY_RELEASE_REVIEW.md) both retain publication checks. Job-description recovery is documented [here](../../../EXTENSION_JOB_DESCRIPTION_RECOVERY.md).
- **OpenAI contact-discovery provider:** a controlled provider comparison and optional provider path, not a universal production switch. The [pilot report](../../../networking-discovery-pilot-2026-09-24.md) explicitly keeps the default provider and bundle opt-in behavior. No contact names, sample email addresses, provider cost estimates, or pilot success rates belong in this customer email.
- **Job ingestion and deployment:** Oracle ingestion supervision/recovery in `5c04c0d`, followed by pinned archive download retries and dependency caching in `449ca9d`. Operational reliability work, not evidence of a particular number of fresh jobs.
- **Infrastructure and maintenance:** browser checks on pushes/PRs, dead-code cleanup, project setup documentation, delivery preferences, tests, worker reliability, and source freshness checks. Valuable work, but omitted from the customer highlights to keep the email readable.
- **Marketing/pricing presentation:** simpler signup/free-tool copy and plan-aware Pro prompts. These are not new free entitlements or evidence for invented growth statistics.
- **September 13 OPT application services research guide:** outside the requested window, so excluded.

Implementation evidence also includes [OPT tools audit](../../../opt-tools-ui-logic-audit-2026-09-23.md), [case delivery verification](../../../CASE_STATUS_DELIVERY.md), and [Document Vault audit](../../../audits/document-vault-2026-09-24.md). Earlier audit limitations are not silently treated as later verified outcomes. In particular, recorded synthetic reminder receipt does not establish delivery to every production user.

## Complete first-parent commit inventory

The inventory below is generated from the pinned snapshot, so later main commits cannot silently enter this draft.

| Commit | Date | Work |
| --- | --- | --- |
| [`449ca9d`](https://github.com/dikondaashish/TrackmyOPT/commit/449ca9d) | 2026-09-24 | fix(deploy): retry pinned ATS archive downloads and cache dependencies |
| [`40e2d0d`](https://github.com/dikondaashish/TrackmyOPT/commit/40e2d0d) | 2026-09-24 | fix(networking): recover bundle email lookups in browser |
| [`5354414`](https://github.com/dikondaashish/TrackmyOPT/commit/5354414) | 2026-09-24 | docs(marketing): draft September 28 product update email |
| [`c2aa5a0`](https://github.com/dikondaashish/TrackmyOPT/commit/c2aa5a0) | 2026-09-24 | feat(networking): add outreach bundles and OpenAI discovery pilot |
| [`440c958`](https://github.com/dikondaashish/TrackmyOPT/commit/440c958) | 2026-09-24 | fix(documents): refine vault layout and harden document actions |
| [`a53dd9a`](https://github.com/dikondaashish/TrackmyOPT/commit/a53dd9a) | 2026-09-24 | fix(career): route ApplyBolt lookups through browser |
| [`6b567fd`](https://github.com/dikondaashish/TrackmyOPT/commit/6b567fd) | 2026-09-24 | fix(career): avoid implying candidate holds target role |
| [`1088b54`](https://github.com/dikondaashish/TrackmyOPT/commit/1088b54) | 2026-09-24 | feat(career): add networking outreach workspace |
| [`5f11f16`](https://github.com/dikondaashish/TrackmyOPT/commit/5f11f16) | 2026-09-24 | style(documents): reduce vault header height |
| [`3132892`](https://github.com/dikondaashish/TrackmyOPT/commit/3132892) | 2026-09-24 | feat(career): add work email finder via ApplyBolt |
| [`1703da4`](https://github.com/dikondaashish/TrackmyOPT/commit/1703da4) | 2026-09-24 | fix(documents): move vault security details below document list |
| [`68985f0`](https://github.com/dikondaashish/TrackmyOPT/commit/68985f0) | 2026-09-24 | fix(documents): audit vault UX and reset handling |
| [`5104695`](https://github.com/dikondaashish/TrackmyOPT/commit/5104695) | 2026-09-24 | fix(case-status): keep partner names out of browser evidence |
| [`933ec02`](https://github.com/dikondaashish/TrackmyOPT/commit/933ec02) | 2026-09-24 | fix(case-status): exclude superseded partner reports |
| [`b191430`](https://github.com/dikondaashish/TrackmyOPT/commit/b191430) | 2026-09-24 | fix(case-status): use neutral community source labels |
| [`f84b6f3`](https://github.com/dikondaashish/TrackmyOPT/commit/f84b6f3) | 2026-09-24 | fix(case-status): simplify status and chart wording |
| [`58324db`](https://github.com/dikondaashish/TrackmyOPT/commit/58324db) | 2026-09-24 | fix(case-status): show footer disclaimer only once |
| [`a60db3c`](https://github.com/dikondaashish/TrackmyOPT/commit/a60db3c) | 2026-09-24 | feat(case-status): add interactive donut and accessible analytics tables |
| [`30c1294`](https://github.com/dikondaashish/TrackmyOPT/commit/30c1294) | 2026-09-24 | feat(case-status): simplify monitoring and journey visual summaries |
| [`4da9a4f`](https://github.com/dikondaashish/TrackmyOPT/commit/4da9a4f) | 2026-09-24 | refactor(case-status): trim repeat forecast caveat |
| [`1e2c6e5`](https://github.com/dikondaashish/TrackmyOPT/commit/1e2c6e5) | 2026-09-24 | fix(case-status): restore visual weight of wait metric |
| [`5ec82cb`](https://github.com/dikondaashish/TrackmyOPT/commit/5ec82cb) | 2026-09-24 | test(opt): await saved STEM dates before asserting |
| [`cc32e4a`](https://github.com/dikondaashish/TrackmyOPT/commit/cc32e4a) | 2026-09-24 | feat(case-status): make comparisons visual and concise |
| [`5ceb2e5`](https://github.com/dikondaashish/TrackmyOPT/commit/5ceb2e5) | 2026-09-24 | Use simple signup and free-tool usage copy |
| [`927b66b`](https://github.com/dikondaashish/TrackmyOPT/commit/927b66b) | 2026-09-24 | Update registered-user and free-tool traffic claims |
| [`d196274`](https://github.com/dikondaashish/TrackmyOPT/commit/d196274) | 2026-09-24 | feat(case-status): show validated broad I-765 decision trends |
| [`f1aad73`](https://github.com/dikondaashish/TrackmyOPT/commit/f1aad73) | 2026-09-24 | Add user-confirmed biometrics attendance to case milestones |
| [`0246dda`](https://github.com/dikondaashish/TrackmyOPT/commit/0246dda) | 2026-09-24 | feat(opt-tools): add plan-aware Pro offers for free and guest users |
| [`e9646d1`](https://github.com/dikondaashish/TrackmyOPT/commit/e9646d1) | 2026-09-24 | fix(case-status): keep milestones open and recognize completed biometrics |
| [`5e0bd88`](https://github.com/dikondaashish/TrackmyOPT/commit/5e0bd88) | 2026-09-24 | fix(opt-tools): show verified USCIS time when community data is limited |
| [`22a0702`](https://github.com/dikondaashish/TrackmyOPT/commit/22a0702) | 2026-09-24 | docs(case-status): record scheduled worker and inbox verification |
| [`f0601bf`](https://github.com/dikondaashish/TrackmyOPT/commit/f0601bf) | 2026-09-23 | Complete case scheduling, journey reminders, digests and official comparisons |
| [`07aa119`](https://github.com/dikondaashish/TrackmyOPT/commit/07aa119) | 2026-09-23 | Connect case insights, private notices, and deadline reminders |
| [`7d06dbb`](https://github.com/dikondaashish/TrackmyOPT/commit/7d06dbb) | 2026-09-23 | Show all case analytics panels together |
| [`27e55f6`](https://github.com/dikondaashish/TrackmyOPT/commit/27e55f6) | 2026-09-23 | Show case analytics tabs in a two by two grid |
| [`2f5309e`](https://github.com/dikondaashish/TrackmyOPT/commit/2f5309e) | 2026-09-23 | Keep case comparison details expanded |
| [`918518d`](https://github.com/dikondaashish/TrackmyOPT/commit/918518d) | 2026-09-23 | Refine case status hierarchy and expandable comparisons |
| [`79e3a85`](https://github.com/dikondaashish/TrackmyOPT/commit/79e3a85) | 2026-09-23 | Fix case status monitoring, premium clocks, and comparison accuracy |
| [`1ecf653`](https://github.com/dikondaashish/TrackmyOPT/commit/1ecf653) | 2026-09-23 | Refine OPT tools UX and validate filing, clock, and approval estimates |
| [`cc0043a`](https://github.com/dikondaashish/TrackmyOPT/commit/cc0043a) | 2026-09-23 | Compact OPT Dates header and status cards |
| [`a68f550`](https://github.com/dikondaashish/TrackmyOPT/commit/a68f550) | 2026-09-23 | ci: run browser checks on pushes and pull requests |
| [`c2400a5`](https://github.com/dikondaashish/TrackmyOPT/commit/c2400a5) | 2026-09-23 | Persist employer websites and show logos in employment history |
| [`cb5f15f`](https://github.com/dikondaashish/TrackmyOPT/commit/cb5f15f) | 2026-09-23 | chore: audit and remove dead code |
| [`875d59a`](https://github.com/dikondaashish/TrackmyOPT/commit/875d59a) | 2026-09-23 | Record default workflow to publish completed changes to main |
| [`225a120`](https://github.com/dikondaashish/TrackmyOPT/commit/225a120) | 2026-09-23 | Refresh project README and verify setup guidance |
| [`e62bb0e`](https://github.com/dikondaashish/TrackmyOPT/commit/e62bb0e) | 2026-09-23 | Refine OPT Dates summary colors and readability |
| [`53adbe1`](https://github.com/dikondaashish/TrackmyOPT/commit/53adbe1) | 2026-09-23 | Fix scheme-bearing employer logo domains (#51) |
| [`e97c400`](https://github.com/dikondaashish/TrackmyOPT/commit/e97c400) | 2026-09-23 | Add company logos to employer suggestions (#50) |
| [`cfa819a`](https://github.com/dikondaashish/TrackmyOPT/commit/cfa819a) | 2026-09-23 | Elevate the OPT Dates dashboard UI (#49) |
| [`5c04c0d`](https://github.com/dikondaashish/TrackmyOPT/commit/5c04c0d) | 2026-09-23 | Fix Oracle ingestion supervision on current release (#48) |
| [`adc1ea2`](https://github.com/dikondaashish/TrackmyOPT/commit/adc1ea2) | 2026-09-23 | Release extension improvements, OPT date fixes, and employer autocomplete (#47) |
