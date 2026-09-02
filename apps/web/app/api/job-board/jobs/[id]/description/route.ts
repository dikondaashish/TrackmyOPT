import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await context.params;
  const { data, error } = await supabase
    .from('jobs')
    .select('description')
    .eq('id', id)
    .eq('listing_status', 'open')
    .eq('source_trust_tier', 'verified_ats')
    .maybeSingle();
  if (error) return NextResponse.json({ error: 'Unable to load job description' }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  return NextResponse.json({ description: data.description || '' });
}
