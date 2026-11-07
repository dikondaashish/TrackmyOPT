'use client';
import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import * as Sentry from '@sentry/nextjs';
import { PricingModal } from '@/components/pricing/PricingModal';

export function MonitoringEmailOffer() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token');
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function viewOffer() {
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/premium/monitoring-engagement', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      if (res.status === 401) {
        router.push(
          '/login?returnTo=' +
            encodeURIComponent(
              '/premium/monitoring?token=' + encodeURIComponent(token ?? '')
            )
        );
        return;
      }
      if (!res.ok) {
        setError(
          res.status >= 500
            ? 'We couldn’t check your offer. Please try again.'
            : 'This offer link is unavailable. Open your case dashboard for current options.'
        );
        return;
      }
      setOpen(true);
    } catch {
      Sentry.captureException(
        new Error('Monitoring email offer request failed')
      );
      setError('We couldn’t check your offer. Please try again.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="min-h-screen bg-surface px-4 py-16 sm:py-24">
      <div className="surface-card mx-auto max-w-xl px-6 py-12 text-center sm:px-10">
      <p className="text-sm font-medium text-primary">TrackMyOPT Pro</p>
      <h1 className="mt-3 text-3xl font-semibold text-foreground">
        Let us handle the daily checks
      </h1>
      <p className="mt-4 text-muted-foreground">
        Daily USCIS checks. Email when your status changes. Manual tracking
        stays free.
      </p>
      <button
        disabled={busy || !token}
        onClick={() => void viewOffer()}
        className="mt-8 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 font-semibold text-primary-foreground shadow-button transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
      >
        {busy ? 'Checking…' : 'See my monitoring options'}
      </button>
      <p className="mt-4 text-sm text-muted-foreground">
        Monitoring cannot speed up a USCIS decision.
      </p>
      {error && (
        <p role="alert" className="mt-5 text-sm text-destructive">
          {error}
        </p>
      )}
      <Link
        href="/dashboard/case-status"
        className="mt-6 inline-block text-sm text-muted-foreground underline hover:text-foreground"
      >
        Back to my case
      </Link>
      <PricingModal
        open={open}
        onClose={() => setOpen(false)}
        caseMonitoring
        checkoutSource="pending_case_email"
      />
      </div>
    </main>
  );
}
