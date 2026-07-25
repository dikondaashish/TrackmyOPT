/**
 * User Notification Email API
 * 
 * Handles storing and retrieving the user's preferred notification email
 * (Case Status, Document Vault, STEM/cron routing, etc.)
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  sendEnrollmentEmail,
  sendNotificationPreferencesSavedEmail,
} from '@/lib/notifications/email-service';
import { sanitizeError, secureLog } from '@/lib/secure-logger';

export const dynamic = 'force-dynamic';

// GET - Fetch user's notification email
export async function GET() {
  try {
    const cookieStore = await cookies();
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

    const cookieStore = await cookies();
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
    /** First time ever setting notification email (not an address change). */
    const isFirstTimeSettingNotificationEmail = Boolean(email && !previousEmail);
    /** Tool-specific welcome (case-status, documents, …) — omit on generic Settings save */
    const explicitToolType =
      typeof toolType === 'string' && toolType.trim().length > 0 ? toolType.trim() : null;

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
      console.error('Error upserting notification email:', sanitizeError(upsertError));

      // Check if column doesn't exist
      if (upsertError.code === '42703' || upsertError.message?.includes('column') || upsertError.message?.includes('does not exist')) {
        return NextResponse.json(
          { error: 'Database column not found. Please run migration 007_add_notification_email.sql in Supabase.' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to save notification email' },
        { status: 500 }
      );
    }

    secureLog.log(
      `📧 Notification email save - IsNewEnrollment: ${isNewEnrollment}, explicitToolType: ${explicitToolType ?? '(none)'}`,
    );

    const firstName = existingProfile?.first_name || 'there';

    if (isNewEnrollment && explicitToolType) {
      secureLog.log(`📤 Sending ${explicitToolType} enrollment email`);
      try {
        const result = await sendEnrollmentEmail(email, firstName, explicitToolType);
        if (result.success) {
          secureLog.log(`✅ ${explicitToolType} enrollment email sent successfully`);
        } else {
          secureLog.error(`❌ Failed to send ${explicitToolType} enrollment email:`, result.error);
        }
      } catch (err) {
        secureLog.error(`❌ ${explicitToolType} enrollment email error:`, err);
      }
    } else if (isFirstTimeSettingNotificationEmail && !explicitToolType) {
      // Settings → Notifications: confirm address without implying Document Vault enrollment
      try {
        const result = await sendNotificationPreferencesSavedEmail(email, firstName);
        if (result.success) {
          secureLog.log(`✅ Notification preferences confirmation sent`);
        } else {
          console.error('❌ Failed to send notification preferences confirmation:', result.error);
        }
      } catch (err) {
        console.error('❌ Notification preferences confirmation error:', err);
      }
    } else {
      console.log(
        `ℹ️ Skipping welcome email (tool enrollment or generic) — explicitToolType: ${explicitToolType ?? 'none'}, firstTime: ${isFirstTimeSettingNotificationEmail}`
      );
    }

    return NextResponse.json({
      success: true,
      email,
      /** Tool-specific welcome (case-status, documents, …) */
      enrollmentEmailSent: Boolean(isNewEnrollment && explicitToolType),
      /** First-time save from Settings without tool context */
      notificationPreferencesConfirmationSent: Boolean(
        isFirstTimeSettingNotificationEmail && !explicitToolType
      ),
    });

  } catch (error) {
    console.error('Error saving notification email:', error);
    return NextResponse.json(
      { error: 'Failed to save notification email' },
      { status: 500 }
    );
  }
}
