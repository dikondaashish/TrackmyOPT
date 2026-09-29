// @vitest-environment node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { load } from 'cheerio';
import { describe, expect, it } from 'vitest';
import { createCampaignToken, verifyCampaignToken, instrumentCampaignEmail, isCampaignDestinationAllowed, isKnownAutomatedEmailRequest } from './campaign-tracking';

const secret = 'test-only-secret';
const messageId = '12345678-1234-4123-8123-123456789012';
const now = 100000;
const token = { messageId, kind: 'click' as const, linkKey: 'pro_intro', expiresAt: now + 1000 };

describe('campaign links', () => {
  it('requires a valid signature, expiry and token kind', () => {
    const signed = createCampaignToken(token, secret);
    expect(verifyCampaignToken(signed, secret, now)).toEqual(token);
    expect(verifyCampaignToken(signed, 'wrong', now)).toBeNull();
    expect(verifyCampaignToken(signed + '.extra', secret, now)).toBeNull();
    expect(verifyCampaignToken(signed, secret, token.expiresAt)).toBeNull();
    expect(verifyCampaignToken(createCampaignToken({ ...token, kind: 'open' }, secret), secret, now)).toBeNull();
    expect(verifyCampaignToken(null, secret, now)).toBeNull();
    expect(verifyCampaignToken(signed, undefined, now)).toBeNull();
    const payload = JSON.parse(Buffer.from(signed.split('.')[0], 'base64url').toString());
    expect(Object.keys(payload).sort()).toEqual(['expiresAt', 'kind', 'linkKey', 'messageId']);
  });

  it.each(['https://trackmyopt.com.evil.test/pricing', 'http://www.trackmyopt.com/pricing', 'https://user:pass@www.trackmyopt.com/pricing', 'https://www.trackmyopt.com:444/pricing', 'javascript:alert(1)', 'https://chromewebstore.google.com/detail/other/abc'])(
    'rejects an unsafe destination: %s', url => expect(isCampaignDestinationAllowed(url)).toBe(false),
  );

  it('instruments the real draft and leaves footer links and Outlook comments intact', () => {
    const directory = resolve(process.cwd(), '../../docs/marketing/updates/2026-09-28');
    const html = readFileSync(resolve(directory, 'email.html'), 'utf8');
    const text = readFileSync(resolve(directory, 'email.txt'), 'utf8');
    const campaign = JSON.parse(readFileSync(resolve(directory, 'tracking.json'), 'utf8'));
    const result = instrumentCampaignEmail({ html, text, campaign, messageId, baseUrl: 'https://www.trackmyopt.com', secret, now });
    const $ = load(result.html);
    const tracked = $('a').toArray().map(a => $(a).attr('href')!).filter(url => url.includes('/campaign/click?'));
    expect(tracked).toHaveLength(2);
    expect(tracked.map(url => verifyCampaignToken(new URL(url).searchParams.get('token'), secret, now)?.linkKey).sort()).toEqual(['free_dashboard', 'pro_intro']);
    expect(result.text).toContain(tracked[0]);
    expect(result.text).toContain(tracked[1]);
    expect($('img[src*="/campaign/open?"]')).toHaveLength(1);
    expect($('a[href="{{UNSUBSCRIBE_URL}}"]')).toHaveLength(1);
    expect($('a[href="https://www.trackmyopt.com/privacy"]')).toHaveLength(1);
    expect(result.html).toContain('<!--[if mso]>');
    expect(result.html).not.toContain('<script');
  });

  it('rejects missing or ambiguous CTA mappings before SMTP', () => {
    const url = 'https://www.trackmyopt.com/pricing';
    const args = { html: `<a href="${url}">Pro</a>`, text: url, campaign: { id: 'test', links: { pro: url } }, messageId, secret, baseUrl: 'https://www.trackmyopt.com' };
    expect(() => instrumentCampaignEmail({ ...args, text: '' })).toThrow();
    expect(() => instrumentCampaignEmail({ ...args, campaign: { id: 'test', links: { pro: url, free: url } } })).toThrow();
    expect(() => instrumentCampaignEmail({ ...args, baseUrl: 'http://localhost:3000' })).toThrow();
  });

  it('flags known scanners and prefetch without treating every browser as automated', () => {
    expect(isKnownAutomatedEmailRequest(new Headers({ 'user-agent': 'Proofpoint scanner' }))).toBe(true);
    expect(isKnownAutomatedEmailRequest(new Headers({ 'sec-purpose': 'prefetch' }))).toBe(true);
    expect(isKnownAutomatedEmailRequest(new Headers({ 'user-agent': 'Mozilla/5.0 Chrome/131.0' }))).toBe(false);
  });
});
