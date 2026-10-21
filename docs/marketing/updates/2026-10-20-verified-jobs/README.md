# Verified Jobs personal outreach

**Status:** Draft. Nothing has been sent, scheduled or registered.

A short, personal-style email from Karthik introducing Verified Jobs (`/dashboard/career/jobs`). It is written to look and read like a one-to-one note, so it has a better chance of landing in Gmail Primary than the [September 29 product update](../2026-09-28/README.md). No template or sender can guarantee Primary placement.

| File | Purpose |
| --- | --- |
| [email.txt](email.txt) | Subject, plain-text body, merge-field rules and a sample |
| [email.html](email.html) | Minimal HTML body with the same text (no images or buttons) |
| [audience.sql](audience.sql) | Read-only query returning each recipient's segment and merge fields |

## Audience and personalization

`audience.sql` selects verified, non-anonymous Auth accounts and excludes `marketing_emails = false` and active `blocked_emails`. It reads the first name from `profiles`, then from the sign-up metadata, because almost no profiles have `first_name` set. Counts from a read-only run on 2026-10-20:

| Segment | Recipients | Opening line uses |
| --- | ---: | --- |
| `runway` | 243 | Their saved OPT or STEM EAD end date (1–270 days away) |
| `major` | 481 | Their major, plus a link filtered to matching entry-level roles |
| `general` | 2,512 | A general opener |
| **Total** | **3,236** | About 98% have a usable first name |

Every link opens Verified Jobs filtered to entry-level roles (`experience=entry`), with a role or title filter where the major maps to one. Only 38 recipients have uploaded a resume, so most see the "add your resume" line.

Product claims checked against the code on 2026-10-20: 1,260 enabled employer boards (Greenhouse, Ashby, Lever, SmartRecruiters, Workday); US-only ingestion; experience, H-1B filing-history ("Source-backed history") and keyword-exclude filters; resume ranking of the newest jobs.

## Getting into Primary

Gmail decides the tab from the content, the sender's history and how recipients react. To give this email the best chance:

1. **Send from a person.** Use `Karthik <karthik@trackmyopt.com>` (or another real mailbox) as both From and Reply-To, and have someone answer replies within a day. Replies are the strongest signal that an email is personal.
2. **Keep it plain.** No images, logo, buttons, emoji or preheader, and one link. The copy is written that way; keep it that way when editing.
3. **Avoid tracking where possible.** The existing campaign sender adds an open pixel and rewrites links through signed redirects. Both are common Promotions signals. Measure with the UTM tags on the link (`utm_campaign=verified_jobs_2026_10`) in analytics instead, if the owner accepts losing per-message open counts.
4. **Keep the unsubscribe line and `List-Unsubscribe` headers.** This is still a commercial email (CAN-SPAM), and Gmail requires one-click unsubscribe for bulk senders.
5. **Seed test first.** Send to a few Gmail, Outlook and iCloud test accounts and check which tab each lands in before any real send.
6. **Send slowly, most engaged first.** Start with `runway`, then `major`, then `general`, in batches of about 100–200 per hour. Stop if bounces or spam complaints rise. Recipients who signed in recently (447 in the last 30 days) are the safest first batch.
7. **Check the provider's rules.** ZeptoMail's public policy treats promotional email as unsupported (see [EMAIL_CAMPAIGN_TRACKING.md](../../EMAIL_CAMPAIGN_TRACKING.md)). Confirm this send is permitted, or use a provider that allows it, before mailing.

SPF, DKIM and DMARC must pass and align with the From domain.

## Before sending

- The owner approves the final copy, sender mailbox and provider.
- `{{POSTAL_ADDRESS}}` and `{{UNSUBSCRIBE_URL}}` are filled for every recipient.
- Re-run `audience.sql` on the send day; counts and dates change.
- Never commit the query's output; it contains email addresses and immigration dates.
