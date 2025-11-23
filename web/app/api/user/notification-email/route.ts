/**
 * User Notification Email API
 * 
 * Handles storing and retrieving the user's preferred email
 * for document expiry notifications
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET - Fetch user's notification email
export async function GET() {
  try {
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
            try {
              cookieStore.set({ name, value, ...options });
            } catch {
              // Cookie setting can fail in middleware
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value: '', ...options });
            } catch {
              // Cookie removal can fail in middleware
            }
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('notification_email')
      .eq('id', user.id)
      .single();

    return NextResponse.json({
      email: profile?.notification_email || user.email || '',
    });

  } catch (error) {
    console.error('Error fetching notification email:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification email' },
      { status: 500 }
    );
  }
}

// POST - Update user's notification email
export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

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
            try {
              cookieStore.set({ name, value, ...options });
            } catch {
              // Cookie setting can fail in middleware
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value: '', ...options });
            } catch {
              // Cookie removal can fail in middleware
            }
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update profiles table
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ notification_email: email })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating notification email:', updateError);
      return NextResponse.json(
        { error: 'Failed to update notification email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      email,
    });

  } catch (error) {
    console.error('Error saving notification email:', error);
    return NextResponse.json(
      { error: 'Failed to save notification email' },
      { status: 500 }
    );
  }
}

