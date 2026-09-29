// @vitest-environment node
import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';
import { registerEmailCampaign, sendTrackedCampaignEmail } from './campaign-send';
import { verifyUnsubscribeToken } from './campaign-unsubscribe';

const destination = 'https://www.trackmyopt.com/pricing';
const campaign = { id: 'test-campaign', links: { pro_intro: destination } };
const content = { subject: 'Product update', html: `<a href="${destination}">Pro</a>`, text: destination };
function setup(reserveError: { code: string } | null = null, saveError: object | null = null) {
  const insert = vi.fn().mockResolvedValue({ error: reserveError });
  const eq = vi.fn().mockResolvedValue({ error: saveError });
  const update = vi.fn().mockReturnValue({ eq });
  const supabase = { from: vi.fn().mockReturnValue({ insert, update }) } as unknown as SupabaseClient;
  const sendMail = vi.fn().mockResolvedValue({ accepted: ['test@example.invalid'], messageId: 'smtp-id' });
  const args = { supabase, campaign, ...content, userId: 'fake-user', email: 'Test@Example.invalid ', secret: 'test-secret', baseUrl: 'https://www.trackmyopt.com', from: 'test@example.invalid', sendMail };
  return { insert, eq, update, args, sendMail };
}

describe('tracked campaign sender', () => {
  it('resolves a direct unsubscribe link for this exact reservation and supplies one-click headers', async () => {
    const m = setup();
    await sendTrackedCampaignEmail({ ...m.args, replyTo: 'support@trackmyopt.com',
      html: content.html + '<a href="{{UNSUBSCRIBE_URL}}">Unsubscribe</a>', text: content.text + '\n{{UNSUBSCRIBE_URL}}' });
    const mail = m.sendMail.mock.calls[0][0];
    const url = new URL(mail.headers['List-Unsubscribe'].slice(1, -1));
    expect(verifyUnsubscribeToken(url.searchParams.get('token'), 'test-secret')).toBe(m.insert.mock.calls[0][0].id);
    expect(mail.html).toContain(url.toString());
    expect(mail.text).toContain(url.toString());
    expect(mail.headers['List-Unsubscribe-Post']).toBe('List-Unsubscribe=One-Click');
    expect(mail.replyTo).toBe('support@trackmyopt.com');
  });
  it('rejects unresolved template fields before reserving or sending', async () => {
    const m = setup();
    await expect(sendTrackedCampaignEmail({ ...m.args, html: content.html + '{{POSTAL_ADDRESS}}' })).rejects.toThrow('template fields');
    expect(m.insert).not.toHaveBeenCalled();
    expect(m.sendMail).not.toHaveBeenCalled();
  });
  it('reserves a normalized recipient before exactly one SMTP attempt', async () => {
    const m = setup();
    expect(await sendTrackedCampaignEmail(m.args)).toBe('sent');
    expect(m.insert).toHaveBeenCalledWith(expect.objectContaining({ email_address: 'test@example.invalid', status: 'campaign_sending', email_data: { campaign_id: campaign.id } }));
    expect(m.insert.mock.invocationCallOrder[0]).toBeLessThan(m.sendMail.mock.invocationCallOrder[0]);
    expect(m.sendMail).toHaveBeenCalledTimes(1);
    expect(m.sendMail.mock.calls[0][0].html).toContain('/campaign/open?token=');
    expect(m.update).toHaveBeenCalledWith(expect.objectContaining({ status: 'sent', provider_message_id: 'smtp-id' }));
  });
  it.each([['23505', 'duplicate'], ['XX000', 'failed']])('does not send when reservation fails (%s)', async (code, outcome) => {
    const m = setup({ code });
    expect(await sendTrackedCampaignEmail(m.args)).toBe(outcome);
    expect(m.sendMail).not.toHaveBeenCalled();
  });
  it('retains an ambiguous SMTP outcome for review without retrying', async () => {
    const m = setup();
    m.sendMail.mockRejectedValue(new Error('connection timed out'));
    expect(await sendTrackedCampaignEmail(m.args)).toBe('needs_review');
    expect(m.sendMail).toHaveBeenCalledTimes(1);
    expect(m.update).toHaveBeenCalledWith(expect.objectContaining({ status: 'campaign_unknown' }));
  });
  it('reports a sent-but-unpersisted result for review', async () => {
    const m = setup(null, { message: 'database unavailable' });
    expect(await sendTrackedCampaignEmail(m.args)).toBe('needs_review');
    expect(m.sendMail).toHaveBeenCalledTimes(1);
  });
  it('does not permit changed content under a previously registered campaign ID', async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null });
    const q = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), single: vi.fn().mockResolvedValue({ data: { content_hash: 'different' }, error: null }), upsert };
    const supabase = { from: () => q } as unknown as SupabaseClient;
    await expect(registerEmailCampaign(supabase, campaign, content)).rejects.toThrow('different content');
    expect(upsert).toHaveBeenCalledWith(expect.objectContaining({ id: campaign.id }), { onConflict: 'id', ignoreDuplicates: true });
  });
});
