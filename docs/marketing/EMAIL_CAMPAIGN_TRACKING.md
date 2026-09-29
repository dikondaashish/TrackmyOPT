# Product email tracking

The SMTP bulk sender can now record campaign opens and separate CTA clicks. It does not send or schedule a campaign by itself. Existing emails without campaign metadata continue through the original flow; this cannot recover their historical opens or clicks.

## Viewing results

Open `/admin/login` and sign in with an approved account's TrackMyOPT email and password. Access is granted only by the server-assigned `app_metadata.email_campaign_admin` permission on a verified, non-anonymous Supabase account. Both the dashboard and report API validate the current user on the server; ordinary signed-in users cannot read reports. Passwords are used only for sign-in and are not saved by the dashboard. Reporting no longer requires entering `ADMIN_SECRET`.

The dashboard lists registered campaigns, loads the newest campaign initially, and shows separate Pro and Free click counts. Use **Refresh results** to fetch the latest aggregate counts. Failed refreshes clear the previous report; an expired session returns to admin sign-in. Reports contain no recipient email addresses or user IDs. Sign out ends this browser's session.

For the September 29 all-Free campaign, the campaign ID is **`product_update_2026_09_29`**. It is registered and appears in the dashboard. Before any tracked campaign is registered, the dashboard shows an empty state rather than fabricated metrics.

### Granting admin access

Run the trusted operator script with server Supabase environment variables loaded. For an existing account:

```sh
pnpm --filter web exec tsx scripts/email-campaign-admin.ts --email owner@example.com
```

For an email that does not yet have an account, supply an absolute output path outside this Git repository:

```sh
pnpm --filter web exec tsx scripts/email-campaign-admin.ts --email owner@example.com --setup-file /private/operator/email-admin-setup.txt
```

The script checks account suppression, grants only the selected account, and verifies the grant. It preserves existing app metadata. The new-account option generates an invitation without sending email and saves one-time password setup instructions in a private file with mode `0600`; never commit, share publicly, or paste its token into logs. The setup route verifies the invitation, establishes a session, and opens the existing password creation form. The account must complete verification before it can read reports. If the link expires, use normal account recovery. For an existing account, use its current password or the existing password recovery flow.

To revoke access, remove or set `email_campaign_admin` to `false` in the account's **app metadata** through a trusted server-side Supabase admin operation. Do not place this permission in editable user metadata. Subsequent dashboard and API requests recheck the current grant.

| Metric | Meaning |
| --- | --- |
| SMTP accepted | The mail server accepted the recipient. This does not confirm delivery to the inbox. |
| Observed opens | Unique recipient messages whose tracking image was requested, excluding detected automation. Privacy proxies can inflate this, and blocked images or plain-text reading can hide opens. |
| Filtered Pro options clickers | Unique recipient messages requesting `pro_intro`, after excluding messages that requested different campaign links within five seconds. This is an estimate of interest in Pro, not verified human visits, offer eligibility, or checkout completion. |
| Filtered Free link clickers | Unique recipient messages requesting `free_dashboard` after the same rapid multi-link filter. |
| Raw recorded clickers | Unique recipient messages requesting at least one configured link before the rapid multi-link filter. A person clicking both links appears once here and once in each raw link count. |
| Rapid multi-link clickers | Messages that requested different tracked links within five seconds. These often reflect email security scanning, but a fast real reader can also match this pattern. The dashboard separates them rather than silently calling every raw click human. |
| Detected automated events | Distinct message/event/link combinations flagged by known scanner user agents or prefetch headers. Repeated requests are deduplicated. Unknown scanners can still affect the main counts. |
| Send outcomes needing review | Reserved messages with incomplete or ambiguous SMTP outcomes. Do not blindly resend them. |

Counts identify the original recipient message, not necessarily the individual reader. Forwarded messages retain the original links. An observed event can also come from an ambiguous SMTP send, so event counts and SMTP acceptance counts measure different things. The five-second filter reduces obvious rapid multi-link activity but cannot identify every scanner or prove a human visited. Opens and filtered clicks remain estimates, not proof that someone read the email or bought a plan.

