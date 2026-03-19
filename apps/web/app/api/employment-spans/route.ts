import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Convert MM/DD/YYYY to ISO format
function mmddyyyyToISO(dateStr: string): string | null {
  if (!dateStr) return null;
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  const [month, day, year] = parts;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

// Convert ISO to MM/DD/YYYY format
function isoToMmddyyyy(isoDate: string): string {
  const date = new Date(isoDate);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}/${day}/${date.getFullYear()}`;
}

// GET - Fetch all employment spans for the user
export async function GET(req: NextRequest) {
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

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
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
      { ok: false, error: error.message || 'Failed to fetch employment spans' },
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

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { spans } = body as {
      spans: Array<{
        id?: string;
        employer_name: string;
        start_date: string;
        end_date: string | null;
        type?: string;
      }>;
    };

    if (!spans || !Array.isArray(spans)) {
      return NextResponse.json(
        { ok: false, error: 'spans array is required' },
        { status: 400 }
      );
    }

    const userId = user.id;
    const savedSpans: any[] = [];

    for (const span of spans) {
      // Skip spans without required fields
      if (!span.employer_name && !span.start_date) continue;

      const startDateISO = span.start_date ? mmddyyyyToISO(span.start_date) : null;
      const endDateISO = span.end_date ? mmddyyyyToISO(span.end_date) : null;

      if (span.id && !span.id.startsWith('temp-')) {
        // Update existing span
        const { data, error } = await supabase
          .from('employment_spans')
          .update({
            employer_name: span.employer_name,
            start_date: startDateISO,
            end_date: endDateISO,
          })
          .eq('id', span.id)
          .eq('user_id', userId)
          .select()
          .single();

        if (error) {
          console.error('Update error:', error);
          continue;
        }
        savedSpans.push(data);
      } else {
        // Insert new span
        const { data, error } = await supabase
          .from('employment_spans')
          .insert({
            user_id: userId,
            employer_name: span.employer_name || '',
            start_date: startDateISO,
            end_date: endDateISO,
          })
          .select()
          .single();

        if (error) {
          console.error('Insert error:', error);
          continue;
        }
        savedSpans.push(data);
      }
    }

    return NextResponse.json({ 
      ok: true, 
      spans: savedSpans 
    });
  } catch (error: any) {
    console.error('Employment spans save error:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to save employment spans' },
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

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
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
      { ok: false, error: error.message || 'Failed to delete employment span' },
      { status: 500 }
    );
  }
}
