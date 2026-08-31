import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { getUserId } from '@/lib/auth/get-user-id';
import { requireLiveStripeKeyInProduction } from '@/lib/stripe/require-live-key-in-production';

function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  requireLiveStripeKeyInProduction();
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-08-26.dahlia',
  });
}

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function GET(req: NextRequest) {
  try {
    // Supports both JWT (extension) and session-cookie (web) auth
    const userId = await getUserId(req);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get Stripe Customer ID from Profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    if (profileError || !profile?.stripe_customer_id) {
      return NextResponse.json({ invoices: [] }); // No customer ID = No invoices
    }

    const stripe = getStripe();

    // 3. Fetch Invoices from Stripe
    const invoices = await stripe.invoices.list({
      customer: profile.stripe_customer_id,
      limit: 12,
      status: 'paid',
    });

    // 4. Transform Data for Frontend
    const formattedInvoices = invoices.data.map((invoice) => ({
      id: invoice.id,
      date: new Date(invoice.created * 1000).toISOString(),
      amount: invoice.total / 100, // Convert cents to dollars
      currency: invoice.currency.toUpperCase(),
      status: invoice.status,
      pdf_url: invoice.invoice_pdf,
      number: invoice.number,
    }));

    return NextResponse.json({ invoices: formattedInvoices });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}
