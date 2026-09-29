// @vitest-environment node
import { expect, it } from 'vitest';
import { getCampaignFromHeader, getCampaignSmtpOptions } from './campaign-smtp';
const env = { CAMPAIGN_SMTP_HOST: 'smtp.example.invalid', CAMPAIGN_SMTP_USER: 'test', CAMPAIGN_SMTP_PASS: 'synthetic' };
it('uses the existing provider when no campaign override is set', () => {
  expect(getCampaignSmtpOptions({ SMTP_HOST: 'smtp.zeptomail.com', SMTP_USER: 'test', SMTP_PASS: 'synthetic', SMTP_PORT: '465' }))
    .toMatchObject({ host: 'smtp.zeptomail.com', auth: { user: 'test', pass: 'synthetic' }, secure: true });
});
it('never mixes a partial campaign override with the existing credentials', () => {
  expect(() => getCampaignSmtpOptions({ SMTP_HOST: 'smtp.zeptomail.com', SMTP_USER: 'test', SMTP_PASS: 'synthetic', CAMPAIGN_SMTP_HOST: 'another.example' }))
    .toThrow('complete campaign SMTP credentials');
});
it('uses verified TLS for both supported SMTP modes', () => {
  expect(getCampaignSmtpOptions(env)).toMatchObject({ secure: true, port: 465, requireTLS: true });
  expect(getCampaignSmtpOptions({ ...env, CAMPAIGN_SMTP_PORT: '587' })).toMatchObject({ secure: false, port: 587, requireTLS: true });
  expect(() => getCampaignSmtpOptions({ ...env, CAMPAIGN_SMTP_PORT: '25' })).toThrow('TLS');
});
it('uses a configured TrackMyOPT mailbox with Karthik as the display name', () => {
  expect(getCampaignFromHeader({ SMTP_FROM_EMAIL: 'updates@trackmyopt.com' }))
    .toBe('Karthik from TrackMyOPT <updates@trackmyopt.com>');
  expect(getCampaignFromHeader({ SMTP_FROM_EMAIL: 'updates@trackmyopt.com', CAMPAIGN_FROM_EMAIL: 'support@trackmyopt.com' }))
    .toBe('Karthik from TrackMyOPT <support@trackmyopt.com>');
  expect(() => getCampaignFromHeader({ SMTP_FROM_EMAIL: 'sender@example.com' })).toThrow('verified TrackMyOPT sender');
  expect(() => getCampaignFromHeader({ CAMPAIGN_FROM_EMAIL: 'name@trackmyopt.com\r\nBcc: other@example.com' })).toThrow('verified TrackMyOPT sender');
});