## Configuration and sending integration

Apply `supabase/migrations/20260929155655_email_campaign_tracking.sql` before using tracking. Its version matches the migration already applied to the TrackMyOPT database. The new tables have RLS enabled and deny anonymous/authenticated client access; only the server service-role client can write events or read the reporting functions.

Tracking uses `EMAIL_LINK_SIGNING_SECRET`, falling back to the existing `ADMIN_SECRET`. Set a dedicated long random signing secret through the hosting environment if desired. Do not rotate the active signing secret while campaign links should keep working. Tokens expire after 90 days; expired clicks fall back to the TrackMyOPT homepage.

Use authenticated `POST /api/admin/bulk-notification` with `type: "service_announcement"`, `subject`, rendered `htmlContent`, `plainTextContent`, the **`campaign`** object, and explicit **`recipientUserIds`** (1–100 account UUIDs per request). The endpoint rejects missing or invalid recipient scope and requires selected accounts to remain Free with an unused intro before an actual send. The offline candidate exporter uses verified accounts with no sign-in in 14 days, after opt-out and blocked-address checks. `dryRun` defaults to **true**: it reads only the selected profiles, marketing opt-outs and suppressions, returns counts, and does not register or send anything. Only `dryRun: false` sends. Non-campaign legacy notifications keep their existing behavior.

For the current all-Free send, use [the preparation guide](updates/2026-09-28/README.md) and `scripts/send-product-update-all-free.ts`. A read-only production preflight selected 3,031 verified non-premium users after excluding two hard bounces, including 703 Auth accounts without a profile or payment history. The script reads confirmed addresses from Supabase Auth because most Free profiles have no copied email. It rechecks Free or profileless status, payment history, opt-outs, and blocks while sending, and uses **Karthik from TrackMyOPT** with the configured `SMTP_FROM_EMAIL` or explicit `CAMPAIGN_FROM_EMAIL` mailbox and Reply-To **support@trackmyopt.com**. The older `prepare-product-update.ts` helper remains for narrow, explicitly selected campaigns.

The owner-authorized September 29 run attempted all 3,031 selected accounts. The initial sender logged 3,028 SMTP acceptances, zero definitive failures, and three uncertain outcomes. ZeptoMail recipient logs showed no product update for those three, and a one-time reviewed retry using [retry-reviewed-campaign-unknown.ts](../../apps/web/scripts/retry-reviewed-campaign-unknown.ts) was SMTP accepted for all three. The current database has 3,030 sent campaign records, zero unresolved outcomes, and one fewer record than the selected audience because an account was deleted during the run. At completion, every still-eligible account had a campaign reservation. The reviewed retry script checks current account eligibility, opt-outs, and suppressions; it refuses a second retry.

Early campaign events showed many recipients requesting both tracked CTAs within five seconds, which can be caused by security scanners. The admin report therefore displays raw counts and separate click counts excluding this rapid multi-link pattern; neither should be presented as confirmed people or purchases.

