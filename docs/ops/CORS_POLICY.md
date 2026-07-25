# CORS policy (TrackMyOPT web)

## Shared helpers

- **`corsHeadersWebAndExtension(req)`** (`lib/api/cors-policy.ts`) — Dashboard and Chrome extension callers. Reflects an allowed web origin (`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_APP_URL`, production hosts, or localhost), the published TrackMyOPT extension ID, or a development ID explicitly listed in `NEXT_PUBLIC_CHROME_EXTENSION_ID` / `CHROME_EXTENSION_IDS`. Arbitrary `chrome-extension://…` origins are rejected. Does **not** use `*`.
- **`corsHeadersConfiguredWebApp()`** — Fixed site origin from `NEXT_PUBLIC_SITE_URL` (fallback `https://www.trackmyopt.com`). Used for same-site, cookie-authenticated APIs such as most `resume-generator` routes and **`/api/resume-generator/generate`** / **`/api/resume-generator/upload`**.

User/session APIs tightened to the extension-aware helper include (non-exhaustive): `/api/me`, `/api/premium/status`, `/api/user/sessions`, `/api/user/tool-email`.

## Routes that still use `Access-Control-Allow-Origin: *`

These intentionally stay permissive because they are called from **unpredictable origins** (bookmarklets, third-party landings, multiple marketing domains, or extension flows that do not send a stable `Origin`), or they are **low-risk public utilities** with no session cookies:

| Route prefix | Rationale |
|--------------|-----------|
| `app/api/opt/calculator/route.ts` | Public calculator; may be embedded or opened from varied referrers. |
| `app/api/case-status/*` | Case status checks and notifications; diverse client entry points. |
| `app/api/referral/*` | Referral tracking/signup from external campaign URLs. |
| `app/api/extension/*` | Extension and uninstall flows; origin patterns vary by install/channel. |

If a route moves to cookie-based auth or is only ever same-site + extension, prefer migrating it to **`corsHeadersWebAndExtension`** or **`corsHeadersConfiguredWebApp`** and document the change here.
