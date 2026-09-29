import type { SupabaseClient } from '@supabase/supabase-js';
import type { CampaignMetrics, CampaignSummary } from './campaign-metrics';

interface ClickEvent {
  message_id: string;
  link_key: string;
  first_seen_at: string;
}

/** Flag near-simultaneous visits to different CTAs without calling them verified bots. */
export function filterRapidMultiLinkClicks(report: CampaignMetrics, events: ClickEvent[]): CampaignMetrics {
  const byMessage = new Map<string, ClickEvent[]>();
  for (const event of events) {
    const group = byMessage.get(event.message_id) || [];
    group.push(event);
    byMessage.set(event.message_id, group);
  }
  const rapidIds = new Set<string>();
  const rapidByLink = new Map<string, number>();
  for (const [id, group] of byMessage) {
    const rapid = group.some((a, i) => group.slice(i + 1).some(b =>
      a.link_key !== b.link_key && Number.isFinite(Date.parse(a.first_seen_at)) &&
      Number.isFinite(Date.parse(b.first_seen_at)) &&
      Math.abs(Date.parse(a.first_seen_at) - Date.parse(b.first_seen_at)) <= 5000));
    if (!rapid) continue;
    rapidIds.add(id);
    for (const key of new Set(group.map(event => event.link_key))) {
      rapidByLink.set(key, (rapidByLink.get(key) || 0) + 1);
    }
  }
  return {
    ...report,
    rapidMultiLinkClickers: rapidIds.size,
    clickersAfterRapidLinkFilter: Math.max(0, report.recordedClickers - rapidIds.size),
    links: report.links.map(link => ({
      ...link,
      clickersAfterRapidLinkFilter: Math.max(0, link.clickers - (rapidByLink.get(link.key) || 0)),
    })),
  };
}

export async function getEmailCampaignReport(supabase: SupabaseClient, id: string): Promise<CampaignMetrics | null> {
  const result = await supabase.rpc('get_email_campaign_metrics', { p_campaign_id: id });
  if (result.error) throw new Error('Campaign report unavailable');
  if (!result.data) return null;
  const events: ClickEvent[] = [];
  for (let offset = 0; ; offset += 1000) {
    const page = await supabase.from('email_campaign_events')
      .select('message_id,link_key,first_seen_at')
      .eq('campaign_id', id).eq('event_type', 'click').eq('known_automated', false)
      .order('message_id').order('link_key').range(offset, offset + 999);
    if (page.error) throw new Error('Campaign click report unavailable');
    events.push(...(page.data || []));
    if ((page.data?.length || 0) < 1000) break;
  }
  return filterRapidMultiLinkClicks(result.data as CampaignMetrics, events);
}

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
