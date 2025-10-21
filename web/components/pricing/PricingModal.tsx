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
}

export function PricingModal({ open, onClose, userEmail, isPremium = false }: PricingModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const freePlanFeatures = [
    { text: "Real-time OPT countdown" },
    { text: "All date tracking (OPT, STEM)" },
    { text: "Chrome notifications" },
    { text: "Dashboard access" },
    { text: "Secure data storage" },
  ];

  const proPlanFeatures = [
    { text: "Daily email reminders (9:00 AM ET)" },
    { text: "Priority support" },
    { text: "Lifetime access" },
    { text: "No subscription" },
  ];

  const handleUpgrade = async () => {
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
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('Failed to start upgrade process. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent onClose={onClose} className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-center">
            Choose Your Plan
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Upgrade to unlock daily email reminders
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col md:flex-row gap-6 mt-6">
          {/* Free Plan */}
          <Card className={`flex-1 ${isPremium ? '' : 'border-2 border-primary'}`}>
            <CardHeader>
              <CardTitle>
                <p className="text-xl">Free</p>
              </CardTitle>
              <span className="text-4xl font-bold">$0</span>
              <p className="text-muted-foreground text-sm">Forever free</p>
            </CardHeader>
            <CardContent>
              <Separator className="mb-6" />
              <ul className="space-y-4">
                {freePlanFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CircleCheck className="size-4 text-primary flex-shrink-0" />
                    <span className="text-sm">{feature.text}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="mt-auto">
              {!isPremium ? (
                <div className="w-full">
                  <Button disabled className="w-full" variant="outline">
                    Current Plan
                  </Button>
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    This is your current plan
                  </p>
                </div>
              ) : (
                <Button disabled className="w-full" variant="outline">
                  Basic Plan
                </Button>
              )}
            </CardFooter>
          </Card>

          {/* Pro Plan */}
          <Card className={`flex-1 ${isPremium ? 'border-2 border-primary' : ''} relative overflow-hidden`}>
            {/* Pro badge ribbon */}
            {!isPremium && (
              <div className="absolute top-4 -right-10 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-12 py-1 text-xs font-bold rotate-45 shadow-lg">
                POPULAR
              </div>
            )}
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <p className="text-xl">Pro</p>
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                    BEST VALUE
                  </span>
                </div>
              </CardTitle>
              <span className="text-4xl font-bold">$2.99</span>
              <p className="text-muted-foreground text-sm">One-time payment, lifetime access</p>
            </CardHeader>
            <CardContent>
              <Separator className="mb-6" />
              <p className="text-sm font-semibold mb-3">Everything in Free, plus:</p>
              <ul className="space-y-4">
                {proPlanFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CircleCheck className="size-4 text-primary flex-shrink-0" />
                    <span className="text-sm">{feature.text}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="mt-auto">
              {isPremium ? (
                <div className="w-full">
                  <Button disabled className="w-full">
                    <CircleCheck className="mr-2 size-4" />
                    Active
                  </Button>
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    You have lifetime access
                  </p>
                </div>
              ) : (
                <Button 
                  onClick={handleUpgrade} 
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isLoading ? (
                    "Processing..."
                  ) : (
                    <>
                      Upgrade Now
                      <ArrowRight className="ml-2 size-4" />
                    </>
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>💳 Secure payment powered by Stripe</p>
          <p className="mt-1">✨ Lifetime access • 🔒 No subscription • 💯 One-time payment</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
