import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// PATCH - Update user profile (full_name, timezone)
export async function PATCH(request: NextRequest) {
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

    const body = await request.json();
    const { full_name, timezone, degree_level, major_name, is_stem_eligible } = body;

    // Use service role key to bypass RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Update user metadata (full_name) in auth.users
    if (full_name !== undefined) {
      const { error: updateUserError } = await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        { user_metadata: { full_name } }
      );

      if (updateUserError) {
        console.error('Error updating user metadata:', updateUserError);
      }
    }

    // Update profile in profiles table
    const profileUpdate: any = { user_id: user.id };
    let hasProfileUpdate = false;

    if (timezone !== undefined) { profileUpdate.timezone = timezone; hasProfileUpdate = true; }
    if (degree_level !== undefined) { profileUpdate.degree_level = degree_level; hasProfileUpdate = true; }
    if (major_name !== undefined) { profileUpdate.major_name = major_name; hasProfileUpdate = true; }
    if (is_stem_eligible !== undefined) { profileUpdate.is_stem_eligible = is_stem_eligible; hasProfileUpdate = true; }

    if (hasProfileUpdate) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert(profileUpdate, {
          onConflict: 'user_id',
        });

      if (profileError) {
        console.error('Error updating profile:', profileError);
        return NextResponse.json(
          { error: 'Failed to update profile data' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

// GET - Fetch user profile
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

    // Fetch profile from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('timezone, is_stem_eligible, degree_level, major_name')
      .eq('user_id', user.id)
      .single();

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || '',
      },
      profile: {
        timezone: profile?.timezone || 'America/New_York',
        is_stem_eligible: profile?.is_stem_eligible || false,
        degree_level: profile?.degree_level || null,
        major_name: profile?.major_name || null,
      },
    });

  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
