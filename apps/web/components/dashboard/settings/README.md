# Settings dashboard

[`SettingsSection.tsx`](SettingsSection.tsx) coordinates shared profile loading,
state, actions, and tab navigation. Tab rendering has already been extracted;
keep new tab-specific UI in `tabs/` instead of growing the parent.

## Structure

- `tabs/`: Profile, Security, Documents, Notifications, Privacy, Extension, and
  Subscription panels.
- `settings-types.ts` and `settings-constants.ts`: shared contracts and values.
- `useDocumentPasscode.ts`: passcode and recovery workflow.
- `useDataExport.ts`: export workflow.
- `useSettingsExtension.ts`: extension connection state.
- `useSettingsNotificationEmails.ts`: notification email settings.
- `SubscriptionSettings.tsx`, `BillingHistory.tsx`, and
  `PlanComparisonModal.tsx`: subscription UI.
- `ApplicationProfileSection.tsx` and `PrivateApplicationAnswersSection.tsx`:
  application profile and private-answer forms.

## Maintenance

Further refactors should isolate one responsibility at a time. Trace shared
loading/error state and profile requests before moving an action into a hook;
avoid introducing duplicate requests or a new provider just to shorten a file.
Preserve the existing tab and callback contracts. Run `pnpm typecheck`,
`pnpm lint`, `pnpm test`, and `pnpm build` from the repository root, then verify
any changed interaction in the browser.
