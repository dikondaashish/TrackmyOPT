/** Separate credentials keep promotional sends off the application's transactional sender. */
export function getCampaignSmtpOptions(env: Record<string, string | undefined> = process.env) {
  const host = env.CAMPAIGN_SMTP_HOST?.trim();
  const port = Number(env.CAMPAIGN_SMTP_PORT || '465');
  if (!host || !env.CAMPAIGN_SMTP_USER || !env.CAMPAIGN_SMTP_PASS) {
    throw new Error('Configure a marketing-capable CAMPAIGN_SMTP_HOST, CAMPAIGN_SMTP_USER and CAMPAIGN_SMTP_PASS');
  }
  if (/zeptomail\./i.test(host)) throw new Error('ZeptoMail does not support promotional campaigns; use a marketing-capable sender');
  if (![465, 587].includes(port)) throw new Error('Campaign SMTP must use TLS on port 465 or STARTTLS on port 587');
  return {
    host, port, secure: port === 465, requireTLS: true,
    auth: { user: env.CAMPAIGN_SMTP_USER, pass: env.CAMPAIGN_SMTP_PASS },
    connectionTimeout: 15_000, greetingTimeout: 15_000, socketTimeout: 30_000,
    pool: true, maxConnections: 5, maxMessages: 100,
  };
}
