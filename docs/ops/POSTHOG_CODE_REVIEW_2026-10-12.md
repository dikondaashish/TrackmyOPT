# TrackMyOPT PostHog code review — 2026-10-12

Reviewed the all-status, one-year view in PostHog project 369087 against GitHub
main `a2d7a2acd62cee862e8737b8be3e6f3f8c940303`. Both pages of the issue query
returned 81 groups. Inspected the latest exception and available stack sample (up to 50 frames)
for every group, including vendor frames. Also inspected all 17 historical events in
the newest React #418 group. No issue status, suppression, billing, project,
Vercel, or Render settings were changed in this review.

A resolved/suppressed label and an old bundle are not evidence of a root-cause
fix. The table below retains every issue ID and separates source repairs from
historical attribution limits. No person/session identifiers, response bodies,
applicant data, or replay content are included.

## Source changes and verification

- **AdSense units:** reserve each actual `ins` element synchronously before
  pushing its request. Repeated SDK-ready/resize callbacks cannot queue that
  element again while Google's status attribute is pending. Check both the
  current container and actual slot width (at least 250px); observe both for
  resize and retry readiness when initially hidden/narrow. Unexpected synchronous
  initialization failures use a fixed diagnostic. Consent still gates loading.
  Tests reproduced three failures before the fix: duplicate requests, a 139px
  slot in a wide container, and failure to initialize after becoming visible.
- **Activation tracker:** retain the existing single-flight/abort protection;
  validate successful case responses and report unexpected request/authentication
  and malformed-response failures with a fixed Sentry-captured console message.
  Do not consume the account marker after failure. Offline, teardown, and expected
  authentication outcomes remain separate. Tests cover recovery/retry, malformed
  payloads, consent withdrawal, aborted requests, and account-scoped capture.
- **Template PDF cleanup:** use the installed PDF.js 6 loading-task destroy API
  (the document proxy no longer exposes `destroy`) and consume rejected document-destroy promises on close,
  replacement, and pending loads. Expected PDF render cancellation
  stays quiet; unexpected cleanup/render/load failures use fixed diagnostics
  without PDF text. Mocked cleanup rejection tests detected the unchecked
  old destroy path; a loading-task test reproduced pending loads not being
  destroyed on close. The installed SDK requires the loading-task API. The selectable editor already consumes its
  paint and document-cleanup cancellations; its regression tests were retained.
- **Unavailable storage:** consent/login/referral already use safe storage.
  Dashboard sidebar bootstrap and toggle still touched `localStorage` directly;
  route both through the same tested safe storage helpers so null/locked storage
  does not crash the shell.
- **React DOM diagnostics:** remove the blanket removeChild/insertBefore message
  filter. These historical events have React bundle frames and no evidence
  proving an extension caused them. Keep future exceptions and boundary reports
  visible instead of treating suppression as a fix. Four reporting regressions
  failed before this change and pass afterward. This restores observability;
  it does not establish the historical DOM mutation's cause.

Existing source mitigations verified: the clock hook's deterministic first
render and browser-date hydration tests, pure login countdown/OTP state updates,
explicit resume feature OpenGraph type, safe consent storage, JSON-LD context
serialization, and the exact Brave/iOS wallet-injection filter. No broad
RangeError, hydration, generic network, or unknown-rejection suppression added.

## Remaining evidence limits

The 12 Safari/iOS recursion groups have either no stack or page-URL-only frames,
sometimes repeating minified pairs such as `Ok`/`Qk` at page line 226. There is no
mapped first-party function or captured source context to attribute this to a
reachable application function. Page URLs also occur on `/dashboard`; their
presence alone does not establish that blog code caused the failures. Eight
other opaque/anonymous exceptions and the generic Safari `Load failed` lack
sufficient source evidence. Leave these unverified and observable.

The newest #418 group includes dashboard/jobs/job-tracker, blog, OPT dates,
pricing, and six clock events. The clock cause is reproduced and fixed, but that
fix does not explain the older non-clock events. Other #418 groups show React
internals or retired chunks only. The dashboard's initial sidebar state, promo
banner's first render, and pricing render are deterministic in inspected code.
Current tests/build cannot prove all historical hydration causes fixed.

The eight JSON-LD reader errors point to short page/global scripts and a
`@context.toLowerCase` reader absent from this repository. The serializer now
emits a string root context; an external reader is an inference, not proven
ownership. Likewise an opaque cross-origin Script error has no recoverable
root cause. Existing browser bridge/extension signatures and AdSense vendor
network failures are external classifications, not repaired third-party code.

