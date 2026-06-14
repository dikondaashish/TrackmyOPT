import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import { getSmtpFromHeader } from '@/lib/notifications/email-smtp';
import { sanitizeError } from '@/lib/secure-logger';

export const dynamic = 'force-dynamic';

/**
 * Admin Bulk Notification API
 * 
 * POST /api/admin/bulk-notification
 * 
 * Used for:
 * - Policy change notifications
 * - Ownership transfer notifications
 * - Data breach notifications
 * - Service announcements
 * 
 * Security: Requires ADMIN_SECRET in Authorization header
 */

interface BulkNotificationRequest {
  type: 'policy_change' | 'ownership_transfer' | 'data_breach' | 'service_announcement';
  subject: string;
  htmlContent: string;
  plainTextContent: string;
  requiresConsent?: boolean; // For policy changes requiring active consent
}

// Create SMTP transporter
const createTransporter = () => nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
});

export async function POST(request: NextRequest) {
  try {
    // Verify admin authorization
    const authHeader = request.headers.get('Authorization');
    const adminSecret = process.env.ADMIN_SECRET;

    if (!adminSecret || authHeader !== `Bearer ${adminSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: BulkNotificationRequest = await request.json();
    const { type, subject, htmlContent, plainTextContent, requiresConsent } = body;

    if (!type || !subject || !htmlContent) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get all users with email preferences
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get all user emails from profiles
    const { data: users, error: usersError } = await supabaseAdmin
      .from('profiles')
      .select('user_id, email, first_name')
      .not('email', 'is', null);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ message: 'No users to notify', sent: 0 });
    }

    // Fetch opted-out user IDs from email_preferences.
    // policy_change, ownership_transfer, data_breach are mandatory (legal/safety), so
    // opt-out is only respected for service_announcement type.
    let optedOutUserIds = new Set<string>();
    if (type === 'service_announcement') {
      const { data: optOuts } = await supabaseAdmin
        .from('email_preferences')
        .select('user_id')
        .eq('marketing_emails', false);
      optedOutUserIds = new Set((optOuts || []).map((r: { user_id: string }) => r.user_id));
    }

    const eligibleUsers = type === 'service_announcement'
      ? users.filter(u => !optedOutUserIds.has(u.user_id))
      : users;

    // Send emails in batches
    const transporter = createTransporter();
    const batchSize = 50;
    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (let i = 0; i < eligibleUsers.length; i += batchSize) {
      const batch = eligibleUsers.slice(i, i + batchSize);

      // Simple HTML escape function to prevent XSS
      const escapeHtml = (unsafe: string) => {
        return unsafe
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
      };

      await Promise.all(batch.map(async (user) => {
        try {
          const safeFirstName = escapeHtml(user.first_name || 'there');
          const safeEmail = escapeHtml(user.email || '');
          const userId = user.user_id; // UUIDs are generally safe, but could escape if wanted

          const personalizedHtml = htmlContent
            .replace('{{firstName}}', safeFirstName)
            .replace('{{email}}', safeEmail)
            .replace('{{userId}}', userId);

          const personalizedText = plainTextContent
            .replace('{{firstName}}', user.first_name || 'there') // Text email doesn't need HTML escaping
            .replace('{{email}}', user.email || '');

          await transporter.sendMail({
            from: getSmtpFromHeader(),
            to: user.email,
            subject: subject,
            html: personalizedHtml,
            text: personalizedText,
          });

          sent++;

          // Log the notification in email_queue for audit
          await supabaseAdmin.from('email_queue').insert({
            user_id: user.user_id,
            email_address: user.email,
            email_type: type,
            email_subject: subject,
            status: 'sent',
            sent_at: new Date().toISOString(),
          });

        } catch (error) {
          failed++;
          errors.push(`Failed to send to ${user.email}: ${(error as Error).message}`);
        }
      }));

      // Small delay between batches to avoid rate limiting
      if (i + batchSize < eligibleUsers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    transporter.close();

    // Log the bulk notification event
    console.log(`Bulk notification (${type}): Sent ${sent}, Failed ${failed}`);

    return NextResponse.json({
      success: true,
      type,
      totalUsers: users.length,
      eligible: eligibleUsers.length,
      skippedOptOut: users.length - eligibleUsers.length,
      sent,
      failed,
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
      requiresConsent,
    });

  } catch (error) {
    console.error('Bulk notification error:', sanitizeError(error));
    return NextResponse.json(
      { error: 'Failed to send bulk notification' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/bulk-notification
 * 
 * Returns email templates for common notification types
 */
export async function GET(request: NextRequest) {
  // Verify admin authorization
  const authHeader = request.headers.get('Authorization');
  const adminSecret = process.env.ADMIN_SECRET;

  if (!adminSecret || authHeader !== `Bearer ${adminSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const templates = {
    policy_change: {
      subject: 'Important: TrackMyOPT Privacy Policy Update',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1a1a1a;">Privacy Policy Update</h1>
          <p>Hi {{firstName}},</p>
          <p>We've updated our Privacy Policy to better protect your data and comply with regulations.</p>
          <h3>Summary of Changes:</h3>
          <ul>
            <li>[Change 1]</li>
            <li>[Change 2]</li>
          </ul>
          <p>These changes take effect on [DATE].</p>
          <p><a href="https://www.trackmyopt.com/privacy" style="color: #007AFF;">Read the full Privacy Policy</a></p>
          <p>If you have questions, contact us at support@trackmyopt.com</p>
          <p>Best regards,<br/>The TrackMyOPT Team<br/>Zyene, Inc.</p>
        </body>
        </html>
      `,
      plainTextContent: `Hi {{firstName}}, We've updated our Privacy Policy. Visit https://www.trackmyopt.com/privacy to read the changes.`,
    },
    ownership_transfer: {
      subject: 'Important Notice: TrackMyOPT Ownership Change',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1a1a1a;">Ownership Transfer Notice</h1>
          <p>Hi {{firstName}},</p>
          <p>We're writing to inform you that TrackMyOPT (Zyene, Inc.) will be transferring ownership to [NEW OWNER].</p>
          <h3>What This Means For You:</h3>
          <ul>
            <li>Your data will be transferred to the new owner</li>
            <li>The new owner agrees to our current Privacy Policy terms</li>
            <li>You have until [DATE] to delete your account if you prefer</li>
          </ul>
          <p><a href="https://www.trackmyopt.com/dashboard/settings" style="background: #DC2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Delete My Account Before Transfer</a></p>
          <p>If you have questions, contact us at support@trackmyopt.com</p>
          <p>Best regards,<br/>The TrackMyOPT Team<br/>Zyene, Inc.</p>
        </body>
        </html>
      `,
      plainTextContent: `Hi {{firstName}}, TrackMyOPT ownership is being transferred. Visit https://www.trackmyopt.com/dashboard/settings to delete your account before transfer if you prefer.`,
    },
    data_breach: {
      subject: 'Security Notice: TrackMyOPT Data Incident',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #DC2626;">Security Incident Notification</h1>
          <p>Hi {{firstName}},</p>
          <p>We are writing to inform you of a security incident that may have affected your data.</p>
          <h3>What Happened:</h3>
          <p>[Description of incident]</p>
          <h3>What Data Was Affected:</h3>
          <ul>
            <li>[List affected data types]</li>
          </ul>
          <h3>What We're Doing:</h3>
          <ul>
            <li>[Steps being taken]</li>
          </ul>
          <h3>What You Should Do:</h3>
          <ul>
            <li>Change your password if you use the same password elsewhere</li>
            <li>Monitor your accounts for suspicious activity</li>
          </ul>
          <p>We sincerely apologize for this incident. Contact us at support@trackmyopt.com with any questions.</p>
          <p>Best regards,<br/>The TrackMyOPT Team<br/>Zyene, Inc.</p>
        </body>
        </html>
      `,
      plainTextContent: `SECURITY NOTICE: Hi {{firstName}}, We're informing you of a security incident. Please contact support@trackmyopt.com for details.`,
    },
  };

  return NextResponse.json({ templates });
}
