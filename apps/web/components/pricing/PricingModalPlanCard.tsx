'use client';

import {
  ArrowRight,
  Check,
  Shield,
  Star,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  getPricingModalDedicatedConsentLabel,
  getPricingModalProConsentLabel,
  PRO_PAID_INTRO_PRICE,
  PRO_TRIAL_DAYS,
} from '@/lib/legal/legal-config';
import { cn } from '@/lib/utils';
import { formatMonthlyEquivalentFromYearly } from '@/lib/premium/format-monthly-equivalent-from-yearly';
import {
  PLAN_SALES_META,
  type PaidPlanId,
} from '@/lib/pricing/sales-copy';
import { LIMITED_TIME_OFFER } from '@/lib/pricing/plan-config';

export interface PricingPlanCardData {
  id: string;
  name: string;
  icon: LucideIcon;
  tagline: string;
  monthlyPrice: number;
  yearlyPrice: number;
  monthlyListPrice: number;
  yearlyListPrice: number;
  popular: boolean;
  current: boolean;
  iconBg: string;
  iconColor: string;
  borderColor: string;
  features: Array<{ text: string; included: boolean; isHeader: boolean }>;
}

interface PricingModalPlanCardProps {
  plan: PricingPlanCardData;
  isYearly: boolean;
  checkoutPage: boolean;
  isInitialPlan: boolean;
  isLoading: boolean;
  proConsent: boolean;
  dedicatedConsent: boolean;
  proIntroEligible: boolean | null;
  onProConsentToggle: () => void;
  onDedicatedConsentToggle: () => void;
  onUpgrade: (planId: string) => void;
}

