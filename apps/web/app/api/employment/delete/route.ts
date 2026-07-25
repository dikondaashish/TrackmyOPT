import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication (getUser revalidates the token server-side)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id } = body;

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { ok: false, error: 'id is required' },
        { status: 400 }
      );
    }

    const userId = user.id;

    // Delete employment span (RLS ensures user owns this record)
    const { error } = await supabase
      .from('employment_spans')
      .delete()
      .eq('id', id)
      .eq('user_id', userId); // Double check ownership

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Employment delete error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to delete employment span' },
      { status: 500 }
    );
  }
}
