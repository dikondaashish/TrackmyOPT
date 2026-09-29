'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { CampaignMetrics } from '@/lib/notifications/campaign-metrics';

export default function EmailCampaignsPage() {
  const [secret, setSecret] = useState('');
  const [campaignId, setCampaignId] = useState('product_update_2026_09_29');
  const [report, setReport] = useState<CampaignMetrics | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function refresh(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setReport(null);
    try {
      const response = await fetch(`/api/admin/email-campaigns?id=${encodeURIComponent(campaignId.trim())}`, {
        headers: { Authorization: `Bearer ${secret}` }, cache: 'no-store',
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Report unavailable');
      setReport(json);
    } catch (err) { setError(err instanceof Error ? err.message : 'Report unavailable'); }
    finally { setLoading(false); }
  }

  const proClicks = report?.links.find(link => link.key === 'pro_intro')?.clickers ?? 0;
  const freeClicks = report?.links.find(link => link.key === 'free_dashboard')?.clickers ?? 0;
  const cards = report ? [
    ['SMTP accepted', report.sent], ['Observed opens', report.observedOpens],
    ['$0.99 offer clickers', proClicks], ['Free link clickers', freeClicks],
  ] as const : [];

  return (
    <main className="mx-auto max-w-5xl p-6 sm:p-10 space-y-6">
      <h1 className="text-2xl font-semibold">Email campaign report</h1>
      <p className="text-sm text-muted-foreground">Counts are unique recipients, not total visits. Opens measure image loads and can be inflated by privacy proxies or missed when images are blocked. Clicks can include undetected security scanners; they are not purchases.</p>
      <form onSubmit={refresh} className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-sm">Campaign ID<Input value={campaignId} onChange={e => setCampaignId(e.target.value)} required /></label>
        <label className="space-y-1 text-sm">Admin secret<Input type="password" autoComplete="off" value={secret} onChange={e => setSecret(e.target.value)} required /></label>
        <Button type="submit" disabled={loading || !secret || !campaignId}>{loading ? 'Loading…' : 'Load report'}</Button>
      </form>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {report && <section aria-label="Campaign results" className="space-y-5">
        <div><h2 className="font-semibold">{report.campaignId}</h2><p className="text-sm text-muted-foreground">{report.subject}</p></div>
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(([label, count]) => <div key={label} className="rounded-lg border p-4"><dt className="text-sm text-muted-foreground">{label}</dt><dd className="mt-2 text-3xl font-semibold">{count.toLocaleString()}</dd></div>)}
        </dl>
        <p className="text-sm">{report.recordedClickers} recipients clicked any tracked link. {report.knownAutomatedRequests} detected automated events are excluded from the cards. SMTP acceptance does not confirm inbox delivery.</p>
        <p className="text-sm">Failed before send: {report.failed}. Send outcomes needing review: {report.needsReview}. A repeated campaign request skips reserved recipients to prevent duplicate sends.</p>
        <div className="overflow-x-auto"><table className="w-full text-left text-sm">
          <caption className="mb-3 text-left font-semibold">Clicks by link</caption>
          <thead><tr className="border-b"><th scope="col" className="p-3">Link</th><th scope="col" className="p-3">Unique clickers</th><th scope="col" className="p-3">Detected automated clickers</th></tr></thead>
          <tbody>{report.links.map(link => <tr key={link.key} className="border-b"><th scope="row" className="p-3 font-normal">{link.key}</th><td className="p-3">{link.clickers}</td><td className="p-3">{link.knownAutomatedClickers}</td></tr>)}</tbody>
        </table></div>
      </section>}
    </main>
  );
}
