'use client';

import { PricingModule, PricingPlan } from '@/components/pricing/PricingModule';
import {
  LANDING_DEDICATED_FEATURES,
  LANDING_FREE_FEATURES,
  LANDING_PRO_FEATURES,
} from '@/lib/pricing/plan-features';
import {
  LANDING_PLAN_COPY,
  shouldShowDedicatedPlanForSale,
} from '@/lib/pricing/sales-copy';
import {
  PLAN_LIST_PRICES,
  PLAN_PRICES,
  annualSavingsPercent,
} from '@/lib/pricing/plan-config';
import { Layers, Rocket, ShieldCheck } from 'lucide-react';

export function LandingPricing() {
  const plans: PricingPlan[] = [
    {
      id: 'free',
      name: 'Free',
      description: LANDING_PLAN_COPY.free.description,
      icon: <Layers className="w-10 h-10 text-muted-foreground" />,
      priceMonthly: PLAN_PRICES.free.month,
      priceYearly: PLAN_PRICES.free.year,
      users: LANDING_PLAN_COPY.free.users,
      buttonLabel: LANDING_PLAN_COPY.free.buttonLabel,
      features: LANDING_FREE_FEATURES,
      recommended: false,
    },
    {
      id: 'pro',
      name: 'Pro',
      description: LANDING_PLAN_COPY.pro.description,
      icon: <Rocket className="w-10 h-10 text-primary" />,
      priceMonthly: PLAN_PRICES.pro.month,
      priceMonthlyOriginal: PLAN_LIST_PRICES.pro.month,
      priceYearly: PLAN_PRICES.pro.year,
      priceYearlyOriginal: PLAN_LIST_PRICES.pro.year,
      users: LANDING_PLAN_COPY.pro.users,
      buttonLabel: LANDING_PLAN_COPY.pro.buttonLabel,
      features: LANDING_PRO_FEATURES,
      recommended: true,
      badge: 'Most popular',
    },
  ];

  if (shouldShowDedicatedPlanForSale()) {
    plans.push({
      id: 'dedicated',
      name: 'Dedicated',
      description: LANDING_PLAN_COPY.dedicated.description,
      icon: <ShieldCheck className="w-10 h-10 text-amber-600" />,
      priceMonthly: PLAN_PRICES.dedicated.month,
      priceMonthlyOriginal: PLAN_LIST_PRICES.dedicated.month,
      priceYearly: PLAN_PRICES.dedicated.year,
      priceYearlyOriginal: PLAN_LIST_PRICES.dedicated.year,
      users: LANDING_PLAN_COPY.dedicated.users,
      buttonLabel: LANDING_PLAN_COPY.dedicated.buttonLabel,
      features: LANDING_DEDICATED_FEATURES,
      recommended: false,
      badge: 'Priority support',
    });
  }

  return (
    <section id="pricing" className="py-24 bg-surface border-y border-border relative">
      <PricingModule
        title="Simple, Transparent Pricing"
        subtitle={
          shouldShowDedicatedPlanForSale()
            ? 'Start free for tracking. Pay only for daily alerts, auto USCIS checks, or Dedicated support.'
            : 'Start free for tracking. Pay only if you want daily reminders and auto USCIS checks.'
        }
        annualBillingLabel={`Annual Billing (Save up to ${annualSavingsPercent('pro')}%)`}
        buttonLabel={LANDING_PLAN_COPY.pro.buttonLabel}
        plans={plans}
        className="!bg-transparent !py-0"
        buildPlanHref={({ planId, interval }) => {
          if (planId === 'free') {
            return `/login?redirect=${encodeURIComponent('/dashboard')}`;
          }
          return `/login?redirect=${encodeURIComponent(
            `/premium/checkout?planId=${planId}&interval=${interval}`
          )}`;
        }}
      />
    </section>
  );
}
