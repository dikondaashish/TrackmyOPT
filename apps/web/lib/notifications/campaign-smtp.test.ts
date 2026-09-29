// @vitest-environment node
import { expect, it } from 'vitest';
import { getCampaignSmtpOptions } from './campaign-smtp';
const env = { CAMPAIGN_SMTP_HOST: 'smtp.example.invalid', CAMPAIGN_SMTP_USER: 'test', CAMPAIGN_SMTP_PASS: 'synthetic' };
it('requires separate campaign credentials instead of falling back to transactional SMTP', () => {
  expect(() => getCampaignSmtpOptions({ SMTP_HOST: 'smtp.zeptomail.com', SMTP_USER: 'test', SMTP_PASS: 'test' })).toThrow('marketing-capable');
  expect(() => getCampaignSmtpOptions({ ...env, CAMPAIGN_SMTP_HOST: 'smtp.zeptomail.com' })).toThrow('ZeptoMail');
});
it('uses verified TLS for both supported SMTP modes', () => {
  expect(getCampaignSmtpOptions(env)).toMatchObject({ secure: true, port: 465, requireTLS: true });
  expect(getCampaignSmtpOptions({ ...env, CAMPAIGN_SMTP_PORT: '587' })).toMatchObject({ secure: false, port: 587, requireTLS: true });
  expect(() => getCampaignSmtpOptions({ ...env, CAMPAIGN_SMTP_PORT: '25' })).toThrow('TLS');
});
