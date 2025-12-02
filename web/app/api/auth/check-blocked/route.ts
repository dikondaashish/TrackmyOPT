import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Use service role to check blocked_emails table
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabaseAdmin
      .from('blocked_emails')
      .select('email, deleted_at')
      .eq('email', email.toLowerCase())
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 means no rows returned, which is expected for non-blocked emails
      console.error('Error checking blocked email:', error);
    }

    if (data) {
      return NextResponse.json({
        blocked: true,
        message: 'This email has been permanently blocked. Previously deleted accounts cannot be recreated.',
      });
    }

    return NextResponse.json({ blocked: false });

  } catch (error) {
    console.error('Check blocked email error:', error);
    return NextResponse.json(
      { error: 'Failed to check email status' },
      { status: 500 }
    );
  }
}
