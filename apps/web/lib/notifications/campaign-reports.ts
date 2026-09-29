import type { SupabaseClient } from '@supabase/supabase-js';
import type { CampaignSummary } from './campaign-metrics';

export async function listEmailCampaigns(
  supabase: SupabaseClient
): Promise<CampaignSummary[]> {
  const campaigns: CampaignSummary[] = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await supabase
      .from('email_campaigns')
      .select('id,subject,created_at')
      .order('created_at', { ascending: false })
      .order('id')
      .range(offset, offset + 999);
    if (error) throw new Error('Campaign list unavailable');
    campaigns.push(...(data || []));
    if (!data || data.length < 1000) return campaigns;
  }
}
