import { NextRequest, NextResponse } from 'next/server';
import { safeEqual } from '@/lib/api/secure-compare';
/** The same server-only key already authenticates Vercel -> Render. */
export function verifyWorkerAuth(req: NextRequest) {
  const key = process.env.API_SECRET_KEY;
  if (!key)
    return NextResponse.json(
      { ok: false, error: 'Worker not configured' },
      { status: 503 }
    );
  const supplied = req.headers.get('x-api-key');
  return supplied && safeEqual(supplied, key)
    ? null
    : NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
}
