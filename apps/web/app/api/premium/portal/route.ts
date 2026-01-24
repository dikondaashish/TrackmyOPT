
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

// Initialize Stripe (Industry specific apiVersion matching existing code)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-09-30.clover' as any, // Type cast to avoid linter issues if types are old, but keeping version consistent
});

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getUserId(req: NextRequest): Promise<string | null> {
    // Try JWT (extension)
    const authHeader = req.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
            const decoded = await verifyToken(token);
            if (decoded) return decoded.userId || decoded.sub;
        } catch (error) {
            console.error('JWT verification error:', error);
        }
    }

    // Try session (web)
    const cookieStore = cookies();
    const sessionClient = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set() { },
                remove() { },
            },
        }
    );

    const { data: { user } } = await sessionClient.auth.getUser();
    return user?.id || null;
}

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

        // Determine return URL
        const origin = req.headers.get('origin') ||
            req.headers.get('referer')?.split('/').slice(0, 3).join('/') ||
            process.env.NEXT_PUBLIC_APP_URL ||
            'https://www.trackmyopt.com';

        const returnUrl = `${origin}/dashboard/settings?tab=subscription`;

        // Create Portal Session
        const session = await stripe.billingPortal.sessions.create({
            customer: profile.stripe_customer_id,
            return_url: returnUrl,
        });

        return NextResponse.json({ url: session.url });

    } catch (error: any) {
        console.error('Stripe Portal Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
