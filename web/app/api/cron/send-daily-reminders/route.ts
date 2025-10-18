/**
 * Daily Email Reminder Cron Job
 * 
 * This endpoint is called by Vercel Cron daily at 9:00 AM EST
 * It sends personalized email reminders to all premium users
 * 
 * Schedule: 0 13 * * * (1:00 PM UTC = 9:00 AM EST)
 * 
 * Security: Protected by CRON_SECRET environment variable
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendDailyReminder, type EmailReminderData } from '@/lib/email-service';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max execution time

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET - Send daily reminders to all premium users
 * Called by Vercel Cron or manually for testing
 */
export async function GET(req: NextRequest) {
  const startTime = Date.now();
  
  // Verify cron secret to prevent unauthorized access
  const authHeader = req.headers.get('authorization');
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
  
  if (authHeader !== expectedAuth) {
    console.error('⚠️ Unauthorized cron job attempt');
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    console.log('🚀 Starting daily reminder cron job...');
    console.log(`📅 Time: ${new Date().toISOString()}`);

    // Get all premium users with email enabled
    const { data: premiumUsers, error: usersError } = await supabase
      .from('profiles')
      .select(`
        user_id,
        email,
        first_name,
        last_name
      `)
      .eq('premium_status', true);

    if (usersError) {
      console.error('❌ Error fetching premium users:', usersError);
      return NextResponse.json(
        { error: usersError.message },
        { status: 500 }
      );
    }

    console.log(`👥 Found ${premiumUsers?.length || 0} premium users`);

    const results = {
      total: premiumUsers?.length || 0,
      sent: 0,
      skipped: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Process each user
    for (const user of premiumUsers || []) {
      try {
        // Get user's email preferences
        const { data: emailPref } = await supabase
          .from('email_preferences')
          .select('email_address, email_enabled, email_verified')
          .eq('user_id', user.user_id)
          .single();

        // Skip if email not enabled or not verified
        if (!emailPref || !emailPref.email_enabled || !emailPref.email_verified) {
          results.skipped++;
          console.log(`⏭️  Skipped user ${user.user_id}: No verified email`);
          continue;
        }

        // Get user's OPT data
        const { data: optData } = await supabase
          .from('opt_status')
          .select('*')
          .eq('user_id', user.user_id)
          .single();

        if (!optData) {
          results.skipped++;
          console.log(`⏭️  Skipped user ${user.user_id}: No OPT data`);
          continue;
        }

        // Calculate countdowns for each tool
        const tools = [];

        // 1. OPT Filing Window (if program_end_date exists)
        if (optData.program_end_date) {
          const programEnd = new Date(optData.program_end_date);
          const latestEnd = new Date(programEnd);
          latestEnd.setDate(latestEnd.getDate() + 60); // 60 days after program ends
          const daysLeft = Math.ceil((latestEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

          if (daysLeft > 0 && daysLeft <= 150) { // Only send if within 150 days
            tools.push({
              name: 'OPT Filing Window',
              daysLeft,
              endDate: latestEnd.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              }),
              urgency: getUrgency(daysLeft, 150),
              message: getOptFilingMessage(daysLeft),
            });
          }
        }

        // 2. STEM OPT Filing Window (if opt_ead_end_date exists)
        if (optData.opt_ead_end_date) {
          const optEnd = new Date(optData.opt_ead_end_date);
          const daysLeft = Math.ceil((optEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

          if (daysLeft > 0 && daysLeft <= 150) {
            tools.push({
              name: 'STEM OPT Filing Window',
              daysLeft,
              endDate: optEnd.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              }),
              urgency: getUrgency(daysLeft, 150),
              message: getStemFilingMessage(daysLeft),
            });
          }
        }

        // 3. OPT Unemployment Days (if opt_start_date exists)
        if (optData.opt_start_date) {
          const optStart = new Date(optData.opt_start_date);
          const endDate = new Date(optStart);
          endDate.setDate(endDate.getDate() + 90); // 90 unemployment days
          const daysLeft = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

          if (daysLeft > 0 && daysLeft <= 90) {
            tools.push({
              name: 'OPT Unemployment Days',
              daysLeft,
              endDate: endDate.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              }),
              urgency: getUrgency(daysLeft, 90),
              message: getUnemploymentMessage(daysLeft, 90),
            });
          }
        }

        // 4. STEM Unemployment Days (if we have STEM start date)
        // Note: Assuming STEM start is opt_ead_end_date for now
        // Adjust based on your actual schema
        if (optData.opt_ead_end_date) {
          const stemStart = new Date(optData.opt_ead_end_date);
          const endDate = new Date(stemStart);
          endDate.setDate(endDate.getDate() + 60); // 60 STEM unemployment days
          const daysLeft = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

          if (daysLeft > 0 && daysLeft <= 60) {
            tools.push({
              name: 'STEM Unemployment Days',
              daysLeft,
              endDate: endDate.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              }),
              urgency: getUrgency(daysLeft, 60),
              message: getUnemploymentMessage(daysLeft, 60),
            });
          }
        }

        // Skip if no active tools/countdowns
        if (tools.length === 0) {
          results.skipped++;
          console.log(`⏭️  Skipped user ${user.user_id}: No active countdowns`);
          continue;
        }

        // Send email
        const emailData: EmailReminderData = {
          userId: user.user_id,
          userEmail: emailPref.email_address,
          firstName: user.first_name || 'there',
          tools,
        };

        const result = await sendDailyReminder(emailData);

        if (result.success) {
          results.sent++;
          console.log(`✅ Email sent to ${emailPref.email_address}`);

          // Log to email_queue
          await supabase.from('email_queue').insert({
            user_id: user.user_id,
            email_address: emailPref.email_address,
            email_type: 'daily_reminder',
            email_subject: `Daily OPT Reminder - ${tools.length} active countdown${tools.length !== 1 ? 's' : ''}`,
            email_data: tools,
            sent_at: new Date().toISOString(),
            status: 'sent',
            provider_message_id: result.messageId,
          });
        } else {
          results.failed++;
          results.errors.push(`${emailPref.email_address}: ${result.error}`);
          console.error(`❌ Failed to send to ${emailPref.email_address}:`, result.error);

          // Log failure
          await supabase.from('email_queue').insert({
            user_id: user.user_id,
            email_address: emailPref.email_address,
            email_type: 'daily_reminder',
            email_data: tools,
            status: 'failed',
            error_message: JSON.stringify(result.error),
          });
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error: any) {
        results.failed++;
        results.errors.push(`${user.email}: ${error.message}`);
        console.error(`❌ Error processing user ${user.user_id}:`, error);
      }
    }

    const duration = Date.now() - startTime;

    console.log('✅ Cron job completed');
    console.log(`📊 Results:`, results);
    console.log(`⏱️  Duration: ${duration}ms`);

    return NextResponse.json({
      success: true,
      results,
      duration,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('❌ Cron job error:', error);
    return NextResponse.json(
      { 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * Determine urgency level based on days remaining
 */
function getUrgency(daysLeft: number, total: number): 'safe' | 'moderate' | 'urgent' | 'critical' {
  const percentage = (daysLeft / total) * 100;
  
  if (percentage > 60) return 'safe';
  if (percentage > 30) return 'moderate';
  if (percentage > 10) return 'urgent';
  return 'critical';
}

/**
 * Get message for OPT filing window
 */
function getOptFilingMessage(daysLeft: number): string {
  if (daysLeft > 90) {
    return 'Start gathering your documents. You\'ll need transcripts, I-20, and passport copies.';
  } else if (daysLeft > 60) {
    return 'Begin filling out Form I-765. Ensure all information is accurate.';
  } else if (daysLeft > 45) {
    return 'Schedule an appointment with your DSO for I-20 recommendation.';
  } else if (daysLeft > 30) {
    return 'Get your passport photos taken. You need 2 identical photos.';
  } else if (daysLeft > 21) {
    return 'Double-check all forms and documents. Make copies before mailing.';
  } else if (daysLeft > 14) {
    return '⚠️ Time to submit! Use expedited shipping with tracking.';
  } else if (daysLeft > 7) {
    return '⚠️ Submit THIS WEEK! USCIS processing takes 3-5 months.';
  } else {
    return '🚨 URGENT: Submit TODAY! Don\'t miss your filing window!';
  }
}

/**
 * Get message for STEM OPT filing window
 */
function getStemFilingMessage(daysLeft: number): string {
  if (daysLeft > 90) {
    return 'Start preparing Form I-983 with your employer. Ensure they\'re E-Verified.';
  } else if (daysLeft > 60) {
    return 'Work on your training plan with your employer. This is crucial for approval.';
  } else if (daysLeft > 45) {
    return 'Finalize Form I-983 and schedule DSO appointment for STEM recommendation.';
  } else if (daysLeft > 30) {
    return 'Get new passport photos and gather all required documents.';
  } else if (daysLeft > 21) {
    return 'Review everything carefully. Verify your degree is on the STEM list.';
  } else if (daysLeft > 14) {
    return '⚠️ Apply before your current OPT expires to avoid work authorization gaps!';
  } else if (daysLeft > 7) {
    return '⚠️ CRITICAL: Mail application with tracking immediately!';
  } else {
    return '🚨 EMERGENCY: Submit NOW! A gap could jeopardize your status!';
  }
}

/**
 * Get message for unemployment days
 */
function getUnemploymentMessage(daysLeft: number, total: number): string {
  const used = total - daysLeft;
  
  if (daysLeft > total * 0.75) {
    return `You've used ${used} of ${total} unemployment days. Keep actively job searching!`;
  } else if (daysLeft > total * 0.5) {
    return `${used} days used. Apply to multiple jobs daily and network actively.`;
  } else if (daysLeft > total * 0.33) {
    return `⚠️ ${used}/${total} days used. Intensify your job search - consider widening your area.`;
  } else if (daysLeft > total * 0.17) {
    return `⚠️ ${used} unemployment days used! Accept reasonable offers soon.`;
  } else {
    return `🚨 CRITICAL: Only ${daysLeft} days left! Accept ANY offer in your field and contact your DSO!`;
  }
}

