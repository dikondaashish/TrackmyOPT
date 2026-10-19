/** Called inside Next's after() so saving a receipt keeps the check alive. */
export async function triggerInitialCaseCheck(
  receiptNumber: string,
  userId: string
) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/case-status/check`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Secret': process.env.CRON_SECRET || '',
          'X-Check-Trigger': 'initial',
        },
        body: JSON.stringify({
          receipt_number: receiptNumber,
          user_id: userId,
        }),
      }
    );
    // A USCIS outage was already reported once as a grouped warning.
    const upstreamUnavailable =
      response.headers.get('X-Upstream-Unavailable') === 'uscis';
    if (response.status >= 500 && !upstreamUnavailable) {
      console.error(`Initial case check returned HTTP ${response.status}`);
    } else if (response.ok) {
      const result = await response.json();
      if (result.ok !== true)
        console.error('Initial case check returned an unsuccessful response');
    }
    // Expected USCIS/validation/auth/rate-limit 4xx remain separate from issues.
  } catch {
    // Never include the receipt, user ID, secret, body, or raw exception text.
    console.error('Initial case check request failed');
  }
}
