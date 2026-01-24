import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { ok: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Use service role to check if user exists
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Query users by email
    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error('Error checking user:', error);
      return NextResponse.json(
        { ok: false, error: 'Failed to check user' },
        { status: 500 }
      );
    }

    // Check if email exists in users list
    const userExists = data.users.some(
      (user) => user.email?.toLowerCase() === email.toLowerCase()
    );

    return NextResponse.json({ 
      ok: true, 
      exists: userExists 
    });
  } catch (error: any) {
    console.error('Check user error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to check user' },
      { status: 500 }
    );
  }
}

