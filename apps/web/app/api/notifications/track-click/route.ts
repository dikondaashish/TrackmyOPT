import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const url = searchParams.get('url');

  if (!id || !url) {
    // If missing params, redirect to home or common dashboard if possible
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Use service role key to bypass RLS for email_queue since this is a public endpoint
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // Update the clicked_at timestamp in email_queue
    const { error } = await supabase
      .from('email_queue')
      .update({ clicked_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error updating click tracking:', error);
    }

    // Always redirect the user to their intended destination
    return NextResponse.redirect(url);
  } catch (err) {
    console.error('Tracking API error:', err);
    return NextResponse.redirect(url);
  }
}
