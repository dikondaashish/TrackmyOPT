import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { verifyToken } from '@/lib/jwt';
import { sendEnrollmentEmail } from '@/lib/email-service';
import {
  API_RATE_LIMIT,
  checkRateLimitByIP,
  checkRateLimitByUser,
  rateLimitResponse,
  addRateLimitHeaders
} from '@/lib/api-rate-limit';
import { caseStatusRequestSchema, validateRequest } from '@/lib/validation';

export const dynamic = 'force-dynamic';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Cache-Control': 'no-store, no-cache, must-revalidate',
};

/**
 * Get user ID from either JWT token or session
 */
async function getUserId(req: NextRequest): Promise<string | null> {
  // Try JWT token first (for extension)
  const authHeader = req.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const decoded = await verifyToken(token);
    if (decoded) {
      return decoded.userId || decoded.sub;
    }
  }

  // Fall back to session cookies (for web)
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

/**
 * GET /api/case-status
 * Fetch user's current case status
 */
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId(req);

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    // Use service role key for database access
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch case status from database
    const { data: caseStatus, error: dbError } = await supabase
      .from('case_status')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (dbError) {
      if (dbError.code === 'PGRST116') {
        // No case status found (not an error, just empty)
        return NextResponse.json(
          { ok: true, data: null },
          { status: 200, headers: corsHeaders }
        );
      }

      console.error('Database error fetching case status:', dbError);
      return NextResponse.json(
        { ok: false, error: 'Failed to fetch case status' },
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { ok: true, data: caseStatus },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error in GET /api/case-status:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * POST /api/case-status
 * Save or update user's case receipt number
 */
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(req);

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    const body = await req.json();
    const { receipt_number, notifications_enabled = true } = body;

    // Validate receipt number
    if (!receipt_number || typeof receipt_number !== 'string') {
      return NextResponse.json(
        { ok: false, error: 'Receipt number is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const receiptPattern = /^[A-Z]{3}\d{10}$/;
    if (!receiptPattern.test(receipt_number)) {
      return NextResponse.json(
        { ok: false, error: 'Invalid receipt number format' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Use service role key for upsert to bypass RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Upsert case status (insert or update)
    const { data: caseStatus, error: dbError } = await supabaseAdmin
      .from('case_status')
      .upsert(
        {
          user_id: userId,
          receipt_number: receipt_number.toUpperCase(),
          notifications_enabled,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id',
          ignoreDuplicates: false,
        }
      )
      .select()
      .single();

    if (dbError) {
      console.error('Database error saving case status:', dbError);
      return NextResponse.json(
        { ok: false, error: 'Failed to save case status' },
        { status: 500, headers: corsHeaders }
      );
    }

    // Check if this is a new case enrollment (first time saving)
    // If caseStatus was just created (no previous current_status), send enrollment email
    const isNewEnrollment = notifications_enabled && !caseStatus?.current_status;

    if (isNewEnrollment) {
      console.log(`📧 Case status enrollment - Receipt: ${receipt_number}, Notifications: ${notifications_enabled}`);

      // Get user's email, name, and premium status from profiles
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('first_name, premium_status')
        .eq('user_id', userId)
        .single();

      // Only send enrollment email to premium users
      const isPremium = profile?.premium_status === true;

      if (!isPremium) {
        console.log(`⏭️ Skipping case-status enrollment email - user is not premium`);
      } else {
        // Try to get email from auth.users table directly
        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);
        const userEmail = userData?.user?.email;

        if (userEmail) {
          const firstName = profile?.first_name || 'there';

          console.log(`📤 Sending case-status enrollment email to ${userEmail} (Premium user)`);

          try {
            const result = await sendEnrollmentEmail(userEmail, firstName, 'case-status');
            if (result.success) {
              console.log(`✅ Case status enrollment email sent successfully to ${userEmail}`);
            } else {
              console.error(`❌ Failed to send case-status enrollment email:`, result.error);
            }
          } catch (err) {
            console.error(`❌ Case-status enrollment email error:`, err);
          }
        } else {
          console.log(`⚠️ Could not find user email for case-status enrollment`);
        }
      }
    }

    // Trigger immediate status check (async, don't wait)
    fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/case-status/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Request': 'true',
      },
      body: JSON.stringify({ receipt_number: receipt_number.toUpperCase() }),
    }).catch((err) => {
      console.error('Failed to trigger initial status check:', err);
    });

    return NextResponse.json(
      { ok: true, data: caseStatus, enrollmentEmailSent: isNewEnrollment },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error in POST /api/case-status:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}

