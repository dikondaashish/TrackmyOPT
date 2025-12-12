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
            subject: `Document Expiring Soon: ${reminder.document.filename}`,
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

  const today = new Date().toLocaleString('en-US', { 
    timeZone: 'America/New_York',
    year: 'numeric', month: 'long', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true
  });

  const daysUntilExpiry = Math.ceil(
    (new Date(doc.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  // Format document type nicely
  const documentType = doc.document_type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  // Determine urgency based on days remaining
  let urgencyColor: string;
  let urgencyBg: string;
  let urgencyLabel: string;
  let headerEmoji: string;
  let actionMessage: string;
  
  if (daysUntilExpiry <= 0) {
    urgencyColor = '#dc2626';
    urgencyBg = '#FEF2F2';
    urgencyLabel = 'EXPIRES TODAY';
    headerEmoji = 'CRITICAL';
    actionMessage = 'Your document has expired or expires today! Take immediate action to renew it.';
  } else if (daysUntilExpiry <= 3) {
    urgencyColor = '#dc2626';
    urgencyBg = '#FEF2F2';
    urgencyLabel = 'CRITICAL - EXPIRING VERY SOON';
    headerEmoji = 'CRITICAL';
    actionMessage = 'This is your final reminder! Renew this document immediately to avoid any issues.';
  } else if (daysUntilExpiry <= 5) {
    urgencyColor = '#dc2626';
    urgencyBg = '#FEF2F2';
    urgencyLabel = 'CRITICAL';
    headerEmoji = 'CRITICAL';
    actionMessage = 'Time is running out! Schedule your renewal appointment today.';
  } else if (daysUntilExpiry <= 10) {
    urgencyColor = '#ea580c';
    urgencyBg = '#FFF7ED';
    urgencyLabel = 'URGENT';
    headerEmoji = 'WARNING';
    actionMessage = 'Your document expires soon. Start the renewal process now to avoid last-minute rush.';
  } else if (daysUntilExpiry <= 20) {
    urgencyColor = '#d97706';
    urgencyBg = '#FFFBEB';
    urgencyLabel = 'IMPORTANT';
    headerEmoji = 'NOTICE';
    actionMessage = 'Plan ahead! Begin gathering required documents for your renewal.';
  } else if (daysUntilExpiry <= 30) {
    urgencyColor = '#ca8a04';
    urgencyBg = '#FEFCE8';
    urgencyLabel = 'ATTENTION';
    headerEmoji = 'REMINDER';
    actionMessage = 'You have about a month left. Good time to check renewal requirements.';
  } else if (daysUntilExpiry <= 45) {
    urgencyColor = '#0891b2';
    urgencyBg = '#ECFEFF';
    urgencyLabel = 'UPCOMING';
    headerEmoji = 'INFO';
    actionMessage = 'Still plenty of time, but it\'s good to plan ahead for your document renewal.';
  } else {
    urgencyColor = '#2563eb';
    urgencyBg = '#EFF6FF';
    urgencyLabel = 'ADVANCE NOTICE';
    headerEmoji = 'INFO';
    actionMessage = 'This is an early reminder. Mark your calendar for the renewal date.';
  }

  const daysText = daysUntilExpiry <= 0 ? 'TODAY' : daysUntilExpiry === 1 ? '1 day' : `${daysUntilExpiry} days`;

  // Get document-specific renewal tips
  const renewalTips = getDocumentRenewalTips(doc.document_type);

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
                    <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Your ${documentType} Needs Attention</p>
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
                      ${daysUntilExpiry <= 0 ? `Your ${documentType} expires today!` : `Your ${documentType} expires in ${daysText}!`}
                    </h2>
                    
                    <!-- Document Details Card -->
                    <div style="background-color: ${urgencyBg}; border-radius: 12px; padding: 24px; margin: 20px 0; border: 1px solid #e5e7eb;">
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
                            <p style="margin: 0; color: #1f2937; font-size: 16px;">${documentType}</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 16px 0; border-bottom: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Expiry Date</p>
                            <p style="margin: 0; color: ${urgencyColor}; font-size: 18px; font-weight: 700;">${expiryDate}</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 16px 0; border-bottom: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Time Remaining</p>
                            <p style="margin: 0; color: ${urgencyColor}; font-size: 28px; font-weight: 800;">${daysText}</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding-top: 16px;">
                            <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Today (ET)</p>
                            <p style="margin: 0; color: #6b7280; font-size: 14px;">${today}</p>
                          </td>
                        </tr>
                      </table>
                    </div>

                    <!-- Action Message -->
                    <div style="background-color: ${urgencyBg}; border-left: 4px solid ${urgencyColor}; padding: 16px 20px; border-radius: 4px; margin: 20px 0;">
                      <p style="margin: 0; color: #1f2937; font-size: 15px; line-height: 1.6;">
                        ${actionMessage}
                      </p>
                    </div>

                    <!-- Document-Specific Renewal Tips -->
                    ${renewalTips}

                    <!-- Why You're Receiving This -->
                    <div style="background-color: #EFF6FF; border-radius: 8px; padding: 16px 20px; margin: 20px 0;">
                      <p style="margin: 0 0 8px 0; color: #1E40AF; font-weight: 600; font-size: 14px;">Why am I receiving this email?</p>
                      <p style="margin: 0; color: #374151; font-size: 13px; line-height: 1.6;">
                        You added your <strong>${documentType}</strong> to your Document Vault with an expiry date of <strong>${expiryDate}</strong>. 
                        We send reminders at 60, 45, 30, 20, 15, 10, 5, 3, 2, and 1 day before expiry to help you stay on top of your documents.
                      </p>
                    </div>

                    <!-- Already Renewed Section -->
                    <div style="background-color: #ECFDF5; border-radius: 8px; padding: 16px 20px; margin: 20px 0;">
                      <p style="margin: 0 0 8px 0; color: #065F46; font-weight: 600; font-size: 14px;">Already renewed this document?</p>
                      <p style="margin: 0; color: #374151; font-size: 13px; line-height: 1.6;">
                        Great! Simply update the expiry date in your Document Vault and you won't receive any more reminders for this document.
                      </p>
                    </div>

                    <!-- CTA Buttons -->
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="https://www.trackmyopt.com/dashboard/documents" 
                         style="display: inline-block; background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; padding: 16px 36px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);">
                        View & Update Document →
                      </a>
                    </div>

                    <p style="color: #6b7280; font-size: 13px; text-align: center; margin: 20px 0 0 0; line-height: 1.6;">
                      Keep your documents up to date to stay compliant with immigration requirements.
                    </p>
                  </td>
                </tr>

                <!-- Reminder Schedule Info -->
                <tr>
                  <td style="padding: 0 30px 24px 30px;">
                    <div style="background-color: #F5F3FF; border-radius: 8px; padding: 16px 20px;">
                      <p style="margin: 0 0 8px 0; color: #5B21B6; font-weight: 600; font-size: 14px;">Reminder Schedule</p>
                      <p style="margin: 0; color: #374151; font-size: 12px; line-height: 1.6;">
                        We'll remind you at: <strong>60 days</strong> → <strong>45 days</strong> → <strong>30 days</strong> → <strong>20 days</strong> → <strong>15 days</strong> → <strong>10 days</strong> → <strong>5 days</strong> → <strong>3 days</strong> → <strong>2 days</strong> → <strong>1 day</strong> before expiry
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f9fafb; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 12px; margin: 0 0 12px 0;">
                      You're receiving this email because you have document reminders enabled.
                    </p>
                    <p style="color: #6b7280; font-size: 12px; margin: 0;">
                      <a href="https://www.trackmyopt.com/dashboard/settings?tab=notifications" style="color: #06b6d4; text-decoration: none; font-weight: 500;">Manage Email Preferences</a>
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

/**
 * Get document-specific renewal tips based on document type
 */
function getDocumentRenewalTips(documentType: string): string {
  const type = documentType.toLowerCase();
  
  if (type.includes('passport')) {
    return `
      <div style="background-color: #FEF3C7; border-radius: 8px; padding: 16px 20px; margin: 20px 0;">
        <p style="margin: 0 0 12px 0; color: #92400E; font-weight: 600; font-size: 14px;">Passport Renewal Tips:</p>
        <ul style="margin: 0; padding: 0 0 0 20px; color: #78350F; font-size: 13px; line-height: 1.8;">
          <li>Start the renewal process at least <strong>3-4 months</strong> before expiry for international travel</li>
          <li>Many countries require <strong>6 months validity</strong> beyond your travel dates</li>
          <li>You may need to update your visa if your passport number changes</li>
          <li>Expedited processing is available for urgent travel needs</li>
        </ul>
      </div>
    `;
  }
  
  if (type.includes('visa') || type.includes('i-94')) {
    return `
      <div style="background-color: #FEF3C7; border-radius: 8px; padding: 16px 20px; margin: 20px 0;">
        <p style="margin: 0 0 12px 0; color: #92400E; font-weight: 600; font-size: 14px;">Visa/Immigration Document Tips:</p>
        <ul style="margin: 0; padding: 0 0 0 20px; color: #78350F; font-size: 13px; line-height: 1.8;">
          <li>Consult with your DSO or immigration attorney before expiry</li>
          <li>Check USCIS processing times for visa extensions</li>
          <li>Maintain valid status - don't let your visa expire without action</li>
          <li>Keep copies of all immigration documents</li>
        </ul>
      </div>
    `;
  }
  
  if (type.includes('ead') || type.includes('employment') || type.includes('work')) {
    return `
      <div style="background-color: #FEF3C7; border-radius: 8px; padding: 16px 20px; margin: 20px 0;">
        <p style="margin: 0 0 12px 0; color: #92400E; font-weight: 600; font-size: 14px;">EAD/Work Authorization Tips:</p>
        <ul style="margin: 0; padding: 0 0 0 20px; color: #78350F; font-size: 13px; line-height: 1.8;">
          <li>Apply for renewal <strong>up to 180 days</strong> before expiration</li>
          <li>You may qualify for automatic extension while renewal is pending</li>
          <li>Notify your employer about upcoming expiration</li>
          <li>Update the SEVP Portal with any employment changes</li>
        </ul>
      </div>
    `;
  }
  
  if (type.includes('driver') || type.includes('license') || type.includes('driving')) {
    return `
      <div style="background-color: #FEF3C7; border-radius: 8px; padding: 16px 20px; margin: 20px 0;">
        <p style="margin: 0 0 12px 0; color: #92400E; font-weight: 600; font-size: 14px;">Driver's License Renewal Tips:</p>
        <ul style="margin: 0; padding: 0 0 0 20px; color: #78350F; font-size: 13px; line-height: 1.8;">
          <li>Check your state's DMV for online renewal options</li>
          <li>Bring valid immigration documents for REAL ID compliance</li>
          <li>Your license expiration may be tied to your immigration status</li>
          <li>Schedule DMV appointments early to avoid long wait times</li>
        </ul>
      </div>
    `;
  }
  
  if (type.includes('i-20')) {
    return `
      <div style="background-color: #FEF3C7; border-radius: 8px; padding: 16px 20px; margin: 20px 0;">
        <p style="margin: 0 0 12px 0; color: #92400E; font-weight: 600; font-size: 14px;">I-20 Tips:</p>
        <ul style="margin: 0; padding: 0 0 0 20px; color: #78350F; font-size: 13px; line-height: 1.8;">
          <li>Contact your DSO for I-20 extension if still in program</li>
          <li>Request travel signature if planning international travel</li>
          <li>Keep all previous I-20s - they're part of your immigration history</li>
          <li>Ensure SEVIS record is active and up-to-date</li>
        </ul>
      </div>
    `;
  }
  
  if (type.includes('insurance') || type.includes('health')) {
    return `
      <div style="background-color: #FEF3C7; border-radius: 8px; padding: 16px 20px; margin: 20px 0;">
        <p style="margin: 0 0 12px 0; color: #92400E; font-weight: 600; font-size: 14px;">Insurance Document Tips:</p>
        <ul style="margin: 0; padding: 0 0 0 20px; color: #78350F; font-size: 13px; line-height: 1.8;">
          <li>Review your coverage options before renewal</li>
          <li>Check for open enrollment periods</li>
          <li>Compare plans to ensure you have adequate coverage</li>
          <li>Don't let coverage lapse - maintain continuous insurance</li>
        </ul>
      </div>
    `;
  }
  
  // Default tips for other document types
  return `
    <div style="background-color: #FEF3C7; border-radius: 8px; padding: 16px 20px; margin: 20px 0;">
      <p style="margin: 0 0 12px 0; color: #92400E; font-weight: 600; font-size: 14px;">Renewal Tips:</p>
      <ul style="margin: 0; padding: 0 0 0 20px; color: #78350F; font-size: 13px; line-height: 1.8;">
        <li>Start the renewal process well in advance of the expiry date</li>
        <li>Gather all required supporting documents</li>
        <li>Check for any changes in renewal requirements or procedures</li>
        <li>Keep a copy of your expired document for your records</li>
      </ul>
    </div>
  `;
}

// Configure response caching
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

