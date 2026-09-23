import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { calendarDateISO } from '@/lib/immigration/calendar-days';
import { normalizeCompanyDomain } from '@/lib/company-domain';

// GET - Fetch all employment spans for the user
export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: spans, error } = await supabase
      .from('employment_spans')
      .select('*')
      .eq('user_id', user.id)
      .order('start_date', { ascending: true });

    if (error) throw error;

    return NextResponse.json({
      ok: true,
      spans: spans || [],
    });
  } catch (error: any) {
    console.error('Employment spans fetch error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch employment spans' },
      { status: 500 }
    );
  }
}

// POST - Save/update multiple employment spans
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => null);
    const { spans } = (body ?? {}) as {
      spans: Array<{
        id?: string;
        employer_name: string;
        employer_domain?: string | null;
        start_date: string;
        end_date: string | null;
        type?: string;
      }>;
    };

    if (!Array.isArray(spans) || spans.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'A non-empty spans array is required' },
        { status: 400 }
      );
    }

    // Validate the entire batch before writing any records.
    for (const span of spans) {
      if (
        span?.employer_domain != null &&
        span.employer_domain !== '' &&
        !normalizeCompanyDomain(span.employer_domain)
      ) {
        return NextResponse.json(
          {
            ok: false,
            error: 'Enter a valid company website or leave it blank.',
          },
          { status: 400 }
        );
      }
      const start =
        typeof span?.start_date === 'string'
          ? calendarDateISO(span.start_date)
          : null;
      const end =
        typeof span?.end_date === 'string' && span.end_date
          ? calendarDateISO(span.end_date)
          : null;
      if (
        !span ||
        typeof span.employer_name !== 'string' ||
        !span.employer_name.trim() ||
        !start ||
        (span.id != null && typeof span.id !== 'string') ||
        (span.end_date != null && span.end_date !== '' && !end) ||
        (end && end < start)
      ) {
        return NextResponse.json(
          {
            ok: false,
            error:
              'Each job needs an employer and a valid start date. End date must be valid and on or after the start date.',
          },
          { status: 400 }
        );
      }
    }

    const userId = user.id;
    const savedSpans: unknown[] = [];
    for (const span of spans) {
      const startDateISO = calendarDateISO(span.start_date)!;
      const endDateISO = span.end_date ? calendarDateISO(span.end_date) : null;

      if (span.id && !span.id.startsWith('temp-')) {
        // Update existing span
        const { data, error } = await supabase
          .from('employment_spans')
          .update({
            employer_name: span.employer_name.trim(),
            ...(span.employer_domain !== undefined
              ? {
                  employer_domain: normalizeCompanyDomain(span.employer_domain),
                }
              : {}),
            start_date: startDateISO,
            end_date: endDateISO,
          })
          .eq('id', span.id)
          .eq('user_id', userId)
          .select()
          .single();

        if (error || !data) throw new Error('Employment update failed');
        savedSpans.push(data);
      } else {
        // Insert new span
        const { data, error } = await supabase
          .from('employment_spans')
          .insert({
            user_id: userId,
            employer_name: span.employer_name.trim(),
            ...(span.employer_domain !== undefined
              ? {
                  employer_domain: normalizeCompanyDomain(span.employer_domain),
                }
              : {}),
            start_date: startDateISO,
            end_date: endDateISO,
          })
          .select()
          .single();

        if (error || !data) throw new Error('Employment insert failed');
        savedSpans.push(data);
      }
    }

    return NextResponse.json({
      ok: true,
      spans: savedSpans,
    });
  } catch (error: any) {
    console.error('Employment spans save error:', error);
    return NextResponse.json(
      {
        ok: false,
        error:
          'Could not save all employment records. Reload history before retrying; some records may have saved.',
      },
      { status: 500 }
    );
  }
}

// DELETE - Remove an employment span by id
export async function DELETE(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { id } = body as { id?: string };

    if (!id) {
      return NextResponse.json(
        { ok: false, error: 'id is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('employment_spans')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Employment span delete error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to delete employment span' },
      { status: 500 }
    );
  }
}
