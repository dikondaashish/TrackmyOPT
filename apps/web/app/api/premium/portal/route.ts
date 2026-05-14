
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { getUserId } from '@/lib/auth/getUserId';

// Initialize Stripe (Industry specific apiVersion matching existing code)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-09-30.clover' as any, // Type cast to avoid linter issues if types are old, but keeping version consistent
});

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);



export async function POST(req: NextRequest) {
    try {
        const userId = await getUserId(req);

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Fetch user profile to get stripe_customer_id
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('stripe_customer_id')
            .eq('user_id', userId)
            .single();

        if (error || !profile?.stripe_customer_id) {
            return NextResponse.json(
                { error: 'No subscription found' },
                { status: 404 }
            );
        }

        // Determine return URL — use env-configured site URL only to prevent open redirect.
        const allowedOrigin =
            process.env.NEXT_PUBLIC_SITE_URL ||
            process.env.NEXT_PUBLIC_APP_URL ||
            'https://www.trackmyopt.com';

        const returnUrl = `${allowedOrigin}/dashboard/settings?tab=subscription`;

        // Create Portal Session
        const session = await stripe.billingPortal.sessions.create({
            customer: profile.stripe_customer_id,
            return_url: returnUrl,
        });

        return NextResponse.json({ url: session.url });

    } catch (error: any) {
        console.error('Stripe Portal Error:', error?.message || 'Unknown error');
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
