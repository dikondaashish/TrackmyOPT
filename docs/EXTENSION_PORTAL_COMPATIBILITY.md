# Extension portal compatibility — verification record

Updated 2026-09-22. Local implementation and test evidence, **not** Chrome Web
Store publication or certification of every employer's application flow.

## Implemented in this pass

- Lever is no longer mistaken for Greenhouse because both use `application-form`.
  Location search text alone is not considered a completed city: the portal's
  companion `selectedLocation` field must be populated by a suggestion click.
  Existing user text is preserved; unmatched extension search text is cleared.
- SmartRecruiters OneClick has an application-root adapter. Nested `spl-input`
  labels, enclosing-shadow menu references, `spl-select-option` city options,
  and the explicit `resume-upload` shadow host are handled. The separate Easy
  Apply resume importer is not used for attachment.
- Workday recognizes `myworkdaysite.com`, groups history fields by record rather
  than individual field wrappers, and discovers history/upload-only application
  steps. Known-root discovery skips hidden earlier forms.
- Ashby now has a host-scoped adapter for its application tab panel (including
  upload-only panels). City controls read the question label from their own
  field wrapper, even when the input lacks the label's target ID. A local
  browser fixture verifies delayed menu linking and country/state disambiguation.
- Shared contact filling respects disabled fieldsets and hidden/inert/ARIA-disabled
  ancestors. Native selects skip disabled optgroups and ambiguous duplicate
  stored values. Existing real answers containing “choose”, and selected real
  answers subsequently disabled by a portal, are preserved. Synchronously
  cleared/rejected writes are not counted as filled; later server acceptance is
  not implied. Workday split month/year labels take precedence over date IDs.
- Native history dates preserve source precision. Month fields receive YYYY-MM
  only when both month and year are known; no day is invented. Calendar labels
  beat zero-based month IDs. Native min/max/step, disabled options, readonly fields,
  user values, rejected writes, and React native setters are covered.
- Resume/cover-letter attachment requires an unambiguous document label. There
  is no unlabeled-single-picker fallback. Inactive steps, disabled fieldsets,
  directory pickers, mixed document labels, and existing files are protected.
  The helper verifies the native FileList after input/change events; this does
  **not** verify later server-side processing or acceptance.
- Dropdown references resolve inside the control's enclosing component roots.
  Unlinked menus are limited to a single dropdown's own field. Reused option nodes
  are rechecked when their text/value changes. Hidden/inert component hosts are
  excluded. Ambiguous options remain for user review.

## Evidence by portal

| Portal | Evidence from this pass | Remaining live qualification |
| --- | --- | --- |
| Lever | Public Integrate form inspected in Chrome; synthetic city search only. Input/companion-field structure confirmed. Local engine/browser fixtures passed. | Live suggestions returned no results. Confirm selection with the reloaded extension on a working form; verify generated uploads and employer-specific questions. |
| SmartRecruiters | Public ServiceNow OneClick form inspected in Chrome. Synthetic New York search and selection confirmed option/component structure; test city cleared. Local nested-component and PDF fixtures passed. | Reloaded-extension full flow; slotted phone-country options/default country behavior; record editors; Next/Back validation; employer-specific questions. |
| Workday | Automated record/date/root tests and a Chrome upload-only-step fixture passed. | Authenticated live multi-step application and employer-specific variants were not rerun in this pass. |
| Greenhouse | Existing dropdown/contact/private-answer regression suite passed. | Live release smoke test of the reloaded extension, generated PDF acceptance and navigation. |
| Ashby | Active OpenAI Data Engineer application inspected in Chrome; synthetic city query verified a dynamically linked, portaled suggestion list and field-wrapper label structure. Query cleared. Unit tests cover tab-panel discovery/contact fill; local Chrome tests cover city matching, agreement/availability preservation, and resume-vs-importer selection. | Updated extension end-to-end on the actual site; server-side attachment acceptance; employer variants. Local control fixtures use a form wrapper; host-specific tab-panel discovery is separately unit-tested. |
| Workable, iCIMS, Oracle/Taleo, SuccessFactors, other portals | Conservative generic fallback remains; no new portal-specific qualification claimed. | Capture current markup, add targeted regressions/adapters, then test actual flows. |

