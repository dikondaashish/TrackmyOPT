'use client';

/**
 * Premium Checkout Page
 * 
 * Allows users to upgrade to premium for $2.99 (lifetime)
 * Features:
 * - Beautiful checkout UI
 * - Stripe integration
 * - Loading states
 * - Error handling
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PremiumCheckout() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [checking, setChecking] = useState(true);

  // Check if user is already premium
  useEffect(() => {
    checkPremiumStatus();
  }, []);

  async function checkPremiumStatus() {
    try {
      const response = await fetch('/api/premium/status');
      const data = await response.json();
      
      if (data.isPremium) {
        setIsPremium(true);
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      }
    } catch (err) {
      console.error('Error checking premium status:', err);
    } finally {
      setChecking(false);
    }
  }

  async function handleCheckout() {
    setLoading(true);
    setError('');

    try {
      // Create checkout session
      const response = await fetch('/api/premium/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();

      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message);
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Checking status...</p>
        </div>
      </div>
    );
  }

  if (isPremium) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            You're Already Premium!
          </h1>
          <p className="text-gray-600 mb-6">
            You already have lifetime access to premium features.
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Premium Badge */}
        <div className="text-center mb-6">
          <div className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-bold px-6 py-2 rounded-full shadow-lg">
            ⭐ LIFETIME ACCESS
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-8 text-center text-white">
            <div className="text-6xl mb-4">🚀</div>
            <h1 className="text-3xl font-extrabold mb-2">
              Go Premium
            </h1>
            <p className="text-blue-100 text-sm">
              Never miss an OPT deadline again
            </p>
          </div>

          {/* Price */}
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 px-8 pb-8">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 text-center text-white">
              <div className="text-5xl font-extrabold mb-1">$2.99</div>
              <div className="text-sm opacity-90">
                One-time payment • Lifetime access
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="p-8 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-gray-900">Daily Email Reminders</div>
                <div className="text-sm text-gray-600">Get personalized reminders every morning at 9 AM EST</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-gray-900">Smart Urgency Detection</div>
                <div className="text-sm text-gray-600">Messages adapt based on your remaining time</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-gray-900">All Tools Included</div>
                <div className="text-sm text-gray-600">Track OPT, STEM, and unemployment days</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-gray-900">Lifetime Access</div>
                <div className="text-sm text-gray-600">Pay once, use forever. No subscriptions.</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-gray-900">Priority Support</div>
                <div className="text-sm text-gray-600">Get help from our team when you need it</div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-8 mb-4">
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm">
                <div className="font-semibold mb-1">Payment Error</div>
                {error}
              </div>
            </div>
          )}

          {/* CTA Button */}
          <div className="px-8 pb-8">
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-4 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transform hover:scale-[1.02]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Processing...
                </span>
              ) : (
                'Upgrade to Premium →'
              )}
            </button>
          </div>

          {/* Trust Badges */}
          <div className="px-8 pb-8 text-center">
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Secure
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Stripe
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Encrypted
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-4">
            Join hundreds of students staying on top of their OPT requirements
          </p>
          <div className="flex justify-center gap-2">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-sm text-gray-600 hover:text-gray-900 underline"
            >
              Maybe later
            </button>
            <span className="text-gray-400">•</span>
            <button
              onClick={() => router.push('/help')}
              className="text-sm text-gray-600 hover:text-gray-900 underline"
            >
              Learn more
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

