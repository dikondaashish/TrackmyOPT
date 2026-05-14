# `components/dashboard/settings/`

Settings dashboard. **Open refactor** — `SettingsSection.tsx` is 2,564 LOC and should be split by tab.

## Current state

A single mega-component (`SettingsSection.tsx`) renders all settings tabs in one file. It is hard to test, slow to type-check, and accumulates accidental coupling.

## Target shape

```
settings/
├── SettingsSection.tsx              ← thin shell: tab nav + routing only (~150 LOC)
├── tabs/
│   ├── AccountTab.tsx               ← email, name, password change
│   ├── SubscriptionTab.tsx          ← Stripe portal link, plan, invoices
│   ├── NotificationsTab.tsx         ← per-tool email preferences
│   ├── SecurityTab.tsx              ← passcode change, OTP recovery
│   ├── PrivacyTab.tsx               ← export data, delete account, policy consent
│   └── DangerZoneTab.tsx            ← delete account, sign out everywhere
├── BillingHistory.tsx               (already exists — keep)
├── PlanComparisonModal.tsx          (already exists — keep)
└── README.md
```

## Migration steps (one tab per PR)

1. Pick a tab. Find its render block inside `SettingsSection.tsx`.
2. Identify the local state slices it uses and the API calls it makes.
3. Move both into a new `tabs/<Name>Tab.tsx` component as a self-contained client component.
4. Replace the inline render block in `SettingsSection.tsx` with `<NameTab />`.
5. Re-run `pnpm test && pnpm build`. Verify the tab still works.

## Why this is risky

- The mega-component has shared local state between tabs (e.g. a single `loading` flag toggled by all tabs).
- Some tabs read the same Supabase row — extracting without a shared context risks duplicate fetches.

**Recommended approach:** introduce a `SettingsDataProvider` context that owns the shared profile fetch, and have each tab read from it.
