# Privacy consent architecture

How TrackMyOPT decides which browser technologies may run, per visitor
jurisdiction. Read this before adding any analytics, advertising, chat,
replay, pixel, or other third-party browser integration.

> **Legal status:** this system is designed to support the consent and opt-out
> requirements of the GDPR/ePrivacy rules, UK PECR, and U.S. state privacy laws.
> It has **not** been reviewed by counsel. Do not describe the site as
> "GDPR compliant", "CCPA compliant", or similar. See
> [Legal review items](#legal-review-items).

## Rule of thumb

**Nothing non-essential may load, initialize, or store data on the device
unless `lib/privacy` permits it.** Every service is classified in
`apps/web/lib/privacy/services.ts`, and only
`apps/web/lib/privacy/integrations.ts` or a `useConsent(category)` check may
start it. Do not add `<Script>`, tag snippets, SDK `init()` calls, or
`instrumentation-client.ts` startup code for non-essential tools.

## Runtime flow

```
Request ─► Vercel adds x-vercel-ip-country
        ─► proxy.ts: classifyCountry() ─► cookie tmo_privacy_region=EU_EEA|UK|US|OTHER|UNKNOWN
        ─► page renders (server/static HTML contains no consent-dependent markup)
        ─► browser: PrivacyProvider (root layout, mounted once)
              getPrivacySnapshot(): region cookie + tmo_consent cookie + navigator.globalPrivacyControl
              ─► resolvePrivacyState() (pure) ─► effective permissions
              ─► startPrivacyManager() ─► applyIntegrations(permissions)
        ─► banner (opt-in regions without a decision) / nothing (U.S.)
        ─► decision ─► tmo_consent cookie ─► applyIntegrations() again
```

## Files

| Path (under `apps/web`) | Role |
| --- | --- |
| `lib/privacy/types.ts` | Categories, regions, snapshot and stored-consent types |
| `lib/privacy/regions.ts` | Country → jurisdiction group and the **only** per-region rules (`REGION_RULES`) |
| `lib/privacy/region-detection.ts` | Reads `x-vercel-ip-country` in `proxy.ts`, sets `tmo_privacy_region`, dev override |
| `lib/privacy/services.ts` | Classification registry for every browser technology |
| `lib/privacy/consent-storage.ts` | Consent cookie read/validate/write, version constant, legacy migration, cookie cleanup |
| `lib/privacy/gpc.ts` | Global Privacy Control detection |
| `lib/privacy/policy.ts` | Pure decision function `resolvePrivacyState()` |
| `lib/privacy/privacy-manager.ts` | Client store: `getPrivacySnapshot`, `hasConsent`, `saveConsent`, `openPrivacySettings` |
| `lib/privacy/integrations.ts` | Script controller: PostHog, GA4 + Google Consent Mode, revocation cleanup |
| `components/privacy/PrivacyProvider.tsx` | Mounted in `app/layout.tsx`; banner, dialog, floating shortcut, gated Vercel components |
| `components/privacy/CookieBanner.tsx` | First-layer banner: Accept all / Reject non-essential / Customize |
| `components/privacy/PrivacySettingsDialog.tsx` | Category toggles; Essential locked |
| `components/privacy/PrivacySettingsLink.tsx` | "Your Privacy Choices" link for footers/menus |
| `components/privacy/use-privacy.ts` | `usePrivacy()` and `useConsent(category)` hooks |

## Region detection

* Next.js 16 has no `request.geo`. Vercel sets the `x-vercel-ip-country`
  request header (ISO 3166-1 alpha-2) and overwrites client-supplied values;
  `@vercel/functions` `geolocation()` reads the same header. We read it directly
  in `proxy.ts` to avoid a dependency for one field. No paid GeoIP API is used.
* Only the group is exposed, in the `tmo_privacy_region` cookie (one day,
  `SameSite=Lax`, `Secure` on HTTPS, readable by JS because the consent UI
  needs it). The country, IP address, city, and coordinates are never stored
  or logged by this feature.
* The cookie is rewritten only when the group changes, so client navigation
  does not cause extra work. `/api/*` requests are skipped.
* Groups: `EU_EEA` (EU-27, their ISO-coded outermost regions, IS, LI, NO),
  `UK` (GB), `US`, `OTHER` (everything else, including CH and U.S. territories),
  `UNKNOWN` (missing/invalid header).

## Jurisdiction rules (`REGION_RULES`)

| Group | Model | Banner | Defaults before a decision |
| --- | --- | --- | --- |
| EU_EEA | opt-in | yes | functional/analytics/marketing off |
| UK | opt-in | yes | all optional off |
| OTHER | opt-in | yes | all optional off |
| UNKNOWN | opt-in | yes | all optional off (protective fallback) |
| US | opt-out | no | functional/analytics/marketing on; GPC turns marketing off |

Change behavior **only** in `REGION_RULES`. Nothing else should branch on region.

## Consent categories

| Category | Can refuse | Meaning |
| --- | --- | --- |
| essential | no | Needed for the site, security, payments, or a feature the user explicitly asked for |
| functional | yes | Conveniences that store data but are not strictly needed |
| analytics | yes | Usage measurement, experiments, surveys, replay, performance beacons |
| marketing | yes | Advertising; treated as "sale/sharing"/targeted advertising for U.S. opt-outs |

## Where consent is stored

First-party cookie `tmo_consent`, path `/`, 12 months, `SameSite=Lax`,
`Secure` on HTTPS, not `HttpOnly` (the client UI reads and writes it):

```json
{"version":2,"functional":false,"analytics":true,"marketing":false,
 "region":"EU_EEA","timestamp":"2026-10-15T12:00:00.000Z","method":"custom"}
```

It contains no identifiers. It is untrusted input: `parseStoredConsent()`
validates types, region, age, and size and treats anything invalid as "no
decision". It is never used for authorization and is not read on the server.
If cookies are blocked, the choice applies for the current page session only.

## Consent versioning

`CONSENT_VERSION` in `consent-storage.ts` (currently **2**; version 1 was the
former localStorage "Accept All / Essential Only" banner, which is read once
for migration and deleted when a new choice is saved).

* A stored decision whose version differs **and** grants any optional category
  is treated as outdated: the banner returns in opt-in regions and the old
  grants are ignored until re-confirmed.
* A refusal stays valid across versions, and opt-outs inside an outdated
  record still apply under U.S. defaults.
* Bump the version when you add a service to an existing optional category,
  move a service to a more permissive category, or change what a category
  means. Adding a new essential-only item does not require a bump.

## How each integration is gated

| Integration | Gate | Before permission | After revocation |
| --- | --- | --- | --- |
| PostHog (analytics, experiments, surveys, replay, exception autocapture) | `setPostHogAnalyticsConsent()` from `integrations.ts`; `posthog.init` happens on the first grant | Not initialized: no `/ingest` requests, cookies, or localStorage. Experiments fall back to control | `opt_out_capturing()`, `ph_*` cookies and localStorage removed; loaded code stays in memory but sends nothing |
| Google Analytics 4 | `loadGoogleAnalytics()` in `integrations.ts`; Consent Mode v2 default `denied` | `gtag.js` not requested | `window['ga-disable-<ID>'] = true`, `_ga*`, `_gid`, `_gat` removed, Consent Mode `analytics_storage: denied` |
| Vercel Web Analytics / Speed Insights | Rendered by `PrivacyProvider` only while analytics is allowed; `beforeSend` drops events when not allowed | Script not requested | Components unmount; `beforeSend` drops anything queued |
| Google AdSense | `AdSenseInArticle` renders and calls `loadAdSense()` only while `useConsent('marketing')` | Script not requested | `__gads`/`__gpi`/`__eoi` removed; if the AdSense script was loaded, the page reloads because loaded ad code (including any Auto ads set up in the AdSense console) cannot be stopped in place |
| Referral code (`trackmyopt_ref`) | `ReferralCapture` stores only with `useConsent('functional')`; the anonymous click count still posts | Not stored | Existing value is left until signup consumes it |
| Sign-in hint (`trackmyopt_last_method`) | `hasConsent('functional')` in `app/login/page.tsx` | Not stored | Existing value remains (first-party, no third party) |

Google Tag Manager containers are **not** used; `googletagmanager.com` serves
only `gtag/js` for GA4. If a GTM container is ever added, treat the whole
container as the highest category of any tag inside it and load it only
through `integrations.ts`.

## Global Privacy Control

* Read from `navigator.globalPrivacyControl === true` in the browser. The
  `Sec-GPC` header is not used because no consent decision is made on the
  server.
* Applied in **every** region in `applyGlobalPrivacyControl()`: it forces
  `marketing` off (AdSense never loads; Google Consent Mode ad signals denied).
  It overrides an earlier "Accept all", and the settings dialog shows marketing
  locked off with an explanation.
* It never disables essential technology and does not by itself change
  functional or analytics.
* Do Not Track is not treated as GPC.

## Adding a new provider

1. Add an entry to `PRIVACY_SERVICES` with the correct category (`analytics` or
   `marketing`; mark `saleOrShare: true` for advertising, cross-context
   behavioral advertising, or data sales).
2. Start it only from `applyIntegrations()` (non-React SDKs/scripts) or behind
   `useConsent('<category>')` (React components). Never from
   `instrumentation-client.ts`, the root layout `<head>`, or module scope.
3. Implement revocation: an SDK opt-out call, first-party cookie prefixes in
   `integrations.ts`, or set `reloadRequired` if the code cannot be stopped.
4. Add its domains to the CSP in `next.config.js` (minimum needed, no new
   `unsafe-*`).
5. Bump `CONSENT_VERSION` if it widens an existing category.
6. Add an e2e network assertion in `apps/web/e2e/privacy-consent.spec.ts`
   proving no request before permission and a request after.
7. Update the Cookie Policy and the inventory below.

## Classifying a new cookie or storage key

* **Essential:** strictly necessary for security, sign-in, payments, a legal
  obligation, or a feature the user explicitly asked for (stored only on that
  action, e.g. "remember my email").
* **Functional:** a convenience stored without an explicit request.
* **Analytics:** any measurement of use or performance, including cookieless
  beacons, experiments, and replay.
* **Marketing:** ads, ad measurement, retargeting, or sharing with ad partners.
* If unsure, classify as the more restrictive category and list it under
  review below. Never classify a third-party tool as essential only because a
  feature depends on it.

## Testing locally

* Unit: `pnpm --filter web exec vitest run lib/privacy components/privacy`.
* E2E with network checks:
  `pnpm --filter web exec playwright test e2e/privacy-consent.spec.ts`.
* Simulate a jurisdiction in development (`NODE_ENV !== 'production'` only):
  * `http://localhost:3000/?privacy_region=EU_EEA` (also `UK`, `US`, `OTHER`,
    `UNKNOWN`); remembered in an HttpOnly dev cookie. `?privacy_region=auto`
    clears it.
  * or `PRIVACY_REGION_OVERRIDE=UK pnpm --filter web dev`
  * or send the header: `curl -H 'x-vercel-ip-country: DE' …`
  Production ignores the parameter, the override cookie, and the env var.
* Simulate GPC: Firefox (`privacy.globalprivacycontrol.enabled`), Brave, or the
  DuckDuckGo extension; or in DevTools run
  `Object.defineProperty(Navigator.prototype,'globalPrivacyControl',{get:()=>true})`
  before the app loads.
* Reset: delete the `tmo_consent` cookie.

## Error monitoring

Third-party script failures (usually ad/tracker blockers) are expected and are
logged with `console.warn`, which is not sent to Sentry. Malformed consent
cookies are expected input and silently treated as "no decision". Rendering
errors in the consent UI reach Sentry through the existing React error
boundaries and global handlers. Sentry itself is essential and unaffected by
consent; its privacy filters (`lib/sentry/options.ts`) are unchanged.

## Cookie and storage inventory

Names are from the code; "consent" = controlled by Your Privacy Choices.
Third-party cookies on other domains are set by those providers and are not
enumerated here.

| Name | Purpose | Provider | Category | Party | Created | Lifetime | Consent |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `sb-<project>-auth-token` (+ `.0`, `.1` chunks) | Sign-in session | Supabase via `@supabase/ssr` | Essential | 1st | Sign-in / refresh | Supabase default (~400 days, refreshed) | No |
| `sb-<project>-auth-token-code-verifier` | OAuth PKCE verifier | Supabase | Essential | 1st | OAuth start | Short-lived | No |
| `tmo_privacy_region` | Jurisdiction group | TrackMyOPT | Essential | 1st | First request / region change | 1 day | No |
| `tmo_consent` | Privacy choices | TrackMyOPT | Essential | 1st | Choice saved | 12 months | No |
| `tmo_privacy_region_override` | Dev-only region simulation | TrackMyOPT | Essential (dev) | 1st | `?privacy_region=` in development | Session | No (never in production) |
| localStorage `theme` | Theme you pick | next-themes | Essential (user-requested) | 1st | Theme change | Persistent | No |
| localStorage `trackmyopt_sidebar_collapsed`, `trackmyopt_job_tracker_view` | Layout you pick | TrackMyOPT | Essential (user-requested) | 1st | UI action | Persistent | No |
| localStorage `trackmyopt_remember_email` | "Remember me" email | TrackMyOPT | Essential (user-requested) | 1st | Checkbox at sign-in | Persistent | No |
| localStorage resume store (zustand `persist`), promo dismissal keys | Your resume draft; dismissed promotions | TrackMyOPT | Essential (user-requested) | 1st | User action | Persistent | No |
| Service worker `/sw.js` + push subscription | Case-status push alerts you enable | TrackMyOPT | Essential (user-requested) | 1st | "Enable notifications" | Until revoked | No |
| localStorage `trackmyopt_ref` | Referral credit | TrackMyOPT | Functional | 1st | Visit with `?ref=` | Until signup | Yes |
| localStorage `trackmyopt_last_method` | Last sign-in method hint | TrackMyOPT | Functional | 1st | Sign-in | Persistent | Yes |
| `ph_<token>_posthog` cookie + localStorage, `__ph_opt_in_out_<token>` | Anonymous/identified analytics ID, opt state | PostHog | Analytics | 1st | Analytics allowed | ~1 year | Yes |
| `_ga`, `_ga_<container>` | GA4 client/session IDs | Google | Analytics | 1st (Google-set) | Analytics allowed | Up to 2 years | Yes |
| Vercel Web Analytics / Speed Insights | Cookieless beacons | Vercel | Analytics | 1st endpoint | Analytics allowed | None stored | Yes |
| `__gads`, `__gpi`, `__eoi` (+ Google-domain cookies) | Ad delivery and measurement | Google AdSense | Marketing | 1st (Google-set) and 3rd | Marketing allowed, article with an ad | Up to 13 months | Yes |
| Stripe cookies | Checkout / billing portal fraud prevention | Stripe | Essential | 3rd (stripe.com pages only) | Checkout | Stripe-defined | No |
| Google sign-in cookies | OAuth on Google's pages | Google | Essential | 3rd (google.com) | "Sign in with Google" | Google-defined | No |

Not cookies, but third-party browser requests: Sentry error reports
(essential), Brandfetch employer-name suggestions and ApplyBolt email lookup
(sent only when the user uses those features), the USCIS E-Verify search
iframe on `/e-verify-employer-search` (government site; its own cookies are not
controlled by TrackMyOPT).

## Legal review items

* U.S. opt-out defaults (`REGION_RULES.US`) have not been reviewed state by
  state, including sensitive-data opt-in rules (e.g. citizenship/immigration
  status) that may apply to analytics on immigration-related pages.
* Classification of Vercel Web Analytics/Speed Insights (gated as analytics),
  Sentry (essential), user-requested preference storage (essential), and the
  E-Verify iframe.
* AdSense in the EEA/UK normally requires a Google-certified TCF CMP; this
  manager is not TCF-certified, so ads to consenting EEA/UK visitors may be
  limited or not served.
* Consent lifetime (12 months) and re-prompt cadence.
* Server-side PostHog events are not controlled by browser consent.
* Cookie Policy and Privacy Policy text updated on 2026-10-15.
