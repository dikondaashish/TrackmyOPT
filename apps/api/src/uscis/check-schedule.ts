export function nextDailyCheck(now = new Date()) {
  const next = new Date(now);
  next.setUTCHours(14, 0, 0, 0);
  if (next.getTime() <= now.getTime()) next.setUTCDate(next.getUTCDate() + 1);
  return next;
}

export const isTerminalCase = (status: string | null | undefined) =>
  /card was delivered|case was denied|withdrawal acknowledged|case was withdrawn|termination notice sent|case was revoked/i.test(
    status ?? '',
  );

/** Public-safe categories only; never persist upstream bodies or credentials. */
export function checkFailureCode(message: string) {
  if (/CIRCUIT_OPEN|503|502|504/i.test(message)) return 'USCIS_UNAVAILABLE';
  if (/429|rate.?limit/i.test(message)) return 'USCIS_RATE_LIMITED';
  if (/401|403|unauthorized|invalid.client/i.test(message))
    return 'USCIS_AUTH_UNAVAILABLE';
  if (/timeout|timed out|aborted/i.test(message)) return 'USCIS_TIMEOUT';
  return 'CHECK_RETRIES_EXHAUSTED';
}
