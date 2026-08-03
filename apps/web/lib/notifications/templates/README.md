# `lib/notifications/templates/`

Email HTML templates extracted out of the monolithic `email-service.ts`.

## Status

**Daily reminder (OPT tools) — migrated.** The HTML for `sendDailyReminder` now lives under `templates/`:

- `daily-reminder-html.ts` — subject helper `getDailyReminderSubject` + wrapper `renderDailyReminderEmailHtml`
- `partials/tool-section.ts` — dispatches by `toolType`
- `partials/opt-apply.ts`, `opt-clock.ts`, `stem-apply.ts`, `stem-clock.ts` — per-tool bodies (with Vitest smoke tests in `__tests__/daily-reminder-html.test.ts`)

`email-service.ts` still owns SMTP orchestration, types (`EmailReminderData`, `ToolReminderDetail`), and other transactional templates.

## Target shape

```ts
// lib/notifications/templates/daily-reminder.ts
import type { EmailReminderData } from '../email-service';

export function dailyReminderTemplate(data: EmailReminderData): {
    subject: string;
    html: string;
} {
    return {
        subject: `Daily OPT Reminder — ${data.tools.length} active`,
        html: `<!DOCTYPE html>...`,
    };
}
```

Then in the route or job that uses it:

```ts
import { dailyReminderTemplate } from '@/lib/notifications/templates/daily-reminder';

const { subject, html } = dailyReminderTemplate(data);
await transporter.sendMail({ to, subject, html });
```

## Migration checklist (per template)

1. Copy `generateXxxHTML` from `email-service.ts` into `templates/<name>.ts` and export it as the function shape above.
2. Replace all call sites in `email-service.ts` with imports from the new file.
3. Delete the old inline function.
4. Add a smoke test: snapshot the rendered HTML for one representative `data` payload (`templates/__tests__/<name>.test.ts`).
5. Manually preview the email in your mail client of choice (Mailtrap is recommended).

## Templates to migrate

| Function in `email-service.ts` | New file | Owner |
|---|---|---|
| `generateEmailHTML` (daily reminder wrapper) | `daily-reminder-html.ts` | done |
| `generateToolSection` | `partials/tool-section.ts` | done |
| `generateOptApplySection` | `partials/opt-apply.ts` | done |
| `generateOptClockSection` | `partials/opt-clock.ts` | done |
| `generateStemApplySection` | `partials/stem-apply.ts` | done |
| `generateStemClockSection` | `partials/stem-clock.ts` | done |

Other transactional templates inside `transactional/billing.ts` (payment failed, refund acknowledged, subscription ended, trial ending) should follow the same pattern in a second PR.
