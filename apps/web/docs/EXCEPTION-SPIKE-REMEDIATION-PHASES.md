# Exception Spike Remediation Phases

PostHog alert: **Exception spike – all pages (>100% day-over-day)** fired Jul 2, 2026.

## Investigation summary (PostHog project 369087)

| Metric | Value |
|--------|-------|
| Jul 1 exceptions | 0 |
| Jul 2 exceptions | 9 |
| Alert trigger | ∞% DoD (0 → 9) |
| Active issues (3d) | 5 |

### Top errors

| Issue | Message | Occurrences | Pages |
|-------|---------|-------------|-------|
| [removeChild #1](https://us.posthog.com/project/369087/error_tracking/019f1902-ab58-7b91-a5e0-2e723e515379) | `Cannot read properties of null (reading 'removeChild')` | 3 | `/login`, `/features/compliance` |
| [removeChild #2](https://us.posthog.com/project/369087/error_tracking/019f2104-5819-71c2-99d0-6929851446c7) | Safari variant (`parentNode.removeChild`) | 4 | `/` |
| [hydration #418](https://us.posthog.com/project/369087/error_tracking/019e8b40-e2bd-7b40-993f-872e1a8abbe1) | React minified error #418 (HTML mismatch) | 1 | `/dashboard` |

**Root cause:** React 19 DOM teardown races during fast client navigation / AnimatePresence exit, often while third-party scripts (GA4, AdSense, PostHog replay) also touch the DOM. Stack traces land in the main Next.js chunk (`4c6c10ff…`) — not app business logic.

**Important (senior review):** Spike pages were `/`, `/login`, `/features/compliance` — **not** Dialog-heavy dashboard flows. Login uses inline modals (not `createPortal`). Portal isolation is still correct hygiene for dashboard modals, but **the alert stopper is the PostHog `before_send` filter**, not portals alone.

Volume is low (~12 events / 3 days) but the alert is sensitive to 0→N spikes after deploy (∞% DoD when baseline is 0).

---

## Phase 1 — Portal isolation (P0)

- [x] Add dedicated `#tmopt-portal-root` in root layout
- [x] Route `Dialog` and `DateInput` portals through `getPortalRoot()` instead of `document.body`
- [x] Stop resetting portal `mounted` flag on effect cleanup (prevents mid-unmount tear-down)

**Files:** `app/layout.tsx`, `lib/portal-root.ts`, `components/ui/dialog.tsx`, `components/dashboard/opt-tools/DateInput.tsx`

---

## Phase 2 — DOM cleanup hardening (P1)

- [x] `browser-download.ts`: use `anchor.remove()` with parent guard (never throw on cleanup)
- [x] `PdfSelectablePreview.tsx`: cancel in-flight pdf.js `RenderTask` on unmount

**Files:** `lib/browser-download.ts`, `editor/components/PdfSelectablePreview.tsx`

---

## Phase 3 — PostHog noise reduction (P1)

- [x] `before_send` filter drops benign React `removeChild` null races (already fixed upstream; prevents alert flapping)
- [ ] Upload production source maps to PostHog symbol sets (optional — improves stack resolution)

**Files:** `lib/posthog/posthog-browser.ts`

---

## Phase 4 — Hydration & monitoring (P2)

- [x] Dashboard already guards localStorage widgets with `dynamic(..., { ssr: false })`
- [ ] Watch React #418 on `/dashboard` after Phase 1–3 deploy
- [ ] Tune alert threshold: require min 5 events/day before DoD % (avoid ∞% on 0 baseline)

---

## Verification

1. Deploy to preview
2. PostHog → Error tracking → confirm no new `removeChild` events after smoke test (login, home, dashboard, resume editor)
3. Confirm alert stops firing for 48h
