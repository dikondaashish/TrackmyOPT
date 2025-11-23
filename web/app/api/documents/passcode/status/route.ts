/**
 * Passcode Status API
 * 
 * GET /api/documents/passcode/status
 * 
 * Checks if user has set up a passcode
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if passcode exists
    const { data: passcode } = await supabase
      .from('document_passcodes')
      .select('id, locked_until, failed_attempts')
      .eq('user_id', user.id)
      .single();

    const hasPasscode = !!passcode;
    const isLocked = passcode?.locked_until 
      ? new Date(passcode.locked_until) > new Date()
      : false;

    return NextResponse.json({
      hasPasscode,
      isLocked,
      lockedUntil: isLocked ? passcode?.locked_until : null,
      failedAttempts: passcode?.failed_attempts || 0,
    });

  } catch (error) {
    console.error('❌ Error checking passcode status:', error);
    return NextResponse.json(
      { error: 'Failed to check passcode status' },
      { status: 500 }
    );
  }
}

