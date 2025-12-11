"use client";

import { ArrowRight, CircleCheck, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getDashboardUrl } from "@/lib/subdomain-config";
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
    { text: "Document Vault - Secure document storage" },
    { text: "AI-powered document analysis (Gemini AI)" },
    { text: "Automatic expiry reminders for documents" },
    { text: "Passcode-protected document vault" },
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
          successUrl: getDashboardUrl('/premium/success'),
          cancelUrl: getDashboardUrl(),
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
              <span className="text-3xl font-bold">$0</span>
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
              <span className="text-3xl font-bold">$2.99</span>
              <p className="text-muted-foreground text-xs">One-time payment, lifetime access</p>
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
                    You have lifetime access
                  </p>
                </div>
              ) : (
                <Button 
                  onClick={handleUpgrade} 
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-xs py-2"
                >
                  {isLoading ? (
                    "Processing..."
                  ) : (
                    <>
                      Upgrade Now
                      <ArrowRight className="ml-2 size-3.5" />
                    </>
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>

        <div className="mt-4 text-center text-[10px] text-muted-foreground">
          <p>💳 Secure payment powered by Stripe</p>
          <p className="mt-0.5">✨ Lifetime access • 🔒 No subscription • 💯 One-time payment</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