Production source-map upload is already implemented and gated on production
release configuration. Missing historical maps cannot be reconstructed by a new
build. See [PostHog stack traces](https://posthog.com/docs/error-tracking/stack-traces)
and [troubleshooting](https://posthog.com/docs/error-tracking/troubleshooting).
Deployments and post-release recurrence verification are left to the owner as
requested. Sentry sampling, privacy filters, plan, and alerts are unchanged.

## Local validation

- Full web unit suite: 307 files / 2,084 tests passed before the final three
  resize/diagnostic/pending-load tests were added. Final focused checks: nine
  files / 84 tests passed, including Sentry privacy and storage/consent tests.
- Monorepo type checks and subsequent web type check passed; production build
  passed, including TypeScript and 421 generated pages.
- Full lint passed with existing warnings; changed paths have one existing
  dashboard effect warning and zero errors. React Doctor: 90/100, no issues in
  changed files.
- Playwright: all 26 tests passed. The initial run could not launch because the
  required Chromium runtime was missing; installing it resolved that prerequisite.
- Delivery requires the protected GitHub CI and Playwright jobs to pass. Their
  final results are recorded on the pull request; no hosting checks are included.

## Complete issue inventory

Counts are issue groups, not unique root causes. IDs map directly to the original
PostHog view. “Mitigation” does not mean every historical occurrence is explained.

| Family | Groups | Code disposition |
| --- | ---: | --- |
| Brave wallet injection | 1 | Existing exact external signature filter; no wallet integration |
| React hydration | 16 | Clock mitigation verified; other historical causes unverified |
| ResizeObserver notifications | 2 | Existing browser notification filter; no source attribution |
| AdSense slot sizing/duplicates | 6 | Actual-slot sizing and synchronous queue reservation repaired |
| Safari recursion | 12 | Unverified; preserve reporting |
| Unattributed network failure | 1 | Unverified; no generic network filter |
| Unattributed exception | 8 | Unverified; preserve reporting |
| PDF cancellation | 1 | Reachable cleanup rejection repaired; historical stack absent |
| Activation request | 1 | Existing rejection handling retained; diagnostics/retry repaired |
| OpenGraph probe | 1 | Existing metadata mitigation verified |
| Native browser bridge | 1 | Existing external signature classification |
| AdSense network failure | 1 | Vendor stack verified; existing external classification |
| React DOM mutation | 13 | Blanket filter removed; historical cause unverified |
| Opaque cross-origin error | 1 | Existing opaque error classification; root cause unavailable |
| JSON-LD reader | 8 | Existing serializer mitigation verified; ownership unverified |
| Login state updates | 1 | Existing pure state updaters verified |
| Navigation cancellation | 1 | Expected context teardown classification |
| Extension global | 1 | External content-script signature |
| Injected host bridge | 4 | Existing external bridge signature |
| Unavailable local storage | 1 | Existing helper verified; dashboard consumers repaired |

### Brave wallet injection

- `01a12b1a-668b-77b0-b727-0679837fcfff`

### React hydration

- `01a04fc1-3d4d-7522-adc4-a28192fa28d3`
- `019f3de7-4875-7a30-b9bf-9c78c3201372`
- `019e8b40-e2bd-7b40-993f-872e1a8abbe1`
- `019e74bc-184f-7f93-b069-c4d9e7334a39`
- `019ecbf3-88c7-7880-96ae-fb55c495a60c`
- `019ec89c-7b0c-7801-83ed-63b7b1baa75e`
- `019ec35f-f034-77a3-872a-acb4290d247e`
- `019e6a67-e817-7b60-9a0f-d5ad38f00257`
- `019e67fd-df7d-72d1-a8b9-ac295b70045a`
- `019e9020-e633-78e0-8119-ebf214c8f328`
- `019e71dd-7579-7c01-81fa-5d9dfbf2752f`
- `019e7061-aa4d-7fa3-a035-b89119acc0c5`
- `019e738d-4fcd-7a53-bb40-baff219ad68a`
- `019ea8dd-4893-72c1-bddc-d93d4864b388`
- `019e71dd-7579-7c01-81fa-5db64023c12f`
- `019e71dd-7579-7c01-81fa-5daf988145e1`

### ResizeObserver notifications

- `01a05491-6ef7-7fe3-93f3-3da293b2d085`
- `01a09dfc-7016-7ce2-ae12-b7f52f7317e8`

### AdSense slot sizing/duplicates

- `01a0edd1-36d8-79e1-883c-e0725d60a6a2`
- `01a0d442-8d8e-7450-a9e0-38aa8815997d`
- `01a08edb-9e26-7c81-8e83-e9c74e1583f2`
- `01a07d33-7479-7553-a26e-4fff16247bb5`
- `01a07c3b-2930-7db2-bedf-069f8c8c3671`
- `01a04a63-661b-72f0-882e-525a99207282`

### Safari recursion

- `01a07e99-9de0-7c00-875a-398189225f4c`
- `01a0a63a-8e9c-7c43-8f40-81b71a4b9fc9`
- `01a0a63a-8e9d-7df0-81a7-42763179c95c`
- `01a0a63a-8e9c-7c43-8f40-81c8038c9da2`
- `01a0992f-d20b-79a1-bf5a-d46cbe985e27`
- `019eaa01-fd72-7c52-8702-0705a0cfc8aa`
- `01a0adc9-8a0f-72f1-9876-99c629cc0c68`
- `01a05b10-8486-76b0-a3a3-49a12f03cde1`
- `01a05b10-8487-7e61-ae63-0aff8af4e60c`
- `01a08703-c252-7651-9209-539c4c6c9270`
- `01a08703-c253-71b1-908e-61dfabde5f78`
- `01a05b10-8487-7e61-ae63-0ae6143df765`

### Unattributed network failure

- `019f3850-c735-7123-9fdf-3f42fd5b5a15`

### Unattributed exception

- `01a0b6bb-a0c1-7552-bf81-0d19289ad7ad`
- `01a0b6be-2c3b-7a61-bcfe-824a9862b666`
- `01a0b6bb-2cb7-7e91-b793-a4a8b63f6e8f`
- `01a0b6bb-2cb7-7e91-b793-a4b54a618b50`
- `01a0637f-427a-7bd0-8df6-16d5bff25c01`
- `01a0345a-502a-7df2-974a-ad43bf64c598`
- `019eaa01-d718-70f0-9ec2-894a1ac9cf4e`
- `019eaa01-d719-7bd0-9f16-1ad888a8d265`

### PDF cancellation

- `01a03eb5-bfc8-78e3-9654-0f98da595b37`

### Activation request

- `019fa331-55e4-7652-bbe3-4eb9ec60d4a9`

### OpenGraph probe

- `019fa51b-b43e-7761-91d6-cce59ee12955`

### Native browser bridge

- `019f89fe-fa96-73d2-98b6-5bc6386819d2`

### AdSense network failure

- `019e7f10-5cdb-7d93-a734-059f54a2dda0`

### React DOM mutation

- `019e67b9-5206-7170-abff-79544d034bf0`
- `019e67b8-f6a7-7d40-8925-254575503916`
- `019ec8a0-0d02-7a00-ade9-d537457d9704`
- `019ed3ef-12ad-71a2-b5ed-9a4ec2b9c37d`
- `019e6aff-8ccb-7e43-a619-6d2e9b26ba62`
- `019ea964-d0d2-7ef3-8de7-1b49f7ac5b91`
- `019e7e4d-ecad-7031-80fa-29c7fb33bc3f`
- `019e7986-94ed-7ae2-9ed6-4040aa7f6012`
- `019e7986-94ed-7ae2-9ed6-40330c70646a`
- `019e7986-94ed-7ae2-9ed6-402eb3a15a23`
- `019e7986-94ed-7ae2-9ed6-400caa7b9742`
- `019e7986-94ed-7ae2-9ed6-4011d016fed2`
- `019e7986-94ed-7ae2-9ed6-3ff1f0701a83`

### Opaque cross-origin error

- `019e8041-0160-74f0-a095-6440adf0ec60`

### JSON-LD reader

- `019eae4e-f21d-7280-ad02-787bd759b35c`
- `019e6aae-e8ab-7ba1-88f1-078183b7a872`
- `019ebcd2-83b9-72d1-9452-2b8d0cf08fda`
- `019e7073-682e-77e3-a8dd-c7c255fa34ef`
- `019eb84d-4991-7361-ac87-76537a9b5ca0`
- `019e8041-32ab-7011-a153-c4f5e7c43801`
- `019e9655-ce9c-7e92-9779-c25fb35a8e87`
- `019e849a-5dda-7400-bcd3-be726984e919`

### Login state updates

- `019eacb8-b2b1-72f1-ab50-c8320498c696`

### Navigation cancellation

- `019e9102-96b8-7853-8915-1fe87640a090`

### Extension global

- `019e891e-9ff3-7c03-86a0-0328275318f3`

### Injected host bridge

- `019e8511-2f91-7083-b1fa-4994bf0d3ac8`
- `019e8511-2f8e-77a1-8cf5-541c4a2ffef6`
- `019e8511-2f8e-77a1-8cf5-54266b5b7f6a`
- `019e7422-fd82-7140-bd6a-0e9810329f16`

### Unavailable local storage

- `019e7cba-93cb-7d22-b6d5-57114da913e3`
