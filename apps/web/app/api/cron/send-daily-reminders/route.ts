/**
 * Daily Email Reminder Cron Job
 * 
 * Sends personalized OPT timeline reminders to premium users at 9 AM ET daily.
 * 
 * ⚠️ This endpoint is triggered by cron-job.org (external service)
 * 
 * Setup on cron-job.org:
 * 1. Go to https://cron-job.org
 * 2. Create a new cron job:
 *    - Title: "TrackMyOPT - Daily Reminders (9 AM ET)"
 *    - URL: https://www.trackmyopt.com/api/cron/send-daily-reminders
 *    - Method: GET
 *    - Schedule: 0 14 * * * (2:00 PM UTC = 9:00 AM ET)
 *    - Headers: Authorization: Bearer YOUR_CRON_SECRET
 *    - Timeout: 30 seconds
 * 
 * Security: Protected by CRON_SECRET environment variable
 * 
 * For manual testing:
 * curl -X GET "https://www.trackmyopt.com/api/cron/send-daily-reminders" \
 *   -H "Authorization: Bearer YOUR_CRON_SECRET"
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendDailyReminder, type EmailReminderData, type ToolReminderDetail } from '@/lib/notifications/email-service';
import { sanitizeError } from '@/lib/secure-logger';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max execution time

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface UserOptData {
  user_id: string;
  program_end_date: string | null;
  opt_start_date: string | null;
  opt_ead_end_date: string | null;
  stem_start_date: string | null;
}

interface UserToolEmails {
  user_id: string;
  opt_apply_email: string | null;
  opt_clock_email: string | null;
  stem_apply_email: string | null;
  stem_clock_email: string | null;
}

/**
 * GET - Send daily reminders to all eligible users
 */
