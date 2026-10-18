# LinkedIn daily jobs post

Every day at 2:30 PM New York time the TrackMyOPT LinkedIn company page can
publish "Today's jobs for OPT & STEM OPT job seekers": fresh US Software
Engineering, Data & AI, Cybersecurity and Networking & Cloud jobs, each with a
`trackmyopt.com/j/<code>` link, plus a link to the day's full list at
`/opt-jobs/<YYYY-MM-DD>`.

Only the admin account manages it, from **Settings → Profile → LinkedIn daily
jobs post** (`dikondaashish@gmail.com` by default; override with
`LINKEDIN_ADMIN_EMAILS`, comma-separated). The account must have a confirmed
email.

## Setup

1. LinkedIn developer app, linked to the TrackMyOPT company page, with the
   **Community Management API** product approved.
2. In the app's **Auth** tab, add the redirect URL
   `https://www.trackmyopt.com/api/admin/linkedin/callback`.
3. Vercel → TrackMyOPT project → Environment Variables (Production):

   | Variable | Value |
   | --- | --- |
   | `LINKEDIN_CLIENT_ID` | App Client ID |
   | `LINKEDIN_CLIENT_SECRET` | App Primary Client Secret |
   | `LINKEDIN_TOKEN_ENCRYPTION_KEY` | 32 random bytes, base64: `openssl rand -base64 32` |
   | `LINKEDIN_ORGANIZATION_ID` | Optional. Only if the LinkedIn account administers several pages |
   | `LINKEDIN_API_VERSION` | Optional. `YYYYMM`; defaults to `202609` |
   | `LINKEDIN_REDIRECT_URI` | Optional. Defaults to `<site origin>/api/admin/linkedin/callback` |
   | `LINKEDIN_SCOPES` | Optional. Space-separated; defaults to `rw_organization_admin w_organization_social`. LinkedIn rejects the whole sign-in (`unauthorized_scope_error`) if any scope is not enabled on the app |

   Redeploy after adding them.
4. Apply `supabase/migrations/20261018120000_linkedin_daily_job_posts.sql`.
5. Sign in as the admin, open Settings → Profile, click **Connect LinkedIn**,
   and approve with the LinkedIn account that is a super admin of the page.

## Daily flow

- `vercel.json` fires `/api/cron/linkedin-daily-post` at 18:30 and 19:30 UTC;
  only the firing that is 14:xx in New York acts (EDT and EST).
- It builds today's draft (unless one exists, so a reviewed preview is kept)
  from open US engineering and data jobs posted in the last 72 hours, plus
  title searches for network, administrator, cyber, infrastructure, cloud,
  penetration and programmer roles.
- Selection skips jobs that state no sponsorship, require US citizenship, a
  green card, "U.S. person" status or a clearance, federal and defense
  contractors, leadership titles, talent pools, repeat titles, and jobs
  published in an earlier post. Early-career and sponsorship-positive roles
  rank first; at most two per company per domain and three overall.
- Up to 10 jobs per domain are picked. LinkedIn allows 3,000 characters, so
  the post shows as many as fit (usually about 20–25) and links the full list.
- **Publish automatically** off (default): the draft waits for **Publish now**.
  On: the cron publishes it. A day publishes at most once (`publishing` claim),
  and a preview refresh never rewrites a day that is being published.
- If LinkedIn does not answer while posting, the day is marked
  `post_uncertain`: check the page before clicking Publish again. A publish
  that never finished can be retried from the card after 10 minutes.

## Tokens

Access tokens last 60 days. Apps with programmatic refresh tokens renew
automatically for a year; otherwise click **Reconnect** before the date shown
on the card (Sentry warns a week ahead). Tokens are stored AES-256-GCM
encrypted in `linkedin_page_connection`; rotating
`LINKEDIN_TOKEN_ENCRYPTION_KEY` requires reconnecting.

## Tables

- `linkedin_page_connection`: the single connected page and settings.
- `linkedin_daily_posts`: one row per New York day (draft → published/failed).
- `linkedin_job_links`: public job data behind `/j/<code>`.

All three are service-role only (RLS forced, no policies).
