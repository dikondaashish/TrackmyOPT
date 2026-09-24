import { z } from 'zod';
import { calendarDateISO } from '@/lib/immigration/calendar-days';

export const noticeSchema = z
  .object({
    case_id: z.string().uuid(),
    document_id: z.string().uuid().nullable().default(null),
    title: z.string().trim().min(1).max(120),
    kind: z.enum(['receipt', 'rfe', 'noid', 'approval', 'dso', 'other']),
    source_key: z
      .string()
      .regex(/^[a-z0-9-]+:\d{4}-\d{2}-\d{2}$/)
      .max(140)
      .optional(),
    due_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .refine((v) => calendarDateISO(v) === v)
      .nullable()
      .default(null),
    deadline_confirmed: z.boolean().default(false),
    email_reminder: z.boolean().default(false),
  })
  .superRefine((v, ctx) => {
    if (v.due_date && !v.deadline_confirmed)
      ctx.addIssue({
        code: 'custom',
        path: ['deadline_confirmed'],
        message: 'Confirm the exact deadline from your notice or DSO.',
      });
    if (v.email_reminder && !v.due_date)
      ctx.addIssue({
        code: 'custom',
        path: ['due_date'],
        message: 'A confirmed deadline is required for reminders.',
      });
  });

export type CaseNotice = {
  id: string;
  case_id: string;
  title: string;
  kind: string;
  document_id: string | null;
  due_date: string | null;
  completed_at: string | null;
  email_reminder: boolean;
  reminder_state:
    | 'off'
    | 'pending'
    | 'sending'
    | 'sent'
    | 'failed'
    | 'cancelled';
  reminder_sent_at: string | null;
  source_key?: string | null;
};
export const NOTICE_COLUMNS =
  'id, case_id, title, kind, document_id, due_date, completed_at, email_reminder, reminder_state, reminder_sent_at, source_key';
