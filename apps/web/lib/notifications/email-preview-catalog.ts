/** Complete rendering catalog. Every fixture uses its production HTML builder. */
import { buildPolicyUpdateNoticeEmailContent } from '@/lib/compliance/policy-update-notice';
import { buildCaseDigest } from '@/lib/case-status/digest';
import {
  buildCaseStatusChangeEmailHtml,
  CASE_STATUS_CHANGE_SUBJECT_PREFIX,
} from './case-status-email';
import {
  buildDocumentExpiryReminderEmail,
  buildForgotVaultPasscodeResetEmail,
  buildPasscodeChangeOtpEmailHtml,
} from './document-expiry-email';
import {
  buildEnrollmentEmailHtml,
  buildExportOtpEmailHtml,
  buildNotificationPreferencesSavedEmailHtml,
  buildEmailChangeNotificationHtml,
  type EmailReminderData,
} from './email-service';
import {
  getDailyReminderSubject,
  renderDailyReminderEmailHtml,
} from './templates/daily-reminder-html';
import {
  getTransactionalEmailPreviews,
  type EmailPreviewItem,
} from './transactional/previews';
import { getAdminNoticeTemplates } from './admin-notice-templates';
import { getSupabaseAuthTemplates } from './supabase-auth-templates';
import { getStemFilingEmailDetails } from './stem-filing-email';
import {
  buildCaseDeadlineEmailBodies,
  buildCaseSummaryEmailHtml,
} from './case-summary-email';
import { escapeHtml } from './transactional/formatting';
export type { EmailPreviewItem };

