"use client";

import { ArrowRight, CircleCheck, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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

  const freePlanFeatures = [
    { text: "OPT/STEM Calculators (Daily 9AM Emails)" },
    { text: "Unemployment Clock (90/60 Day Tracking)" },
    { text: "USCIS Case Tracker (Basic Status Check)" },
    { text: "H1B Sponsor Intelligence (100 Companies)" },
    { text: "Job Application Tracker (Track 5 Jobs)" },
  ];

  const proPlanFeatures = [
    { text: "Automated USCIS Tracker (Every 6hrs + Alerts)" },
    { text: "H1B Sponsor Intelligence (Unlimited)" },
    { text: "Job App Tracker (Unlimited Jobs)" },
    { text: "Resume Generator & ATS Scanner (Unlimited)" },
    { text: "Secure Vault + Expiry Alerts" },
    { text: "Fast Community Data" },
    { text: "Free Sprintax Tax Coupon ($20)" },
  ];

  const handleUpgrade = async (selectedPlan?: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/premium/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          successUrl: `${window.location.origin}/premium/success`,
          cancelUrl: `${window.location.origin}/dashboard`,
          planId: (typeof selectedPlan === 'string' ? selectedPlan : initialPlan) || 'pro',
          interval: initialInterval || 'year',
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
    }
  };

  // Auto-start if params are present and not already premium
  if (open && initialPlan && !isPremium && !isLoading) {
    // Small timeout to allow render
    setTimeout(() => {
      if (!isLoading) handleUpgrade();
    }, 100);
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent onClose={onClose} className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-2xl font-bold text-center">
            Choose Your Plan
          </DialogTitle>
          <DialogDescription className="text-center text-sm">
            Upgrade to unlock daily email reminders
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col lg:flex-row gap-4 mt-4">
          {/* Free Plan */}
          <Card className={`flex-1 ${isPremium ? '' : 'border-2 border-primary'} flex flex-col`}>
            <CardHeader className="pb-3">
              <CardTitle>
                <p className="text-lg">Free</p>
              </CardTitle>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">$0</span>
              </div>
              <p className="text-muted-foreground text-xs">Forever free</p>
            </CardHeader>
            <CardContent className="flex-1 pb-3">
              <Separator className="mb-4" />
              <ul className="space-y-2">
                {freePlanFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CircleCheck className="size-3.5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-xs leading-relaxed">{feature.text}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="pt-3">
              {!isPremium ? (
                <div className="w-full">
                  <Button disabled className="w-full text-xs py-2" variant="outline">
                    Current Plan
                  </Button>
                  <p className="text-xs text-center text-muted-foreground mt-1.5">
                    This is your current plan
                  </p>
                </div>
              ) : (
                <Button disabled className="w-full text-xs py-2" variant="outline">
                  Basic Plan
                </Button>
              )}
            </CardFooter>
          </Card>

          {/* Pro Plan */}
          <Card className={`flex-1 ${isPremium ? 'border-2 border-primary' : ''} relative overflow-hidden flex flex-col`}>
            {/* Pro badge ribbon */}
            {!isPremium && (
              <div className="absolute top-3 -right-10 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-0.5 text-[10px] font-bold rotate-45 shadow-lg">
                POPULAR
              </div>
            )}
            <CardHeader className="pb-3">
              <CardTitle>
                <div className="flex items-center gap-2">
                  <p className="text-lg">Pro</p>
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    BEST VALUE
                  </span>
                </div>
              </CardTitle>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">$4.99</span>
                <span className="text-sm text-gray-400 line-through">$7.99</span>
              </div>
              <p className="text-muted-foreground text-xs">per month</p>
            </CardHeader>
            <CardContent className="flex-1 pb-3">
              <Separator className="mb-4" />
              <p className="text-xs font-semibold mb-2">Everything in Free, plus:</p>
              <ul className="space-y-2">
                {proPlanFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CircleCheck className="size-3.5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-xs leading-relaxed">{feature.text}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="pt-3">
              {isPremium ? (
                <div className="w-full">
                  <Button disabled className="w-full text-xs py-2">
                    <CircleCheck className="mr-2 size-3.5" />
                    Active
                  </Button>
                  <p className="text-xs text-center text-muted-foreground mt-1.5">
                    Active Pro Plan
                  </p>
                </div>
              ) : (
                <Button
                  onClick={() => handleUpgrade('pro')}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-xs py-2"
                >
                  {isLoading ? (
                    "Processing..."
                  ) : (
                    <>
                      Start 7-Day Free Trial
                      <ArrowRight className="ml-2 size-3.5" />
                    </>
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>

          {/* Dedicated Plan */}
          <Card className="flex-1 relative overflow-hidden flex flex-col border border-border">
            <CardHeader className="pb-3">
              <CardTitle>
                <div className="flex items-center gap-2">
                  <p className="text-lg">Dedicated</p>
                </div>
              </CardTitle>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">$14.99</span>
                <span className="text-sm text-gray-400 line-through">$19.99</span>
              </div>
              <p className="text-muted-foreground text-xs">per month</p>
            </CardHeader>
            <CardContent className="flex-1 pb-3">
              <Separator className="mb-4" />
              <p className="text-xs font-semibold mb-2">Everything in Pro, plus:</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CircleCheck className="size-3.5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-xs leading-relaxed">1-on-1 Lawyer Session (1 hr/mo)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CircleCheck className="size-3.5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-xs leading-relaxed">Complete Application Audit</span>
                </li>
                <li className="flex items-start gap-2">
                  <CircleCheck className="size-3.5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-xs leading-relaxed">24/7 Dedicated Support</span>
                </li>
                <li className="flex items-start gap-2">
                  <CircleCheck className="size-3.5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-xs leading-relaxed">Personalized Strategy Plan</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="pt-3">
              <Button
                onClick={() => handleUpgrade('dedicated')}
                disabled={isLoading}
                variant="outline"
                className="w-full text-xs py-2 hover:bg-primary/5"
              >
                {isLoading ? (
                  "Processing..."
                ) : (
                  <>
                    Upgrade to Dedicated
                    <ArrowRight className="ml-2 size-3.5" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="mt-4 text-center text-[10px] text-muted-foreground">
          <p>💳 Secure payment powered by Stripe</p>
          <p className="mt-0.5">✨ 7-Day Free Trial • 🔒 Secure Payment • 💯 Cancel Anytime</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
