'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Eye, MousePointerClick, RefreshCw, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type {
  CampaignMetrics,
  CampaignSummary,
} from '@/lib/notifications/campaign-metrics';

export default function EmailCampaignDashboard({
  email,
  initialCampaigns,
  initialReport,
  initialError = '',
  updatedAt = null,
}: {
  email: string;
  initialCampaigns: CampaignSummary[];
  initialReport: CampaignMetrics | null;
  initialError?: string;
  updatedAt?: string | null;
}) {
  const router = useRouter();
  const requestId = useRef(0);
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [campaignId, setCampaignId] = useState(initialCampaigns[0]?.id || '');
  const [report, setReport] = useState<CampaignMetrics | null>(initialReport);
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(updatedAt);

  async function read(url: string) {
    const response = await fetch(url, {
      credentials: 'same-origin',
      cache: 'no-store',
      signal: AbortSignal.timeout(20000),
    });
    if (response.status === 401 || response.status === 403) {
      router.replace('/admin/login');
      router.refresh();
      throw new Error('Your admin session has expired. Please sign in again.');
    }
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Report unavailable');
    return result;
  }

  async function refresh(selected = campaignId) {
    const currentRequest = ++requestId.current;
    setLoading(true);
    setError('');
    setReport(null);
    try {
      const list: { campaigns: CampaignSummary[] } = await read(
        '/api/admin/email-campaigns'
      );
      const nextId = list.campaigns.some((c) => c.id === selected)
        ? selected
        : list.campaigns[0]?.id || '';
      const nextReport: CampaignMetrics | null = nextId
        ? await read(
            `/api/admin/email-campaigns?id=${encodeURIComponent(nextId)}`
          )
        : null;
      if (currentRequest !== requestId.current) return;
      setCampaigns(list.campaigns);
      setCampaignId(nextId);
      setReport(nextReport);
      setLastUpdated(nextReport ? new Date().toISOString() : null);
    } catch (err) {
      if (currentRequest === requestId.current)
        setError(err instanceof Error ? err.message : 'Report unavailable');
    } finally {
      setLoading((active) =>
        currentRequest === requestId.current ? false : active
      );
    }
  }

  async function signOut() {
    requestId.current++;
    setReport(null);
    setLoggingOut(true);
    setError('');
    try {
      const response = await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'same-origin',
        signal: AbortSignal.timeout(20000),
      });
      if (!response.ok)
        throw new Error('Unable to sign out. Please try again.');
      router.replace('/admin/login');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign out');
    } finally {
      setLoading(false);
      setLoggingOut(false);
    }
  }

  return (
    <main className="ph-no-capture mx-auto max-w-7xl space-y-8 px-5 py-8 sm:px-10 sm:py-12">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b pb-5">
        <p className="font-semibold text-blue-600 dark:text-blue-400">
          TrackMyOPT{' '}
          <span className="ml-2 text-xs font-normal uppercase tracking-widest text-muted-foreground">
            Admin
          </span>
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-muted-foreground">{email}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={signOut}
            disabled={loggingOut}
          >
            <LogOut aria-hidden="true" className="mr-2 h-4 w-4" />
            {loggingOut ? 'Signing out…' : 'Sign out'}
          </Button>
        </div>
      </header>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Email analytics
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          See how recipients engage with your product updates.
        </p>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <label className="min-w-0 flex-1 space-y-2 text-sm font-medium">
          Campaign
          <select
            value={campaignId}
            onChange={(e) => {
              setCampaignId(e.target.value);
              void refresh(e.target.value);
            }}
            disabled={loading || loggingOut || !campaigns.length}
            className="block h-11 w-full rounded-md border bg-background px-3 font-normal"
          >
            {!campaigns.length && (
              <option value="">No tracked campaigns yet</option>
            )}
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.subject} · {c.id}
              </option>
            ))}
          </select>
        </label>
        <Button
          variant="outline"
          onClick={() => void refresh()}
          disabled={loading || loggingOut}
        >
          <RefreshCw aria-hidden="true" className="mr-2 h-4 w-4" />
          {loading ? 'Refreshing…' : 'Refresh results'}
        </Button>
      </div>
      <CampaignFeedback
        report={report}
        error={error}
        loading={loading}
        loggingOut={loggingOut}
        lastUpdated={lastUpdated}
      />
      <aside className="rounded-xl bg-blue-50 p-5 text-sm leading-6 text-slate-700 dark:bg-blue-950/30 dark:text-muted-foreground">
        <h2 className="font-semibold">What these numbers mean</h2>
        <p className="mt-1">
          Clicks count unique recipient messages, so repeat visits do not
          increase the count. A recipient can click both offers. Opens measure
          image loads; privacy proxies can inflate them and blocked images can
          hide them. Known scanners are separated, but unknown automation and
          forwarded messages can still affect the results. Clicks are not
          purchases.
        </p>
      </aside>
    </main>
  );
}

