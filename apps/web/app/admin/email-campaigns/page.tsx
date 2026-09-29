import { redirect } from 'next/navigation';
import { getEmailCampaignAdmin } from '@/lib/auth/email-campaign-admin';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getEmailCampaignReport, listEmailCampaigns } from '@/lib/notifications/campaign-reports';
import type {
  CampaignMetrics,
  CampaignSummary,
} from '@/lib/notifications/campaign-metrics';
import EmailCampaignDashboard from './dashboard';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Email analytics | TrackMyOPT Admin',
  robots: { index: false, follow: false },
};

export default async function EmailCampaignsPage() {
  const admin = await getEmailCampaignAdmin();
  if (admin.status === 'signed_out') redirect('/admin/login');
  if (admin.status === 'forbidden') redirect('/admin/login?error=access');
  if (admin.status !== 'admin')
    return (
      <main className="mx-auto max-w-lg p-10">
        <h1 className="text-xl font-semibold">Sign-in unavailable</h1>
        <p role="alert" className="mt-3">
          Please refresh in a moment. Your reports are protected.
        </p>
      </main>
    );
  let campaigns: CampaignSummary[] = [];
  let report: CampaignMetrics | null = null;
  let error = '';
  try {
    const supabase = getSupabaseAdminClient();
    campaigns = await listEmailCampaigns(supabase);
    if (campaigns[0]) {
      report = await getEmailCampaignReport(supabase, campaigns[0].id);
      if (!report) throw new Error('Report unavailable');
    }
  } catch {
    error = 'Campaign results are temporarily unavailable. Please refresh.';
  }
  const updatedAt = report ? new Date().toISOString() : null;
  return (
    <EmailCampaignDashboard
      email={admin.email}
      initialCampaigns={campaigns}
      initialReport={report}
      initialError={error}
      updatedAt={updatedAt}
    />
  );
}
