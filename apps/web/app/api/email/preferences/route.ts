/**
 * Email Preferences API
 * 
 * Allows users to:
 * - Get their email preferences
 * - Update email address
 * - Enable/disable email reminders
 * - Delete email preferences
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUserId } from '@/lib/auth/getUserId';
import { sendEmailChangeNotification } from '@/lib/notifications/email-service';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = 'force-dynamic';



/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * GET - Get user's email preferences
 */
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId(req);

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get email preferences
    const { data, error } = await supabase
      .from('email_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching email preferences:', error);
      return NextResponse.json(
        { error: 'Failed to fetch preferences' },
        { status: 500 }
      );
    }

    // No preferences found
    if (!data) {
      return NextResponse.json({
        preferences: null,
        hasPreferences: false
      });
    }

    return NextResponse.json({
      preferences: {
        email_address: data.email_address,
        email_verified: data.email_verified,
        email_enabled: data.email_enabled,
        created_at: data.created_at,
        updated_at: data.updated_at,
      },
      hasPreferences: true
    });
  } catch (error: any) {
    console.error('GET /api/email/preferences error:', error?.message || 'Unknown error');
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

/**
 * POST - Update email preferences
 */
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(req);

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is premium
    const { data: profile } = await supabase
      .from('profiles')
      .select('premium_status')
      .eq('user_id', userId)
      .single();

    if (!profile?.premium_status) {
      return NextResponse.json(
        { error: 'Premium subscription required' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { email_address, email_enabled } = body;

    // Validate email if provided
    if (email_address && !isValidEmail(email_address)) {
      return NextResponse.json(
        { error: 'Invalid email address format' },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {
      user_id: userId,
      updated_at: new Date().toISOString(),
    };

    if (email_address !== undefined) {
      updateData.email_address = email_address;
      // Reset verification when email changes
      updateData.email_verified = false;
      await sendEmailChangeNotification(userId, email_address);
    }

    if (email_enabled !== undefined) {
      updateData.email_enabled = email_enabled;
    }

    // Upsert email preferences
    const { data, error } = await supabase
      .from('email_preferences')
      .upsert(updateData, {
        onConflict: 'user_id',
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating email preferences:', error);
      return NextResponse.json(
        { error: 'Failed to update preferences' },
        { status: 500 }
      );
    }


    return NextResponse.json({
      success: true,
      preferences: {
        email_address: data.email_address,
        email_verified: data.email_verified,
        email_enabled: data.email_enabled,
        updated_at: data.updated_at,
      },
      message: email_address ? 'Email preferences updated. Please verify your email.' : 'Email preferences updated.'
    });
  } catch (error: any) {
    console.error('POST /api/email/preferences error:', error?.message || 'Unknown error');
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete email preferences (stop all emails)
 */
export async function DELETE(req: NextRequest) {
  try {
    const userId = await getUserId(req);

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Delete email preferences
    const { error } = await supabase
      .from('email_preferences')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting email preferences:', error);
      return NextResponse.json(
        { error: 'Failed to delete preferences' },
        { status: 500 }
      );
    }


    return NextResponse.json({
      success: true,
      message: 'Email preferences deleted. You will no longer receive reminders.'
    });
  } catch (error: any) {
    console.error('DELETE /api/email/preferences error:', error?.message || 'Unknown error');
    return NextResponse.json(
      { error: 'Failed to delete preferences' },
      { status: 500 }
    );
  }
}
