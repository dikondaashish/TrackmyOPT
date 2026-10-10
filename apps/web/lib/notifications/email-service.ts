/**
 * Email Service - Handles all email sending via SMTP (Hostinger)
 *
 * Features:
 * - Daily reminder emails
 * - Urgency-based messaging
 * - Beautiful HTML templates
 * - Apple-inspired design
 */

import { createClient } from '@supabase/supabase-js';
import { getSmtpFromHeader, sendMailWithRetry } from './email-smtp';
import { sendPremiumWelcomeQueuedEmail } from './transactional/onboarding';
import {
  EMAIL,
  emailTextLead,
  emailTextMuted,
  emailTextP,
} from './email-brand';
import {
  buildTransactionalEmail,
  emailBodySectionClose,
  emailBodySectionOpen,
  emailOtpBox,
  emailPrimaryButton,
} from './email-layout';
import {
  getDailyReminderSubject,
  renderDailyReminderEmailHtml,
} from './templates/daily-reminder-html';
import { escapeHtml } from './transactional/formatting';
import { emailSummaryRows } from './templates/partials/summary';
import { emailTextList } from './email-brand';
import {
  renderStemFilingTimeline,
  type StemFilingEmailDetails,
} from './stem-filing-email';

export interface ToolReminderDetail {
  name: string;
  toolType: 'opt-apply' | 'opt-clock' | 'stem-apply' | 'stem-clock';
  daysLeft: number;
  totalDays: number;
  startDate: string;
  endDate: string;
  urgency: 'safe' | 'moderate' | 'urgent' | 'critical';
  message: string;
  // OPT specific fields
  optType?: 'Pre-Completion OPT' | 'Post-Completion OPT';
  programEndDate?: string;
  stemFiling?: StemFilingEmailDetails;
}

export interface EmailReminderData {
  userId: string;
  userEmail: string;
  firstName: string;
  tools: ToolReminderDetail[];
}

/**
 * Send daily reminder email to a user
 */
export async function sendDailyReminder(data: EmailReminderData) {
  try {
    const info = await sendMailWithRetry({
      from: getSmtpFromHeader(),
      to: data.userEmail,
      subject: getDailyReminderSubject(data.tools),
      html: renderDailyReminderEmailHtml(data),
    });

    console.log('Daily reminder email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Daily reminder email service error:', error);
    return { success: false, error };
  }
}

/**
 * Send OTP email for data export verification
 */
export function buildExportOtpEmailHtml(
  otp: string,
  firstName?: string
): string {
  return buildTransactionalEmail({
    headerTitle: 'Data export verification',
    bodyHtml: `
${emailBodySectionOpen()}
${emailTextLead('Use the code below to finish your export')}
${emailTextP(
  `${firstName ? `Hi ${escapeHtml(firstName)}, ` : ''}You requested an export of your data. Enter this code to continue:`
)}
${emailOtpBox(escapeHtml(otp))}
${emailTextMuted('Expires in 10 minutes. If you didn&rsquo;t request this, you can ignore this email.')}
${emailBodySectionClose()}`,
  });
}

export async function sendExportOtpEmail(
  email: string,
  otp: string,
  firstName?: string
) {
  try {
    const info = await sendMailWithRetry({
      from: getSmtpFromHeader(),
      to: email,
      subject: 'Your TrackMyOPT data export verification code',
      html: buildExportOtpEmailHtml(otp, firstName),
    });

    console.log('Export OTP email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Export OTP email service error:', error);
    return { success: false, error };
  }
}

// removed: sendVerificationEmail — no double opt-in / notification-email verification flow implemented.
// Re-add when wiring email_preferences confirmation with email_type: email_verified + email_queue.

/**
 * Enrollment email data including timeline information
 */
export interface EnrollmentEmailData {
  stemFiling?: StemFilingEmailDetails;
  startDate?: string;
  endDate?: string;
  programEndDate?: string;
  optType?: string;
  totalDays?: number;
}