No application was submitted, no account was created, and no personal resume or
profile was entered into the public forms during this pass. Live inspection is
distinct from exercising the modified extension on those sites.

## Reproduce

From the repository root:

```sh
pnpm --dir apps/extension test
pnpm --dir apps/extension typecheck
pnpm --dir apps/extension build
node apps/extension/scripts/preview-portal-compatibility.mjs
```

Open the printed loopback URL in Chrome and click **Run compatibility checks**.
The fixture bundles production helpers with synthetic data and blocks outgoing
connections and form submission. It tests 14 browser scenarios: contact/city fill,
wrong-city rejection, ignored clicks, cancellation, preserved edits, nested
SmartRecruiters components, Workday dates/grouping/Undo, attachment safety,
SmartRecruiters resume-host selection, active multi-step discovery, Ashby-shaped
city/attachment controls, disabled/rejected contact fields, and a step transition
that preserves earlier user edits without clicking Next.

Automated results: **523 tests passed**, including 123 new tests in the portal
adapter/history/upload/second-audit suites. Chrome fixture result: **14/14 passed**. Existing
top-level assertion suites also run as part of the unit command.

## Release gates

### Cherry follow-up (2026-09-22)

Live Cherry/Ashby Prefill reproduced a blank Name, missed radio question context,
CSS-collapsed coverage rows, incorrect required counts, and misleading upload copy.
Local fixes recognize Ashby's system-name field, question-level labels and CSS
required markers, and yes/no groups in coverage. Saved private radio answers use
unique visible option labels and a native click; existing selections are preserved.
The scan excludes the resume importer and recognizes existing uploaded file items.
Attachment outcome is carried to the status row rather than inferred from new-fill
counts. Coverage sets its own readable line height and content-sized rows.

The Chrome fixture now passes **15/15** scenarios using synthetic data, including
the Cherry-shaped regression. This is not a retest of the updated installed
extension on the live Cherry application. The existing live application was not
reloaded or cleared. Employment status is not present in the private-answer
contract and remains manual; it is now correctly counted as required. No answer
is inferred from an unemployment clock or fabricated performance metrics.

1. Reload the candidate extension build, then verify manual Prefill, Continuous,
   Guided Autopilot, and Undo separately on real supported applications. Generic
   Prefill does not click Next/Submit; guided navigation remains a separate mode.
2. Use an authorized test account/profile for live writes; explicitly approve
   personal-data uploads before transmitting documents to employers. Never submit
   as part of compatibility testing.
3. Confirm portal-side file acceptance, country/phone-code pairing, validation,
   Back/Next preservation, dependent dropdowns, and SPA step transitions. Closed
   shadow roots, cross-origin restrictions, CAPTCHA, and proprietary date/tag
   editors may still require manual action.
4. Add real-site regression captures for generic-fallback portals before
   advertising dedicated support. More adapters alone are not proof of coverage.
5. Complete the broader release checklist. This pass did not deploy or submit
   a Chrome Web Store release.

Public pages inspected:

- [Integrate application on Lever](https://jobs.lever.co/integrate/041a9433-2b9b-4f0f-84d1-be42f011a504/apply)
- [ServiceNow application on SmartRecruiters](https://jobs.smartrecruiters.com/oneclick-ui/company/ServiceNow/publication/2aeedaa7-5d79-4e1e-8236-5be7be4b4e21?dcr_ci=ServiceNow)
- [OpenAI Data Engineer application on Ashby](https://jobs.ashbyhq.com/openai/fc5bbc77-a30c-4e7a-9acc-8a2e748545b4/application)
