# STEM date synchronization — release handoff

Updated: 2026-09-22

## Status

Implementation and local verification are complete. The additive database migration is applied to the main TrackmyOPT Supabase project (`deknauqkqqzwuvopqott`). Website/backend and Chrome extension publication, authenticated production smoke testing, and real email delivery verification remain pending. No live reminder emails were sent during testing.

The working tree includes substantial unrelated, unpublished changes. Do not deploy or publish the entire working tree as a STEM-only release without reviewing its contents.

## Behavior

- `opt_status.stem_dso_recommendation_date` is separate from the initial OPT recommendation date. No existing dates were backfilled or changed by the migration.
- `/api/opt/calculator` accepts explicit date patches, validates real calendar dates, and supports `null` to clear a date. Omitted fields are preserved and ownership comes from authenticated identity.
- The extension reloads current server dates when reopening the STEM countdown. Failed loads block saves; late responses cannot overwrite in-progress edits. Bearer authentication does not fall back to a different cookie identity.
- The dashboard STEM tool, OPT Dates form, date selector, upcoming-deadline panel, and data exports include the new field.
- Dashboard calculations and reminder emails use the earlier of EAD expiration and recommendation date plus 60 days. Missing recommendations are explicitly EAD-only estimates. Passed recommendation deadlines are not presented as remaining filing time.
- Enrollment, daily reminders, and STEM window emails include the saved recommendation. Window-email retries rebuild from current dates and check the current recipient. Stale daily reminders are not replayed; suppressed retries are marked failed and fresh daily calculations occur through the daily cron.

## Database

Applied migration: `supabase/migrations/20260922140251_add_stem_dso_recommendation_date.sql`.

Verified the nullable DATE column and existing ownership RLS. A rolled-back temporary-table check verified preservation of original OPT/EAD dates and the earlier recommendation deadline. No real user date records were modified for testing.

## Verification

- Extension suite: 381 tests passed.
- Focused web/API/email plus immigration regression suite: 86 tests passed across 6 files.
- Extension browser suite: 32 tool flows across four timezones and two themes, including STEM save/edit/clear roundtrips.
- Web Chromium checks: desktop (1440px) and mobile (390px), light and dark themes; load/edit/discard/save/clear/reload, failed saves, date-selector synchronization, preservation of other dates, no horizontal overflow, and no browser runtime errors.
- Web and extension TypeScript checks passed. Extension build and local web production build passed.
- Scoped whitespace and lint checks found no new blocking errors. React Doctor reported 49/100 across the broader dirty branch; this is not a clean whole-product audit. Existing architectural/complexity findings remain outside this scoped release.

Browser fixtures use the real UI with synthetic API storage. API/email tests mock database and SMTP dependencies. These checks do not establish live authentication, scheduled execution, inbox delivery, or installed-extension behavior.

## Release order and remaining acceptance checks

1. Review the release contents and deploy the web/backend changes first. The database migration is already applied. A new extension encountering an older API without the field deliberately fails closed.
2. With an authorized test account, save a STEM date in the portal, reopen the loaded extension, then change and clear the date from the extension. Confirm both surfaces match and the initial OPT date remains unchanged.
3. Verify the authenticated calendar response, dashboard deadline card, and exports for that account. Exercise a failed request and a reload.
4. Send a controlled reminder to an approved test inbox. Verify the displayed DSO date/effective deadline, missing-date estimate, recipient selection, and delivery. Check scheduler configuration and queue outcomes; do not trigger bulk production reminders as a smoke test.
5. Rebuild and publish the reviewed extension package only after the production backend checks pass. Confirm installed-extension auth, reopening/restart, and service-worker behavior.

There is no instant cross-tab push subscription: reopening/reloading the relevant tool fetches the latest saved dates. An already-open form can retain its current inputs until refreshed.
