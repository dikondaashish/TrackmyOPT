import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getUserId } from '@/lib/auth/get-user-id';
import { requireLiveStripeKeyInProduction } from '@/lib/stripe/require-live-key-in-production';

export const dynamic = 'force-dynamic';

function getStripe(): Stripe {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    requireLiveStripeKeyInProduction();
    return new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2026-08-26.dahlia',
    });
}

const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function resolveUserId(req: NextRequest): Promise<string | null> {
    const fromHeader = await getUserId(req);
    if (fromHeader) return fromHeader;

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
                        /* ignore */
                    }
                },
                remove(name: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value: '', ...options });
                    } catch {
                        /* ignore */
                    }
                },
            },
        }
    );
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
}

async function createPortalSession(userId: string): Promise<{ url: string } | { error: string; status: number }> {
    const { data: profile, error } = await adminSupabase
        .from('profiles')
        .select('stripe_customer_id')
        .eq('user_id', userId)
        .single();

    if (error || !profile?.stripe_customer_id) {
        return { error: 'No subscription found', status: 404 };
    }

    const allowedOrigin =
        process.env.NEXT_PUBLIC_SITE_URL ||
        process.env.NEXT_PUBLIC_APP_URL ||
        'https://www.trackmyopt.com';

    const returnUrl = `${allowedOrigin}/dashboard/settings?tab=subscription`;
    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
        customer: profile.stripe_customer_id,
        return_url: returnUrl,
    });

    if (!session.url) {
        return { error: 'Portal URL missing', status: 500 };
    }
    return { url: session.url };
}

/** JSON for in-app Manage billing buttons. */
export async function POST(req: NextRequest) {
    try {
        const userId = await resolveUserId(req);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const result = await createPortalSession(userId);
        if ('error' in result) {
            return NextResponse.json({ error: result.error }, { status: result.status });
        }
        return NextResponse.json({ url: result.url });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Stripe Portal Error:', message);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * Phase 5: email deep-link — GET redirects straight into Stripe Customer Portal
 * so payment-failed CTAs skip Settings → Manage billing.
 */
export async function GET(req: NextRequest) {
    try {
        const userId = await resolveUserId(req);
        if (!userId) {
            const login = new URL('/login', req.url);
            login.searchParams.set(
                'returnTo',
                '/api/premium/portal'
            );
            return NextResponse.redirect(login);
        }

        const result = await createPortalSession(userId);
        if ('error' in result) {
            return NextResponse.redirect(
                new URL('/dashboard/settings?tab=subscription&billing=error', req.url)
            );
        }
        return NextResponse.redirect(result.url);
    } catch (error: unknown) {
        console.error('Stripe Portal GET Error:', error instanceof Error ? error.message : error);
        return NextResponse.redirect(
            new URL('/dashboard/settings?tab=subscription', req.url)
        );
    }
}
