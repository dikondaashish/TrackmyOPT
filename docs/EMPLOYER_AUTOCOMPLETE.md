# Employer name autocomplete

Implemented locally on 2026-09-22 for the OPT Dates Employment History add/edit forms. Not deployed. No database migration or secret API key is required.

## Behavior

- Three trimmed characters trigger a live Brandfetch search after a 300 ms pause.
- Up to five company names and domains appear. Manual names always remain valid; users can correct a brand name to their employer's legal name.
- Arrow Up/Down highlights; Enter selects; Escape/Tab dismiss without silently selecting. Click selection works. Composition input is not searched until completed.
- Selection changes only Employer Name. Dates, employment status and saving remain explicit, existing actions.
- Requests are cancelled when typing changes, the input blurs, a suggestion is selected, or the component unmounts. Late responses are ignored; an eight-second timeout and error/empty states preserve manual entry.
- The existing theme, visible focus rings, screen-reader status, and minimum 44px rows follow the UI/UX skill's guidance. The containing employment card allows the dropdown to extend beyond its edge while editing.

## Configuration and data handling

`EmployerNameInput.tsx` uses the owner's public client ID by default. `NEXT_PUBLIC_BRANDFETCH_CLIENT_ID` can override it at build time; restart/rebuild when changing this value. Never use the server-side Brand API secret here.

Requests go directly to `https://api.brandfetch.io/v2/search/{query}?c={clientId}` with credentials omitted, no referrer, and no-store caching. Only the search text and public client identifier are included by the application; the provider necessarily receives normal network information such as IP address. No dates, user IDs, resumes or complete employment records are sent by this feature. The field identifies Brandfetch as the search provider.

Search result lists are transient component state only: no Supabase directory, localStorage cache, server proxy, bulk collection, or analytics logging is added. The user-confirmed editable employer name uses the existing employment-save mechanism. Domains are display-only and not saved. Owner review of provider terms/privacy disclosures remains part of release review.

The site CSP adds only `https://api.brandfetch.io` to `connect-src`; no other directive is relaxed. Provider integration follows [Brand Search documentation](https://docs.brandfetch.com/reference/brand-search-api) and [guidelines](https://docs.brandfetch.com/brand-search-api/overview).

## Verification

- 14 new autocomplete tests; 45 tests pass across the OPT component suite.
- TypeScript passes; new component/form/test targeted lint passes.
- React Doctor remained 49/100 before and after this work, with the same unrelated findings; the broader workspace is not certified release-clean.
- Live Chrome against the real API using synthetic account data: `Ama` returned Amazon and four other results; Arrow Down + Enter selected Amazon and closed suggestions. Editing a synthetic employer and typing `Mic` returned Microsoft and four other results. Fixed visually observed card clipping and rechecked all five rows.
- No live user dates or employment were changed. No production deployment, push, or migration was performed.

Reproduce locally from `apps/web` with `node scripts/preview-opt-dates-audit.mjs`. Its account endpoints are mocked; public Brandfetch searches are live. No employment data is saved outside that preview's memory.
