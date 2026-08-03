import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import Stripe from 'stripe';
import { cancelStripeSubscriptionsForCustomer } from '@/lib/premium/cancel-stripe-subscriptions-for-customer';
import { logIdPrefix, sanitizeError, secureLog } from '@/lib/secure-logger';

export const dynamic = 'force-dynamic';

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, {
    apiVersion: '2025-09-30.clover',
  });
}

export async function DELETE() {
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

    // Load billing id before any row deletes (profiles row holds stripe_customer_id)
    const { data: billingProfile } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .maybeSingle();

    const stripeCustomerId = billingProfile?.stripe_customer_id?.trim() || null;

    // Cancel active Stripe subscriptions so the user is not charged after leaving
    if (stripeCustomerId) {
      const stripe = getStripe();
      if (!stripe) {
        secureLog.warn(
          'Account delete: STRIPE_SECRET_KEY missing; skipping Stripe cancel (dev/local?)',
          { stripeCustomerId: logIdPrefix(stripeCustomerId) },
        );
      } else {
        try {
          const { cancelledIds } = await cancelStripeSubscriptionsForCustomer(stripe, stripeCustomerId);
          if (cancelledIds.length > 0) {
            secureLog.log(
              `Account delete: cancelled Stripe subscriptions: ${cancelledIds.map((id) => logIdPrefix(id)).join(', ')}`,
            );
          }
        } catch (err: unknown) {
          const code =
            typeof err === 'object' && err !== null && 'code' in err
              ? String((err as { code?: string }).code)
              : '';
          const message = err instanceof Error ? err.message : String(err);
          // Customer already removed in Stripe — still delete our account
          if (code === 'resource_missing' || message.includes('No such customer')) {
            secureLog.warn(
              'Account delete: Stripe customer not found, continuing:',
              logIdPrefix(stripeCustomerId),
            );
          } else {
            secureLog.error('Account delete: Stripe subscription cancel failed:', sanitizeError(err));
            return NextResponse.json(
              {
                error:
                  'We could not cancel your subscription with our payment provider. Open Settings → Subscription → Manage billing to cancel, then try deleting your account again.',
              },
              { status: 502 }
            );
          }
        }
      }
    }

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
    
    // Payment data (subscription state lives on profiles; no separate subscriptions table)
    await supabaseAdmin.from('payment_transactions').delete().eq('user_id', userId);

    // Job tracker & resume (interviews/followups CASCADE when applications deleted)
    await supabaseAdmin.from('job_applications').delete().eq('user_id', userId);
    await supabaseAdmin.from('job_stages').delete().eq('user_id', userId);
    await supabaseAdmin.from('resume_generations').delete().eq('user_id', userId);
    await supabaseAdmin.from('resumes').delete().eq('user_id', userId);

    // Session and OTP data
    await supabaseAdmin.from('user_sessions').delete().eq('user_id', userId);
    await supabaseAdmin.from('export_otps').delete().eq('user_id', userId);
    await supabaseAdmin.from('passcode_otps').delete().eq('user_id', userId);
    
    // Insurance eligibility data (table name: insurance_eligibility_checks)
    await supabaseAdmin.from('insurance_eligibility_checks').delete().eq('user_id', userId);

    // Application profile (autofill data)
    await supabaseAdmin.from('application_profile').delete().eq('user_id', userId);
    await supabaseAdmin.from('private_application_answers').delete().eq('user_id', userId);

    // Policy consent records
    await supabaseAdmin.from('policy_consents').delete().eq('user_id', userId);

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