Campaign SMTP uses the configured `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, and `SMTP_PASS` unless a complete set of `CAMPAIGN_SMTP_*` overrides is provided. A partial override fails closed. TLS is required on port 465 or STARTTLS on 587. [ZeptoMail’s public policy](https://www.zoho.com/zeptomail/help/sending-bulk-emails.html) describes promotional announcements as unsupported; confirm this account’s permission and limits privately before mailing. No new SMTP credentials were configured during implementation.

The bodies must contain `{{UNSUBSCRIBE_URL}}` in both formats, with all asset and postal placeholders resolved. The sender substitutes the recipient's signed unsubscribe URL and attaches `List-Unsubscribe` and `List-Unsubscribe-Post` headers. Verify that the provider DKIM-signs both headers, as required for inbox [one-click unsubscribe](https://datatracker.ietf.org/doc/html/rfc8058). Clicking the footer opens a no-login confirmation page; POST changes only `marketing_emails` to false. GET/HEAD do not mutate preferences. Existing reminder preferences and the saved reminder address are preserved. Links use a separate signature purpose from analytics and have no tracking-style expiry; retain the signing key and message record while these links must work.

Migration `supabase/migrations/20260929172952_email_marketing_unsubscribe_preference.sql` adds the previously missing `email_preferences.marketing_emails` column. It was applied with owner approval and verified. NULL means unknown, not consent; the endpoint excludes explicit opt-outs while the operator must independently establish a valid audience. No preference values were backfilled.

The source's CTA destinations must match [tracking.json](updates/2026-09-28/tracking.json) exactly in both bodies. Image files are deployed with the app under `/email/product-update-2026-09-29/`. Use a distinct `test_...` campaign ID and one explicitly approved account for mailbox testing. The all-Free copy makes the $0.99 offer conditional because 32 selected accounts have already used that introduction; the Pro click metric measures visits to the Pro page, not checkout completion or eligibility.

The sender checks all scoped addresses against suppressions before the first SMTP attempt and pages through marketing opt-outs. It reserves each campaign/normalized-email pair durably before SMTP. Repeating unchanged content with the same ID skips existing reservations. Changed content requires a new ID. Ambiguous SMTP outcomes are held for manual review rather than automatically retried. Read `sent`, `failed`, `duplicate`, `suppressed`, `skippedOptOut`, and `needsReview`; SMTP acceptance still does not prove inbox delivery.

Each message gets one tiny open image and signed redirect URLs for the configured CTAs. No recipient email, destination URL, admin secret, IP address or raw user agent is embedded in the tracking token or saved in the event table. The existing email queue still holds its normal recipient record. Known automation is stored separately; the browser still reaches a valid CTA if event recording fails. HEAD requests do not count.

If using a different campaign sender instead of the SMTP endpoint, use that provider's native campaign tracking. Merely copying `email.html` into another platform does not activate these endpoints.

## Validation

Unit tests cover signatures/expiry, destination checks, real-template instrumentation, authenticated reporting, scanner flags, duplicate reservations, preference/suppression failures and ambiguous SMTP outcomes. Admin tests also check trusted grants versus editable metadata, ordinary-user denial, sign-in rate limits and request origins, password clearing, local sign-out, invitation verification, campaign pagination, expired sessions and refresh races. Run `supabase/tests/email_campaign_tracking.sql` against the migrated database for a verification with fictional recipients inside a rolled-back transaction. It checks unique counts, repeat events, separate CTA counts and private privileges; it does not send mail or write applicant records.

September 29 implementation verification: the migration was applied to the TrackMyOPT database and the rolled-back test passed under `service_role`. All 31 targeted tests, TypeScript, lint and the production build passed; React Doctor reported 100/100. The broader suite passed 1,610 tests with one existing `screening-review-widget-ui.test.ts` failure that also reproduces on an isolated `origin/main` baseline. No campaign was registered or sent. The security advisor's informational “RLS enabled, no policy” findings on these two private tables are intentional: client privileges are revoked and only the server role accesses them, consistent with [Supabase's RLS documentation](https://supabase.com/docs/guides/database/postgres/row-level-security).

Password-based admin update verification: all 59 focused tests, TypeScript, scoped lint and the production build passed; React Doctor reported 100/100. Full web lint had no errors and 240 existing warnings. The broader suite passed 1,637 tests with the same existing review-widget failure and one sensitive-autofill timeout; all sensitive-autofill tests passed on an isolated rerun. The rolled-back database check passed again, leaving no synthetic campaign records. No campaign was registered or sent by this update.

Send-preparation verification (September 29): 48 focused tests, TypeScript, scoped lint, production build and the offline CLI fixture passed for the earlier revision. The approved unsubscribe preference migration is live with RLS retained. The refreshed local preview shows Karthik and the owner-supplied postal address. A read-only candidate export found five accounts, and a live dry run reported requested 5, matched 5, eligible 5, skipped opt-outs 0, suppressed 0, sent 0. No SMTP test, campaign registration or send was performed.
