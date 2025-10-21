"use client";

import { ArrowRight, CircleCheck, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

interface PremiumModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PremiumModal({ open, onOpenChange }: PremiumModalProps) {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Check premium status
  useEffect(() => {
    const checkPremiumStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from('profiles')
          .select('premium_status')
          .eq('user_id', user.id)
          .single();

        setIsPremium(data?.premium_status || false);
      } catch (error) {
        console.error('Error checking premium:', error);
      } finally {
        setCheckingStatus(false);
      }
    };

    if (open) {
      checkPremiumStatus();
    }
  }, [open]);

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      // Call create-checkout API
      const response = await fetch('/api/premium/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('Failed to start checkout. Please try again.');
      setIsLoading(false);
    }
  };

  const freePlanFeatures = [
    { text: "Track OPT/STEM countdown" },
    { text: "Calculate filing windows" },
    { text: "Monitor unemployment days" },
    { text: "Chrome notifications" },
  ];

  const proPlanFeatures = [
    { text: "Daily email reminders (9:00 AM ET)" },
    { text: "All Free features included" },
    { text: "Priority support" },
    { text: "Lifetime access" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-center">
            Choose Your Plan
          </DialogTitle>
          <DialogDescription className="text-center text-lg">
            Upgrade to Pro for daily email reminders and more
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {/* Free Plan */}
          <Card className={`flex flex-col ${isPremium ? 'opacity-60' : 'border-2 border-primary'}`}>
            <CardHeader>
              <CardTitle>
                <p className="text-2xl">Free</p>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Essential OPT tracking
              </p>
              <span className="text-5xl font-bold mt-4">$0</span>
              <p className="text-muted-foreground">
                Forever free
              </p>
            </CardHeader>
            <CardContent>
              <Separator className="mb-6" />
              <ul className="space-y-4">
                {freePlanFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CircleCheck className="size-5 text-green-600 flex-shrink-0" />
                    <span>{feature.text}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="mt-auto">
              <Button 
                disabled
                variant="outline"
                className="w-full"
              >
                {isPremium ? 'Free Features Included' : 'Current Plan'}
              </Button>
            </CardFooter>
          </Card>

          {/* Pro Plan */}
          <Card className={`flex flex-col ${isPremium ? 'border-2 border-primary' : ''} relative`}>
            {!isPremium && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
            )}
            {isPremium && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                ✓ Active
              </div>
            )}
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <p className="text-2xl">Pro</p>
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-2 py-0.5 rounded text-xs font-bold">
                    PRO
                  </span>
                </div>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Everything + email reminders
              </p>
              <span className="text-5xl font-bold mt-4">$2.99</span>
              <p className="text-muted-foreground">
                One-time payment • Lifetime access
              </p>
            </CardHeader>
            <CardContent>
              <Separator className="mb-6" />
              <p className="mb-3 font-semibold text-sm">
                Everything in Free, plus:
              </p>
              <ul className="space-y-4">
                {proPlanFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CircleCheck className="size-5 text-blue-600 flex-shrink-0" />
                    <span className="font-medium">{feature.text}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="mt-auto">
              {isPremium ? (
                <Button disabled className="w-full bg-green-600 hover:bg-green-700">
                  ✓ You're a Pro Member
                </Button>
              ) : (
                <Button 
                  onClick={handleUpgrade}
                  disabled={isLoading || checkingStatus}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Processing...
                    </>
                  ) : (
                    <>
                      Upgrade to Pro
                      <ArrowRight className="ml-2 size-4" />
                    </>
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <div className="flex items-start gap-3">
            <Lock className="size-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="text-sm text-muted-foreground">
              <p className="font-semibold mb-1">Secure payment powered by Stripe</p>
              <p>Your payment information is encrypted and secure. All transactions are processed by Stripe, the industry leader in online payment processing.</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
