'use client';

/**
 * Premium Checkout Page
 * 
 * Modern, full-page pricing experience with premium design
 */

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, CircleCheck, Shield, Clock, Zap, Sparkles, ArrowLeft, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import Link from 'next/link';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPremium, setIsPremium] = useState(false);
  const [checking, setChecking] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isYearly, setIsYearly] = useState(true);

  useEffect(() => {
    checkPremiumStatus();
  }, []);

  async function checkPremiumStatus() {
    try {
      const response = await fetch('/api/premium/status');
      const data = await response.json();

      if (data.isPremium) {
        setIsPremium(true);
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      }
    } catch (err) {
    } finally {
      setChecking(false);
    }
  }

  const handleUpgrade = async (planId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/premium/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          interval: isYearly ? 'year' : 'month',
        }),
      });

      if (!response.ok) throw new Error('Failed to create checkout');
      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      alert('Failed to start checkout. Please try again.');
      setIsLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (isPremium) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-10 text-center">
          <div className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
            <CircleCheck className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
            You're Already Premium!
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Enjoy all the premium features in your dashboard.
          </p>
          <Button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-6 rounded-xl"
          >
            Go to Dashboard
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    );
  }

  const freePlanFeatures = [
    "OPT & STEM Calculators",
    "90-Day Unemployment Tracker",
    "USCIS Case Status (Manual)",
    "H-1B Sponsors (100 Companies)",
    "Job Tracker & Resumes (5/mo)",
    "Chrome Extension",
  ];

  const proPlanFeatures = [
    "Daily 9AM Email Reminders",
    "USCIS Auto-Checks (6hrs)",
    "Instant Status Alerts",
    "Unlimited H-1B Sponsors",
    "Document Vault + Expiry Alerts",
    "Unlimited Jobs & Resumes",
    "ATS Scanner (Unlimited)",
    "Sprintax Coupon ($20)",
  ];

  const dedicatedPlanFeatures = [
    "1-on-1 Lawyer Session (1 hr/mo)",
    "Complete Application Audit",
    "24/7 Priority Support",
    "Personalized Strategy Plan",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-purple-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            <span className="text-sm text-slate-600 dark:text-slate-400">Secure Checkout</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-500/20 dark:to-purple-500/20 px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Limited Time: 40% Off Annual Plans</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Unlock powerful OPT tools, automated alerts, and peace of mind for your immigration journey.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={`text-base font-medium transition-colors ${!isYearly ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-500'}`}>
            Monthly
          </span>
          <Switch
            checked={isYearly}
            onCheckedChange={setIsYearly}
            className="data-[state=checked]:bg-blue-600 h-7 w-14"
          />
          <span className={`text-base font-medium transition-colors ${isYearly ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-500'}`}>
            Annual
          </span>
          {isYearly && (
            <span className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-sm font-semibold px-3 py-1 rounded-full">
              Save 40%
            </span>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Free Plan */}
          <Card className="relative bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
            <CardHeader className="pb-4">
              <p className="text-slate-600 dark:text-slate-400 font-medium mb-2">Free</p>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold text-slate-900 dark:text-white">$0</span>
              </div>
              <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">Forever free</p>
            </CardHeader>
            <CardContent className="pb-6">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">What's included:</p>
              <ul className="space-y-3">
                {freePlanFeatures.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CircleCheck className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button disabled variant="outline" className="w-full py-6 rounded-xl text-base">
                Current Plan
              </Button>
            </CardFooter>
          </Card>

          {/* Pro Plan - Featured */}
          <Card className="relative bg-white dark:bg-slate-800 border-2 border-blue-600 dark:border-blue-500 rounded-2xl overflow-hidden shadow-xl shadow-blue-500/10">
            {/* Popular Badge */}
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 py-2 text-center">
              <div className="flex items-center justify-center gap-2">
                <Star className="w-4 h-4 text-white fill-white" />
                <span className="text-white text-sm font-bold">MOST POPULAR</span>
                <Star className="w-4 h-4 text-white fill-white" />
              </div>
            </div>
            <CardHeader className="pt-14 pb-4">
              <p className="text-blue-600 dark:text-blue-400 font-medium mb-2">Pro</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-slate-900 dark:text-white">
                  {isYearly ? '$49' : '$4.99'}
                </span>
                <span className="text-slate-400 line-through text-lg">
                  {isYearly ? '$79' : '$7.99'}
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">
                {isYearly ? 'per year' : 'per month'}
              </p>
            </CardHeader>
            <CardContent className="pb-6">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">Everything in Free, plus:</p>
              <ul className="space-y-3">
                {proPlanFeatures.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CircleCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="flex-col gap-3">
              <Button
                onClick={() => handleUpgrade('pro')}
                disabled={isLoading}
                className="w-full py-6 rounded-xl text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Start 7-Day Free Trial
                    <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </Button>
              <p className="text-xs text-slate-500 text-center">No credit card charged during trial</p>
            </CardFooter>
          </Card>

          {/* Dedicated Plan */}
          <Card className="relative bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 border-slate-700 rounded-2xl overflow-hidden text-white">
            <CardHeader className="pb-4">
              <p className="text-amber-400 font-medium mb-2">Dedicated</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold">
                  {isYearly ? '$149' : '$14.99'}
                </span>
                <span className="text-slate-500 line-through text-lg">
                  {isYearly ? '$199' : '$19.99'}
                </span>
              </div>
              <p className="text-slate-400 text-sm mt-1">
                {isYearly ? 'per year' : 'per month'}
              </p>
            </CardHeader>
            <CardContent className="pb-6">
              <p className="text-sm font-medium text-slate-300 mb-4">Everything in Pro, plus:</p>
              <ul className="space-y-3">
                {dedicatedPlanFeatures.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CircleCheck className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-200">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => handleUpgrade('dedicated')}
                disabled={isLoading}
                variant="outline"
                className="w-full py-6 rounded-xl text-base border-slate-600 text-white hover:bg-slate-700 hover:text-white"
              >
                {isLoading ? 'Processing...' : (
                  <span className="flex items-center gap-2">
                    Upgrade to Dedicated
                    <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <div className="flex flex-wrap items-center justify-center gap-8">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Shield className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium">Secure Payment</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium">7-Day Free Trial</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Zap className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium">Cancel Anytime</span>
            </div>
          </div>
          <p className="mt-6 text-sm text-slate-500 dark:text-slate-500">
            Powered by <span className="font-semibold">Stripe</span> • Your payment info is never stored on our servers
          </p>
        </div>

        {/* FAQ Teaser */}
        <div className="mt-16 text-center">
          <p className="text-slate-600 dark:text-slate-400">
            Have questions?{' '}
            <Link href="/faq" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Check our FAQ
            </Link>
            {' '}or{' '}
            <Link href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Contact Us
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PremiumCheckout() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
