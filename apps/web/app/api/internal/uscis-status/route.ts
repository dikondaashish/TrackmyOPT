import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyWorkerAuth } from '@/lib/api/verify-worker-auth';
import { withSentryApiErrors } from '@/lib/sentry/api-errors';
import { POST as syncCase } from '@/app/api/case-status/check/route';
export const dynamic = 'force-dynamic';
export const maxDuration = 180;
const schema = z
  .object({
    userId: z.string().uuid(),
    receiptNumber: z.string().regex(/^[A-Z]{3}\d{10}$/),
  })
  .strict();
async function handlePOST(req: NextRequest) {
  const denied = verifyWorkerAuth(req);
  if (denied) return denied;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });
  try {
    // Confirm the worker can receive/persist this result before spending a
    // provider request. This inbound request also keeps Render active during
    // a batch longer than the Free instance's 15-minute idle window.
    const workerUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!workerUrl) throw new Error('Case worker URL missing');
    const health = await fetch(workerUrl, {
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    });
    if (!health.ok) throw new Error('Case worker unavailable');
    // Reuse the same persistence/date/notification flow as an initial or manual
    // check. A daily trigger never promotes the free user's display snapshot.
    const secret = process.env.CRON_SECRET;
    if (!secret) throw new Error('Case sync secret missing');
    return await syncCase(
      new NextRequest(new URL('/api/case-status/check', req.url), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Secret': secret,
          'X-Force-Refresh': 'true',
          'X-Check-Trigger': 'daily',
        },
        body: JSON.stringify({
          user_id: parsed.data.userId,
          receipt_number: parsed.data.receiptNumber,
        }),
      })
    );
  } catch {
    // Never log request URLs, receipt numbers, body or exception text.
    console.error('Internal daily case sync failed');
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
export const POST = withSentryApiErrors(
  handlePOST,
  '/api/internal/uscis-status',
  'POST'
);
