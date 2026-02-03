'use client';

/**
 * Premium Purchase Cancelled Page
 * 
 * Shown when user cancels the Stripe checkout
 */

import { useRouter } from 'next/navigation';

export default function PremiumCancelled() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-background dark:via-background dark:to-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-card rounded-2xl shadow-xl p-8 text-center">
        {/* Cancelled Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-muted rounded-full mb-6">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-foreground mb-3">
          Payment Cancelled
        </h1>

        <p className="text-gray-600 dark:text-muted-foreground mb-8">
          Your payment was cancelled. No charges were made to your account.
        </p>

        {/* Reminder of benefits */}
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6 text-left">
          <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-3">💡 Reminder: Premium includes</h3>
          <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">✓</span>
              <span>Daily email reminders at 9 AM EST</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">✓</span>
              <span>Smart urgency-based messaging</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">✓</span>
              <span>Track all OPT and STEM deadlines</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">✓</span>
              <span><strong>Pro access</strong> for just $4.99/mo</span>
            </li>
          </ul>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => router.push('/premium/checkout')}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-4 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
          >
            Try Again →
          </button>

          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-gray-100 dark:bg-muted text-gray-700 dark:text-foreground font-semibold py-4 rounded-xl hover:bg-gray-200 dark:hover:bg-muted/80 transition-all"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Support */}
        <p className="text-xs text-gray-500 dark:text-muted-foreground mt-6">
          Having issues?{' '}
          <a href="mailto:support@trackmyopt.com" className="text-blue-600 hover:underline">
            Contact support
          </a>
        </p>

        {/* Testimonial */}
        <div className="mt-8 p-4 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex">
              {'★★★★★'.split('').map((star, i) => (
                <span key={i} className="text-yellow-400">{star}</span>
              ))}
            </div>
          </div>
          <p className="text-sm text-gray-700 dark:text-foreground italic mb-2">
            "The daily reminders saved me! I almost missed my filing window. Worth every penny."
          </p>
          <p className="text-xs text-gray-500 dark:text-muted-foreground">
            — Sarah K., F-1 Student
          </p>
        </div>
      </div>
    </div>
  );
}

