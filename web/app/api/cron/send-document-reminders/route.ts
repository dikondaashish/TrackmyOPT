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
      console.error('❌ Unauthorized cron request');
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
      console.error('❌ Database query error:', queryError);
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
          console.error(`❌ Could not get user email for ${reminder.user_id}`);
          failedCount++;
          continue;
        }

        const userEmail = userData.user.email;

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

        // Send email via SMTP
        try {
          await transporter.sendMail({
            from: `Zyene Inc <${process.env.SMTP_USER || 'no-reply@trackmyopt.com'}>`,
            to: userEmail,
            subject: `⏰ Document Expiring Soon: ${reminder.document.filename}`,
            html: generateReminderEmail(reminder),
          });
        } catch (emailError) {
          console.error(`❌ Email send error for ${userEmail}:`, emailError);
          
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
        console.error(`❌ Error processing reminder ${reminder.id}:`, error);
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
    console.error('❌ Cron job error:', error);
    
    return NextResponse.json(
      { 
        error: 'Cron job failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function generateReminderEmail(reminder: ReminderWithDocument): string {
  const doc = reminder.document;
  const expiryDate = new Date(doc.expiry_date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const daysUntilExpiry = Math.ceil(
    (new Date(doc.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  // Determine urgency based on days remaining
  let urgencyColor: string;
  let urgencyLabel: string;
  let headerEmoji: string;
  
  if (daysUntilExpiry <= 0) {
    urgencyColor = '#dc2626';
    urgencyLabel = '⚠️ EXPIRES TODAY';
    headerEmoji = '🚨';
  } else if (daysUntilExpiry <= 5) {
    urgencyColor = '#dc2626';
    urgencyLabel = 'CRITICAL';
    headerEmoji = '🚨';
  } else if (daysUntilExpiry <= 10) {
    urgencyColor = '#ea580c';
    urgencyLabel = 'URGENT';
    headerEmoji = '⚠️';
  } else if (daysUntilExpiry <= 20) {
    urgencyColor = '#d97706';
    urgencyLabel = 'IMPORTANT';
    headerEmoji = '📢';
  } else if (daysUntilExpiry <= 30) {
    urgencyColor = '#ca8a04';
    urgencyLabel = 'ATTENTION';
    headerEmoji = '📅';
  } else {
    urgencyColor = '#2563eb';
    urgencyLabel = 'REMINDER';
    headerEmoji = '📋';
  }

  const daysText = daysUntilExpiry <= 0 ? 'TODAY' : daysUntilExpiry === 1 ? '1 day' : `${daysUntilExpiry} days`;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); padding: 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">${headerEmoji} Document Expiry Alert</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Action Required</p>
                  </td>
                </tr>

                <!-- Urgency Badge -->
                <tr>
                  <td style="padding: 24px 30px 0 30px; text-align: center;">
                    <div style="display: inline-block; background-color: ${urgencyColor}; color: #ffffff; padding: 10px 24px; border-radius: 24px; font-weight: 700; font-size: 13px; letter-spacing: 0.5px;">
                      ${urgencyLabel}
                    </div>
                  </td>
                </tr>

                <!-- Main Content -->
                <tr>
                  <td style="padding: 24px 30px 30px 30px;">
                    <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 22px; text-align: center;">
                      ${daysUntilExpiry <= 0 ? 'Your document expires today!' : `Your document expires in ${daysText}!`}
                    </h2>
                    
                    <!-- Document Details Card -->
                    <div style="background-color: #f9fafb; border-radius: 12px; padding: 24px; margin: 20px 0; border: 1px solid #e5e7eb;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding-bottom: 16px; border-bottom: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Document Name</p>
                            <p style="margin: 0; color: #1f2937; font-size: 18px; font-weight: 600;">${doc.filename}</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 16px 0; border-bottom: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Document Type</p>
                            <p style="margin: 0; color: #1f2937; font-size: 16px; text-transform: capitalize;">${doc.document_type.replace('_', ' ')}</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 16px 0; border-bottom: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Expiry Date</p>
                            <p style="margin: 0; color: ${urgencyColor}; font-size: 18px; font-weight: 700;">${expiryDate}</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding-top: 16px;">
                            <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Time Remaining</p>
                            <p style="margin: 0; color: ${urgencyColor}; font-size: 28px; font-weight: 800;">${daysText}</p>
                          </td>
                        </tr>
                      </table>
                    </div>

                    <!-- Action Required Box -->
                    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px 20px; border-radius: 4px; margin: 20px 0;">
                      <p style="margin: 0 0 8px 0; color: #92400e; font-weight: 600; font-size: 15px;">📌 What you should do:</p>
                      <ul style="margin: 0; padding: 0 0 0 20px; color: #78350f; font-size: 14px; line-height: 1.8;">
                        <li>If you haven't renewed yet, please renew this document soon</li>
                        <li>If you've already renewed, <strong>update the expiry date</strong> in your Document Vault to stop receiving these reminders</li>
                      </ul>
                    </div>

                    <!-- CTA Buttons -->
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="https://www.trackmyopt.com/dashboard/documents" 
                         style="display: inline-block; background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; padding: 16px 36px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);">
                        View Document in Vault →
                      </a>
                    </div>

                    <p style="color: #6b7280; font-size: 13px; text-align: center; margin: 20px 0 0 0; line-height: 1.6;">
                      Keep your documents up to date to stay compliant with immigration requirements.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f9fafb; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 12px; margin: 0 0 12px 0;">
                      You're receiving this email because you have document reminders enabled.
                    </p>
                    <p style="color: #6b7280; font-size: 12px; margin: 0;">
                      <a href="https://www.trackmyopt.com/dashboard/settings" style="color: #06b6d4; text-decoration: none; font-weight: 500;">Manage Preferences</a>
                      <span style="color: #d1d5db; margin: 0 8px;">|</span>
                      <a href="https://www.trackmyopt.com/dashboard/documents" style="color: #06b6d4; text-decoration: none; font-weight: 500;">View All Documents</a>
                    </p>
                    <p style="color: #9ca3af; font-size: 11px; margin: 16px 0 0 0;">
                      © ${new Date().getFullYear()} Zyene, Inc. All rights reserved.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

// Configure response caching
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