/** The preview and sender use the same responsive enrollment template. */
export function buildEnrollmentEmailHtml(
  firstName: string,
  toolName: string,
  data?: EnrollmentEmailData
): { subject: string; html: string } {
  const content: Record<
    string,
    { title: string; steps: string[]; href: string }
  > = {
    'opt-apply': {
      title: 'OPT Apply Dates',
      href: '/dashboard/opt-tools/opt-apply',
      steps: [
        'Confirm your program end date and OPT recommendation date with your DSO.',
        'Review <a href="https://www.uscis.gov/i-765">Form I-765 instructions</a> and the <a href="https://www.uscis.gov/g-1055">current USCIS fee schedule</a> before filing.',
        'Keep copies of your application and proof of submission. Processing times vary.',
      ],
    },
    'opt-clock': {
      title: 'OPT Unemployment Clock',
      href: '/dashboard/opt-tools/opt-clock',
      steps: [
        'Keep your employment start and end dates up to date.',
        'Post-completion OPT has a 90-day cumulative unemployment limit.',
        'Confirm qualifying employment and reporting requirements with your DSO.',
      ],
    },
    'stem-apply': {
      title: 'STEM OPT Extension',
      href: '/dashboard/opt-tools/stem-apply',
      steps: [
        'Complete Form I-983 with your employer and confirm E-Verify participation.',
        'Request your STEM recommendation from your DSO before filing Form I-765.',
        'Apply up to 90 days before OPT EAD expiration and within 60 days of the DSO recommendation in SEVIS. The earlier deadline controls.',
      ],
    },
    'stem-clock': {
      title: 'STEM Unemployment Clock',
      href: '/dashboard/opt-tools/stem-clock',
      steps: [
        'The 150-day cumulative unemployment limit includes both initial OPT and STEM OPT.',
        'Keep employment records and Form I-983 information current.',
        'Complete required validation reports through your school and report changes to your DSO.',
      ],
    },
    documents: {
      title: 'Document Expiry Reminders',
      href: '/dashboard/documents',
      steps: [
        'Add an expiry date to each document you want to track.',
        'Review the reminder dates shown in your Document Vault.',
        'After renewal, update the saved expiry date so future reminders use the new date.',
      ],
    },
    'case-status': {
      title: 'Case Status Tracker',
      href: '/dashboard/case-status',
      steps: [
        'Add your USCIS receipt number to your dashboard.',
        'With an eligible paid plan and alerts enabled, daily checks can email you when a status change is detected.',
        'Review official USCIS notices for required actions and exact deadlines.',
      ],
    },
    default: {
      title: 'OPT Daily Reminders',
      href: '/dashboard',
      steps: [
        'Review your saved dates and enable the tool reminders you want in notification settings.',
      ],
    },
  };
  const selected = content[toolName] || content.default;
  const timeline =
    toolName === 'stem-apply'
      ? renderStemFilingTimeline(data?.stemFiling)
      : data
        ? emailSummaryRows([
            ['Saved start date', data.startDate || 'Not saved'],
            ['Saved end date', data.endDate || 'Not saved'],
            ...(data.programEndDate
              ? [['Program end date', data.programEndDate] as [string, string]]
              : []),
          ])
        : '';
  return {
    subject: `Welcome to ${selected.title} — TrackMyOPT`,
    html: buildTransactionalEmail({
      headerTitle: selected.title,
      bodyHtml: `${emailBodySectionOpen()}
${emailTextP(`Hi ${escapeHtml(firstName.trim() || 'there')},`)}
${emailTextP(`You are enrolled in <strong>${selected.title}</strong>. We will send the reminders and updates you have enabled for this tool.`)}
${timeline}
${emailTextLead('Your next steps')}
${emailTextList(selected.steps)}
${emailPrimaryButton(`https://www.trackmyopt.com${selected.href}`, `Open ${selected.title}`)}
${emailTextMuted('Reminders use your saved records and notification preferences. Keep your dates up to date.')}
${emailTextP('<a href="https://www.trackmyopt.com/dashboard/settings?tab=notifications" style="color:#2563EB;text-decoration:underline;">Manage notification preferences</a>')}
${emailBodySectionClose()}`,
    }),
  };
}

/**
 * Send enrollment confirmation email when user enables daily reminders
 */
export async function sendEnrollmentEmail(
  email: string,
  firstName: string,
  toolName: string,
  data?: EnrollmentEmailData
) {
  try {
    const { subject, html } = buildEnrollmentEmailHtml(
      firstName,
      toolName,
      data
    );

    const info = await sendMailWithRetry({
      from: getSmtpFromHeader(),
      to: email,
      subject,
      html,
    });

    console.log('Enrollment email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Enrollment email service error:', error);
    return { success: false, error };
  }
}

/**
 * Short confirmation when the user saves their shared notification email from
 * Settings (no toolType) — does not imply Document Vault / tool enrollment.
 */
export function buildNotificationPreferencesSavedEmailHtml(
  email: string,
  firstName: string
): string {
  const esc = (s: string) =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  const dashSettings =
    (
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'https://www.trackmyopt.com'
    ).replace(/\/$/, '') + '/dashboard/settings?tab=notifications';
  const greeting = esc(
    firstName && firstName.trim() ? firstName.trim() : 'there'
  );
  const safeEmail = esc(email.trim());
  return buildTransactionalEmail({
    headerTitle: 'Notification email saved',
    bodyHtml: `
${emailBodySectionOpen()}
${emailTextP(`Hi <strong>${greeting}</strong>,`)}
${emailTextP('We saved this address for your <strong>notification email</strong>:')}
${emailTextP(`<span class="tmo-force-link" style="color:${EMAIL.link} !important;font-weight:600;word-break:break-all;">${safeEmail}</span>`)}
${emailTextP(
  'You may receive case updates, document reminders (when you use those features), and other messages you opt into at this address.'
)}
${emailPrimaryButton(dashSettings, 'Notification settings')}
${emailTextMuted('Questions? <a href="mailto:support@trackmyopt.com" class="tmo-force-link" style="color:#2563EB !important;">support@trackmyopt.com</a>')}
${emailBodySectionClose()}`,
  });
}

export async function sendNotificationPreferencesSavedEmail(
  email: string,
  firstName: string
) {
  try {
    const dashSettings =
      (
        process.env.NEXT_PUBLIC_SITE_URL ||
        process.env.NEXT_PUBLIC_APP_URL ||
        'https://www.trackmyopt.com'
      ).replace(/\/$/, '') + '/dashboard/settings?tab=notifications';
    const info = await sendMailWithRetry({
      from: getSmtpFromHeader(),
      to: email,
      subject: 'Your TrackMyOPT notification email is saved',
      text: `Hi ${firstName && firstName.trim() ? firstName.trim() : 'there'},

We saved this address for TrackMyOPT notifications: ${email.trim()}

You'll receive important updates, case and document reminders (when enabled), and other messages you opt into at this address.

Manage preferences anytime:
${dashSettings}

— TrackMyOPT
support@trackmyopt.com`,
      html: buildNotificationPreferencesSavedEmailHtml(email, firstName),
    });
    console.log('Notification preferences confirmation sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('sendNotificationPreferencesSavedEmail error:', error);
    return { success: false, error };
  }
}

/**
 * Send welcome email to new premium user (email_queue + SMTP; deduped per user via premium_welcome).
 */
export async function sendPremiumWelcomeEmail(
  userId: string,
  email: string,
  name: string
) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const result = await sendPremiumWelcomeQueuedEmail({
      supabase,
      userId,
      toEmail: email,
      firstName: name,
    });
    if (result.ok) {
      if (result.skipped === false) {
        console.log('Premium welcome email queued/sent:', result.queueId);
        return { success: true, messageId: result.queueId };
      }
      console.log('Premium welcome skipped:', result.skipped);
      return { success: true, messageId: 'skipped' };
    }
    return {
      success: false,
      error: 'error' in result ? result.error : undefined,
    };
  } catch (error) {
    console.error('Premium welcome email service error:', error);
    return { success: false, error };
  }
}

/**
 * Send email change notification
 */
export function buildEmailChangeNotificationHtml(): string {
  return buildTransactionalEmail({
    headerTitle: 'Email address updated',
    bodyHtml: `
${emailBodySectionOpen()}
${emailTextP('Hello,')}
${emailTextP('Your email address for TrackMyOPT was recently updated to this address.')}
${emailTextP('If you did not make this change, please <a href="mailto:support@trackmyopt.com">contact support immediately</a>.')}
${emailTextMuted('&mdash; TrackMyOPT Team')}
${emailBodySectionClose()}`,
  });
}

export async function sendEmailChangeNotification(
  userId: string,
  email: string
) {
  try {
    const info = await sendMailWithRetry({
      from: getSmtpFromHeader(),
      to: email,
      subject: 'Your email address was updated',
      html: buildEmailChangeNotificationHtml(),
    });

    console.log('Email change notification sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email change notification error:', error);
    return { success: false, error };
  }
}
