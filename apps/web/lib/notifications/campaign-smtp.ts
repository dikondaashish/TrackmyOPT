/** Campaign credentials can override the site's established SMTP account. */
export function getCampaignSmtpOptions(env: Record<string, string | undefined> = process.env) {
  const campaignOverride = ['CAMPAIGN_SMTP_HOST', 'CAMPAIGN_SMTP_PORT', 'CAMPAIGN_SMTP_USER', 'CAMPAIGN_SMTP_PASS']
    .some(key => Boolean(env[key]?.trim()));
  const host = (campaignOverride ? env.CAMPAIGN_SMTP_HOST : env.SMTP_HOST)?.trim();
  const user = campaignOverride ? env.CAMPAIGN_SMTP_USER : env.SMTP_USER;
  const pass = campaignOverride ? env.CAMPAIGN_SMTP_PASS : env.SMTP_PASS;
  const port = Number((campaignOverride ? env.CAMPAIGN_SMTP_PORT : env.SMTP_PORT) || '465');
  if (!host || !user || !pass) {
    throw new Error('Configure complete campaign SMTP credentials or the existing SMTP_HOST, SMTP_USER and SMTP_PASS');
  }
  if (![465, 587].includes(port)) throw new Error('Campaign SMTP must use TLS on port 465 or STARTTLS on port 587');
  return {
    host, port, secure: port === 465, requireTLS: true,
    auth: { user, pass },
    connectionTimeout: 15_000, greetingTimeout: 15_000, socketTimeout: 30_000,
    pool: true, maxConnections: 5, maxMessages: 100,
  };
}

/** Use the mailbox configured with the SMTP provider while signing the note as Karthik. */
export function getCampaignFromHeader(env: Record<string, string | undefined> = process.env) {
  const address = (env.CAMPAIGN_FROM_EMAIL || env.SMTP_FROM_EMAIL)?.trim();
  if (!address || !/^[a-z0-9._%+-]+@trackmyopt\.com$/i.test(address)) {
    throw new Error('Configure a verified TrackMyOPT sender in SMTP_FROM_EMAIL or CAMPAIGN_FROM_EMAIL');
  }
  return `Karthik from TrackMyOPT <${address}>`;
}