export function PricingModalPlanCard({
  plan,
  isYearly,
  checkoutPage,
  isInitialPlan,
  isLoading,
  proConsent,
  dedicatedConsent,
  proIntroEligible,
  onProConsentToggle,
  onDedicatedConsentToggle,
  onUpgrade,
}: PricingModalPlanCardProps) {
  const Icon = plan.icon;
  const monthlyDisplay = plan.monthlyPrice;
  const yearlyTotal = plan.yearlyPrice;
  const monthlyListDisplay = plan.monthlyListPrice;
  const yearlyListTotal = plan.yearlyListPrice;
  const salesMeta =
    plan.id === 'pro' || plan.id === 'dedicated'
      ? PLAN_SALES_META[plan.id as PaidPlanId]
      : null;
  const hasProIntroOffer = plan.id === 'pro' && proIntroEligible === true;
  const proRenewalPrice = isYearly
    ? `$${yearlyTotal.toFixed(2)}/year`
    : `$${monthlyDisplay.toFixed(2)}/month`;
  const proListRenewalPrice = isYearly
    ? `$${yearlyListTotal.toFixed(2)}/year`
    : `$${monthlyListDisplay.toFixed(2)}/month`;

  return (
    <div
      id={`pricing-plan-${plan.id}`}
      className={cn(
        'relative rounded-2xl md:rounded-xl transition-all duration-300 flex flex-col h-full',
        plan.popular
          ? 'bg-gradient-to-b from-violet-500/[0.08] via-violet-500/[0.03] to-transparent ring-2 ring-violet-500/40 shadow-xl shadow-violet-500/10'
          : plan.id === 'dedicated'
            ? 'bg-gradient-to-b from-amber-500/[0.06] via-amber-500/[0.02] to-transparent ring-2 ring-amber-500/30 shadow-lg shadow-amber-500/5'
            : 'bg-card/60 border hover:border-border/80 hover:shadow-lg',
        plan.borderColor,
        isInitialPlan && 'ring-offset-2 ring-offset-background'
      )}
    >
      {plan.popular && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-10">
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[10px] font-bold uppercase tracking-wide shadow-lg shadow-violet-500/30">
            <Star className="w-3 h-3 fill-current" />
            {salesMeta?.badge ?? 'Most Popular'}
          </div>
        </div>
      )}

      {plan.id === 'dedicated' && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-10">
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[10px] font-bold uppercase tracking-wide shadow-lg shadow-amber-500/30">
            <Shield className="w-3 h-3" />
            {salesMeta?.badge ?? 'Priority Support'}
          </div>
        </div>
      )}

      <div
        className={cn(
          'p-4 sm:p-5 flex flex-col h-full',
          checkoutPage ? 'md:p-4' : 'md:p-3.5'
        )}
      >
        <div className="mb-3 md:mb-2">
          <div className="flex items-center gap-2.5 md:gap-2 mb-2 md:mb-1.5">
            <div className={cn('p-2 md:p-1.5 rounded-lg shadow-sm', plan.iconBg)}>
              <Icon
                className={cn(
                  'w-[18px] h-[18px] md:w-4 md:h-4',
                  plan.iconColor
                )}
              />
            </div>
            <div>
              <h3
                className={cn(
                  'font-bold text-foreground',
                  checkoutPage
                    ? 'text-base md:text-[15px]'
                    : 'text-base md:text-sm'
                )}
              >
                {plan.name}
              </h3>
              <p
                className={cn(
                  'text-muted-foreground leading-tight',
                  checkoutPage
                    ? 'text-[11px] md:text-xs'
                    : 'text-[11px] md:text-[10px]'
                )}
              >
                {plan.tagline}
              </p>
              {salesMeta && (
                <p
                  className={cn(
                    'text-[10px] md:text-[9px] font-medium mt-0.5',
                    plan.id === 'pro'
                      ? 'text-violet-600 dark:text-violet-400'
                      : 'text-amber-700 dark:text-amber-400'
                  )}
                >
                  Best for: {salesMeta.bestFor}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mb-3 md:mb-2 pb-3 md:pb-2 border-b border-border/50">
          {plan.id === 'free' ? (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl md:text-2xl font-bold tracking-tight text-foreground">
                  $0
                </span>
              </div>
              <p className="text-muted-foreground text-xs md:text-[11px] mt-0.5">
                Forever free
              </p>
            </>
          ) : hasProIntroOffer ? (
            <>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-violet-700 dark:text-violet-300">
                First-time Pro offer
              </p>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-4xl md:text-3xl font-bold tracking-tight text-foreground tabular-nums">
                  ${PRO_PAID_INTRO_PRICE.toFixed(2)}
                </span>
                <span className="text-sm md:text-xs font-medium text-muted-foreground">
                  for the first {PRO_TRIAL_DAYS} days
                </span>
              </div>
              <p className="mt-1 text-xs md:text-[11px] font-semibold text-violet-700 dark:text-violet-300">
                Then {proRenewalPrice}
                <span className="font-medium text-muted-foreground">
                  {' '}
                  · {LIMITED_TIME_OFFER.label}
                </span>
              </p>
              <p className="mt-0.5 text-[10px] md:text-[9px] text-muted-foreground">
                Regularly{' '}
                <span className="line-through tabular-nums">
                  {proListRenewalPrice}
                </span>
              </p>
            </>
          ) : isYearly ? (
            <>
              <div className="mb-0.5 text-[11px] font-medium text-muted-foreground/70 line-through tabular-nums">
                ${formatMonthlyEquivalentFromYearly(yearlyListTotal)}
                /mo
              </div>
              <div className="flex items-baseline gap-1 flex-wrap">
                <span
                  className={cn(
                    'font-bold tracking-tight text-foreground tabular-nums',
                    checkoutPage
                      ? 'text-3xl md:text-[1.65rem]'
                      : 'text-3xl md:text-2xl'
                  )}
                >
                  ${formatMonthlyEquivalentFromYearly(yearlyTotal)}
                </span>
                <span className="text-sm md:text-xs font-medium text-muted-foreground">
                  /mo
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-xs md:text-[11px] text-muted-foreground">
                <span className="text-muted-foreground/90">
                  ${yearlyTotal.toFixed(2)} billed yearly
                </span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {LIMITED_TIME_OFFER.label}
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="mb-0.5 text-[11px] font-medium text-muted-foreground/70 line-through tabular-nums">
                ${monthlyListDisplay.toFixed(2)}/mo
              </div>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span
                  className={cn(
                    'font-bold tracking-tight text-foreground tabular-nums',
                    checkoutPage
                      ? 'text-3xl md:text-[1.65rem]'
                      : 'text-3xl md:text-2xl'
                  )}
                >
                  ${monthlyDisplay}
                </span>
              </div>
              <p className="text-xs md:text-[11px] mt-0.5 font-semibold text-emerald-600 dark:text-emerald-400">
                {LIMITED_TIME_OFFER.label}
              </p>
            </>
          )}
          {salesMeta?.guarantee && (
            <p
              className={cn(
                'text-xs md:text-[11px] font-medium mt-1.5 md:mt-1',
                plan.id === 'dedicated'
                  ? 'text-amber-700 dark:text-amber-400'
                  : 'text-violet-600 dark:text-violet-400'
              )}
            >
              {plan.id === 'pro'
                ? proIntroEligible === true
                  ? 'Cancel before day 7 to avoid renewal.'
                  : proIntroEligible === null
                    ? 'Checking introductory-offer eligibility…'
                    : 'Regular billing starts today'
                : salesMeta.guarantee}
            </p>
          )}
        </div>

        <div className="mb-3 md:mb-2">
          {plan.current ? (
            <Button
              disabled
              variant="outline"
              className="w-full h-9 md:h-8 text-xs md:text-[11px] font-medium"
            >
              <Check className="w-3.5 h-3.5 md:w-3 md:h-3 mr-1.5" />
              Current Plan
            </Button>
          ) : plan.id === 'free' ? (
            <Button
              disabled
              variant="outline"
              className="w-full h-9 md:h-8 text-xs md:text-[11px] font-medium opacity-60"
            >
              Free Forever
            </Button>
          ) : (
            <>
              <label
                className={cn(
                  'flex items-start gap-2.5 rounded-lg border p-2.5 my-3 cursor-pointer min-h-[44px] select-none transition-all duration-200',
                  plan.id === 'pro'
                    ? proConsent
                      ? 'border-violet-500 bg-violet-500/[0.06]'
                      : 'border-border/60 bg-transparent hover:border-violet-400/50'
                    : dedicatedConsent
                      ? 'border-amber-500 bg-amber-500/[0.06]'
                      : 'border-border/60 bg-transparent hover:border-amber-400/50'
                )}
              >
                <input
                  type="checkbox"
                  checked={plan.id === 'pro' ? proConsent : dedicatedConsent}
                  onChange={() =>
                    plan.id === 'pro'
                      ? onProConsentToggle()
                      : onDedicatedConsentToggle()
                  }
                  className={cn(
                    'mt-0.5 h-4 w-4 shrink-0 rounded',
                    plan.id === 'pro' ? 'accent-violet-600' : 'accent-amber-500'
                  )}
                />
                <span
                  className={cn(
                    'leading-snug text-muted-foreground',
                    checkoutPage ? 'text-xs md:text-[13px]' : 'text-[11px]'
                  )}
                >
                  {plan.id === 'pro'
                    ? getPricingModalProConsentLabel({
                        interval: isYearly ? 'year' : 'month',
                        monthlyPrice: plan.monthlyPrice,
                        yearlyPrice: plan.yearlyPrice,
                        includeIntro: proIntroEligible === true,
                      })
                    : getPricingModalDedicatedConsentLabel({
                        interval: isYearly ? 'year' : 'month',
                        monthlyPrice: plan.monthlyPrice,
                        yearlyPrice: plan.yearlyPrice,
                      })}
                </span>
              </label>

              <p
                className={cn(
                  'leading-snug text-muted-foreground mb-2',
                  checkoutPage ? 'text-[11px] md:text-xs' : 'text-[10px]'
                )}
              >
                By continuing, you agree to the{' '}
                <Link
                  href="/terms"
                  className="underline underline-offset-2 hover:text-foreground"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Terms
                </Link>
                ,{' '}
                <Link
                  href="/privacy"
                  className="underline underline-offset-2 hover:text-foreground"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Privacy Policy
                </Link>
                , and{' '}
                <Link
                  href="/refund-policy"
                  className="underline underline-offset-2 hover:text-foreground"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Refund Policy
                </Link>
                .
              </p>

              <Button
                onClick={() => onUpgrade(plan.id)}
                disabled={
                  isLoading ||
                  (plan.id === 'pro' && proIntroEligible === null) ||
                  (plan.id === 'pro' ? !proConsent : !dedicatedConsent)
                }
                className={cn(
                  'w-full h-9 md:h-8 text-xs md:text-[11px] font-semibold transition-all duration-300',
                  plan.popular
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 md:hover:scale-[1.01]'
                    : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 md:hover:scale-[1.01]',
                  (plan.id === 'pro' ? !proConsent : !dedicatedConsent) &&
                    '!opacity-40 !cursor-not-allowed !shadow-none'
                )}
              >
                <span className="flex items-center gap-1.5">
                  {isLoading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : plan.popular ? (
                    <>
                      {proIntroEligible === true
                        ? `Start ${PRO_TRIAL_DAYS} Days for $${PRO_PAID_INTRO_PRICE.toFixed(2)}`
                        : proIntroEligible === null
                          ? 'Checking eligibility…'
                          : PLAN_SALES_META.pro.ctaNoTrial}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      {PLAN_SALES_META.dedicated.ctaDefault}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </span>
              </Button>
            </>
          )}
        </div>

        <div className="flex-1">
          {salesMeta && (
            <ul className="space-y-1.5 mb-3 pb-3 border-b border-border/40">
              {salesMeta.highlights.map((highlight) => (
                <li key={highlight} className="flex items-start gap-2">
                  <Check
                    className={cn(
                      'w-3.5 h-3.5 shrink-0 mt-0.5',
                      plan.id === 'pro'
                        ? 'text-violet-600 dark:text-violet-400'
                        : 'text-amber-600 dark:text-amber-400'
                    )}
                  />
                  <span className="text-xs md:text-[11px] font-medium text-foreground leading-snug">
                    {highlight}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <p className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground mb-2">
            Full feature list
          </p>
          <ul className="space-y-1.5 md:space-y-1 max-h-[min(280px,42vh)] overflow-y-auto pr-0.5">
            {plan.features.map((feature, idx) => (
              <li
                key={idx}
                className={cn(
                  'flex items-start gap-2 md:gap-1.5',
                  feature.isHeader && 'pt-0.5'
                )}
              >
                <div
                  className={cn(
                    'mt-0.5 flex-shrink-0 rounded-full p-0.5 md:p-px',
                    plan.popular
                      ? 'bg-violet-500/10'
                      : plan.id === 'dedicated'
                        ? 'bg-amber-500/10'
                        : 'bg-muted'
                  )}
                >
                  <Check
                    className={cn(
                      'w-2.5 h-2.5 md:w-2 md:h-2',
                      plan.popular
                        ? 'text-violet-600 dark:text-violet-400'
                        : plan.id === 'dedicated'
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-muted-foreground'
                    )}
                  />
                </div>
                <span
                  className={cn(
                    'text-xs md:text-[11px] leading-snug md:leading-tight',
                    feature.isHeader
                      ? 'font-semibold text-foreground'
                      : 'text-muted-foreground'
                  )}
                >
                  {feature.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