const ENROLLMENT_TOOLS = [
  'opt-apply',
  'opt-clock',
  'stem-apply',
  'stem-clock',
  'documents',
  'case-status',
  'default',
] as const;
export function getAllEmailPreviews(firstName = 'Alex'): EmailPreviewItem[] {
  const sampleEmail = 'student@example.com';
  const stemFiling = getStemFilingEmailDetails('2026-11-30', '2026-10-01');
  const tools: EmailReminderData['tools'] = [
    {
      name: 'OPT Apply Dates',
      toolType: 'opt-apply',
      daysLeft: 5,
      totalDays: 90,
      startDate: '2026-08-31',
      endDate: '2026-10-15',
      urgency: 'urgent',
      message: 'Review your saved OPT filing dates with your DSO.',
      programEndDate: '2026-08-16',
    },
    {
      name: 'OPT Unemployment Clock',
      toolType: 'opt-clock',
      daysLeft: 45,
      totalDays: 90,
      startDate: '2026-06-01',
      endDate: '2027-06-01',
      urgency: 'moderate',
      message: 'Keep your employment records current.',
    },
    {
      name: 'STEM OPT Extension',
      toolType: 'stem-apply',
      daysLeft: 50,
      totalDays: 90,
      startDate: '2026-09-01',
      endDate: '2026-11-30',
      urgency: 'moderate',
      message: stemFiling.message,
      stemFiling,
    },
    {
      name: 'STEM Unemployment Clock',
      toolType: 'stem-clock',
      daysLeft: 70,
      totalDays: 150,
      startDate: '2026-06-01',
      endDate: '2028-06-01',
      urgency: 'safe',
      message: 'This balance includes initial OPT unemployment.',
    },
  ];
  const data = {
    userId: 'preview-user',
    userEmail: sampleEmail,
    firstName,
    tools,
  };
  const expiry = new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10);
  const digest = buildCaseDigest(
    [
      {
        label: 'OPT application',
        current_status: 'Case Was Received',
        last_checked_at: '2026-10-10T12:00:00Z',
      },
    ],
    [{ title: 'Review official notice', due_date: '2026-10-17' }],
    '2026-10-05'
  );
  const authValues: Record<string, string> = {
    Token: '847291',
    ConfirmationURL:
      'https://www.trackmyopt.com/auth/confirm?token_hash=preview&type=recovery',
    Email: sampleEmail,
    NewEmail: 'new-address@example.com',
    OldEmail: 'previous-address@example.com',
    OldPhone: '+1 202 555 0100',
    Phone: '+1 202 555 0101',
    Provider: 'Google',
    FactorType: 'Authenticator app',
  };
  return [
    ...getTransactionalEmailPreviews(firstName),
    {
      id: 'daily_reminder',
      category: 'Cron',
      subject: getDailyReminderSubject(tools),
      html: renderDailyReminderEmailHtml(data),
    },
    ...tools.map((tool) => ({
      id: `daily_${tool.toolType}`,
      category: 'Cron',
      subject: getDailyReminderSubject([tool]),
      html: renderDailyReminderEmailHtml({ ...data, tools: [tool] }),
    })),
    ...[
      'passport',
      'visa',
      'ead',
      'i-20',
      'driver_license',
      'health_insurance',
      'other',
    ].map((document_type) => ({
      id: `document_expiry_${document_type}`,
      category: 'Document vault',
      subject: `Document expiring soon: ${document_type}`,
      html: buildDocumentExpiryReminderEmail({
        filename: 'saved-document.pdf',
        expiry_date: expiry,
        document_type,
      }),
    })),
    {
      id: 'export_otp',
      category: 'Settings',
      subject: 'Your TrackMyOPT data export verification code',
      html: buildExportOtpEmailHtml('847291', firstName),
    },
    ...ENROLLMENT_TOOLS.map((tool) => ({
      id: `enrollment_${tool}`,
      category: 'Enrollment',
      ...buildEnrollmentEmailHtml(firstName, tool, {
        startDate: '2026-06-01',
        endDate: '2027-06-01',
        stemFiling,
      }),
    })),
    {
      id: 'notification_email_saved',
      category: 'Settings',
      subject: 'Your TrackMyOPT notification email is saved',
      html: buildNotificationPreferencesSavedEmailHtml(sampleEmail, firstName),
    },
    {
      id: 'email_address_updated',
      category: 'Settings',
      subject: 'Your email address was updated',
      html: buildEmailChangeNotificationHtml(),
    },
    ...[
      'Case Was Received',
      'Card Was Mailed To Me',
      'Request for Additional Evidence Was Sent',
      'Case Was Denied',
    ].map((new_status, index) => ({
      id: `case_status_change_${index}`,
      category: 'Case status',
      subject: `${CASE_STATUS_CHANGE_SUBJECT_PREFIX}MSC2190123456`,
      html: buildCaseStatusChangeEmailHtml({
        name: firstName,
        receipt_number: 'MSC2190123456',
        old_status: 'Case Was Received',
        new_status,
      }),
    })),
    {
      id: 'case_weekly_summary',
      category: 'Case status',
      subject: 'Your weekly case summary',
      text: digest,
      html: buildCaseSummaryEmailHtml('Your weekly case summary', digest),
    },
    {
      id: 'case_deadline',
      category: 'Case status',
      ...buildCaseDeadlineEmailBodies('Review official notice', '2026-10-17'),
    },
    {
      id: 'passcode_change_otp',
      category: 'Document vault',
      subject: 'Your OTP for Passcode Change - TrackMyOPT',
      html: buildPasscodeChangeOtpEmailHtml('582104', firstName),
    },
    {
      id: 'passcode_forgot_reset',
      category: 'Document vault',
      subject: 'Reset your Document Vault passcode',
      html: buildForgotVaultPasscodeResetEmail('582104', firstName),
    },
    ...[false, true].map((pro) => ({
      id: `policy_update_notice_${pro ? 'pro' : 'free'}`,
      category: 'Compliance',
      ...buildPolicyUpdateNoticeEmailContent(firstName, {
        showBillingUnchangedNotice: pro,
      }),
    })),
    ...Object.entries(getAdminNoticeTemplates()).map(([id, t]) => ({
      id: `admin_bulk_${id}`,
      category: 'Admin drafts',
      subject: t.subject,
      html: t.htmlContent.replaceAll('{{firstName}}', escapeHtml(firstName)),
      text: t.plainTextContent.replaceAll('{{firstName}}', firstName),
    })),
    ...getSupabaseAuthTemplates().map((t) => ({
      id: `auth_${t.id}`,
      category: 'Authentication',
      subject: t.subject,
      html: t.html.replace(/\{\{\s*\.(\w+)\s*\}\}/g, (_, key: string) =>
        escapeHtml(authValues[key] || 'Preview')
      ),
    })),
  ];
}

export const DEFAULT_PREVIEW_RECIPIENT = 'support@trackmyopt.com';