export async function GET(req: NextRequest) {
  const startTime = Date.now();
  
  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
  
  if (authHeader !== expectedAuth) {
    console.error('⚠️ Unauthorized cron job attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('📧 Starting daily reminder job...');

    // Get all premium users with at least one tool email set
    // Tool emails are stored in profiles table: opt_apply_email, opt_clock_email, etc.
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select(`
        user_id,
        first_name,
        last_name,
        premium_status,
        opt_apply_email,
        opt_clock_email,
        stem_apply_email,
        stem_clock_email
      `)
      .eq('premium_status', true);

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
      return NextResponse.json({ error: profilesError.message }, { status: 500 });
    }

    // Filter to only users who have at least one tool email set
    const usersWithEmails = (profiles || []).filter(p => 
      p.opt_apply_email || p.opt_clock_email || p.stem_apply_email || p.stem_clock_email
    );

    if (usersWithEmails.length === 0) {
      console.log('ℹ️ No users with tool emails enabled');
      return NextResponse.json({ 
        success: true, 
        message: 'No users with email enabled',
        sent: 0 
      });
    }

    console.log(`📊 Found ${usersWithEmails.length} premium users with tool emails`);

    const results = {
      total: usersWithEmails.length,
      sent: 0,
      skipped: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Process each user
    for (const profile of usersWithEmails) {
      try {
        // Get user's OPT data
        const { data: optData } = await supabase
          .from('opt_status')
          .select('*')
          .eq('user_id', profile.user_id)
          .single();

        if (!optData) {
          console.log(`ℹ️ No OPT data for user ${profile.user_id}`);
          results.skipped++;
          continue;
        }

        // Build tool email preferences from profile
        const toolPrefs = {
          user_id: profile.user_id,
          opt_apply_email: profile.opt_apply_email,
          opt_clock_email: profile.opt_clock_email,
          stem_apply_email: profile.stem_apply_email,
          stem_clock_email: profile.stem_clock_email,
        };

        // Calculate active tools and reminders
        const tools = calculateActiveTools(optData, toolPrefs);

        if (tools.length === 0) {
          console.log(`ℹ️ No active tools for user ${profile.user_id}`);
          results.skipped++;
          continue;
        }

        // Determine which email to send to (use first available)
        const targetEmail = profile.opt_apply_email || profile.opt_clock_email || 
                          profile.stem_apply_email || profile.stem_clock_email;

        // Send email
        const emailData: EmailReminderData = {
          userId: profile.user_id,
          userEmail: targetEmail,
          firstName: profile.first_name || 'there',
          tools,
        };

        const result = await sendDailyReminder(emailData);

        if (result.success) {
          results.sent++;
          console.log(`✅ Sent to ${targetEmail}`);

          // Log to email_queue (optional - don't fail if this errors)
          try {
            await supabase.from('email_queue').insert({
              user_id: profile.user_id,
              email_address: targetEmail,
              email_type: 'daily_reminder',
              email_subject: `Daily OPT Reminder - ${tools.length} active`,
              email_data: tools,
              sent_at: new Date().toISOString(),
              status: 'sent',
              provider_message_id: result.messageId,
            });
          } catch { /* ignore logging errors */ }
        } else {
          results.failed++;
          results.errors.push(`${targetEmail}: ${result.error}`);
          console.error(`❌ Failed: ${targetEmail}`);
        }

        // Rate limiting delay
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error: any) {
        results.failed++;
        results.errors.push(`User ${profile.user_id}: ${error.message}`);
        console.error(`❌ Error processing user ${profile.user_id}:`, sanitizeError(error));
      }
    }

    const duration = Date.now() - startTime;
    console.log(`✅ Job completed in ${duration}ms - Sent: ${results.sent}, Skipped: ${results.skipped}, Failed: ${results.failed}`);

    return NextResponse.json({
      success: true,
      results,
      duration,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('❌ Cron job error:', sanitizeError(error));
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Calculate active tools and their reminder messages based on dates
 * Only includes tools where user has set an email address
 */
function calculateActiveTools(optData: UserOptData, toolEmails: UserToolEmails): EmailReminderData['tools'] {
  const tools: EmailReminderData['tools'] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // ========================================
  // 1. OPT APPLY - Filing Window Reminders
  // ========================================
  // Earliest: 90 days before program end
  // Deadline: 60 days after program end
  // Only if user has opt_apply_email set
  if (optData.program_end_date && toolEmails.opt_apply_email) {
    const programEnd = new Date(optData.program_end_date);
    
    // Earliest filing date: 90 days before program end
    const earliestFiling = new Date(programEnd);
    earliestFiling.setDate(earliestFiling.getDate() - 90);
    
    // Filing deadline: 60 days after program end
    const filingDeadline = new Date(programEnd);
    filingDeadline.setDate(filingDeadline.getDate() + 60);
    
    // Only send reminders within the filing window
    if (today >= earliestFiling && today <= filingDeadline) {
      const daysLeft = Math.ceil((filingDeadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const totalWindow = 150; // 90 + 60 days total window
      
      const formatDate = (date: Date) => date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
      
      tools.push({
        name: 'OPT Application',
        toolType: 'opt-apply',
        daysLeft,
        totalDays: totalWindow,
        startDate: formatDate(earliestFiling),
        endDate: formatDate(filingDeadline),
        urgency: getUrgency(daysLeft, totalWindow),
        message: getOptApplyMessage(daysLeft, programEnd, today),
        optType: 'Post-Completion OPT',
        programEndDate: formatDate(programEnd),
      });
    }
  }

  // ========================================
  // 2. OPT CLOCK - Unemployment Days Tracker
  // ========================================
  // 90 days total during initial OPT
  if (optData.opt_start_date && toolEmails.opt_clock_email) {
    const optStart = new Date(optData.opt_start_date);
    const optEnd = optData.opt_ead_end_date ? new Date(optData.opt_ead_end_date) : null;
    
    // Only track during active OPT period
    if (today >= optStart && (!optEnd || today <= optEnd)) {
      // Calculate used days (simplified - in reality would need employment spans)
      const daysSinceStart = Math.ceil((today.getTime() - optStart.getTime()) / (1000 * 60 * 60 * 24));
      const daysLeft = Math.max(0, 90 - daysSinceStart);
      
      if (daysLeft > 0 && daysLeft <= 90) {
        const formatDate = (date: Date) => date.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        });
        
        tools.push({
          name: 'OPT Unemployment Days',
          toolType: 'opt-clock',
          daysLeft,
          totalDays: 90,
          startDate: formatDate(optStart),
          endDate: optEnd ? formatDate(optEnd) : 'Max 90 days',
          urgency: getUrgency(daysLeft, 90),
          message: getUnemploymentMessage(daysLeft, 90, 'OPT'),
        });
      }
    }
  }

  // ========================================
  // 3. STEM APPLY - Extension Filing Window
  // ========================================
  // Can file up to 90 days before OPT EAD expires
  // Must file before OPT EAD expires
  if (optData.opt_ead_end_date && toolEmails.stem_apply_email) {
    const optEadEnd = new Date(optData.opt_ead_end_date);
    
    // Earliest STEM filing: 90 days before OPT EAD expires
    const earliestStemFiling = new Date(optEadEnd);
    earliestStemFiling.setDate(earliestStemFiling.getDate() - 90);
    
    // Only send reminders within STEM filing window (and not yet on STEM)
    if (!optData.stem_start_date && today >= earliestStemFiling && today <= optEadEnd) {
      const daysLeft = Math.ceil((optEadEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      const formatDate = (date: Date) => date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
      
      tools.push({
        name: 'STEM OPT Extension',
        toolType: 'stem-apply',
        daysLeft,
        totalDays: 90,
        startDate: formatDate(earliestStemFiling),
        endDate: formatDate(optEadEnd),
        urgency: getUrgency(daysLeft, 90),
        message: getStemApplyMessage(daysLeft),
      });
    }
  }

  // ========================================
  // 4. STEM CLOCK - STEM Unemployment Tracker
  // ========================================
  // 60 days additional unemployment during STEM OPT (separate from 90 days during initial OPT)
  if (optData.stem_start_date && toolEmails.stem_clock_email) {
    const stemStart = new Date(optData.stem_start_date);
    
    // Calculate STEM period end (24 months from STEM start)
    const stemEnd = new Date(stemStart);
    stemEnd.setMonth(stemEnd.getMonth() + 24);
    
    if (today >= stemStart && today <= stemEnd) {
      // During STEM, track 60 additional unemployment days
      const daysSinceStemStart = Math.ceil((today.getTime() - stemStart.getTime()) / (1000 * 60 * 60 * 24));
      const stemDaysRemaining = Math.max(0, 60 - Math.min(60, daysSinceStemStart));
      
      if (stemDaysRemaining > 0) {
        const formatDate = (date: Date) => date.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        });
        
        tools.push({
          name: 'STEM Unemployment Days',
          toolType: 'stem-clock',
          daysLeft: stemDaysRemaining,
          totalDays: 60,
          startDate: formatDate(stemStart),
          endDate: formatDate(stemEnd),
          urgency: getUrgency(stemDaysRemaining, 60),
          message: getUnemploymentMessage(stemDaysRemaining, 60, 'STEM'),
        });
      }
    }
  }

  return tools;
}

/**
 * Determine urgency level
 */
function getUrgency(daysLeft: number, total: number): 'safe' | 'moderate' | 'urgent' | 'critical' {
  const percentage = (daysLeft / total) * 100;
  if (percentage > 60) return 'safe';
  if (percentage > 30) return 'moderate';
  if (percentage > 10) return 'urgent';
  return 'critical';
}

/**
 * OPT Apply reminder messages based on timeline position
 */
function getOptApplyMessage(daysLeft: number, programEnd: Date, today: Date): string {
  const daysToProgEnd = Math.ceil((programEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  // Before program ends (daysToProgEnd > 0)
  if (daysToProgEnd > 60) {
    return `📋 START EARLY: Request official transcripts and gather required documents. You'll need: passport copies, I-94, I-20s, and 2 passport photos.`;
  } else if (daysToProgEnd > 45) {
    return `📝 PREPARE FORMS: Begin filling out Form I-765 carefully. Double-check every entry - errors cause delays!`;
  } else if (daysToProgEnd > 30) {
    return `🏫 DSO MEETING: Schedule appointment with your DSO for OPT recommendation on your I-20. This is required!`;
  } else if (daysToProgEnd > 14) {
    return `📸 FINAL PREP: Get passport photos taken (2 identical, 2x2 inches). Make copies of ALL documents before mailing.`;
  } else if (daysToProgEnd > 0) {
    return `⚠️ SUBMIT NOW: Mail your complete application with USPS tracking. Processing takes 3-5 months!`;
  }
  
  // After program ends (counting down to 60-day deadline)
  if (daysLeft > 45) {
    return `⚠️ POST-GRADUATION: Your program has ended. Submit OPT application ASAP - you have ${daysLeft} days left.`;
  } else if (daysLeft > 30) {
    return `🚨 URGENT: Only ${daysLeft} days remaining! Mail your application THIS WEEK with tracking.`;
  } else if (daysLeft > 14) {
    return `🚨 CRITICAL: ${daysLeft} days until deadline! Submit TODAY - consider premium processing if available.`;
  } else if (daysLeft > 7) {
    return `🆘 EMERGENCY: Just ${daysLeft} days left! Contact your DSO immediately if you haven't submitted!`;
  } else {
    return `🆘 FINAL DAYS: Only ${daysLeft} days remaining! Submit NOW or you will miss your OPT window entirely!`;
  }
}

/**
 * STEM Apply reminder messages
 */
function getStemApplyMessage(daysLeft: number): string {
  if (daysLeft > 75) {
    return `📋 STEM PREP: Start gathering documents. You'll need Form I-983 completed with your employer and proof they're E-Verified.`;
  } else if (daysLeft > 60) {
    return `📝 FORM I-983: Work with your employer to complete the Training Plan. This requires detailed mentorship info.`;
  } else if (daysLeft > 45) {
    return `🏫 DSO MEETING: Schedule appointment for STEM I-20 recommendation. Have Form I-983 ready!`;
  } else if (daysLeft > 30) {
    return `📸 PREPARE APPLICATION: Get new passport photos. Verify your degree is STEM-eligible (check CIP code).`;
  } else if (daysLeft > 14) {
    return `⚠️ SUBMIT SOON: Your current OPT expires in ${daysLeft} days. Mail STEM application with tracking!`;
  } else if (daysLeft > 7) {
    return `🚨 URGENT: Only ${daysLeft} days before OPT expires! Submit NOW to maintain work authorization!`;
  } else {
    return `🆘 CRITICAL: ${daysLeft} days left! A gap in filing could void your work authorization - submit TODAY!`;
  }
}

/**
 * Unemployment clock reminder messages
 */
function getUnemploymentMessage(daysLeft: number, total: number, type: 'OPT' | 'STEM'): string {
  const used = total - daysLeft;
  const threshold = type === 'OPT' ? 90 : 60;
  
  if (daysLeft > threshold * 0.75) {
    return `⏰ ${used}/${total} unemployment days used. Apply to 3+ jobs daily and document your search!`;
  } else if (daysLeft > threshold * 0.5) {
    return `⚠️ ${used} days used, ${daysLeft} remaining. Intensify job search - network actively on LinkedIn!`;
  } else if (daysLeft > threshold * 0.33) {
    return `🚨 WARNING: ${used}/${total} days used! Consider widening your geographic area and industry.`;
  } else if (daysLeft > threshold * 0.17) {
    return `🆘 CRITICAL: Only ${daysLeft} days left! Accept reasonable offers - negotiate after starting!`;
  } else {
    return `🆘 EMERGENCY: Just ${daysLeft} days remaining! Accept ANY qualifying offer and contact your DSO immediately!`;
  }
}
