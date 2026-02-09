"use client";

import { ArrowRight, Check, Crown, Shield, Sparkles, Star, Zap } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
          cancelUrl: `${window.location.origin}/dashboard`,
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
      description: 'Get started with essential tools',
      monthlyPrice: 0,
      yearlyPrice: 0,
      popular: false,
      current: !isPremium,
      gradient: 'from-slate-500 to-slate-600',
      bgGradient: 'from-slate-500/5 to-slate-600/5',
      features: [
        'OPT & STEM Calculators',
        'OPT 90-Day & STEM 60-Day Trackers',
        'USCIS Case Status (Manual Check)',
        'H-1B Sponsor Data (100 Companies)',
        'Job Tracker (5 Jobs) & Resume (5/mo)',
        'Chrome Extension & Dashboard',
        'Tax Filing & Health Insurance Info',
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      icon: Crown,
      description: 'Everything you need for OPT success',
      monthlyPrice: 4.99,
      yearlyPrice: 49.99,
      originalMonthly: 7.99,
      originalYearly: 79.99,
      popular: true,
      current: isPremium,
      trial: '7-day free trial',
      gradient: 'from-violet-600 to-indigo-600',
      bgGradient: 'from-violet-600/10 to-indigo-600/10',
      features: [
        'Everything in Free, plus:',
        'Daily 9AM Email Reminders',
        'USCIS Auto-Checks (Every 6 Hours)',
        'Instant Status Change Alerts',
        'H-1B Sponsor Data (Unlimited)',
        'Document Vault + Expiry Reminders',
        'Unlimited Job & Resume Tools',
        'ATS Scanner (Unlimited)',
        'Sprintax Tax Coupon ($20 Value)',
        'Exclusive Partner Offers',
      ],
    },
    {
      id: 'dedicated',
      name: 'Dedicated',
      icon: Shield,
      description: 'Premium support with legal experts',
      monthlyPrice: 14.99,
      yearlyPrice: 149.99,
      originalMonthly: 19.99,
      originalYearly: 199.99,
      popular: false,
      current: false,
      gradient: 'from-amber-500 to-orange-600',
      bgGradient: 'from-amber-500/5 to-orange-600/5',
      features: [
        'Everything in Pro, plus:',
        '1-on-1 Lawyer Session (1 hr/mo)',
        'Complete Application Audit',
        '24/7 Dedicated Support',
        'Personalized Strategy Plan',
      ],
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl p-0 gap-0 overflow-hidden border-0 bg-gradient-to-b from-background to-muted/30">
        {/* Header */}
        <div className="relative px-8 pt-8 pb-6 text-center bg-gradient-to-b from-muted/50 to-transparent">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 text-violet-600 text-xs font-medium mb-4">
              <Sparkles className="w-3 h-3" />
              Upgrade Your OPT Journey
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
              Choose the Perfect Plan
            </h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Join 2,500+ international students who trust TrackMyOPT
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <span className={cn(
              "text-sm font-medium transition-colors",
              !isYearly ? "text-foreground" : "text-muted-foreground"
            )}>
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={cn(
                "relative w-14 h-7 rounded-full transition-all duration-300",
                isYearly
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600"
                  : "bg-muted"
              )}
            >
              <div className={cn(
                "absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300",
                isYearly ? "left-8" : "left-1"
              )} />
            </button>
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-sm font-medium transition-colors",
                isYearly ? "text-foreground" : "text-muted-foreground"
              )}>
                Annual
              </span>
              <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 text-[10px] font-bold uppercase tracking-wide">
                Save 40%
              </span>
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="p-8 pt-4">
          <div className="grid md:grid-cols-3 gap-4">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
              const originalPrice = isYearly ? plan.originalYearly : plan.originalMonthly;

              return (
                <div
                  key={plan.id}
                  className={cn(
                    "relative rounded-2xl p-5 transition-all duration-300 flex flex-col",
                    plan.popular
                      ? "bg-gradient-to-b from-violet-600/5 via-violet-600/[0.02] to-transparent ring-2 ring-violet-600/30 shadow-xl shadow-violet-500/5"
                      : "bg-card/50 ring-1 ring-border hover:ring-border/80 hover:bg-card/80"
                  )}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[10px] font-bold uppercase tracking-wide shadow-lg">
                        <Star className="w-3 h-3 fill-current" />
                        Most Popular
                      </div>
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={cn(
                        "p-1.5 rounded-lg bg-gradient-to-br",
                        plan.gradient
                      )}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-semibold text-base">{plan.name}</span>
                    </div>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {plan.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold tracking-tight">
                        ${price}
                      </span>
                      {originalPrice && originalPrice > price && (
                        <span className="text-sm text-muted-foreground line-through">
                          ${originalPrice}
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {plan.id === 'free' ? 'Forever free' : `per ${isYearly ? 'year' : 'month'}`}
                    </p>
                    {plan.trial && (
                      <p className="text-violet-600 text-xs font-medium mt-1">
                        {plan.trial}
                      </p>
                    )}
                  </div>

                  {/* CTA Button */}
                  <div className="mb-4">
                    {plan.current ? (
                      <Button
                        disabled
                        variant="outline"
                        className="w-full h-10 text-sm"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Current Plan
                      </Button>
                    ) : plan.id === 'free' ? (
                      <Button
                        disabled
                        variant="outline"
                        className="w-full h-10 text-sm"
                      >
                        Free Forever
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleUpgrade(plan.id)}
                        disabled={isLoading}
                        className={cn(
                          "w-full h-10 text-sm font-medium transition-all duration-300",
                          plan.popular
                            ? "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
                            : "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                        )}
                      >
                        {loadingPlan === plan.id ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Processing...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            {plan.popular ? 'Start Free Trial' : 'Get Dedicated'}
                            <ArrowRight className="w-4 h-4" />
                          </span>
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Features */}
                  <div className="flex-1">
                    <ul className="space-y-2">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className={cn(
                            "w-3.5 h-3.5 mt-0.5 flex-shrink-0",
                            plan.popular ? "text-violet-600" : "text-muted-foreground"
                          )} />
                          <span className="text-xs leading-relaxed text-muted-foreground">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Trust Badges */}
          <div className="mt-6 pt-6 border-t border-border/50">
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-green-600" />
                <span>Secure Payment</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                <span>7-Day Free Trial</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                <span>Cancel Anytime</span>
              </div>
              <div className="flex items-center gap-1.5">
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
