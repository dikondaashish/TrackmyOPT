'use client';

/**
 * Premium Checkout Page
 * 
 * Shows the pricing modal for upgrading to premium
 * Uses the PricingModal component for consistent UI
 */

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PricingModal } from '@/components/pricing/PricingModal';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPremium, setIsPremium] = useState(false);
  const [checking, setChecking] = useState(true);
  const [userEmail, setUserEmail] = useState('');

  // Check if user is already premium
  useEffect(() => {
    checkPremiumStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function checkPremiumStatus() {
    try {
      const response = await fetch('/api/premium/status');
      const data = await response.json();

      if (data.isPremium) {
        setIsPremium(true);
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      }

      // Get user email if available
      const userRes = await fetch('/api/me');
      if (userRes.ok) {
        const userData = await userRes.json();
        setUserEmail(userData.user?.email || '');
      }
    } catch (err) {
    } finally {
      setChecking(false);
    }
  }

  function handleClose() {
    router.push('/dashboard');
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-background dark:to-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-muted-foreground">Checking status...</p>
        </div>
      </div>
    );
  }

  if (isPremium) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-background dark:to-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-card rounded-2xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-foreground mb-2">
            You're Already Premium!
          </h1>
          <p className="text-gray-600 dark:text-muted-foreground mb-6">
            You have an active Pro subscription.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-4 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all"
          >
            Go to Dashboard →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background flex items-center justify-center p-4">
      <PricingModal
        open={true}
        onClose={handleClose}
        userEmail={userEmail}
        isPremium={isPremium}
        initialPlan={searchParams?.get('planId') || undefined}
        initialInterval={searchParams?.get('interval') || undefined}
      />
    </div>
  );
}

export default function PremiumCheckout() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}

