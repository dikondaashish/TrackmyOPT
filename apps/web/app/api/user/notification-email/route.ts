/**
 * User Notification Email API
 * 
 * Handles storing and retrieving the user's preferred email
 * for document expiry notifications
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { sendEnrollmentEmail } from '@/lib/notifications/email-service';

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
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('notification_email, first_name')
      .eq('user_id', user.id)
      .single();

    // If column doesn't exist, return user's email as fallback
    if (fetchError && (fetchError.code === '42703' || fetchError.message?.includes('column') || fetchError.message?.includes('does not exist'))) {
      return NextResponse.json({
        email: user.email || '',
      });
    }

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
    const { email, toolType } = await request.json();

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

    // Check previous email BEFORE updating to detect new enrollment
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('notification_email, first_name')
      .eq('user_id', user.id)
      .single();

    const previousEmail = existingProfile?.notification_email;
    const isNewEnrollment = email && (!previousEmail || previousEmail !== email);

    // Use upsert to handle both create and update cases
    const { error: upsertError } = await supabase
      .from('profiles')
      .upsert({
        user_id: user.id,
        notification_email: email,
      }, {
        onConflict: 'user_id',
      });

    if (upsertError) {
      console.error('Error upserting notification email:', upsertError);
      console.error('Error details:', JSON.stringify(upsertError, null, 2));

      // Check if column doesn't exist
      if (upsertError.code === '42703' || upsertError.message?.includes('column') || upsertError.message?.includes('does not exist')) {
        return NextResponse.json(
          { error: 'Database column not found. Please run migration 007_add_notification_email.sql in Supabase.' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: `Failed to save notification email: ${upsertError.message || 'Unknown error'}` },
        { status: 500 }
      );
    }

    // Send enrollment confirmation email if this is a new enrollment
    // Use toolType from request, default to 'documents' for backward compatibility
    const emailToolType = toolType || 'documents';
    console.log(`📧 Notification email save - Email: ${email}, PreviousEmail: ${previousEmail}, IsNewEnrollment: ${isNewEnrollment}, ToolType: ${emailToolType}`);

    if (isNewEnrollment) {
      const firstName = existingProfile?.first_name || 'there';

      console.log(`📤 Sending ${emailToolType} enrollment email to ${email}`);

      // Send enrollment email and wait for result
      try {
        const result = await sendEnrollmentEmail(email, firstName, emailToolType);
        if (result.success) {
          console.log(`✅ ${emailToolType} enrollment email sent successfully to ${email}`);
        } else {
          console.error(`❌ Failed to send ${emailToolType} enrollment email:`, result.error);
        }
      } catch (err) {
        console.error(`❌ ${emailToolType} enrollment email error:`, err);
      }
    } else {
      console.log(`ℹ️ Skipping enrollment email - not a new enrollment for ${emailToolType}`);
    }

    return NextResponse.json({
      success: true,
      email,
      enrollmentEmailSent: isNewEnrollment,
    });

  } catch (error) {
    console.error('Error saving notification email:', error);
    return NextResponse.json(
      { error: 'Failed to save notification email' },
      { status: 500 }
    );
  }
}

