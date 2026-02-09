"use client";

import { ArrowRight, Check, Crown, Shield, Sparkles, Star, Zap, Gift } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface PricingModalProps {
  open: boolean;
  onClose: () => void;
  userEmail?: string;
  isPremium?: boolean;
  initialPlan?: string;
  initialInterval?: string;
}

export function PricingModal({ open, onClose, userEmail, isPremium = false, initialPlan, initialInterval }: PricingModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isYearly, setIsYearly] = useState(true);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleUpgrade = async (selectedPlan: string) => {
    setIsLoading(true);
    setLoadingPlan(selectedPlan);
    try {
      const response = await fetch('/api/premium/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          successUrl: `${window.location.origin}/premium/success`,
          cancelUrl: `${window.location.origin}/premium/checkout`,
          planId: selectedPlan,
          interval: isYearly ? 'year' : 'month',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      alert('Failed to start upgrade process. Please try again.');
      setIsLoading(false);
      setLoadingPlan(null);
    }
  };

  // Auto-start if params are present and not already premium
  if (open && initialPlan && !isPremium && !isLoading) {
    setTimeout(() => {
      if (!isLoading) handleUpgrade(initialPlan);
    }, 100);
  }

  const plans = [
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
        { text: 'OPT & STEM Calculators', included: true },
        { text: 'OPT 90-Day & STEM 60-Day Trackers', included: true },
        { text: 'USCIS Case Status (Manual)', included: true },
        { text: 'H-1B Sponsors (100 Companies)', included: true },
        { text: 'Job Tracker (5 Jobs)', included: true },
        { text: 'Resume Builder (5/mo)', included: true },
        { text: 'Chrome Extension', included: true },
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
      trial: '7-day free trial',
      iconBg: 'bg-gradient-to-br from-violet-500 to-indigo-600',
      iconColor: 'text-white',
      borderColor: 'border-violet-500/50',
      ringColor: 'ring-violet-500/20',
      features: [
        { text: 'Everything in Free, plus:', included: true, isHeader: true },
        { text: 'Daily 9AM Email Reminders', included: true },
        { text: 'USCIS Auto-Checks (Every 6 Hours)', included: true },
        { text: 'Instant Status Change Alerts', included: true },
        { text: 'H-1B Sponsors (Unlimited)', included: true },
        { text: 'Document Vault + Expiry Alerts', included: true },
        { text: 'Unlimited Job & Resume Tools', included: true },
        { text: 'ATS Scanner (Unlimited)', included: true },
        { text: 'Sprintax Tax Coupon ($20)', included: true },
      ],
    },
    {
      id: 'dedicated',
      name: 'Dedicated',
      icon: Shield,
      tagline: 'Premium legal & expert support',
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
        { text: '1-on-1 Lawyer Session (1 hr/mo)', included: true },
        { text: 'Complete Application Audit', included: true },
        { text: '24/7 Dedicated Support', included: true },
        { text: 'Personalized Strategy Plan', included: true },
      ],
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[1100px] w-[95vw] p-0 gap-0 overflow-hidden border border-border/50 bg-background shadow-2xl">
        {/* Header Section */}
        <div className="relative px-8 pt-8 pb-6 text-center border-b border-border/30 bg-gradient-to-b from-muted/40 via-muted/20 to-transparent">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.08),transparent_50%)]" />

          <div className="relative z-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 text-xs font-semibold mb-4 border border-violet-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              Upgrade Your OPT Journey
            </div>

            {/* Title */}
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-2">
              Choose Your Plan
            </h2>
            <p className="text-muted-foreground text-sm max-w-lg mx-auto">
              Join 2,500+ international students who trust TrackMyOPT to navigate their F-1 visa journey
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <span className={cn(
                "text-sm font-medium transition-all duration-200",
                !isYearly ? "text-foreground" : "text-muted-foreground"
              )}>
                Monthly
              </span>

              <button
                onClick={() => setIsYearly(!isYearly)}
                className={cn(
                  "relative w-16 h-8 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-violet-500/40",
                  isYearly
                    ? "bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/30"
                    : "bg-muted border border-border"
                )}
                aria-label="Toggle billing period"
              >
                <div className={cn(
                  "absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 ease-out",
                  isYearly ? "left-[34px]" : "left-1"
                )} />
              </button>

              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-sm font-medium transition-all duration-200",
                  isYearly ? "text-foreground" : "text-muted-foreground"
                )}>
                  Annual
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-bold uppercase tracking-wider border border-green-500/20">
                  <Gift className="w-3 h-3" />
                  Save 40%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="p-6 md:p-8">
          <div className="grid md:grid-cols-3 gap-5">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
              const originalPrice = isYearly ? plan.originalYearly : plan.originalMonthly;

              return (
                <div
                  key={plan.id}
                  className={cn(
                    "relative rounded-2xl transition-all duration-300 flex flex-col h-full",
                    plan.popular
                      ? "bg-gradient-to-b from-violet-500/[0.08] via-violet-500/[0.03] to-transparent ring-2 ring-violet-500/40 shadow-xl shadow-violet-500/10"
                      : "bg-card/60 border hover:border-border/80 hover:shadow-lg",
                    plan.borderColor
                  )}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                      <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[11px] font-bold uppercase tracking-wide shadow-lg shadow-violet-500/30">
                        <Star className="w-3 h-3 fill-current" />
                        Most Popular
                      </div>
                    </div>
                  )}

                  <div className="p-6 flex flex-col h-full">
                    {/* Plan Header */}
                    <div className="mb-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={cn(
                          "p-2.5 rounded-xl shadow-sm",
                          plan.iconBg
                        )}>
                          <Icon className={cn("w-5 h-5", plan.iconColor)} />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-foreground">{plan.name}</h3>
                          <p className="text-muted-foreground text-xs">{plan.tagline}</p>
                        </div>
                      </div>
                    </div>

                    {/* Price Section */}
                    <div className="mb-5 pb-5 border-b border-border/50">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold tracking-tight text-foreground">
                          ${price}
                        </span>
                        {originalPrice && originalPrice > price && (
                          <span className="text-base text-muted-foreground/70 line-through">
                            ${originalPrice}
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm mt-1">
                        {plan.id === 'free' ? 'Forever free' : `per ${isYearly ? 'year' : 'month'}`}
                      </p>
                      {plan.trial && (
                        <p className="text-violet-600 dark:text-violet-400 text-sm font-medium mt-2 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          {plan.trial}
                        </p>
                      )}
                    </div>

                    {/* CTA Button */}
                    <div className="mb-5">
                      {plan.current ? (
                        <Button
                          disabled
                          variant="outline"
                          className="w-full h-11 text-sm font-medium"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Current Plan
                        </Button>
                      ) : plan.id === 'free' ? (
                        <Button
                          disabled
                          variant="outline"
                          className="w-full h-11 text-sm font-medium opacity-60"
                        >
                          Free Forever
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleUpgrade(plan.id)}
                          disabled={isLoading}
                          className={cn(
                            "w-full h-11 text-sm font-semibold transition-all duration-300",
                            plan.popular
                              ? "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.02]"
                              : "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 hover:scale-[1.02]"
                          )}
                        >
                          {loadingPlan === plan.id ? (
                            <span className="flex items-center gap-2">
                              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Processing...
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              {plan.popular ? 'Start 7-Day Free Trial' : 'Upgrade to Dedicated'}
                              <ArrowRight className="w-4 h-4" />
                            </span>
                          )}
                        </Button>
                      )}
                    </div>

                    {/* Features List */}
                    <div className="flex-1">
                      <ul className="space-y-2.5">
                        {plan.features.map((feature, idx) => (
                          <li
                            key={idx}
                            className={cn(
                              "flex items-start gap-2.5",
                              feature.isHeader && "pt-1"
                            )}
                          >
                            <div className={cn(
                              "mt-0.5 flex-shrink-0 rounded-full p-0.5",
                              plan.popular
                                ? "bg-violet-500/10"
                                : plan.id === 'dedicated'
                                  ? "bg-amber-500/10"
                                  : "bg-muted"
                            )}>
                              <Check className={cn(
                                "w-3 h-3",
                                plan.popular
                                  ? "text-violet-600 dark:text-violet-400"
                                  : plan.id === 'dedicated'
                                    ? "text-amber-600 dark:text-amber-400"
                                    : "text-muted-foreground"
                              )} />
                            </div>
                            <span className={cn(
                              "text-sm leading-relaxed",
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

          {/* Footer Trust Section */}
          <div className="mt-8 pt-6 border-t border-border/40">
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4 text-green-600" />
                <span>Secure Payment</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="w-4 h-4 text-violet-600" />
                <span>7-Day Free Trial</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="w-4 h-4 text-amber-600" />
                <span>Cancel Anytime</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
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
