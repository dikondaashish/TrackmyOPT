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
    const userEmail = user.email;

    // Use service role key to delete user and related data
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Add email to blocked_emails table to prevent re-registration
    if (userEmail) {
      await supabaseAdmin.from('blocked_emails').upsert({
        email: userEmail.toLowerCase(),
        reason: 'account_deleted',
        deleted_at: new Date().toISOString(),
      }, {
        onConflict: 'email',
      });
    }

    // Delete user data from ALL tables (explicit deletion for USCIS compliance)
    // Note: Most tables have ON DELETE CASCADE, but we're explicit for audit trail
    
    // Core user data
    await supabaseAdmin.from('profiles').delete().eq('user_id', userId);
    await supabaseAdmin.from('opt_status').delete().eq('user_id', userId);
    await supabaseAdmin.from('employment_spans').delete().eq('user_id', userId);
    await supabaseAdmin.from('case_status').delete().eq('user_id', userId);
    
    // Document vault data
    await supabaseAdmin.from('document_reminders').delete().eq('user_id', userId);
    await supabaseAdmin.from('documents').delete().eq('user_id', userId);
    await supabaseAdmin.from('document_passcodes').delete().eq('user_id', userId);
    
    // Email and notification data
    await supabaseAdmin.from('email_preferences').delete().eq('user_id', userId);
    await supabaseAdmin.from('email_queue').delete().eq('user_id', userId);
    await supabaseAdmin.from('notification_settings').delete().eq('user_id', userId);
    
    // Payment data
    await supabaseAdmin.from('payment_transactions').delete().eq('user_id', userId);
    await supabaseAdmin.from('subscriptions').delete().eq('user_id', userId);
    
    // Session and OTP data
    await supabaseAdmin.from('user_sessions').delete().eq('user_id', userId);
    await supabaseAdmin.from('export_otps').delete().eq('user_id', userId);
    await supabaseAdmin.from('passcode_otps').delete().eq('user_id', userId);
    
    // Insurance eligibility data
    await supabaseAdmin.from('insurance_eligibility').delete().eq('user_id', userId);
    
    // Policy consent records
    await supabaseAdmin.from('policy_consents').delete().eq('user_id', userId);
    
    // Legacy tables (if they exist)
    await supabaseAdmin.from('tool_reminders').delete().eq('user_id', userId);

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
