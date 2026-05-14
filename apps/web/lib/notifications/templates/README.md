# `lib/notifications/templates/`

Email HTML templates extracted out of the monolithic `email-service.ts`.

## Status

Migration in progress. The legacy file `lib/notifications/email-service.ts` (1,716 LOC) still contains every template inline. We are moving them here one at a time so each can be unit-tested in isolation and previewed independently.

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
| `generateEmailHTML` (daily reminder wrapper) | `daily-reminder.ts` | open |
| `generateToolSection` | `partials/tool-section.ts` | open |
| `generateOptApplySection` | `partials/opt-apply.ts` | open |
| `generateOptClockSection` | `partials/opt-clock.ts` | open |
| `generateStemApplySection` | `partials/stem-apply.ts` | open |
| `generateStemClockSection` | `partials/stem-clock.ts` | open |

Other transactional templates inside `transactional-emails.ts` (payment failed, refund acknowledged, subscription ended, trial ending) should follow the same pattern in a second PR.
