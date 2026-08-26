'use client';

import {
  ArrowRight,
  Check,
  Crown,
  Shield,
  Sparkles,
  Star,
  Zap,
  Gift,
  Bell,
  Clock,
  FileCheck,
  Mail,
  CalendarDays,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  getPricingModalDedicatedConsentLabel,
  getPricingModalProConsentLabel,
  PRO_PAID_INTRO_PRICE,
  PRO_TRIAL_DAYS,
} from '@/lib/legal/legal-config';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { PromoCodeCheckoutBar } from '@/components/pricing/PromoCodeCheckoutBar';
import type { PromoCheckoutMode } from '@/lib/premium/promo-checkout-types';
import { buildPromoCheckoutBody } from '@/lib/premium/checkout-promo-payload';
import { formatMonthlyEquivalentFromYearly } from '@/lib/premium/format-monthly-equivalent-from-yearly';
import { getPlanCardFeatures } from '@/lib/pricing/plan-features';
import {
  PLAN_SALES_META,
  PRICING_MODAL,
  shouldShowDedicatedPlanForSale,
  type PaidPlanId,
} from '@/lib/pricing/sales-copy';
import { PlanPickerGuide } from '@/components/pricing/PlanPickerGuide';
import { capturePricingCtaViewed } from '@/lib/posthog-client';
import {
  LIMITED_TIME_OFFER,
  PLAN_LIST_PRICES,
  PLAN_PRICES,
  annualSavingsPercent,
} from '@/lib/pricing/plan-config';

interface PricingModalProps {
  open: boolean;
  onClose: () => void;
  userEmail?: string;
  isPremium?: boolean;
  initialPlan?: string;
  initialInterval?: string;
  /** Slightly larger desktop typography on /premium/checkout (full-page flow). */
  checkoutPage?: boolean;
}

function isYearlyBillingDefault(interval: string | undefined): boolean {
  return interval !== 'month';
}

const HEADER_BENEFITS: Array<{ icon: LucideIcon; title: string; sub: string }> =
  [
    {
      icon: Bell,
      title: 'Daily USCIS monitoring',
      sub: 'Auto-checks + status email',
    },
    {
      icon: Clock,
      title: 'Unemployment alerts',
      sub: 'Before 90 / 150-day limits',
    },
    {
      icon: FileCheck,
      title: 'Document vault',
      sub: 'EAD & I-20 expiry reminders',
    },
    {
      icon: CalendarDays,
      title: 'STEM deadline tracking',
      sub: 'Extension filing window reminders',
    },
    { icon: Mail, title: '9:00 AM ET reminders', sub: 'Daily, per tracker' },
    { icon: Shield, title: 'Stay organized', sub: 'Key dates in one place' },
  ];

/**
 * Decorative vertical marquee shown behind the header on the left/right edges.
 * Purely visual — hidden from assistive tech and pointer events.
 */
