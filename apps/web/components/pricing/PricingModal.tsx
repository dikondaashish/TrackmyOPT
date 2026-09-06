'use client';

import { Crown, Shield, Zap } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { PromoCodeCheckoutBar } from '@/components/pricing/PromoCodeCheckoutBar';
import { HeaderBenefitTicker } from '@/components/pricing/PricingModalBenefitTicker';
import { PricingModalBillingToggle } from '@/components/pricing/PricingModalBillingToggle';
import {
  PricingModalPlanCard,
  type PricingPlanCardData,
} from '@/components/pricing/PricingModalPlanCard';
import { PricingModalTrustFooter } from '@/components/pricing/PricingModalTrustFooter';
import type { PromoCheckoutMode } from '@/lib/premium/promo-checkout-types';
import { buildPromoCheckoutBody } from '@/lib/premium/checkout-promo-payload';
import { getPlanCardFeatures } from '@/lib/pricing/plan-features';
import {
  PLAN_SALES_META,
  PRICING_MODAL,
  shouldShowDedicatedPlanForSale,
} from '@/lib/pricing/sales-copy';
import { PlanPickerGuide } from '@/components/pricing/PlanPickerGuide';
import { capturePricingCtaViewed } from '@/lib/posthog-client';
import { PLAN_LIST_PRICES, PLAN_PRICES } from '@/lib/pricing/plan-config';

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

  const plans = useMemo((): PricingPlanCardData[] => {
    const allPlans: PricingPlanCardData[] = [
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
        <div className="relative shrink-0 overflow-hidden px-5 sm:px-6 md:px-5 pt-5 pb-3 sm:pb-4 md:pt-4 md:pb-2 text-center border-b border-border/30 bg-gradient-to-b from-muted/40 via-muted/20 to-transparent">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.08),transparent_50%)]" />

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
            <div className="inline-flex items-center gap-1.5 px-3 py-1 md:px-2.5 md:py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 text-[11px] md:text-[10px] font-semibold mb-2 md:mb-1.5 border border-violet-500/20">
              <Shield className="w-3 h-3 md:w-2.5 md:h-2.5" />
              {PRICING_MODAL.badge}
            </div>

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

            <PricingModalBillingToggle
              isYearly={isYearly}
              onToggle={() => setIsYearly(!isYearly)}
            />
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
                  A promo code replaces the public offer after your $0.99
                  introductory period.
                </p>
              )}
            </div>
            <div
              className={cn(
                'grid gap-3 sm:gap-4 md:gap-3 md:items-stretch',
                plans.length >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'
              )}
            >
              {plans.map((plan) => (
                <PricingModalPlanCard
                  key={plan.id}
                  plan={plan}
                  isYearly={isYearly}
                  checkoutPage={checkoutPage}
                  isInitialPlan={initialPlan === plan.id}
                  isLoading={isLoading}
                  proConsent={proConsent}
                  dedicatedConsent={dedicatedConsent}
                  proIntroEligible={proIntroEligible}
                  onProConsentToggle={() => setProConsent((v) => !v)}
                  onDedicatedConsentToggle={() =>
                    setDedicatedConsent((v) => !v)
                  }
                  onUpgrade={handleUpgrade}
                />
              ))}
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

          <PricingModalTrustFooter isPremium={isPremium} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
