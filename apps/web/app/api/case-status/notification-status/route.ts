import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUserId } from '@/lib/auth/get-user-id';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export async function GET(req: NextRequest) {
  const headers = { 'Cache-Control': 'no-store' };
  const userId = await getUserId(req);
  if (!userId)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401, headers }
    );
  const id = req.nextUrl.searchParams.get('case_id');
  if (!z.string().uuid().safeParse(id).success)
    return NextResponse.json(
      { error: 'Invalid case' },
      { status: 400, headers }
    );
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data: c, error: caseError } = await db
    .from('case_status')
    .select('receipt_number')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle();
  if (caseError || !c)
    return NextResponse.json(
      { error: 'Case unavailable' },
      { status: caseError ? 503 : 404, headers }
    );
  const { data, error } = await db
    .from('email_queue')
    .select('status,sent_at,created_at')
    .eq('user_id', userId)
    .eq('email_type', 'case_status_change')
    .contains('email_data', { receipt_number: c.receipt_number })
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error)
    return NextResponse.json(
      { error: 'Email history unavailable' },
      { status: 503, headers }
    );
  return NextResponse.json({ ok: true, notification: data }, { headers });
}