function HeaderBenefitTicker({ reverse = false }: { reverse?: boolean }) {
  return (
    <div
      className="flex flex-col gap-[var(--gap)] [--gap:0.6rem] [--duration:30s]"
      style={reverse ? { animationDirection: 'reverse' } : undefined}
    >
      {[0, 1].map((copy) => (
        <div
          key={copy}
          className="flex shrink-0 flex-col gap-[var(--gap)] animate-marquee-vertical"
          style={reverse ? { animationDirection: 'reverse' } : undefined}
        >
          {HEADER_BENEFITS.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                className="flex items-start gap-2 rounded-xl border border-border/40 bg-background/70 px-3 py-2 shadow-sm backdrop-blur-sm"
              >
                <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-500 dark:text-violet-400" />
                <div className="min-w-0 text-left">
                  <p className="text-[11px] font-semibold leading-tight text-foreground/80 truncate">
                    {b.title}
                  </p>
                  <p className="text-[10px] leading-snug text-muted-foreground truncate">
                    {b.sub}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export function PricingModal({
  open,
  onClose,
  userEmail,
  isPremium = false,
  initialPlan,
  initialInterval,
  checkoutPage = false,
}: PricingModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  /** Annual on by default; only `initialInterval === "month"` forces monthly (user can toggle anytime). */
  const [isYearly, setIsYearly] = useState(() =>
    isYearlyBillingDefault(initialInterval)
  );
  const [promoMode, setPromoMode] = useState<PromoCheckoutMode>('default');
  const [customPromoInput, setCustomPromoInput] = useState('');
  const [promoError, setPromoError] = useState<string | null>(null);
  const [proConsent, setProConsent] = useState(false);
  const [dedicatedConsent, setDedicatedConsent] = useState(false);
  const [proIntroEligible, setProIntroEligible] = useState<boolean | null>(
    null
  );

  useEffect(() => {
    if (!open || isPremium) {
      return;
    }
    capturePricingCtaViewed({
      variant: 'control',
      source: 'pricing_modal',
    });
  }, [open, isPremium]);

  useEffect(() => {
    if (!open) return;
    setIsYearly(isYearlyBillingDefault(initialInterval));
  }, [open, initialInterval]);

  useEffect(() => {
    if (open) {
      setPromoMode('default');
      setCustomPromoInput('');
      setPromoError(null);
      setProConsent(false);
      setDedicatedConsent(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (isPremium) {
      setProIntroEligible(false);
      return;
    }

    const controller = new AbortController();
    setProIntroEligible(null);
    void fetch('/api/premium/status', {
      credentials: 'include',
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok)
          throw new Error('Unable to verify introductory eligibility');
        return response.json();
      })
      .then((status) => {
        const eligible =
          status?.proPaidIntroEligible ?? status?.proFreeTrialEligible;
        setProIntroEligible(eligible === true);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError')
          return;
        // Fail closed: never advertise an introductory offer we cannot verify.
        setProIntroEligible(false);
      });

    return () => controller.abort();
  }, [open, isPremium]);

  useEffect(() => {
    setProConsent(false);
    setDedicatedConsent(false);
  }, [isYearly]);

  useEffect(() => {
    setProConsent(false);
  }, [proIntroEligible]);

  useEffect(() => {
    if (!open || !initialPlan) return;
    const timer = window.setTimeout(() => {
      document.getElementById(`pricing-plan-${initialPlan}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }, 150);
    return () => window.clearTimeout(timer);
  }, [open, initialPlan]);

  const handleUpgrade = async (selectedPlan: string) => {
    setIsLoading(true);
    setPromoError(null);

    const currentInterval = isYearly ? 'year' : 'month';

    try {
      const promoFields = buildPromoCheckoutBody(promoMode, customPromoInput);
      const response = await fetch('/api/premium/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          planId: selectedPlan,
          interval: currentInterval,
          recurringBillingAccepted: true,
          ...promoFields,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        const msg =
          typeof payload?.message === 'string'
            ? payload.message
            : typeof payload?.error === 'string'
              ? payload.error
              : 'Failed to create checkout session';

        if (payload?.portalUrl && typeof payload.portalUrl === 'string') {
          const usePortal = window.confirm(
            `${msg}\n\nOpen billing portal to update payment or manage your subscription?`
          );
          if (usePortal) {
            window.location.href = payload.portalUrl;
            return;
          }
        }

        if (
          payload?.hostedInvoiceUrl &&
          typeof payload.hostedInvoiceUrl === 'string'
        ) {
          window.location.href = payload.hostedInvoiceUrl;
          return;
        }

        setPromoError(msg);
        setIsLoading(false);
        return;
      }

      if (payload?.type === 'checkout' && payload?.url) {
        window.location.href = payload.url;
        return;
      }

      if (payload?.type === 'subscription_updated' && payload?.redirect) {
        window.location.href = payload.redirect;
        return;
      }

      if (payload?.type === 'already_subscribed') {
        if (payload?.portalUrl) {
          window.location.href = payload.portalUrl;
          return;
        }
        setPromoError(
          typeof payload?.message === 'string'
            ? payload.message
            : 'You already have an active subscription.'
        );
        setIsLoading(false);
        return;
      }

      if (
        payload?.type === 'payment_action_required' ||
        payload?.type === 'payment_required'
      ) {
        if (payload?.hostedInvoiceUrl) {
          window.location.href = payload.hostedInvoiceUrl;
          return;
        }
        if (payload?.portalUrl) {
          window.location.href = payload.portalUrl;
          return;
        }
        setPromoError(
          typeof payload?.message === 'string'
            ? payload.message
            : 'Payment is required to complete this upgrade.'
        );
        setIsLoading(false);
        return;
      }

      if (payload?.url) {
        window.location.href = payload.url;
        return;
      }

      setPromoError(
        'Unexpected checkout response. Please try again or contact support.'
      );
      setIsLoading(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to start upgrade process.';
      setPromoError(message);
      setIsLoading(false);
    }
  };

  const plans = useMemo((): Array<{
    id: string;
    name: string;
    icon: typeof Zap;
    tagline: string;
    monthlyPrice: number;
    yearlyPrice: number;
    monthlyListPrice: number;
    yearlyListPrice: number;
    popular: boolean;
    current: boolean;
    trial?: string;
    iconBg: string;
    iconColor: string;
    borderColor: string;
    ringColor?: string;
    features: Array<{ text: string; included: boolean; isHeader: boolean }>;
  }> => {
    const allPlans = [
      {
        id: 'free',
        name: 'Free',
        icon: Zap,
        tagline: 'Essential tools to start',
        monthlyPrice: PLAN_PRICES.free.month,
        yearlyPrice: PLAN_PRICES.free.year,
        monthlyListPrice: PLAN_LIST_PRICES.free.month,
        yearlyListPrice: PLAN_LIST_PRICES.free.year,
        popular: false,
        current: !isPremium,
        iconBg: 'bg-slate-100 dark:bg-slate-800',
        iconColor: 'text-slate-600 dark:text-slate-400',
        borderColor: 'border-border/60',
        features: getPlanCardFeatures('free'),
      },
      {
        id: 'pro',
        name: 'Pro',
        icon: Crown,
        tagline: PLAN_SALES_META.pro.tagline,
        monthlyPrice: PLAN_PRICES.pro.month,
        yearlyPrice: PLAN_PRICES.pro.year,
        monthlyListPrice: PLAN_LIST_PRICES.pro.month,
        yearlyListPrice: PLAN_LIST_PRICES.pro.year,
        popular: true,
        current: isPremium,
        iconBg: 'bg-gradient-to-br from-violet-500 to-indigo-600',
        iconColor: 'text-white',
        borderColor: 'border-violet-500/50',
        ringColor: 'ring-violet-500/20',
        features: getPlanCardFeatures('pro'),
      },
      {
        id: 'dedicated',
        name: 'Dedicated',
        icon: Shield,
        tagline: PLAN_SALES_META.dedicated.tagline,
        monthlyPrice: PLAN_PRICES.dedicated.month,
        yearlyPrice: PLAN_PRICES.dedicated.year,
        monthlyListPrice: PLAN_LIST_PRICES.dedicated.month,
        yearlyListPrice: PLAN_LIST_PRICES.dedicated.year,
        popular: false,
        current: false,
        iconBg: 'bg-gradient-to-br from-amber-400 to-orange-500',
        iconColor: 'text-white',
        borderColor: 'border-amber-500/30',
        features: getPlanCardFeatures('dedicated'),
      },
    ];
    // The feature flag can pause new Dedicated sales without removing existing access.
    return shouldShowDedicatedPlanForSale()
      ? allPlans
      : allPlans.filter((p) => p.id !== 'dedicated');
  }, [isPremium]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        onClose={onClose}
        className={cn(
          'max-w-[1100px] w-[95vw] p-0 gap-0 overflow-hidden border border-border/50 bg-background shadow-2xl flex flex-col',
          checkoutPage
            ? 'max-h-[min(95vh,920px)] md:text-base lg:text-[15px]'
            : 'max-h-[min(92vh,880px)] md:text-[15px]'
        )}
      >
        {/* Header Section */}
        <div className="relative shrink-0 overflow-hidden px-5 sm:px-6 md:px-5 pt-5 pb-3 sm:pb-4 md:pt-4 md:pb-2 text-center border-b border-border/30 bg-gradient-to-b from-muted/40 via-muted/20 to-transparent">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.08),transparent_50%)]" />

          {/* Decorative scrolling benefit columns (left + right, behind content) */}
          <div
            className="pointer-events-none absolute inset-0 z-0 hidden select-none lg:block"
            aria-hidden="true"
          >
            <div className="absolute inset-y-0 left-0 w-44 overflow-hidden opacity-60 [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_82%,transparent)]">
              <div className="px-3 py-2">
                <HeaderBenefitTicker />
              </div>
            </div>
            <div className="absolute inset-y-0 right-0 w-44 overflow-hidden opacity-60 [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_82%,transparent)]">
              <div className="px-3 py-2">
                <HeaderBenefitTicker reverse />
              </div>
            </div>
          </div>

          <div className="relative z-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 md:px-2.5 md:py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 text-[11px] md:text-[10px] font-semibold mb-2 md:mb-1.5 border border-violet-500/20">
              <Shield className="w-3 h-3 md:w-2.5 md:h-2.5" />
              {PRICING_MODAL.badge}
            </div>

            {/* Title */}
            <h2
              className={cn(
                'text-xl sm:text-2xl font-bold tracking-tight text-foreground mb-1',
                checkoutPage
                  ? 'md:text-2xl lg:text-[1.4rem]'
                  : 'md:text-xl lg:text-[1.35rem]'
              )}
            >
              {PRICING_MODAL.title}
            </h2>
            <p
              className={cn(
                'text-muted-foreground max-w-lg mx-auto leading-snug',
                checkoutPage
                  ? 'text-xs sm:text-sm md:text-sm'
                  : 'text-xs sm:text-sm md:text-xs'
              )}
            >
              {PRICING_MODAL.subtitle}
            </p>
            <p
              className={cn(
                'text-muted-foreground/90 max-w-xl mx-auto mt-2 leading-snug',
                checkoutPage
                  ? 'text-[11px] sm:text-xs'
                  : 'text-[10px] sm:text-[11px]'
              )}
            >
              {PRICING_MODAL.valueAnchor}
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-2.5 mt-3 sm:mt-4 md:mt-2.5">
              <span
                className={cn(
                  'text-sm md:text-xs font-medium transition-all duration-200',
                  !isYearly ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                Monthly
              </span>

              <button
                onClick={() => setIsYearly(!isYearly)}
                className={cn(
                  'relative w-16 h-8 md:w-14 md:h-7 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-violet-500/40',
                  isYearly
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/30'
                    : 'bg-muted border border-border'
                )}
                aria-label="Toggle billing period"
              >
                <div
                  className={cn(
                    'absolute top-1 w-6 h-6 md:w-5 md:h-5 md:top-1 rounded-full bg-white shadow-md transition-all duration-300 ease-out',
                    isYearly ? 'left-[34px] md:left-[30px]' : 'left-1'
                  )}
                />
              </button>

              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'text-sm md:text-xs font-medium transition-all duration-200',
                    isYearly ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  Annual
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 md:px-2 md:py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] md:text-[9px] font-bold uppercase tracking-wider border border-green-500/20">
                  <Gift className="w-3 h-3" />
                  Save up to {annualSavingsPercent('pro')}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain">
          <div
            className={cn(
              'p-4 sm:p-5 pt-3',
              checkoutPage ? 'md:p-5 lg:p-6 md:pt-3' : 'md:p-4 lg:p-5 md:pt-2'
            )}
          >
            <div className="mb-3 md:mb-2 max-w-xs mx-auto w-full">
              <PromoCodeCheckoutBar
                compact
                mode={promoMode}
                customCode={customPromoInput}
                error={promoError}
                disabled={isLoading}
                onRemoveDefault={() => {
                  setPromoMode('custom-entry');
                  setCustomPromoInput('');
                  setPromoError(null);
                }}
                onCustomCodeChange={(v) => {
                  setCustomPromoInput(v);
                  setPromoError(null);
                }}
                onApplyCustom={() => {
                  const t = customPromoInput.trim();
                  if (!t) return;
                  setPromoMode('custom');
                  setPromoError(null);
                }}
                onClearCustom={() => {
                  setPromoMode('default');
                  setCustomPromoInput('');
                  setPromoError(null);
                }}
              />
              {proIntroEligible === true && (
                <p className="mt-1 text-center text-[10px] text-muted-foreground">
                  Promo codes cannot be combined with the $0.99 Pro
                  introduction.
                </p>
              )}
            </div>
            <div
              className={cn(
                'grid gap-3 sm:gap-4 md:gap-3 md:items-stretch',
                plans.length >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'
              )}
            >
              {plans.map((plan) => {
                const Icon = plan.icon;
                const monthlyDisplay = plan.monthlyPrice;
                const yearlyTotal = plan.yearlyPrice;
                const monthlyListDisplay = plan.monthlyListPrice;
                const yearlyListTotal = plan.yearlyListPrice;
                const salesMeta =
                  plan.id === 'pro' || plan.id === 'dedicated'
                    ? PLAN_SALES_META[plan.id as PaidPlanId]
                    : null;
                const isInitialPlan = initialPlan === plan.id;

                return (
                  <div
                    key={plan.id}
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
                    {/* Popular Badge */}
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
                      {/* Plan Header */}
                      <div className="mb-3 md:mb-2">
                        <div className="flex items-center gap-2.5 md:gap-2 mb-2 md:mb-1.5">
                          <div
                            className={cn(
                              'p-2 md:p-1.5 rounded-lg shadow-sm',
                              plan.iconBg
                            )}
                          >
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

                      {/* Price Section */}
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
                        ) : isYearly ? (
                          <>
                            <div className="mb-0.5 text-[11px] font-medium text-muted-foreground/70 line-through tabular-nums">
                              $
                              {formatMonthlyEquivalentFromYearly(
                                yearlyListTotal
                              )}
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
                                $
                                {formatMonthlyEquivalentFromYearly(yearlyTotal)}
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
                                ? `$${PRO_PAID_INTRO_PRICE.toFixed(2)} for the first ${PRO_TRIAL_DAYS} days, then regular billing`
                                : proIntroEligible === null
                                  ? 'Checking introductory-offer eligibility…'
                                  : 'Regular billing starts today'
                              : salesMeta.guarantee}
                          </p>
                        )}
                      </div>

                      {/* Consent + CTA Button */}
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
                            {/* Inline consent checkbox */}
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
                                checked={
                                  plan.id === 'pro'
                                    ? proConsent
                                    : dedicatedConsent
                                }
                                onChange={() =>
                                  plan.id === 'pro'
                                    ? setProConsent((v: boolean) => !v)
                                    : setDedicatedConsent((v: boolean) => !v)
                                }
                                className={cn(
                                  'mt-0.5 h-4 w-4 shrink-0 rounded',
                                  plan.id === 'pro'
                                    ? 'accent-violet-600'
                                    : 'accent-amber-500'
                                )}
                              />
                              <span
                                className={cn(
                                  'leading-snug text-muted-foreground',
                                  checkoutPage
                                    ? 'text-xs md:text-[13px]'
                                    : 'text-[11px]'
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
                                checkoutPage
                                  ? 'text-[11px] md:text-xs'
                                  : 'text-[10px]'
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
                              onClick={() => handleUpgrade(plan.id)}
                              disabled={
                                isLoading ||
                                (plan.id === 'pro' &&
                                  proIntroEligible === null) ||
                                (plan.id === 'pro'
                                  ? !proConsent
                                  : !dedicatedConsent)
                              }
                              className={cn(
                                'w-full h-9 md:h-8 text-xs md:text-[11px] font-semibold transition-all duration-300',
                                plan.popular
                                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 md:hover:scale-[1.01]'
                                  : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 md:hover:scale-[1.01]',
                                (plan.id === 'pro'
                                  ? !proConsent
                                  : !dedicatedConsent) &&
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

                      {/* Features List */}
                      <div className="flex-1">
                        {salesMeta && (
                          <ul className="space-y-1.5 mb-3 pb-3 border-b border-border/40">
                            {salesMeta.highlights.map((highlight) => (
                              <li
                                key={highlight}
                                className="flex items-start gap-2"
                              >
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
              })}
            </div>

            {promoError && (
              <p
                className="px-4 pb-2 text-xs text-destructive text-center"
                role="alert"
              >
                {promoError}
              </p>
            )}

            <div className="px-4 sm:px-5 md:px-4 pb-3">
              <PlanPickerGuide compact />
            </div>
          </div>

          {/* Footer Trust Section */}
          <div className="px-4 sm:px-5 md:px-4 pb-4 md:pb-3 pt-3 md:pt-2 border-t border-border/40 bg-background/95">
            <div className="flex flex-wrap items-center justify-center gap-x-6 md:gap-x-4 gap-y-2 md:gap-y-1">
              <div className="flex items-center gap-1.5 text-xs md:text-[11px] text-muted-foreground">
                <Shield className="w-3.5 h-3.5 text-green-600" />
                <span>Secure Payment</span>
              </div>
              {!isPremium && (
                <div className="flex items-center gap-1.5 text-xs md:text-[11px] text-muted-foreground">
                  <Sparkles className="w-3.5 h-3.5 md:w-3 md:h-3 text-violet-600" />
                  <span>
                    Pro: ${PRO_PAID_INTRO_PRICE.toFixed(2)} for {PRO_TRIAL_DAYS}{' '}
                    days for eligible accounts
                  </span>
                </div>
              )}
              {shouldShowDedicatedPlanForSale() ? (
                <div className="flex items-center gap-1.5 text-xs md:text-[11px] text-muted-foreground">
                  <Shield className="w-3.5 h-3.5 md:w-3 md:h-3 text-amber-600" />
                  <span>Dedicated: 3-day money-back</span>
                </div>
              ) : null}
              <div className="flex items-center gap-1.5 text-xs md:text-[11px] text-muted-foreground">
                <Zap className="w-3.5 h-3.5 md:w-3 md:h-3 text-amber-600" />
                <span>Cancel in Settings → Billing</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs md:text-[11px]">
                <span className="text-muted-foreground/60">Powered by</span>
                <span className="font-semibold text-foreground/80">Stripe</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
