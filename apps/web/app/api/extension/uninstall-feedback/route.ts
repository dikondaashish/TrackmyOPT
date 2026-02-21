import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

const getAdminClient = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { reasons, subOptions, followUpAnswers, additionalFeedback, timestamp } = body;

    if (!reasons || !Array.isArray(reasons) || reasons.length === 0) {
      return NextResponse.json(
        { error: 'At least one reason is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ||
               req.headers.get('x-real-ip') ||
               'Unknown';

    const userAgent = req.headers.get('user-agent') || 'Unknown';

    const supabase = getAdminClient();

    await supabase
      .from('extension_uninstall_feedback')
      .insert({
        reasons,
        sub_options: subOptions || [],
        follow_up_answers: followUpAnswers || {},
        additional_feedback: additionalFeedback || '',
        ip_address: ip,
        user_agent: userAgent,
        submitted_at: timestamp || new Date().toISOString(),
      });

    return NextResponse.json(
      { ok: true, message: 'Feedback received' },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Uninstall feedback error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
