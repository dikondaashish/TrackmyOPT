import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { getUserId } from '@/lib/auth/get-user-id';
import { calendarDateISO } from '@/lib/immigration/calendar-days';

export const dynamic = 'force-dynamic';
const input = z
  .object({
    case_id: z.string().uuid(),
    completed_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .nullable(),
  })
  .strict();
const reply = (body: unknown, status = 200) =>
  NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

/** User-reported attendance only. Never modifies USCIS status/history. */
export async function PATCH(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) return reply({ error: 'Sign in to update your case.' }, 401);
    const parsed = input.safeParse(await req.json().catch(() => null));
    if (!parsed.success)
      return reply(
        { error: 'Choose a case and a valid completion date.' },
        400
      );
    const { case_id, completed_date } = parsed.data;
    const now = new Date();
    if (
      completed_date !== null &&
      (!calendarDateISO(completed_date) ||
        completed_date > now.toISOString().slice(0, 10))
    )
      return reply(
        { error: 'Completion date must be a real date, today or earlier.' },
        400
      );
    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data, error } = await db
      .from('case_status')
      .update({
        biometrics_attended_date: completed_date,
        biometrics_confirmed_at: completed_date ? now.toISOString() : null,
      })
      .eq('id', case_id)
      .eq('user_id', userId)
      .select('id, biometrics_attended_date, biometrics_confirmed_at')
      .maybeSingle();
    if (error)
      return reply(
        { error: 'Could not save your confirmation. Please try again.' },
        500
      );
    if (!data) return reply({ error: 'Case not found.' }, 404);
    return reply({ ok: true, data });
  } catch {
    return reply(
      { error: 'Could not save your confirmation. Please try again.' },
      500
    );
  }
}
