import { NextResponse } from 'next/server';

/**
 * Retired: server-side account creation confirmed email addresses without
 * proving mailbox ownership and could not create the browser session expected
 * by the extension callback. Extension signup now uses Supabase Auth directly
 * and requires OTP verification in the browser.
 */
export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      error: 'This signup endpoint has been retired. Use the extension signup page.',
    },
    { status: 410 }
  );
}
