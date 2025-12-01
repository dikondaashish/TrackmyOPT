import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function DELETE() {
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

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    // Use service role key to delete user and related data
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Delete user data from all tables (cascade should handle most, but let's be explicit)
    // Delete from profiles
    await supabaseAdmin.from('profiles').delete().eq('user_id', userId);
    
    // Delete from opt_status
    await supabaseAdmin.from('opt_status').delete().eq('user_id', userId);
    
    // Delete from documents
    await supabaseAdmin.from('documents').delete().eq('user_id', userId);
    
    // Delete from case_status
    await supabaseAdmin.from('case_status').delete().eq('user_id', userId);
    
    // Delete from tool_reminders
    await supabaseAdmin.from('tool_reminders').delete().eq('user_id', userId);
    
    // Delete from subscriptions
    await supabaseAdmin.from('subscriptions').delete().eq('user_id', userId);

    // Finally, delete the user from auth
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error('Error deleting user:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete account' },
        { status: 500 }
      );
    }

    // Sign out the user
    await supabase.auth.signOut();

    return NextResponse.json({ 
      success: true, 
      message: 'Account deleted successfully' 
    });

  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}
