'use client';

/**
 * Premium Purchase Success Page
 * 
 * Shown after successful Stripe checkout
 */

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { Check, Mail, Zap, Shield, Crown, FileText, Search, Clock, Sparkles } from 'lucide-react';

function PremiumSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const planId = searchParams.get('planId') || 'pro'; // Default to pro if not specified
  const [countdown, setCountdown] = useState(8);
  const [syncState, setSyncState] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');

  const isDedicated = planId === 'dedicated';

  // Immediately confirm checkout server-side so premium is active before dashboard
  // (Stripe webhooks can arrive seconds later; without this, users often still see "Upgrade".)
  useEffect(() => {
    if (!sessionId) return;

    let cancelled = false;
    const run = async (attempt: number) => {
      setSyncState('syncing');
      try {
        const res = await fetch('/api/premium/confirm-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ sessionId }),
        });
        const data = await res.json().catch(() => ({}));
        if (!cancelled && res.ok && data.ok) {
          setSyncState('synced');
          return;
        }
        if (attempt < 5 && !cancelled) {
          await new Promise((r) => setTimeout(r, 1200));
          return run(attempt + 1);
        }
        if (!cancelled) setSyncState('error');
      } catch {
        if (attempt < 5 && !cancelled) {
          await new Promise((r) => setTimeout(r, 1200));
          return run(attempt + 1);
        }
        if (!cancelled) setSyncState('error');
      }
    };

    run(1);
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  useEffect(() => {
    // Redirect to dashboard after countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-background dark:via-background dark:to-background flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white dark:bg-card rounded-2xl shadow-2xl p-8 text-center">
        {/* Success Icon */}
        <div className={`inline-flex items-center justify-center w-20 h-20 ${isDedicated ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-green-100 dark:bg-green-900/30'} rounded-full mb-6`}>
          {isDedicated ? (
            <Shield className="w-10 h-10 text-amber-600 dark:text-amber-500" />
          ) : (
            <Crown className="w-10 h-10 text-green-600 dark:text-green-500" />
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-foreground mb-3">
          {isDedicated ? 'Welcome to Dedicated!' : 'Welcome to Premium!'}
        </h1>

        <p className="text-gray-600 dark:text-muted-foreground mb-6">
          {isDedicated
            ? 'Your payment was successful. You now have full Dedicated access with expert support!'
            : 'Your payment was successful. You now have full Pro access!'
          }
        </p>

        {/* Features Unlocked */}
        <div className={`bg-gradient-to-br ${isDedicated ? 'from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30' : 'from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30'} rounded-xl p-6 mb-6 text-left`}>
          <h3 className="font-bold text-gray-900 dark:text-foreground mb-4 text-center">You've Unlocked:</h3>
          <div className="space-y-3">
            {isDedicated ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-amber-100 dark:bg-amber-900/50 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span className="text-gray-700 dark:text-foreground text-sm font-medium">1-on-1 Lawyer Session (1 hr/mo)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-amber-100 dark:bg-amber-900/50 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span className="text-gray-700 dark:text-foreground text-sm font-medium">Complete Application Audit</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-amber-100 dark:bg-amber-900/50 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span className="text-gray-700 dark:text-foreground text-sm font-medium">24/7 Dedicated Support</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-amber-100 dark:bg-amber-900/50 rounded-lg flex items-center justify-center">
                    <Crown className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span className="text-gray-700 dark:text-foreground text-sm font-medium">Everything in Pro Plan</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                    <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-gray-700 dark:text-foreground text-sm font-medium">Daily email reminders (9 AM EST)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-gray-700 dark:text-foreground text-sm font-medium">Smart urgency detection</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                    <Search className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-gray-700 dark:text-foreground text-sm font-medium">All tracking tools</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-gray-700 dark:text-foreground text-sm font-medium">Priority support</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6 text-left">
          <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">📝 Next Steps:</h4>
          <ol className="text-sm text-blue-800 dark:text-blue-400 space-y-2 list-decimal list-inside">
            <li>Go to your dashboard to set up your OPT dates</li>
            {isDedicated && <li>Check your email for instructions on scheduling your lawyer session</li>}
            <li>Add your email address in settings</li>
            <li>Verify your email to start receiving reminders</li>
          </ol>
        </div>

        {/* Sync + redirect */}
        {sessionId && (
          <p className="text-sm text-gray-600 dark:text-muted-foreground mb-2">
            {syncState === 'syncing' && 'Activating your subscription on your account…'}
            {syncState === 'synced' && '✓ Subscription activated. Loading your dashboard...'}
            {syncState === 'error' && (
              <>
                We could not confirm your subscription automatically. If the dashboard still shows "Upgrade", wait a minute
                and refresh, or contact{' '}
                <a href="mailto:support@trackmyopt.com" className="text-blue-600 underline">
                  support@trackmyopt.com
                </a>
                .
              </>
            )}
            {syncState === 'idle' && <span className="text-gray-500">Preparing your account…</span>}
          </p>
        )}
        <p className="text-sm text-gray-500 dark:text-muted-foreground mb-6">
          Redirecting to your dashboard in <span className="font-bold text-blue-600">{countdown}</span> seconds...
        </p>

        {/* CTA Button */}
        <button
          onClick={() => router.push('/dashboard')}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-4 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
        >
          Go to Dashboard Now →
        </button>

        {/* Support */}
        <p className="text-xs text-gray-500 dark:text-muted-foreground mt-6">
          Need help? Contact us at{' '}
          <a href="mailto:support@trackmyopt.com" className="text-blue-600 hover:underline">
            support@trackmyopt.com
          </a>
        </p>

        {/* Receipt */}
        {sessionId && (
          <p className="text-xs text-gray-400 dark:text-muted-foreground mt-4">
            Session ID: {sessionId.substring(0, 20)}...
          </p>
        )}
      </div>
    </div>
  );
}

export default function PremiumSuccess() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <PremiumSuccessContent />
    </Suspense>
  );
}

