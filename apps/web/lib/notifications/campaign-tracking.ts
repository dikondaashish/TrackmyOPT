import { createHmac, timingSafeEqual } from 'node:crypto';
import { load } from 'cheerio';
import { z } from 'zod';

export const campaignIdSchema = z.string().regex(/^[a-z0-9][a-z0-9_-]{0,79}$/);
export const campaignLinkKeySchema = z.string().regex(/^[a-z0-9][a-z0-9_-]{0,39}$/);
export const campaignTrackingSchema = z.object({
  id: campaignIdSchema,
  links: z.record(campaignLinkKeySchema, z.string().url()).refine(
    links => Object.keys(links).length > 0 && Object.keys(links).length <= 20,
    'Provide between 1 and 20 tracked links',
  ),
});
export type CampaignTracking = z.infer<typeof campaignTrackingSchema>;

const tokenSchema = z.object({
  messageId: z.string().uuid(),
  kind: z.enum(['open', 'click']),
  linkKey: z.string().max(40),
  expiresAt: z.number().int().positive(),
});
export type CampaignToken = z.infer<typeof tokenSchema>;

// Domain separation keeps these signatures separate from legacy click links.
function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(`email-campaign-v1:${payload}`).digest('base64url');
}

export function getCampaignSigningSecret(): string | undefined {
  return process.env.EMAIL_LINK_SIGNING_SECRET || process.env.ADMIN_SECRET;
}

export function createCampaignToken(token: CampaignToken, secret: string): string {
  const payload = Buffer.from(JSON.stringify(token)).toString('base64url');
  return `${payload}.${sign(payload, secret)}`;
}

export function verifyCampaignToken(value: string | null, secret: string | undefined, now = Date.now()): CampaignToken | null {
  if (!value || !secret || value.length > 1024) return null;
  const [payload, signature, extra] = value.split('.');
  if (!payload || !signature || extra) return null;
  const expected = Buffer.from(sign(payload, secret));
  const actual = Buffer.from(signature);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
  try {
    const parsed = tokenSchema.safeParse(JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')));
    if (!parsed.success || parsed.data.expiresAt <= now) return null;
    if (parsed.data.kind === 'open' && parsed.data.linkKey !== '') return null;
    if (parsed.data.kind === 'click' && !campaignLinkKeySchema.safeParse(parsed.data.linkKey).success) return null;
    return parsed.data;
  } catch { return null; }
}

export function isCampaignDestinationAllowed(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && !url.port && (
      url.hostname === 'www.trackmyopt.com' || url.hostname === 'trackmyopt.com' ||
      (url.hostname === 'chromewebstore.google.com' && url.pathname === '/detail/trackmyopt/hfljbefkccdmlnhclfojlafipjnjbajm')
    );
  } catch { return false; }
}

/** Known automation only; unknown scanners and privacy proxies remain possible. No UA or IP is stored. */
export function isKnownAutomatedEmailRequest(headers: Headers): boolean {
  return /bot|crawler|spider|headless|proofpoint|barracuda|mimecast|curl|wget|python-requests/i.test(headers.get('user-agent') || '') ||
    /prefetch|prerender/i.test(`${headers.get('purpose') || ''} ${headers.get('sec-purpose') || ''} ${headers.get('x-purpose') || ''}`);
}

export function instrumentCampaignEmail(args: {
  html: string; text: string; messageId: string; campaign: CampaignTracking;
  baseUrl: string; secret: string; now?: number;
}): { html: string; text: string } {
  const { campaign, messageId, secret } = args;
  for (const url of Object.values(campaign.links)) {
    if (!isCampaignDestinationAllowed(url)) throw new Error('Tracked destination is not allowed');
  }
  if (new Set(Object.values(campaign.links)).size !== Object.keys(campaign.links).length) {
    throw new Error('Each tracked link must have a distinct destination URL');
  }
  const base = new URL(args.baseUrl);
  if (base.protocol !== 'https:' || !['www.trackmyopt.com', 'trackmyopt.com'].includes(base.hostname) || base.username || base.password || base.port) {
    throw new Error('Campaign tracking requires the production HTTPS origin');
  }
  const expiresAt = (args.now ?? Date.now()) + 90 * 24 * 60 * 60 * 1000;
  const trackingUrl = (kind: 'open' | 'click', linkKey: string) => {
    const url = new URL(`/api/notifications/campaign/${kind}`, base.origin);
    url.searchParams.set('token', createCampaignToken({ messageId, kind, linkKey, expiresAt }, secret));
    return url.toString();
  };
  const $ = load(args.html);
  let text = args.text;
  for (const [key, destination] of Object.entries(campaign.links)) {
    const anchors = $('a').filter((_, el) => $(el).attr('href') === destination);
    if (!anchors.length || !text.includes(destination)) throw new Error(`Tracked link ${key} must appear in HTML and plain text`);
    const url = trackingUrl('click', key);
    anchors.attr('href', url);
    text = text.replaceAll(destination, url);
  }
  // Only explicitly configured CTA links are rewritten; footer links stay direct.
  $('body').append(`<img src="${trackingUrl('open', '')}" width="1" height="1" alt="" style="border:0;width:1px;height:1px;">`);
  return { html: $.html(), text };
}
