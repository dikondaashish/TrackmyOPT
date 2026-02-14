/**
 * Passcode Verification API
 * 
 * POST /api/documents/passcode/verify
 * Body: { passcode: "123456" }
 * 
 * Verifies user's document vault passcode
 * Implements lockout after 3 failed attempts
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { 
  verifyPasscode, 
  isValidPasscode,
  checkLockoutStatus,
  getRemainingAttempts 
} from '@/lib/auth/passcode';

export async function POST(request: NextRequest) {
  try {

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { passcode } = body;

    // Validate format
    if (!isValidPasscode(passcode)) {
      return NextResponse.json(
        { error: 'Invalid passcode format' },
        { status: 400 }
      );
    }

    // Fetch stored passcode
    const { data: stored, error: fetchError } = await supabase
      .from('document_passcodes')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (fetchError || !stored) {
      return NextResponse.json(
        { error: 'No passcode set. Please set up a passcode first.' },
        { status: 404 }
      );
    }

    // Check lockout status
    const lockoutStatus = checkLockoutStatus(
      stored.failed_attempts,
      stored.locked_until
    );

    if (lockoutStatus.isLocked) {
      return NextResponse.json(
        { 
          error: 'Too many failed attempts. Please try again later.',
          lockedUntil: stored.locked_until,
          remainingMinutes: lockoutStatus.remainingTime
        },
        { status: 429 }
      );
    }

    // Verify passcode
    const isValid = await verifyPasscode(passcode, stored.passcode_hash);

    if (isValid) {
      // Reset failed attempts on success
      await supabase
        .from('document_passcodes')
        .update({
          failed_attempts: 0,
          locked_until: null,
          last_accessed_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);


      return NextResponse.json({
        success: true,
        message: 'Passcode verified',
      });

    } else {
      // Increment failed attempts
      const newFailedAttempts = stored.failed_attempts + 1;
      const remaining = getRemainingAttempts(newFailedAttempts);

      // Get custom lockout duration (default 10 minutes)
      const lockoutMinutes = stored.lockout_duration ?? 10;

      // Lock account after 3 failed attempts
      const shouldLock = newFailedAttempts >= 3;
      const lockedUntil = shouldLock 
        ? new Date(Date.now() + lockoutMinutes * 60 * 1000)
        : null;

      await supabase
        .from('document_passcodes')
        .update({
          failed_attempts: newFailedAttempts,
          locked_until: lockedUntil?.toISOString() || null,
        })
        .eq('user_id', user.id);

      if (shouldLock) {
        return NextResponse.json(
          { 
            error: `Too many failed attempts. Account locked for ${lockoutMinutes} minute${lockoutMinutes > 1 ? 's' : ''}.`,
            lockedUntil: lockedUntil?.toISOString(),
            remainingMinutes: lockoutMinutes
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { 
          error: 'Invalid passcode',
          remainingAttempts: remaining
        },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('❌ Passcode verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify passcode' },
      { status: 500 }
    );
  }
}

