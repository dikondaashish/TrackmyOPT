import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-09-30.clover',
});

// Initialize Supabase
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
    try {
        // 1. Authenticate User
        const cookieStore = await cookies();
        const supabaseAuth = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                },
            }
        );

        const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Get Stripe Customer ID from Profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('stripe_customer_id')
            .eq('user_id', user.id)
            .single();

        if (profileError || !profile?.stripe_customer_id) {
            return NextResponse.json({ invoices: [] }); // No customer ID = No invoices
        }

        // 3. Fetch Invoices from Stripe
        const invoices = await stripe.invoices.list({
            customer: profile.stripe_customer_id,
            limit: 12,
            status: 'paid',
        });

        // 4. Transform Data for Frontend
        const formattedInvoices = invoices.data.map(invoice => ({
            id: invoice.id,
            date: new Date(invoice.created * 1000).toISOString(),
            amount: invoice.total / 100, // Convert cents to dollars
            currency: invoice.currency.toUpperCase(),
            status: invoice.status,
            pdf_url: invoice.invoice_pdf,
            number: invoice.number
        }));

        return NextResponse.json({ invoices: formattedInvoices });

    } catch (error) {
        console.error('Error fetching invoices:', error);
        return NextResponse.json(
            { error: 'Failed to fetch invoices' },
            { status: 500 }
        );
    }
}
