import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

/**
 * Cron Job: Check USCIS case status every 6 hours
 * 
 * ⚠️ This endpoint is triggered by cron-job.org (external service)
 * 
 * Setup on cron-job.org:
 * 1. Go to https://cron-job.org
 * 2. Create a new cron job with these settings:
 *    - Title: "TrackMyOPT - USCIS Status Check"
 *    - URL: https://www.trackmyopt.com/api/cron/check-case-status
 *    - Method: GET
 *    - Schedule: Every 6 hours (0 *\/6 * * *)
 *      OR: At 12am, 6am, 12pm, 6pm (0 0,6,12,18 * * *)
 *    - Headers:
 *      - Authorization: Bearer YOUR_CRON_SECRET
 *    - Timeout: 30 seconds (free tier max)
 * 
 * Security:
 * - Protected by CRON_SECRET environment variable
 * - Only responds to requests with valid Bearer token
 * 
 * For manual testing:
 * curl -X GET "https://www.trackmyopt.com/api/cron/check-case-status" \
 *   -H "Authorization: Bearer YOUR_CRON_SECRET"
 */
export async function GET(req: NextRequest) {
  try {

    // Verify cron secret (set in Vercel environment variables)
    const authHeader = req.headers.get('authorization');
    
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.error('❌ Unauthorized cron job attempt');
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Use service role key for database access
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch all active case statuses
    const { data: cases, error: fetchError } = await supabase
      .from('case_status')
      .select('receipt_number, user_id, current_status, last_checked_at')
      .order('last_checked_at', { ascending: true, nullsFirst: true });

    if (fetchError) {
      console.error('❌ Error fetching cases:', fetchError);
      return NextResponse.json(
        { ok: false, error: 'Database error' },
        { status: 500 }
      );
    }

    if (!cases || cases.length === 0) {
      return NextResponse.json(
        { ok: true, message: 'No cases to check', checked: 0 },
        { status: 200 }
      );
    }


    // Check each case (with delay to avoid rate limiting)
    const results = [];
    
    for (const caseItem of cases) {
      try {
        
        // Call the check endpoint
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/case-status/check`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.CRON_SECRET}`,
            },
            body: JSON.stringify({
              receipt_number: caseItem.receipt_number,
            }),
          }
        );

        if (response.ok) {
          const result = await response.json();
          results.push({
            receipt_number: caseItem.receipt_number,
            success: true,
            changed: result.data?.changed || false,
          });
          
          if (result.data?.changed) {
          } else {
          }
        } else {
          console.error(`❌ Failed to check ${caseItem.receipt_number}`);
          results.push({
            receipt_number: caseItem.receipt_number,
            success: false,
          });
        }

        // Add delay between requests to avoid rate limiting (2 seconds)
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`❌ Error checking ${caseItem.receipt_number}:`, error);
        results.push({
          receipt_number: caseItem.receipt_number,
          success: false,
          error: (error as Error).message,
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const changedCount = results.filter((r) => r.changed).length;


    return NextResponse.json(
      {
        ok: true,
        message: 'Cron job completed',
        total: cases.length,
        successful: successCount,
        changed: changedCount,
        results,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Cron job error:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