function CampaignFeedback({
  report,
  error,
  loading,
  loggingOut,
  lastUpdated,
}: {
  report: CampaignMetrics | null;
  error: string;
  loading: boolean;
  loggingOut: boolean;
  lastUpdated: string | null;
}) {
  if (error)
    return (
      <p role="alert" className="text-sm text-red-600">
        {error}
      </p>
    );
  if (loggingOut)
    return (
      <p role="status" className="text-sm text-muted-foreground">
        Signing out…
      </p>
    );
  if (loading)
    return (
      <p role="status" className="text-sm text-muted-foreground">
        Loading current campaign results…
      </p>
    );
  if (!report)
    return (
      <div className="rounded-xl border border-dashed p-8 text-center">
        <Mail
          aria-hidden="true"
          className="mx-auto mb-3 h-8 w-8 text-muted-foreground"
        />
        <h2 className="font-semibold">No tracked campaigns yet</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Your product updates will appear here when prepared by the
          tracking-enabled sender. This page does not send emails.
        </p>
      </div>
    );
  return <CampaignResults report={report} lastUpdated={lastUpdated} />;
}

function CampaignResults({
  report,
  lastUpdated,
}: {
  report: CampaignMetrics;
  lastUpdated: string | null;
}) {
  const proClicks =
    report.links.find((link) => link.key === 'pro_intro')?.clickers ?? 0;
  const freeClicks =
    report.links.find((link) => link.key === 'free_dashboard')?.clickers ?? 0;
  const cards = [
    ['Emails accepted', report.sent, Mail],
    ['Observed opens', report.observedOpens, Eye],
    ['Unique link clickers', report.recordedClickers, MousePointerClick],
    ['Pro options clickers', proClicks, MousePointerClick],
    ['Free link clickers', freeClicks, MousePointerClick],
  ] as const;
  return (
    <section aria-label="Campaign results" className="space-y-5">
      <div>
        <h2 className="font-semibold">{report.subject}</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {report.campaignId}
          {lastUpdated && (
            <>
              {' '}
              · Updated{' '}
              {new Date(lastUpdated).toLocaleString('en-US', {
                timeZone: 'America/New_York',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}{' '}
              ET
            </>
          )}
        </p>
      </div>
      <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map(([label, count, Icon]) => (
          <div key={label} className="rounded-xl border bg-card p-5">
            <Icon
              aria-hidden="true"
              className="mb-4 h-5 w-5 text-blue-600 dark:text-blue-400"
            />
            <dt className="text-sm text-muted-foreground">
              {label}
              {label === 'Observed opens' && (
                <span className="mt-1 block text-xs">Approximate</span>
              )}
            </dt>
            <dd className="mt-2 text-3xl font-semibold tabular-nums">
              {count.toLocaleString()}
            </dd>
          </div>
        ))}
      </dl>
      <p className="text-sm">
        {report.knownAutomatedRequests} detected automated events are excluded
        from the engagement cards. Mail server acceptance does not confirm inbox
        delivery.
      </p>
      <p className="text-sm">
        Failed before send: {report.failed}. Send outcomes needing review:{' '}
        {report.needsReview}. A repeated campaign request skips reserved
        recipients to prevent duplicate sends.
      </p>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-left text-sm">
          <caption className="mb-3 text-left font-semibold">
            Clicks by link
          </caption>
          <thead>
            <tr className="border-b">
              <th scope="col" className="p-3">
                Link
              </th>
              <th scope="col" className="p-3">
                Unique clickers
              </th>
              <th scope="col" className="p-3">
                Detected automated clickers
              </th>
            </tr>
          </thead>
          <tbody>
            {report.links.map((link) => (
              <tr key={link.key} className="border-b">
                <th scope="row" className="p-3 font-normal">
                  {link.key}
                </th>
                <td className="p-3">{link.clickers}</td>
                <td className="p-3">{link.knownAutomatedClickers}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
