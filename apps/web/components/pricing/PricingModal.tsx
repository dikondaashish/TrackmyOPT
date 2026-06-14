"use client";

import { ArrowRight, Check, Crown, Shield, Sparkles, Star, Zap, Gift, Bell, Clock, FileCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  getPricingModalDedicatedConsentLabel,
  getPricingModalProConsentLabel,
} from "@/lib/legal/legal-config";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { PromoCodeCheckoutBar } from "@/components/pricing/PromoCodeCheckoutBar";
import type { PromoCheckoutMode } from "@/lib/premium/promoCheckoutTypes";
import { buildPromoCheckoutBody } from "@/lib/premium/checkoutPromoPayload";
import { formatMonthlyEquivalentFromYearly } from "@/lib/premium/formatMonthlyEquivalentFromYearly";
import { getPlanCardFeatures } from "@/lib/pricing/plan-features";
import {
  PLAN_SALES_META,
  PRICING_MODAL,
  PRICING_VALUE_PILLARS,
  type PaidPlanId,
} from "@/lib/pricing/sales-copy";
import { PlanPickerGuide } from "@/components/pricing/PlanPickerGuide";

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
  return interval !== "month";
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
  const [isYearly, setIsYearly] = useState(() => isYearlyBillingDefault(initialInterval));
  const [promoMode, setPromoMode] = useState<PromoCheckoutMode>("default");
  const [customPromoInput, setCustomPromoInput] = useState("");
  const [promoError, setPromoError] = useState<string | null>(null);
  /** null = still loading / unknown; server omits trial when false */
  const [proFreeTrialEligible, setProFreeTrialEligible] = useState<boolean | null>(null);
  const [proConsent, setProConsent] = useState(false);
  const [dedicatedConsent, setDedicatedConsent] = useState(false);

  useEffect(() => {
    if (!open || isPremium) {
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/premium/status", { credentials: "include" });
        const j = (await r.json()) as { proFreeTrialEligible?: boolean };
        if (cancelled) return;
        if (typeof j.proFreeTrialEligible === "boolean") {
          setProFreeTrialEligible(j.proFreeTrialEligible);
        } else {
          setProFreeTrialEligible(true);
        }
      } catch {
        if (!cancelled) setProFreeTrialEligible(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, isPremium]);

  useEffect(() => {
    if (!open) return;
    setIsYearly(isYearlyBillingDefault(initialInterval));
  }, [open, initialInterval]);

  useEffect(() => {
    if (open) {
      setPromoMode("default");
      setCustomPromoInput("");
      setPromoError(null);
      setProConsent(false);
      setDedicatedConsent(false);
    }
  }, [open]);

  useEffect(() => {
    setProConsent(false);
    setDedicatedConsent(false);
  }, [isYearly]);

  useEffect(() => {
    if (!open || !initialPlan) return;
    const timer = window.setTimeout(() => {
      document
        .getElementById(`pricing-plan-${initialPlan}`)
        ?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }, 150);
    return () => window.clearTimeout(timer);
  }, [open, initialPlan]);

  const handleUpgrade = async (selectedPlan: string) => {
    setIsLoading(true);
    setPromoError(null);

    const currentInterval = isYearly ? "year" : "month";

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

        if (payload?.hostedInvoiceUrl && typeof payload.hostedInvoiceUrl === 'string') {
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

      if (payload?.type === 'payment_action_required' || payload?.type === 'payment_required') {
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

      setPromoError('Unexpected checkout response. Please try again or contact support.');
      setIsLoading(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to start upgrade process.';
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
    originalMonthly?: number;
    originalYearly?: number;
    popular: boolean;
    current: boolean;
    trial?: string;
    iconBg: string;
    iconColor: string;
    borderColor: string;
    ringColor?: string;
    features: Array<{ text: string; included: boolean; isHeader: boolean }>;
  }> => {
    const showProTrial = !isPremium && proFreeTrialEligible !== false;
    return [
    {
      id: 'free',
      name: 'Free',
      icon: Zap,
      tagline: 'Essential tools to start',
      monthlyPrice: 0,
      yearlyPrice: 0,
      popular: false,
      current: !isPremium,
      iconBg: 'bg-slate-100 dark:bg-slate-800',
      iconColor: 'text-slate-600 dark:text-slate-400',
      borderColor: 'border-border/60',
      features: getPlanCardFeatures("free"),
    },
    {
      id: 'pro',
      name: 'Pro',
      icon: Crown,
      tagline: PLAN_SALES_META.pro.tagline,
      monthlyPrice: 4.99,
      yearlyPrice: 49.99,
      originalMonthly: 7.99,
      originalYearly: 79.99,
      popular: true,
      current: isPremium,
      ...(showProTrial ? { trial: '7-day free trial' as const } : {}),
      iconBg: 'bg-gradient-to-br from-violet-500 to-indigo-600',
      iconColor: 'text-white',
      borderColor: 'border-violet-500/50',
      ringColor: 'ring-violet-500/20',
      features: getPlanCardFeatures("pro"),
    },
    {
      id: 'dedicated',
      name: 'Dedicated',
      icon: Shield,
      tagline: PLAN_SALES_META.dedicated.tagline,
      monthlyPrice: 14.99,
      yearlyPrice: 149.99,
      originalMonthly: 19.99,
      originalYearly: 199.99,
      popular: false,
      current: false,
      iconBg: 'bg-gradient-to-br from-amber-400 to-orange-500',
      iconColor: 'text-white',
      borderColor: 'border-amber-500/30',
      features: getPlanCardFeatures("dedicated"),
    },
  ];
  }, [isPremium, proFreeTrialEligible]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        onClose={onClose}
        className={cn(
          "max-w-[1100px] w-[95vw] p-0 gap-0 overflow-hidden border border-border/50 bg-background shadow-2xl flex flex-col",
          checkoutPage
            ? "max-h-[min(95vh,920px)] md:text-base lg:text-[15px]"
            : "max-h-[min(92vh,880px)] md:text-[15px]"
        )}
      >
        {/* Header Section */}
        <div className="relative shrink-0 px-5 sm:px-6 md:px-5 pt-5 pb-3 sm:pb-4 md:pt-4 md:pb-2 text-center border-b border-border/30 bg-gradient-to-b from-muted/40 via-muted/20 to-transparent">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.08),transparent_50%)]" />

          <div className="relative z-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 md:px-2.5 md:py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 text-[11px] md:text-[10px] font-semibold mb-2 md:mb-1.5 border border-violet-500/20">
              <Shield className="w-3 h-3 md:w-2.5 md:h-2.5" />
              {PRICING_MODAL.badge}
            </div>

            {/* Title */}
            <h2
              className={cn(
                "text-xl sm:text-2xl font-bold tracking-tight text-foreground mb-1",
                checkoutPage ? "md:text-2xl lg:text-[1.4rem]" : "md:text-xl lg:text-[1.35rem]"
              )}
            >
              {PRICING_MODAL.title}
            </h2>
            <p
              className={cn(
                "text-muted-foreground max-w-lg mx-auto leading-snug",
                checkoutPage ? "text-xs sm:text-sm md:text-sm" : "text-xs sm:text-sm md:text-xs"
              )}
            >
              {PRICING_MODAL.subtitle}
            </p>
            <p
              className={cn(
                "text-muted-foreground/90 max-w-xl mx-auto mt-2 leading-snug",
                checkoutPage ? "text-[11px] sm:text-xs" : "text-[10px] sm:text-[11px]"
              )}
            >
              {PRICING_MODAL.valueAnchor}
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-2.5 mt-3 sm:mt-4 md:mt-2.5">
              <span className={cn(
                "text-sm md:text-xs font-medium transition-all duration-200",
                !isYearly ? "text-foreground" : "text-muted-foreground"
              )}>
                Monthly
              </span>

              <button
                onClick={() => setIsYearly(!isYearly)}
                className={cn(
                  "relative w-16 h-8 md:w-14 md:h-7 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-violet-500/40",
                  isYearly
                    ? "bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/30"
                    : "bg-muted border border-border"
                )}
                aria-label="Toggle billing period"
              >
                <div className={cn(
                  "absolute top-1 w-6 h-6 md:w-5 md:h-5 md:top-1 rounded-full bg-white shadow-md transition-all duration-300 ease-out",
                  isYearly ? "left-[34px] md:left-[30px]" : "left-1"
                )} />
              </button>

              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-sm md:text-xs font-medium transition-all duration-200",
                  isYearly ? "text-foreground" : "text-muted-foreground"
                )}>
                  Annual
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 md:px-2 md:py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] md:text-[9px] font-bold uppercase tracking-wider border border-green-500/20">
                  <Gift className="w-3 h-3" />
                  Save 40%
                </span>
              </div>
            </div>

          </div>
        </div>

        <div className="shrink-0 border-b border-border/30 bg-muted/20 px-4 py-3 md:px-5 md:py-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3 max-w-4xl mx-auto">
            {PRICING_VALUE_PILLARS.map((pillar, index) => {
              const Icon = [Bell, Clock, FileCheck][index] ?? Bell;
              return (
                <div
                  key={pillar.title}
                  className="flex items-start gap-2 rounded-lg bg-background/80 border border-border/40 px-3 py-2"
                >
                  <Icon className="w-4 h-4 shrink-0 text-violet-600 dark:text-violet-400 mt-0.5" />
                  <div className="text-left min-w-0">
                    <p className="text-[11px] md:text-xs font-semibold text-foreground leading-tight">
                      {pillar.title}
                    </p>
                    <p className="text-[10px] md:text-[11px] text-muted-foreground leading-snug">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain">
        <div
          className={cn(
            "p-4 sm:p-5 pt-3",
            checkoutPage ? "md:p-5 lg:p-6 md:pt-3" : "md:p-4 lg:p-5 md:pt-2"
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
                setPromoMode("none");
                setCustomPromoInput("");
                setPromoError(null);
              }}
              onCustomCodeChange={(v) => {
                setCustomPromoInput(v);
                setPromoError(null);
              }}
              onApplyCustom={() => {
                const t = customPromoInput.trim();
                if (!t) return;
                setPromoMode("custom");
                setPromoError(null);
              }}
              onClearCustom={() => {
                setPromoMode("none");
                setCustomPromoInput("");
                setPromoError(null);
              }}
            />
          </div>
          <div className="grid md:grid-cols-3 gap-3 sm:gap-4 md:gap-3 md:items-stretch">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const monthlyDisplay = plan.monthlyPrice;
              const yearlyTotal = plan.yearlyPrice;
              const originalMonthly = plan.originalMonthly;
              const originalYearly = plan.originalYearly;
              const salesMeta =
                plan.id === "pro" || plan.id === "dedicated"
                  ? PLAN_SALES_META[plan.id as PaidPlanId]
                  : null;
              const isInitialPlan = initialPlan === plan.id;

              return (
                <div
                  key={plan.id}
                  id={`pricing-plan-${plan.id}`}
                  className={cn(
                    "relative rounded-2xl md:rounded-xl transition-all duration-300 flex flex-col h-full",
                    plan.popular
                      ? "bg-gradient-to-b from-violet-500/[0.08] via-violet-500/[0.03] to-transparent ring-2 ring-violet-500/40 shadow-xl shadow-violet-500/10"
                      : plan.id === "dedicated"
                        ? "bg-gradient-to-b from-amber-500/[0.06] via-amber-500/[0.02] to-transparent ring-2 ring-amber-500/30 shadow-lg shadow-amber-500/5"
                        : "bg-card/60 border hover:border-border/80 hover:shadow-lg",
                    plan.borderColor,
                    isInitialPlan && "ring-offset-2 ring-offset-background"
                  )}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-10">
                      <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[10px] font-bold uppercase tracking-wide shadow-lg shadow-violet-500/30">
                        <Star className="w-3 h-3 fill-current" />
                        {salesMeta?.badge ?? "Most Popular"}
                      </div>
                    </div>
                  )}

                  {plan.id === "dedicated" && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-10">
                      <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[10px] font-bold uppercase tracking-wide shadow-lg shadow-amber-500/30">
                        <Shield className="w-3 h-3" />
                        {salesMeta?.badge ?? "Attorney-Backed"}
                      </div>
                    </div>
                  )}

                  <div
                    className={cn(
                      "p-4 sm:p-5 flex flex-col h-full",
                      checkoutPage ? "md:p-4" : "md:p-3.5"
                    )}
                  >
                    {/* Plan Header */}
                    <div className="mb-3 md:mb-2">
                      <div className="flex items-center gap-2.5 md:gap-2 mb-2 md:mb-1.5">
                        <div className={cn(
                          "p-2 md:p-1.5 rounded-lg shadow-sm",
                          plan.iconBg
                        )}>
                          <Icon className={cn("w-[18px] h-[18px] md:w-4 md:h-4", plan.iconColor)} />
                        </div>
                        <div>
                          <h3
                            className={cn(
                              "font-bold text-foreground",
                              checkoutPage ? "text-base md:text-[15px]" : "text-base md:text-sm"
                            )}
                          >
                            {plan.name}
                          </h3>
                          <p
                            className={cn(
                              "text-muted-foreground leading-tight",
                              checkoutPage ? "text-[11px] md:text-xs" : "text-[11px] md:text-[10px]"
                            )}
                          >
                            {plan.tagline}
                          </p>
                          {salesMeta && (
                            <p
                              className={cn(
                                "text-[10px] md:text-[9px] font-medium mt-0.5",
                                plan.id === "pro"
                                  ? "text-violet-600 dark:text-violet-400"
                                  : "text-amber-700 dark:text-amber-400"
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
                      {plan.id === "free" ? (
                        <>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl md:text-2xl font-bold tracking-tight text-foreground">$0</span>
                          </div>
                          <p className="text-muted-foreground text-xs md:text-[11px] mt-0.5">Forever free</p>
                        </>
                      ) : isYearly ? (
                        <>
                          <div className="flex items-baseline gap-1 flex-wrap">
                            <span
                              className={cn(
                                "font-bold tracking-tight text-foreground tabular-nums",
                                checkoutPage ? "text-3xl md:text-[1.65rem]" : "text-3xl md:text-2xl"
                              )}
                            >
                              ${formatMonthlyEquivalentFromYearly(yearlyTotal)}
                            </span>
                            <span className="text-sm md:text-xs font-medium text-muted-foreground">/mo</span>
                          </div>
                          <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-xs md:text-[11px] text-muted-foreground">
                            {originalYearly != null &&
                              yearlyTotal > 0 &&
                              originalYearly > yearlyTotal && (
                                <span className="line-through decoration-muted-foreground/50 text-muted-foreground/80 tabular-nums">
                                  ${formatMonthlyEquivalentFromYearly(originalYearly)}/mo
                                </span>
                              )}
                            <span className="text-muted-foreground/90">billed yearly</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <span
                              className={cn(
                                "font-bold tracking-tight text-foreground tabular-nums",
                                checkoutPage ? "text-3xl md:text-[1.65rem]" : "text-3xl md:text-2xl"
                              )}
                            >
                              ${monthlyDisplay}
                            </span>
                            {originalMonthly != null &&
                              originalMonthly > monthlyDisplay && (
                                <span className="text-sm md:text-xs text-muted-foreground/70 line-through tabular-nums">
                                  ${originalMonthly}
                                </span>
                              )}
                          </div>
                          <p className="text-muted-foreground text-xs md:text-[11px] mt-0.5">per month</p>
                        </>
                      )}
                      {plan.trial && (
                        <p className="text-violet-600 dark:text-violet-400 text-xs md:text-[11px] font-medium mt-1.5 md:mt-1 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 md:w-2.5 md:h-2.5" />
                          {plan.trial}
                        </p>
                      )}
                      {plan.id === "dedicated" && salesMeta?.guarantee && (
                        <p className="text-amber-700 dark:text-amber-400 text-xs md:text-[11px] font-medium mt-1.5 md:mt-1">
                          {salesMeta.guarantee}
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
                              "flex items-start gap-2.5 rounded-lg border p-2.5 my-3 cursor-pointer min-h-[44px] select-none transition-all duration-200",
                              plan.id === "pro"
                                ? proConsent
                                  ? "border-violet-500 bg-violet-500/[0.06]"
                                  : "border-border/60 bg-transparent hover:border-violet-400/50"
                                : dedicatedConsent
                                  ? "border-amber-500 bg-amber-500/[0.06]"
                                  : "border-border/60 bg-transparent hover:border-amber-400/50"
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={plan.id === "pro" ? proConsent : dedicatedConsent}
                              onChange={() =>
                                plan.id === "pro"
                                  ? setProConsent((v: boolean) => !v)
                                  : setDedicatedConsent((v: boolean) => !v)
                              }
                              className={cn(
                                "mt-0.5 h-4 w-4 shrink-0 rounded",
                                plan.id === "pro" ? "accent-violet-600" : "accent-amber-500"
                              )}
                            />
                            <span
                              className={cn(
                                "leading-snug text-muted-foreground",
                                checkoutPage ? "text-xs md:text-[13px]" : "text-[11px]"
                              )}
                            >
                              {plan.id === "pro"
                                ? getPricingModalProConsentLabel({
                                    interval: isYearly ? "year" : "month",
                                    monthlyPrice: plan.monthlyPrice,
                                    yearlyPrice: plan.yearlyPrice,
                                    includeTrial: proFreeTrialEligible !== false,
                                  })
                                : getPricingModalDedicatedConsentLabel({
                                    interval: isYearly ? "year" : "month",
                                    monthlyPrice: plan.monthlyPrice,
                                    yearlyPrice: plan.yearlyPrice,
                                  })}
                            </span>
                          </label>

                          <p
                            className={cn(
                              "leading-snug text-muted-foreground mb-2",
                              checkoutPage ? "text-[11px] md:text-xs" : "text-[10px]"
                            )}
                          >
                            By continuing, you agree to the{" "}
                            <Link
                              href="/terms"
                              className="underline underline-offset-2 hover:text-foreground"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Terms
                            </Link>
                            ,{" "}
                            <Link
                              href="/privacy"
                              className="underline underline-offset-2 hover:text-foreground"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Privacy Policy
                            </Link>
                            , and{" "}
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
                              (plan.id === "pro" ? !proConsent : !dedicatedConsent)
                            }
                            className={cn(
                              "w-full h-9 md:h-8 text-xs md:text-[11px] font-semibold transition-all duration-300",
                              plan.popular
                                ? "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 md:hover:scale-[1.01]"
                                : "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 md:hover:scale-[1.01]",
                              (plan.id === "pro" ? !proConsent : !dedicatedConsent) &&
                                "!opacity-40 !cursor-not-allowed !shadow-none"
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
                                  {proFreeTrialEligible === false
                                    ? PLAN_SALES_META.pro.ctaNoTrial
                                    : PLAN_SALES_META.pro.ctaDefault}
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
                            <li key={highlight} className="flex items-start gap-2">
                              <Check
                                className={cn(
                                  "w-3.5 h-3.5 shrink-0 mt-0.5",
                                  plan.id === "pro"
                                    ? "text-violet-600 dark:text-violet-400"
                                    : "text-amber-600 dark:text-amber-400"
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
                              "flex items-start gap-2 md:gap-1.5",
                              feature.isHeader && "pt-0.5"
                            )}
                          >
                            <div className={cn(
                              "mt-0.5 flex-shrink-0 rounded-full p-0.5 md:p-px",
                              plan.popular
                                ? "bg-violet-500/10"
                                : plan.id === 'dedicated'
                                  ? "bg-amber-500/10"
                                  : "bg-muted"
                            )}>
                              <Check className={cn(
                                "w-2.5 h-2.5 md:w-2 md:h-2",
                                plan.popular
                                  ? "text-violet-600 dark:text-violet-400"
                                  : plan.id === 'dedicated'
                                    ? "text-amber-600 dark:text-amber-400"
                                    : "text-muted-foreground"
                              )} />
                            </div>
                            <span className={cn(
                              "text-xs md:text-[11px] leading-snug md:leading-tight",
                              feature.isHeader
                                ? "font-semibold text-foreground"
                                : "text-muted-foreground"
                            )}>
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
            <p className="px-4 pb-2 text-xs text-destructive text-center" role="alert">
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
              {!isPremium && proFreeTrialEligible !== false && (
              <div className="flex items-center gap-1.5 text-xs md:text-[11px] text-muted-foreground">
                <Sparkles className="w-3.5 h-3.5 md:w-3 md:h-3 text-violet-600" />
                <span>Pro: 7-day free trial</span>
              </div>
              )}
              <div className="flex items-center gap-1.5 text-xs md:text-[11px] text-muted-foreground">
                <Shield className="w-3.5 h-3.5 md:w-3 md:h-3 text-amber-600" />
                <span>Dedicated: 3-day money-back</span>
              </div>
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
