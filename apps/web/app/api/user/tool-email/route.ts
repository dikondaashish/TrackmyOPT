/**
 * Tool-Specific Email API
 * 
 * Handles storing and retrieving emails for each tool's notifications:
 * - opt_apply: OPT Apply Dates tool
 * - opt_clock: OPT Clock Tracker tool
 * - stem_apply: STEM Apply Dates tool
 * - stem_clock: STEM Clock Tracker tool
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth/getUserId';
import { sendEnrollmentEmail, type EnrollmentEmailData } from '@/lib/notifications/email-service';
import { corsHeadersWebAndExtension } from '@/lib/api/cors-policy';
import { sanitizeError, secureLog } from '@/lib/secure-logger';

export const dynamic = 'force-dynamic';

// Valid tool names
const VALID_TOOLS = ['opt_apply', 'opt_clock', 'stem_apply', 'stem_clock'] as const;
type ToolName = typeof VALID_TOOLS[number];

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeadersWebAndExtension(req),
  });
}



// GET - Fetch emails for all tools or specific tool
export async function GET(req: NextRequest) {
  const cors = corsHeadersWebAndExtension(req);
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: cors });
    }

    const { searchParams } = new URL(req.url);
    const tool = searchParams.get('tool') as ToolName | null;

    // Use service role client to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch from profiles table
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('opt_apply_email, opt_clock_email, stem_apply_email, stem_clock_email')
      .eq('user_id', userId)
      .single();

    // If column doesn't exist or no profile, return empty
    if (fetchError && fetchError.code !== 'PGRST116') {
      // Check if columns don't exist yet
      if (fetchError.message?.includes('column') || fetchError.code === '42703') {
        return NextResponse.json({
          emails: {
            opt_apply: null,
            opt_clock: null,
            stem_apply: null,
            stem_clock: null,
          }
        }, { headers: cors });
      }
    }

    const emails = {
      opt_apply: profile?.opt_apply_email || null,
      opt_clock: profile?.opt_clock_email || null,
      stem_apply: profile?.stem_apply_email || null,
      stem_clock: profile?.stem_clock_email || null,
    };

    // If specific tool requested, return only that
    if (tool && VALID_TOOLS.includes(tool)) {
      return NextResponse.json({
        tool,
        email: emails[tool.replace('_', '_') as keyof typeof emails] || null,
      }, { headers: cors });
    }

    return NextResponse.json({ emails }, { headers: cors });

  } catch (error) {
    secureLog.error('Error fetching tool emails:', sanitizeError(error));
    return NextResponse.json(
      { error: 'Failed to fetch tool emails' },
      { status: 500, headers: cors }
    );
  }
}

// POST - Update email for a specific tool
export async function POST(req: NextRequest) {
  const cors = corsHeadersWebAndExtension(req);
  try {
    const { tool, email } = await req.json();

    // Validate tool name
    if (!tool || !VALID_TOOLS.includes(tool)) {
      return NextResponse.json(
        { error: 'Invalid tool name. Must be one of: opt_apply, opt_clock, stem_apply, stem_clock' },
        { status: 400, headers: cors }
      );
    }

    // Validate email if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400, headers: cors }
        );
      }
    }

    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: cors });
    }

    // Use service role client to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Map tool name to column name
    const columnName = `${tool}_email`;

    // First, check if profile exists and get current email for this tool
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('user_id, first_name, premium_status, opt_apply_email, opt_clock_email, stem_apply_email, stem_clock_email')
      .eq('user_id', userId)
      .single();

    // Check if this is a new enrollment (email being set for first time or changed)
    const profileData = existingProfile as Record<string, any> | null;
    const previousEmail = profileData?.[columnName];
    const isPremium = profileData?.premium_status === true;
    // Only send enrollment email to premium users
    const isNewEnrollment = email && (!previousEmail || previousEmail !== email) && isPremium;

    let error;

    if (existingProfile) {
      // Profile exists, update the email column
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ [columnName]: email || null })
        .eq('user_id', userId);
      error = updateError;
    } else {
      // Profile doesn't exist, insert new row
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          [columnName]: email || null,
        });
      error = insertError;
    }

    if (error) {
      secureLog.error('Error saving tool email:', sanitizeError(error));

      // Check if column doesn't exist
      if (error.message?.includes('column') || error.code === '42703') {
        return NextResponse.json(
          { error: 'Database column not found. Please run migration 008_add_tool_emails.sql in Supabase.' },
          { status: 500, headers: cors }
        );
      }

      return NextResponse.json(
        { error: `Failed to save email: ${error.message}` },
        { status: 500, headers: cors }
      );
    }

    // Send enrollment confirmation email if this is a new enrollment (premium users only)
    secureLog.info(
      `Tool email save: tool=${tool}, isPremium=${isPremium}, isNewEnrollment=${isNewEnrollment}`,
    );

    if (!isPremium && email && (!previousEmail || previousEmail !== email)) {
      secureLog.info(`Skipping tool enrollment email for ${tool} — not premium`);
    }

    if (isNewEnrollment) {
      const toolNameForEmail = tool.replace('_', '-'); // Convert opt_apply to opt-apply
      const firstName = profileData?.first_name || 'there';

      // Fetch OPT data for timeline information in email
      let enrollmentData: EnrollmentEmailData | undefined;

      try {
        const { data: optData } = await supabase
          .from('opt_status')
          .select('program_end_date, opt_start_date, opt_ead_end_date, stem_start_date')
          .eq('user_id', userId)
          .single();

        if (optData) {
          const formatDate = (dateStr: string | null) => {
            if (!dateStr) return undefined;
            return new Date(dateStr).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            });
          };

          // Calculate dates based on tool type
          if (tool === 'opt_apply' && optData.program_end_date) {
            const programEnd = new Date(optData.program_end_date);
            const earliestFiling = new Date(programEnd);
            earliestFiling.setDate(earliestFiling.getDate() - 90);
            const filingDeadline = new Date(programEnd);
            filingDeadline.setDate(filingDeadline.getDate() + 60);

            enrollmentData = {
              startDate: formatDate(earliestFiling.toISOString()),
              endDate: formatDate(filingDeadline.toISOString()),
              programEndDate: formatDate(optData.program_end_date),
              totalDays: 150,
              optType: 'Post-Completion OPT',
            };
          } else if (tool === 'opt_clock' && optData.opt_start_date) {
            enrollmentData = {
              startDate: formatDate(optData.opt_start_date),
              endDate: optData.opt_ead_end_date ? formatDate(optData.opt_ead_end_date) : undefined,
            };
          } else if (tool === 'stem_apply' && optData.opt_ead_end_date) {
            const optEadEnd = new Date(optData.opt_ead_end_date);
            const earliestStemFiling = new Date(optEadEnd);
            earliestStemFiling.setDate(earliestStemFiling.getDate() - 90);

            enrollmentData = {
              startDate: formatDate(earliestStemFiling.toISOString()),
              endDate: formatDate(optData.opt_ead_end_date),
              totalDays: 90,
            };
          } else if (tool === 'stem_clock' && optData.stem_start_date) {
            enrollmentData = {
              startDate: formatDate(optData.stem_start_date),
            };
          }
        }
      } catch (err) {
        secureLog.warn('Could not fetch OPT data for enrollment email:', sanitizeError(err));
      }

      secureLog.info(`Sending enrollment email for tool=${toolNameForEmail}`);

      // Send enrollment email and wait for result to ensure it's sent
      try {
        const result = await sendEnrollmentEmail(email, firstName, toolNameForEmail, enrollmentData);
        if (result.success) {
          secureLog.info(`Enrollment email sent for tool=${tool}`);
        } else {
          secureLog.error(`Failed to send enrollment email for ${tool}:`, result.error);
        }
      } catch (err) {
        secureLog.error(`Enrollment email error for ${tool}:`, sanitizeError(err));
      }
    } else {
      secureLog.info(`Skipping enrollment email — not a new enrollment for ${tool}`);
    }

    return NextResponse.json({
      success: true,
      tool,
      email: email || null,
      enrollmentEmailSent: isNewEnrollment,
    }, { headers: cors });

  } catch (error) {
    secureLog.error('Error saving tool email:', sanitizeError(error));
    return NextResponse.json(
      { error: 'Failed to save tool email' },
      { status: 500, headers: cors }
    );
  }
}
