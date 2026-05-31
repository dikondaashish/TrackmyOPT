"use client";

import { ArrowRight, Check, ChevronLeft, Crown, Shield, Sparkles, Star, Zap, Gift } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { PromoCodeCheckoutBar } from "@/components/pricing/PromoCodeCheckoutBar";
import type { PromoCheckoutMode } from "@/lib/premium/promoCheckoutTypes";
import { buildPromoCheckoutBody } from "@/lib/premium/checkoutPromoPayload";
import { formatMonthlyEquivalentFromYearly } from "@/lib/premium/formatMonthlyEquivalentFromYearly";
import { SubscriptionCheckoutDisclosures } from "@/components/billing/SubscriptionCheckoutDisclosures";
import type { BillingInterval, PaidPlanId } from "@/lib/billing/legal-config";

interface PricingModalProps {
  open: boolean;
  onClose: () => void;
  userEmail?: string;
  isPremium?: boolean;
  initialPlan?: string;
  initialInterval?: string;
}

function isYearlyBillingDefault(interval: string | undefined): boolean {
  return interval !== "month";
}

type CheckoutStep = "select" | "confirm";

export function PricingModal({ open, onClose, userEmail, isPremium = false, initialPlan, initialInterval }: PricingModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  /** Annual on by default; only `initialInterval === "month"` forces monthly (user can toggle anytime). */
  const [isYearly, setIsYearly] = useState(() => isYearlyBillingDefault(initialInterval));
  const [promoMode, setPromoMode] = useState<PromoCheckoutMode>("default");
  const [customPromoInput, setCustomPromoInput] = useState("");
  const [promoError, setPromoError] = useState<string | null>(null);
  /** null = still loading / unknown; server omits trial when false */
  const [proFreeTrialEligible, setProFreeTrialEligible] = useState<boolean | null>(null);
  const [recurringConsent, setRecurringConsent] = useState(false);
  const [disclosurePlan, setDisclosurePlan] = useState<PaidPlanId>("pro");
  const [consentError, setConsentError] = useState<string | null>(null);
  const [step, setStep] = useState<CheckoutStep>("select");
  const [confirmInterval, setConfirmInterval] = useState<BillingInterval>("year");
  const confirmHeadingRef = useRef<HTMLHeadingElement>(null);

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
      setRecurringConsent(false);
      setConsentError(null);
      setStep("select");
    }
  }, [open]);

  useEffect(() => {
    if (step !== "confirm" || !open) return;
    const t = window.setTimeout(() => {
      confirmHeadingRef.current?.focus();
    }, 0);
    return () => window.clearTimeout(t);
  }, [step, open]);

  const handleSelectPlan = (planId: "pro" | "dedicated") => {
    setDisclosurePlan(planId);
    setConfirmInterval(isYearly ? "year" : "month");
    setConsentError(null);
    setPromoError(null);
    setStep("confirm");
  };

  const handleUpgrade = async (selectedPlan: string, intervalOverride?: BillingInterval) => {
    const paidPlan = selectedPlan === "dedicated" ? "dedicated" : "pro";
    setDisclosurePlan(paidPlan);
    setConsentError(null);

    if (!recurringConsent) {
      setConsentError("Please check the box to agree to auto-renewing subscription terms.");
      window.setTimeout(() => {
        document.getElementById("recurring-billing-consent")?.focus();
      }, 0);
      return;
    }

    setIsLoading(true);
    setPromoError(null);

    const currentInterval =
      intervalOverride ?? confirmInterval ?? (isYearly ? "year" : "month");

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

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        const msg =
          typeof errBody?.error === 'string' ? errBody.error : 'Failed to create checkout session';
        setPromoError(msg);
        setIsLoading(false);
        return;
      }

      const { url } = await response.json();
      window.location.href = url;
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
      features: [
        { text: 'OPT & STEM Calculators', included: true, isHeader: false },
        { text: 'OPT 90-Day & STEM 60-Day Trackers', included: true, isHeader: false },
        { text: 'USCIS Case Status (Manual)', included: true, isHeader: false },
        { text: 'H-1B Sponsors (100 Companies)', included: true, isHeader: false },
        { text: 'Job Tracker (5 Jobs)', included: true, isHeader: false },
        { text: 'Resume Builder (5/mo)', included: true, isHeader: false },
        { text: 'Chrome Extension', included: true, isHeader: false },
        { text: 'Sprintax partner coupon ($20)', included: true, isHeader: false },
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      icon: Crown,
      tagline: 'Complete OPT success toolkit',
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
      features: [
        { text: 'Everything in Free, plus:', included: true, isHeader: true },
        { text: 'Daily 9AM Email Reminders', included: true, isHeader: false },
        { text: 'USCIS Auto-Checks (Daily)', included: true, isHeader: false },
        { text: 'Instant Status Change Alerts', included: true, isHeader: false },
        { text: 'H-1B Sponsors (Unlimited)', included: true, isHeader: false },
        { text: 'Document Vault + Expiry Alerts', included: true, isHeader: false },
        { text: 'Unlimited Job & Resume Tools', included: true, isHeader: false },
        { text: 'ATS Scanner (Unlimited)', included: true, isHeader: false },
      ],
    },
    {
      id: 'dedicated',
      name: 'Dedicated',
      icon: Shield,
      tagline: 'Premium support with independent attorney access',
      monthlyPrice: 14.99,
      yearlyPrice: 149.99,
      originalMonthly: 19.99,
      originalYearly: 199.99,
      popular: false,
      current: false,
      iconBg: 'bg-gradient-to-br from-amber-400 to-orange-500',
      iconColor: 'text-white',
      borderColor: 'border-amber-500/30',
      features: [
        { text: 'Everything in Pro, plus:', included: true, isHeader: true },
        { text: '1-on-1 Attorney Session (1 hr/mo)', included: true, isHeader: false },
        { text: 'Complete Application Audit', included: true, isHeader: false },
        { text: '24/7 Dedicated Support', included: true, isHeader: false },
        { text: 'Personalized Strategy Plan', included: true, isHeader: false },
      ],
    },
  ];
  }, [isPremium, proFreeTrialEligible]);

  const selectedPlanForConfirm = useMemo(
    () => plans.find((p) => p.id === disclosurePlan),
    [plans, disclosurePlan]
  );

  const showProTrialOnConfirm =
    disclosurePlan === "pro" && proFreeTrialEligible !== false;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        onClose={onClose}
        className="max-w-[1100px] w-[95vw] max-h-[min(92vh,880px)] p-0 gap-0 overflow-hidden border border-border/50 bg-background shadow-2xl flex flex-col md:text-[15px]"
      >
        {/* Header Section */}
        <div className="relative shrink-0 px-5 sm:px-6 md:px-5 pt-5 pb-3 sm:pb-4 md:pt-4 md:pb-2.5 text-center border-b border-border/30 bg-gradient-to-b from-muted/40 via-muted/20 to-transparent">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.08),transparent_50%)]" />

          <div className="relative z-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 md:px-2.5 md:py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 text-[11px] md:text-[10px] font-semibold mb-2 md:mb-1.5 border border-violet-500/20">
              <Sparkles className="w-3 h-3 md:w-2.5 md:h-2.5" />
              Upgrade Your OPT Journey
            </div>

            {/* Title */}
            {step === "select" ? (
              <>
                <h2 className="text-xl sm:text-2xl md:text-xl lg:text-[1.35rem] font-bold tracking-tight text-foreground mb-1">
                  Choose Your Plan
                </h2>
                <p className="text-muted-foreground text-xs sm:text-sm md:text-xs max-w-lg mx-auto leading-snug">
                  Join 2,500+ international students who trust TrackMyOPT to navigate their F-1 visa journey
                </p>
              </>
            ) : (
              <>
                <h2
                  ref={confirmHeadingRef}
                  tabIndex={-1}
                  className="text-xl sm:text-2xl md:text-xl lg:text-[1.35rem] font-bold tracking-tight text-foreground mb-1 outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 rounded-sm"
                >
                  Review &amp; confirm
                </h2>
                <p className="text-muted-foreground text-xs sm:text-sm md:text-xs max-w-lg mx-auto leading-snug">
                  Review subscription terms before continuing to secure payment
                </p>
                {promoMode !== "none" && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-medium">
                    Promo code will be applied at checkout
                  </p>
                )}
              </>
            )}

            {/* Billing Toggle */}
            {step === "select" && (
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
            )}

            {step === "select" && (
            <div className="mt-3 md:mt-2 max-w-md mx-auto px-1">
              <PromoCodeCheckoutBar
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
            )}
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain">
        {step === "select" && (
        <div className="p-4 sm:p-5 md:p-4 lg:p-5">
          <div className="grid md:grid-cols-3 gap-3 sm:gap-4 md:gap-3">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const monthlyDisplay = plan.monthlyPrice;
              const yearlyTotal = plan.yearlyPrice;
              const originalMonthly = plan.originalMonthly;
              const originalYearly = plan.originalYearly;

              return (
                <div
                  key={plan.id}
                  className={cn(
                    "relative rounded-2xl md:rounded-xl transition-all duration-300 flex flex-col h-full",
                    plan.popular
                      ? "bg-gradient-to-b from-violet-500/[0.08] via-violet-500/[0.03] to-transparent ring-2 ring-violet-500/40 shadow-xl shadow-violet-500/10"
                      : "bg-card/60 border hover:border-border/80 hover:shadow-lg",
                    plan.borderColor
                  )}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-10">
                      <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[10px] font-bold uppercase tracking-wide shadow-lg shadow-violet-500/30">
                        <Star className="w-3 h-3 fill-current" />
                        Most Popular
                      </div>
                    </div>
                  )}

                  <div className="p-4 sm:p-5 md:p-3.5 flex flex-col h-full">
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
                          <h3 className="font-bold text-base md:text-sm text-foreground">{plan.name}</h3>
                          <p className="text-muted-foreground text-[11px] md:text-[10px] leading-tight">{plan.tagline}</p>
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
                            <span className="text-3xl md:text-2xl font-bold tracking-tight text-foreground tabular-nums">
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
                            <span className="text-3xl md:text-2xl font-bold tracking-tight text-foreground tabular-nums">
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
                    </div>

                    {/* CTA Button */}
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
                        <Button
                          onClick={() => {
                            if (plan.id === "pro" || plan.id === "dedicated") {
                              handleSelectPlan(plan.id);
                            }
                          }}
                          disabled={isLoading}
                          className={cn(
                            "w-full h-9 md:h-8 text-xs md:text-[11px] font-semibold transition-all duration-300",
                            plan.popular
                              ? "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 md:hover:scale-[1.01]"
                              : "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 md:hover:scale-[1.01]"
                          )}
                        >
                          <span className="flex items-center gap-1.5">
                            {plan.popular
                              ? proFreeTrialEligible === false
                                ? "Subscribe to Pro"
                                : "Start 7-Day Free Trial"
                              : "Upgrade to Dedicated"}
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </Button>
                      )}
                    </div>

                    {/* Features List */}
                    <div className="flex-1">
                      <ul className="space-y-1.5 md:space-y-1">
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
        </div>
        )}

        {step === "confirm" && selectedPlanForConfirm && (
          <div className="p-4 sm:p-5 md:p-4 max-w-xl mx-auto w-full space-y-4 md:space-y-3">
            <button
              type="button"
              onClick={() => {
                setStep("select");
                setConsentError(null);
              }}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 rounded-sm"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden />
              Back to plans
            </button>

            <div
              className={cn(
                "rounded-2xl md:rounded-xl border p-4 sm:p-5 md:p-4",
                selectedPlanForConfirm.popular
                  ? "border-violet-500/40 bg-gradient-to-b from-violet-500/[0.08] to-transparent"
                  : "border-amber-500/30 bg-card/60"
              )}
            >
              <div className="flex items-center gap-2.5 mb-3">
                {(() => {
                  const Icon = selectedPlanForConfirm.icon;
                  return (
                    <div className={cn("p-2 rounded-lg shadow-sm", selectedPlanForConfirm.iconBg)}>
                      <Icon className={cn("w-[18px] h-[18px]", selectedPlanForConfirm.iconColor)} />
                    </div>
                  );
                })()}
                <div>
                  <h3 className="font-bold text-base text-foreground">
                    {selectedPlanForConfirm.name}
                  </h3>
                  <p className="text-muted-foreground text-[11px] leading-tight">
                    {selectedPlanForConfirm.tagline}
                  </p>
                </div>
              </div>

              <div className="pb-3 border-b border-border/50">
                {confirmInterval === "year" ? (
                  <>
                    <div className="flex items-baseline gap-1 flex-wrap">
                      <span className="text-3xl md:text-2xl font-bold tracking-tight text-foreground tabular-nums">
                        $
                        {formatMonthlyEquivalentFromYearly(
                          selectedPlanForConfirm.yearlyPrice
                        )}
                      </span>
                      <span className="text-sm md:text-xs font-medium text-muted-foreground">/mo</span>
                    </div>
                    <p className="text-xs md:text-[11px] text-muted-foreground mt-0.5">
                      ${selectedPlanForConfirm.yearlyPrice.toFixed(2)} billed yearly
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-3xl md:text-2xl font-bold tracking-tight text-foreground tabular-nums">
                        ${selectedPlanForConfirm.monthlyPrice}
                      </span>
                      <span className="text-sm md:text-xs font-medium text-muted-foreground">/mo</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">Billed monthly</p>
                  </>
                )}
                {showProTrialOnConfirm && selectedPlanForConfirm.trial && (
                  <p className="text-violet-600 dark:text-violet-400 text-xs font-medium mt-1.5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {selectedPlanForConfirm.trial}
                  </p>
                )}
              </div>
            </div>

            <SubscriptionCheckoutDisclosures
              planId={disclosurePlan}
              interval={confirmInterval}
              includeProTrial={showProTrialOnConfirm}
              checked={recurringConsent}
              onCheckedChange={(v) => {
                setRecurringConsent(v);
                if (v) setConsentError(null);
              }}
              disabled={isLoading}
            />

            {(consentError || promoError) && (
              <p className="text-xs text-destructive" role="alert">
                {consentError || promoError}
              </p>
            )}

            <Button
              type="button"
              onClick={() => handleUpgrade(disclosurePlan, confirmInterval)}
              disabled={isLoading}
              className={cn(
                "w-full h-11 md:h-10 text-sm md:text-xs font-semibold cursor-pointer transition-all duration-200 focus-visible:ring-2 focus-visible:ring-violet-500/40",
                disclosurePlan === "pro"
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25"
                  : "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg shadow-amber-500/20"
              )}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  Agree and Continue to Payment
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </div>
        )}

          {/* Footer Trust Section */}
          <div className="px-4 sm:px-5 md:px-4 pb-4 md:pb-3 pt-3 md:pt-2 border-t border-border/40 bg-background/95">
            <div className="flex flex-wrap items-center justify-center gap-x-6 md:gap-x-4 gap-y-2 md:gap-y-1">
              <div className="flex items-center gap-1.5 text-xs md:text-[11px] text-muted-foreground">
                <Shield className="w-3.5 h-3.5 text-green-600" />
                <span>Secure Payment</span>
              </div>
              {!isPremium &&
                proFreeTrialEligible !== false &&
                (step === "select" ||
                  (step === "confirm" && disclosurePlan === "pro")) && (
              <div className="flex items-center gap-1.5 text-xs md:text-[11px] text-muted-foreground">
                <Sparkles className="w-3.5 h-3.5 md:w-3 md:h-3 text-violet-600" />
                <span>7-Day Free Trial</span>
              </div>
              )}
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
