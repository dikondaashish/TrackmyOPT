# Premium Email Reminder System - Complete Implementation Guide

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Database Schema](#database-schema)
3. [Payment Integration (Stripe)](#payment-integration-stripe)
4. [Email Service Setup](#email-service-setup)
5. [Scheduled Email System](#scheduled-email-system)
6. [API Endpoints](#api-endpoints)
7. [Frontend Implementation](#frontend-implementation)
8. [Email Templates](#email-templates)
9. [Testing Strategy](#testing-strategy)
10. [Deployment Checklist](#deployment-checklist)

---

## 🎯 System Overview

### User Tiers

**Free Users:**
- ✅ Access to Chrome Extension
- ✅ Access to Web Dashboard
- ✅ All calculator tools
- ✅ Countdown timers
- ❌ No email reminders

**Premium Users ($2.99 lifetime):**
- ✅ Everything in Free
- ✅ Daily email reminders
- ✅ Email sent at 9:00 AM EST
- ✅ Personalized based on countdown data
- ✅ Multiple tool tracking support

### Email Reminder Logic

Users receive **ONE** email per day at 9:00 AM EST containing:
- All active countdowns they're tracking
- Days remaining for each
- Urgency-based messaging
- Action items based on timeline

---

## 💾 Database Schema

### 1. Update `profiles` Table

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS premium_status BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS premium_purchased_at TIMESTAMP;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;
```

### 2. Create `email_preferences` Table

```sql
CREATE TABLE email_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email_address TEXT NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  email_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE email_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own email preferences"
  ON email_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own email preferences"
  ON email_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own email preferences"
  ON email_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### 3. Create `email_queue` Table (for tracking sent emails)

```sql
CREATE TABLE email_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email_address TEXT NOT NULL,
  email_type TEXT NOT NULL, -- 'daily_reminder', 'urgent_alert', etc.
  email_data JSONB, -- Store countdown data
  sent_at TIMESTAMP,
  status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_email_queue_status ON email_queue(status);
CREATE INDEX idx_email_queue_user_id ON email_queue(user_id);
CREATE INDEX idx_email_queue_sent_at ON email_queue(sent_at);
```

### 4. Create `payment_transactions` Table

```sql
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_payment_intent_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  amount INTEGER NOT NULL, -- Amount in cents (299 = $2.99)
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL, -- 'pending', 'succeeded', 'failed', 'refunded'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(status);
```

---

## 💳 Payment Integration (Stripe)

### 1. Install Stripe SDK

```bash
cd web
npm install stripe @stripe/stripe-js
```

### 2. Environment Variables

Add to `.env.local`:

```bash
# Stripe Keys (get from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Stripe Webhook Secret (for production)
STRIPE_WEBHOOK_SECRET=whsec_...

# Product Price ID (create in Stripe Dashboard)
STRIPE_PREMIUM_PRICE_ID=price_...
```

### 3. Create Stripe Checkout API

**File: `web/app/api/premium/create-checkout/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { verifyToken } from '@/lib/jwt';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    // Get user ID from JWT or session
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = await verifyToken(token);
      userId = decoded?.userId || decoded?.sub;
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user data
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, premium_status, stripe_customer_id')
      .eq('user_id', userId)
      .single();

    if (profile?.premium_status) {
      return NextResponse.json(
        { error: 'Already premium' },
        { status: 400 }
      );
    }

    // Create or retrieve Stripe customer
    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile?.email,
        metadata: {
          supabase_user_id: userId,
        },
      });
      customerId = customer.id;

      // Save customer ID
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', userId);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: 299, // $2.99
            product_data: {
              name: 'TrackMyOPT Premium - Lifetime',
              description: 'Daily email reminders for your OPT deadlines',
              images: ['https://trackmyopt.com/premium-icon.png'], // Add your logo
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/premium/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/premium/cancelled`,
      metadata: {
        supabase_user_id: userId,
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

### 4. Create Webhook Handler

**File: `web/app/api/premium/webhook/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.supabase_user_id;

      if (!userId) {
        console.error('No user ID in session metadata');
        break;
      }

      // Update user to premium
      await supabase
        .from('profiles')
        .update({
          premium_status: true,
          premium_purchased_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      // Record transaction
      await supabase
        .from('payment_transactions')
        .insert({
          user_id: userId,
          stripe_payment_intent_id: session.payment_intent as string,
          stripe_customer_id: session.customer as string,
          amount: 299,
          currency: 'usd',
          status: 'succeeded',
        });

      console.log(`User ${userId} upgraded to premium`);
      break;
    }

    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log('Payment succeeded:', paymentIntent.id);
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.error('Payment failed:', paymentIntent.id);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
```

### 5. Create Premium Status Check API

**File: `web/app/api/premium/status/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

async function getUserId(req: NextRequest): Promise<string | null> {
  // Try JWT (extension)
  const authHeader = req.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const decoded = await verifyToken(token);
    if (decoded) return decoded.userId || decoded.sub;
  }

  // Try session (web)
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set() {},
        remove() {},
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId(req);

    if (!userId) {
      return NextResponse.json(
        { isPremium: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: profile } = await supabase
      .from('profiles')
      .select('premium_status, premium_purchased_at')
      .eq('user_id', userId)
      .single();

    return NextResponse.json({
      isPremium: profile?.premium_status || false,
      purchasedAt: profile?.premium_purchased_at || null,
    });
  } catch (error: any) {
    console.error('Premium status check error:', error);
    return NextResponse.json(
      { isPremium: false, error: error.message },
      { status: 500 }
    );
  }
}
```

---

## 📧 Email Service Setup

### 1. Choose Email Provider

**Options:**
- **Resend** (Recommended) - Modern, developer-friendly
- **SendGrid** - Reliable, scalable
- **AWS SES** - Cost-effective for high volume
- **Hostinger SMTP** - You already have this

**Recommendation: Use Resend** for better deliverability and ease of use.

### 2. Install Resend

```bash
cd web
npm install resend
```

### 3. Environment Variables

```bash
# Resend API Key (get from https://resend.com/api-keys)
RESEND_API_KEY=re_...

# Sender email (must be verified in Resend)
EMAIL_FROM=reminders@trackmyopt.com
EMAIL_FROM_NAME=TrackMyOPT Reminders
```

### 4. Create Email Service

**File: `web/lib/email-service.ts`**

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailReminderData {
  userId: string;
  userEmail: string;
  firstName: string;
  tools: {
    name: string;
    daysLeft: number;
    endDate: string;
    urgency: 'safe' | 'moderate' | 'urgent' | 'critical';
    message: string;
  }[];
}

export async function sendDailyReminder(data: EmailReminderData) {
  try {
    const { data: emailResult, error } = await resend.emails.send({
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to: data.userEmail,
      subject: getDynamicSubject(data.tools),
      html: generateEmailHTML(data),
    });

    if (error) {
      console.error('Email send error:', error);
      return { success: false, error };
    }

    console.log(`Email sent successfully to ${data.userEmail}:`, emailResult);
    return { success: true, messageId: emailResult.id };
  } catch (error) {
    console.error('Email service error:', error);
    return { success: false, error };
  }
}

function getDynamicSubject(tools: EmailReminderData['tools']): string {
  const minDays = Math.min(...tools.map(t => t.daysLeft));
  
  if (minDays <= 7) {
    return `🚨 URGENT: ${minDays} days left - Action required!`;
  } else if (minDays <= 14) {
    return `⚠️ ${minDays} days remaining - Don't delay!`;
  } else if (minDays <= 30) {
    return `📅 ${minDays} days left - Time to prepare`;
  } else {
    return `✅ TrackMyOPT Daily Update - ${minDays} days remaining`;
  }
}

function generateEmailHTML(data: EmailReminderData): string {
  const toolsHTML = data.tools.map(tool => {
    const bgColor = getUrgencyColor(tool.urgency);
    const emoji = getUrgencyEmoji(tool.urgency);
    
    return `
      <div style="background: ${bgColor}; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
        <h3 style="margin: 0 0 8px 0; color: #1F2937; font-size: 18px;">
          ${emoji} ${tool.name}
        </h3>
        <div style="font-size: 32px; font-weight: 800; color: #1F2937; margin: 12px 0;">
          ${tool.daysLeft} days left
        </div>
        <div style="color: #4B5563; font-size: 14px; margin-bottom: 8px;">
          Deadline: ${tool.endDate}
        </div>
        <div style="color: #374151; font-size: 15px; font-weight: 500;">
          ${tool.message}
        </div>
      </div>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>TrackMyOPT Daily Reminder</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F3F4F6;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #007AFF, #5856D6); border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 800;">
            TrackMyOPT
          </h1>
          <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
            Your Daily OPT Reminder
          </p>
        </div>

        <!-- Greeting -->
        <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h2 style="margin: 0 0 12px 0; color: #1F2937; font-size: 20px;">
            Good morning, ${data.firstName}! 👋
          </h2>
          <p style="margin: 0; color: #6B7280; font-size: 15px; line-height: 1.6;">
            Here's your daily update for ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <!-- Tools -->
        ${toolsHTML}

        <!-- Footer -->
        <div style="background: #F9FAFB; border-radius: 12px; padding: 20px; margin-top: 24px; text-align: center;">
          <p style="margin: 0 0 12px 0; color: #6B7280; font-size: 13px;">
            You're receiving this because you're a TrackMyOPT Premium member
          </p>
          <p style="margin: 0; color: #9CA3AF; font-size: 12px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings" style="color: #007AFF; text-decoration: none;">
              Manage email preferences
            </a> · 
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="color: #007AFF; text-decoration: none;">
              Open Dashboard
            </a>
          </p>
          <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #E5E7EB;">
            <p style="margin: 0; color: #9CA3AF; font-size: 11px;">
              © ${new Date().getFullYear()} TrackMyOPT. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

function getUrgencyColor(urgency: string): string {
  switch (urgency) {
    case 'safe': return '#D1FAE5'; // Light green
    case 'moderate': return '#DBEAFE'; // Light blue
    case 'urgent': return '#FED7AA'; // Light orange
    case 'critical': return '#FEE2E2'; // Light red
    default: return '#F3F4F6';
  }
}

function getUrgencyEmoji(urgency: string): string {
  switch (urgency) {
    case 'safe': return '✅';
    case 'moderate': return '📅';
    case 'urgent': return '⚠️';
    case 'critical': return '🚨';
    default: return '📋';
  }
}
```

---

## ⏰ Scheduled Email System

### Option 1: Vercel Cron Jobs (Recommended for Vercel deployment)

**File: `web/vercel.json`**

```json
{
  "crons": [
    {
      "path": "/api/cron/send-daily-reminders",
      "schedule": "0 13 * * *"
    }
  ]
}
```

Note: `0 13 * * *` = 1:00 PM UTC = 9:00 AM EST (accounting for EST being UTC-5)

**File: `web/app/api/cron/send-daily-reminders/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendDailyReminder, EmailReminderData } from '@/lib/email-service';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max execution

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    console.log('Starting daily reminder cron job...');

    // Get all premium users with email enabled
    const { data: premiumUsers, error: usersError } = await supabase
      .from('profiles')
      .select(`
        user_id,
        email,
        first_name,
        email_preferences (
          email_address,
          email_enabled,
          email_verified
        )
      `)
      .eq('premium_status', true);

    if (usersError) {
      console.error('Error fetching premium users:', usersError);
      return NextResponse.json({ error: usersError.message }, { status: 500 });
    }

    console.log(`Found ${premiumUsers?.length || 0} premium users`);

    const results = {
      total: premiumUsers?.length || 0,
      sent: 0,
      skipped: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Process each user
    for (const user of premiumUsers || []) {
      try {
        // Skip if email not enabled or not verified
        const emailPref = user.email_preferences?.[0];
        if (!emailPref?.email_enabled || !emailPref?.email_verified) {
          results.skipped++;
          continue;
        }

        // Get user's OPT data
        const { data: optData } = await supabase
          .from('opt_status')
          .select('*')
          .eq('user_id', user.user_id)
          .single();

        if (!optData) {
          results.skipped++;
          continue;
        }

        // Calculate countdowns for each tool
        const tools = [];

        // OPT Filing Window
        if (optData.program_end_date) {
          const programEnd = new Date(optData.program_end_date);
          const latestEnd = new Date(programEnd);
          latestEnd.setDate(latestEnd.getDate() + 60);
          const daysLeft = Math.ceil((latestEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

          if (daysLeft > 0) {
            tools.push({
              name: 'OPT Filing Window',
              daysLeft,
              endDate: latestEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
              urgency: getUrgency(daysLeft, 60),
              message: getFilingMessage(daysLeft),
            });
          }
        }

        // STEM OPT Filing Window
        if (optData.opt_ead_end_date) {
          const optEnd = new Date(optData.opt_ead_end_date);
          const daysLeft = Math.ceil((optEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

          if (daysLeft > 0) {
            tools.push({
              name: 'STEM OPT Filing Window',
              daysLeft,
              endDate: optEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
              urgency: getUrgency(daysLeft, 60),
              message: getStemFilingMessage(daysLeft),
            });
          }
        }

        // OPT Clock Tracker
        if (optData.opt_start_date) {
          const optStart = new Date(optData.opt_start_date);
          const endDate = new Date(optStart);
          endDate.setDate(endDate.getDate() + 90);
          const daysLeft = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

          if (daysLeft > 0) {
            tools.push({
              name: 'OPT Unemployment Days',
              daysLeft,
              endDate: endDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
              urgency: getUrgency(daysLeft, 90),
              message: getUnemploymentMessage(daysLeft, 90),
            });
          }
        }

        // Skip if no active tools
        if (tools.length === 0) {
          results.skipped++;
          continue;
        }

        // Send email
        const emailData: EmailReminderData = {
          userId: user.user_id,
          userEmail: emailPref.email_address,
          firstName: user.first_name || 'there',
          tools,
        };

        const result = await sendDailyReminder(emailData);

        if (result.success) {
          results.sent++;

          // Log to email_queue
          await supabase.from('email_queue').insert({
            user_id: user.user_id,
            email_address: emailPref.email_address,
            email_type: 'daily_reminder',
            email_data: tools,
            sent_at: new Date().toISOString(),
            status: 'sent',
          });
        } else {
          results.failed++;
          results.errors.push(`${user.email}: ${result.error}`);

          // Log failure
          await supabase.from('email_queue').insert({
            user_id: user.user_id,
            email_address: emailPref.email_address,
            email_type: 'daily_reminder',
            email_data: tools,
            status: 'failed',
            error_message: JSON.stringify(result.error),
          });
        }
      } catch (error: any) {
        results.failed++;
        results.errors.push(`${user.email}: ${error.message}`);
      }
    }

    console.log('Cron job completed:', results);

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

function getUrgency(daysLeft: number, total: number): 'safe' | 'moderate' | 'urgent' | 'critical' {
  const percentage = (daysLeft / total) * 100;
  if (percentage > 60) return 'safe';
  if (percentage > 30) return 'moderate';
  if (percentage > 10) return 'urgent';
  return 'critical';
}

function getFilingMessage(daysLeft: number): string {
  if (daysLeft > 45) return 'Start gathering your documents and prepare your application.';
  if (daysLeft > 30) return 'Schedule your DSO appointment and begin filling out Form I-765.';
  if (daysLeft > 14) return 'Finalize all documents and prepare to submit your application.';
  if (daysLeft > 7) return '⚠️ Submit your application this week! Processing takes 3-5 months.';
  return '🚨 URGENT: Submit TODAY to avoid missing your filing window!';
}

function getStemFilingMessage(daysLeft: number): string {
  if (daysLeft > 45) return 'Begin preparing your I-983 form with your employer.';
  if (daysLeft > 30) return 'Ensure your employer is E-Verified and finalize your training plan.';
  if (daysLeft > 14) return 'Schedule DSO appointment for STEM extension recommendation.';
  if (daysLeft > 7) return '⚠️ Submit before your current OPT expires to avoid gaps!';
  return '🚨 CRITICAL: Apply immediately to maintain your work authorization!';
}

function getUnemploymentMessage(daysLeft: number, total: number): string {
  const used = total - daysLeft;
  if (daysLeft > 75) return `You've used ${used} of ${total} unemployment days. Keep job searching!`;
  if (daysLeft > 60) return `${used} days used. Apply to multiple jobs daily.`;
  if (daysLeft > 45) return `${used}/${total} days used. Intensify your job search efforts.`;
  if (daysLeft > 30) return `⚠️ ${used} unemployment days used. Accept reasonable offers soon.`;
  if (daysLeft > 15) return `🚨 ${used}/${total} days used! Critical: Accept any offer in your field.`;
  return `🚨 EMERGENCY: Only ${daysLeft} days left! Contact your DSO immediately!`;
}
```

### Option 2: Node-Cron (For self-hosted)

**File: `web/lib/cron-scheduler.ts`**

```typescript
import cron from 'node-cron';
import { spawn } from 'child_process';

// Run daily at 9:00 AM EST (14:00 UTC)
export function startCronJobs() {
  console.log('Starting cron scheduler...');

  cron.schedule('0 14 * * *', () => {
    console.log('Running daily email reminder job...');
    
    // Call the API endpoint
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/cron/send-daily-reminders`, {
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET}`,
      },
    })
      .then(res => res.json())
      .then(data => console.log('Cron job result:', data))
      .catch(err => console.error('Cron job error:', err));
  }, {
    timezone: 'America/New_York'
  });

  console.log('Cron jobs initialized');
}
```

---

## 🔌 API Endpoints

### Email Preferences Management

**File: `web/app/api/email/preferences/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyToken } from '@/lib/jwt';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Get email preferences
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('email_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ preferences: data || null });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Update email preferences
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { email_address, email_enabled } = body;

    // Validate email
    if (email_address && !isValidEmail(email_address)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('email_preferences')
      .upsert({
        user_id: userId,
        email_address: email_address,
        email_enabled: email_enabled ?? true,
        email_verified: false, // Will be verified separately
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // TODO: Send verification email

    return NextResponse.json({ preferences: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function getUserId(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const decoded = await verifyToken(token);
    return decoded?.userId || decoded?.sub;
  }
  return null;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

---

## 🎨 Frontend Implementation

### Extension: Update checkPremiumStatus

**File: `extension/src/pages/opt-countdown.ts` (and others)**

```typescript
async function checkPremiumStatus(): Promise<boolean> {
  try {
    const { idToken } = await chrome.storage.sync.get('idToken');
    if (!idToken) return false;

    const response = await fetch(`${getApiBaseUrl()}/api/premium/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${idToken}`,
      },
    });

    const result = await response.json();
    return result.isPremium || false;
  } catch (error) {
    console.error('Premium status check error:', error);
    return false;
  }
}
```

### Extension: Update Premium Upgrade Button

Already implemented - just ensure it opens the correct URL:

```typescript
const upgradeBtn = content.querySelector('#upgrade-premium-btn');
if (upgradeBtn) {
  upgradeBtn.addEventListener('click', async () => {
    const { idToken } = await chrome.storage.sync.get('idToken');
    if (idToken) {
      // This will open the web app which will create checkout
      chrome.tabs.create({ 
        url: `${getApiBaseUrl()}/premium/checkout` 
      });
    } else {
      alert('Please sign in to upgrade to premium');
    }
  });
}
```

### Web: Premium Checkout Page

**File: `web/app/premium/checkout/page.tsx`**

```typescript
'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function PremiumCheckout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckout = async () => {
    setLoading(true);
    setError('');

    try {
      // Get auth token
      const token = localStorage.getItem('idToken');

      // Create checkout session
      const response = await fetch('/api/premium/create-checkout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🚀</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Go Premium
          </h1>
          <p className="text-gray-600">
            Never miss an OPT deadline again
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-white mb-6">
          <div className="text-center mb-4">
            <div className="text-5xl font-bold">$2.99</div>
            <div className="text-sm opacity-90 mt-1">One-time payment • Lifetime access</div>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-start gap-3">
            <div className="text-green-500 text-xl">✓</div>
            <div>
              <div className="font-semibold text-gray-900">Daily Email Reminders</div>
              <div className="text-sm text-gray-600">Get personalized reminders every morning at 9 AM EST</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="text-green-500 text-xl">✓</div>
            <div>
              <div className="font-semibold text-gray-900">Smart Urgency Detection</div>
              <div className="text-sm text-gray-600">Messages adapt based on your remaining time</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="text-green-500 text-xl">✓</div>
            <div>
              <div className="font-semibold text-gray-900">All Tools Included</div>
              <div className="text-sm text-gray-600">Track OPT, STEM, and unemployment days</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="text-green-500 text-xl">✓</div>
            <div>
              <div className="font-semibold text-gray-900">Lifetime Access</div>
              <div className="text-sm text-gray-600">Pay once, use forever. No subscriptions.</div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-4 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Loading...' : 'Upgrade to Premium'}
        </button>

        <p className="text-center text-xs text-gray-500 mt-4">
          Secure payment powered by Stripe
        </p>
      </div>
    </div>
  );
}
```

---

## ✅ Testing Strategy

### 1. Test Stripe Integration

```bash
# Use Stripe CLI to test webhooks locally
stripe listen --forward-to localhost:3000/api/premium/webhook

# Trigger test payment
stripe trigger checkout.session.completed
```

### 2. Test Email Sending

Create a test endpoint:

**File: `web/app/api/test/send-email/route.ts`**

```typescript
import { NextResponse } from 'next/server';
import { sendDailyReminder } from '@/lib/email-service';

export async function GET() {
  const testData = {
    userId: 'test-user-id',
    userEmail: 'your-email@example.com', // Use your email
    firstName: 'Test',
    tools: [
      {
        name: 'OPT Filing Window',
        daysLeft: 45,
        endDate: 'December 31, 2025',
        urgency: 'moderate' as const,
        message: 'Schedule your DSO appointment soon.',
      },
    ],
  };

  const result = await sendDailyReminder(testData);
  return NextResponse.json(result);
}
```

Test by visiting: `http://localhost:3000/api/test/send-email`

### 3. Test Cron Job Locally

```bash
# Call cron endpoint with auth
curl -X GET \
  http://localhost:3000/api/cron/send-daily-reminders \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## 🚀 Deployment Checklist

### Pre-Deployment

- [ ] Add all environment variables to production
- [ ] Set up Stripe webhook endpoint in Stripe Dashboard
- [ ] Verify domain in Resend for sending emails
- [ ] Test payment flow in Stripe test mode
- [ ] Test email sending to multiple providers (Gmail, Outlook, etc.)
- [ ] Set up proper DKIM/SPF records for email domain

### Stripe Setup

- [ ] Create product in Stripe Dashboard
- [ ] Set price to $2.99 (one-time payment)
- [ ] Copy Price ID to `STRIPE_PREMIUM_PRICE_ID`
- [ ] Set up webhook endpoint: `https://trackmyopt.com/api/premium/webhook`
- [ ] Copy webhook secret to `STRIPE_WEBHOOK_SECRET`
- [ ] Enable payment methods (card, Apple Pay, Google Pay)

### Email Setup

- [ ] Sign up for Resend (or chosen provider)
- [ ] Verify sending domain
- [ ] Set up DNS records (SPF, DKIM, DMARC)
- [ ] Test email deliverability to major providers
- [ ] Set up email templates
- [ ] Configure bounce/complaint handling

### Cron Setup (Vercel)

- [ ] Deploy `vercel.json` with cron configuration
- [ ] Set `CRON_SECRET` environment variable
- [ ] Test cron endpoint manually
- [ ] Monitor first automated run

### Database

- [ ] Run all migration SQL scripts
- [ ] Enable RLS policies
- [ ] Create indexes for performance
- [ ] Test with sample data
- [ ] Set up backups

### Monitoring

- [ ] Set up error logging (Sentry, LogRocket)
- [ ] Monitor email delivery rates
- [ ] Track payment success/failure rates
- [ ] Set up alerts for cron job failures
- [ ] Monitor API response times

---

## 📊 Success Metrics

Track these metrics to ensure system health:

1. **Payment Metrics:**
   - Conversion rate (free → premium)
   - Payment success rate
   - Refund rate

2. **Email Metrics:**
   - Daily email send rate
   - Delivery rate (should be >95%)
   - Open rate
   - Click-through rate
   - Bounce rate (should be <5%)
   - Unsubscribe rate

3. **Technical Metrics:**
   - Cron job success rate
   - API response times
   - Error rates
   - Database query performance

---

## 🔐 Security Considerations

1. **API Security:**
   - Always verify JWT tokens
   - Use HTTPS only
   - Rate limit API endpoints
   - Validate all user inputs

2. **Payment Security:**
   - Never store credit card info
   - Use Stripe's secure checkout
   - Verify webhook signatures
   - Log all transactions

3. **Email Security:**
   - Verify email addresses
   - Implement unsubscribe
   - Rate limit email sending
   - Monitor for abuse

4. **Data Privacy:**
   - GDPR compliance (if EU users)
   - Allow data export
   - Implement data deletion
   - Secure personal data

---

## 📝 Next Steps

1. **Implement Database Schema** - Run SQL migrations
2. **Set Up Stripe** - Create product and webhook
3. **Configure Email Service** - Set up Resend and verify domain
4. **Build API Endpoints** - Create all necessary routes
5. **Update Frontend** - Add premium UI components
6. **Test Everything** - Thorough testing before launch
7. **Deploy Gradually** - Start with test users
8. **Monitor & Iterate** - Track metrics and improve

---

## 🆘 Troubleshooting

### Emails Not Sending

1. Check Resend API key is correct
2. Verify domain is verified in Resend
3. Check DNS records (SPF, DKIM)
4. Review email queue for errors
5. Check spam folder

### Cron Not Running

1. Verify `vercel.json` is deployed
2. Check cron secret matches
3. Review Vercel logs for errors
4. Test endpoint manually
5. Verify timezone is correct

### Payments Failing

1. Check Stripe API keys
2. Verify webhook is receiving events
3. Review Stripe Dashboard for errors
4. Test with Stripe test cards
5. Check webhook signature verification

---

## 💡 Future Enhancements

1. **Multiple Email Times** - Let users choose reminder time
2. **SMS Reminders** - Add Twilio integration
3. **Slack/Discord Integration** - Send to workspace channels
4. **Weekly Summary** - Send weekly progress reports
5. **Custom Reminders** - Let users set custom deadlines
6. **Email Analytics** - Track which emails are most effective
7. **A/B Testing** - Test different email formats
8. **Push Notifications** - Browser push for instant alerts

---

**Need help? Contact: support@trackmyopt.com**

*Last updated: [Current Date]*

