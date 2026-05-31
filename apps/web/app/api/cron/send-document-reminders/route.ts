/**
 * Document Reminder Cron Job
 * 
 * Checks for reminders due today and sends email notifications
 * Triggered daily by cron-job.org at 9 AM EST
 * 
 * Setup on cron-job.org:
 * - URL: https://www.trackmyopt.com/api/cron/send-document-reminders
 * - Schedule: Daily at 9:00 AM EST (14:00 UTC)
 * - Method: GET
 * - Headers: Authorization: Bearer YOUR_CRON_SECRET
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import { getSmtpFromHeader } from '@/lib/notifications/email-smtp';
import { buildDocumentExpiryReminderEmail } from '@/lib/notifications/document-expiry-email';
import { sanitizeError, secureLog, logIdPrefix } from '@/lib/secure-logger';

// Create SMTP transporter for Hostinger
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Type definitions for reminder with document
interface DocumentData {
  filename: string;
  expiry_date: string;
  document_type: string;
}

interface ReminderWithDocument {
  id: string;
  user_id: string;
  document_id: string;
  reminder_message: string;
  reminder_type: string;
  document: DocumentData;
}

export async function GET(request: NextRequest) {

  try {
    // Security: Verify cron secret
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

    if (authHeader !== expectedAuth) {
      secureLog.warn('Unauthorized cron request (send-document-reminders)');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use service role client for database access
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get today's date (start and end)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.toISOString();

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const todayEnd = tomorrow.toISOString();


    // Query reminders due today that haven't been sent
    const { data: reminders, error: queryError } = await supabase
      .from('document_reminders')
      .select(`
        id,
        user_id,
        document_id,
        reminder_message,
        reminder_type,
        document:documents (
          filename,
          expiry_date,
          document_type
        )
      `)
      .eq('status', 'pending')
      .gte('send_at', todayStart)
      .lt('send_at', todayEnd);

    if (queryError) {
      secureLog.error('Database query error (document reminders):', sanitizeError(queryError));
      throw queryError;
    }


    if (!reminders || reminders.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No reminders to send today',
        sent: 0,
      });
    }

    // Process each reminder
    let sentCount = 0;
    let failedCount = 0;

    for (const reminder of (reminders as unknown as ReminderWithDocument[])) {
      try {
        // Get user email
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(reminder.user_id);

        if (userError || !userData?.user?.email) {
          secureLog.error(`Could not get user email for ${logIdPrefix(reminder.user_id)}`);
          failedCount++;
          continue;
        }

        const userEmail = userData.user.email;

        // Check if user is premium - only premium users get document reminder emails
        const { data: profile } = await supabase
          .from('profiles')
          .select('premium_status')
          .eq('user_id', reminder.user_id)
          .single();

        if (!profile?.premium_status) {
          secureLog.info(`Skipping document reminder for ${logIdPrefix(reminder.user_id)} — not premium`);
          // Mark as skipped for non-premium users
          await supabase
            .from('document_reminders')
            .update({ status: 'skipped' })
            .eq('id', reminder.id);
          continue;
        }

        // Check if user has email notifications enabled
        const { data: emailPrefs } = await supabase
          .from('email_preferences')
          .select('document_reminders_enabled')
          .eq('user_id', reminder.user_id)
          .single();

        if (emailPrefs && !emailPrefs.document_reminders_enabled) {

          // Mark as cancelled
          await supabase
            .from('document_reminders')
            .update({ status: 'cancelled' })
            .eq('id', reminder.id);

          continue;
        }

        // Format document type for subject with Title Case
        const subjectDocType = reminder.document.document_type
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());

        // Send email via SMTP
        try {
          await transporter.sendMail({
            from: getSmtpFromHeader(),
            to: userEmail,
            subject: `⏰ Document Expiring Soon: ${subjectDocType}`,
            html: buildDocumentExpiryReminderEmail(reminder.document),
          });
        } catch (emailError) {
          secureLog.error('Email send error (document reminder):', {
            user: logIdPrefix(reminder.user_id),
            err: sanitizeError(emailError),
          });

          // Mark as failed
          await supabase
            .from('document_reminders')
            .update({
              status: 'failed',
              sent_at: new Date().toISOString()
            })
            .eq('id', reminder.id);

          failedCount++;
          continue;
        }

        // Mark as sent
        await supabase
          .from('document_reminders')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            email_sent: true
          })
          .eq('id', reminder.id);

        sentCount++;

      } catch (error) {
        secureLog.error(`Error processing reminder ${logIdPrefix(reminder.id)}:`, sanitizeError(error));
        failedCount++;
      }
    }


    return NextResponse.json({
      success: true,
      message: 'Reminder emails processed',
      sent: sentCount,
      failed: failedCount,
      total: reminders.length,
    });

  } catch (error) {
    secureLog.error('Cron job error (send-document-reminders):', sanitizeError(error));

    return NextResponse.json(
      { error: 'Cron job failed' },
      { status: 500 }
    );
  }
}

// Configure response caching
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

