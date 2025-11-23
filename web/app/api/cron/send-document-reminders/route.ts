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
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Type definitions for reminder with document
interface DocumentData {
  file_name: string;
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
  console.log('🔔 Document Reminder Cron: Starting...');
  
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

    console.log(`📅 Checking reminders for ${today.toDateString()}`);

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
          file_name,
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

    console.log(`📬 Found ${reminders?.length || 0} reminders to send`);

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
          console.log(`⏭️  User ${userEmail} has document reminders disabled`);
          
          // Mark as cancelled
          await supabase
            .from('document_reminders')
            .update({ status: 'cancelled' })
            .eq('id', reminder.id);
          
          continue;
        }

        // Send email
        console.log(`📧 Sending reminder to ${userEmail}`);
        
        const { error: emailError } = await resend.emails.send({
          from: 'TrackMyOPT <notifications@trackmyopt.com>',
          to: userEmail,
          subject: `⏰ Document Expiring Soon: ${reminder.document.file_name}`,
          html: generateReminderEmail(reminder),
        });

        if (emailError) {
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
        console.log(`✅ Reminder sent to ${userEmail}`);

      } catch (error) {
        console.error(`❌ Error processing reminder ${reminder.id}:`, error);
        failedCount++;
      }
    }

    console.log(`✅ Cron job complete: ${sentCount} sent, ${failedCount} failed`);

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

  const urgencyColor = daysUntilExpiry <= 7 ? '#ef4444' : daysUntilExpiry <= 30 ? '#f97316' : '#eab308';
  const urgencyLabel = daysUntilExpiry <= 7 ? 'CRITICAL' : daysUntilExpiry <= 30 ? 'URGENT' : 'REMINDER';

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
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); padding: 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px;">⏰ Document Reminder</h1>
                  </td>
                </tr>

                <!-- Urgency Badge -->
                <tr>
                  <td style="padding: 20px; text-align: center;">
                    <div style="display: inline-block; background-color: ${urgencyColor}; color: #ffffff; padding: 8px 16px; border-radius: 20px; font-weight: bold; font-size: 12px;">
                      ${urgencyLabel}
                    </div>
                  </td>
                </tr>

                <!-- Main Content -->
                <tr>
                  <td style="padding: 0 30px 30px 30px;">
                    <h2 style="color: #1f2937; margin-top: 0;">Your document is expiring soon!</h2>
                    
                    <div style="background-color: #f9fafb; border-left: 4px solid ${urgencyColor}; padding: 15px; margin: 20px 0; border-radius: 4px;">
                      <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">Document:</p>
                      <p style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px; font-weight: 600;">${doc.file_name}</p>
                      
                      <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">Document Type:</p>
                      <p style="margin: 0 0 15px 0; color: #1f2937; font-size: 16px; text-transform: capitalize;">${doc.document_type.replace('_', ' ')}</p>
                      
                      <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">Expiry Date:</p>
                      <p style="margin: 0 0 15px 0; color: ${urgencyColor}; font-size: 18px; font-weight: 600;">${expiryDate}</p>
                      
                      <p style="margin: 0; color: #6b7280; font-size: 14px;">Days Remaining:</p>
                      <p style="margin: 0; color: ${urgencyColor}; font-size: 24px; font-weight: bold;">${daysUntilExpiry} days</p>
                    </div>

                    <p style="color: #4b5563; line-height: 1.6; margin: 20px 0;">
                      ${reminder.reminder_message}
                    </p>

                    <p style="color: #4b5563; line-height: 1.6;">
                      Please take action to renew or update this document before it expires to avoid any compliance issues.
                    </p>

                    <!-- CTA Button -->
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="https://www.trackmyopt.com/dashboard/documents" 
                         style="display: inline-block; background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                        View Document in Vault
                      </a>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 12px; margin: 0 0 10px 0;">
                      You're receiving this email because you have document reminders enabled in TrackMyOPT.
                    </p>
                    <p style="color: #6b7280; font-size: 12px; margin: 0;">
                      <a href="https://www.trackmyopt.com/dashboard/settings" style="color: #06b6d4; text-decoration: none;">Manage Email Preferences</a> | 
                      <a href="https://www.trackmyopt.com/dashboard/documents" style="color: #06b6d4; text-decoration: none;">View All Documents</a>
                    </p>
                    <p style="color: #9ca3af; font-size: 11px; margin: 15px 0 0 0;">
                      © 2025 TrackMyOPT. All rights reserved.
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

