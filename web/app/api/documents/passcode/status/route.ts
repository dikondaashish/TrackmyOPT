/**
 * Passcode Status API
 * 
 * GET /api/documents/passcode/status
 * 
 * Checks if user has set up a passcode and auto-lock timeout
 * 
 * PATCH /api/documents/passcode/status
 * Body: { autoLockTimeout: 5 }
 * 
 * Updates auto-lock timeout setting
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
      .select('id, locked_until, failed_attempts, auto_lock_timeout')
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
      autoLockTimeout: passcode?.auto_lock_timeout ?? 5, // Default 5 minutes
    });

  } catch (error) {
    console.error('❌ Error checking passcode status:', error);
    return NextResponse.json(
      { error: 'Failed to check passcode status' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { autoLockTimeout } = body;

    // Validate auto-lock timeout
    const validTimeouts = [0, 5, 15, 30, 60];
    if (autoLockTimeout !== undefined && !validTimeouts.includes(autoLockTimeout)) {
      return NextResponse.json(
        { error: 'Invalid auto-lock timeout value' },
        { status: 400 }
      );
    }

    // Check if passcode record exists
    const { data: existing } = await supabase
      .from('document_passcodes')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existing) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('document_passcodes')
        .update({
          auto_lock_timeout: autoLockTimeout,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('❌ Update error:', updateError);
        throw updateError;
      }
    } else {
      // Create new record with just auto-lock timeout (no passcode yet)
      const { error: insertError } = await supabase
        .from('document_passcodes')
        .insert({
          user_id: user.id,
          auto_lock_timeout: autoLockTimeout,
        });

      if (insertError) {
        console.error('❌ Insert error:', insertError);
        throw insertError;
      }
    }

    return NextResponse.json({
      success: true,
      autoLockTimeout,
    });

  } catch (error) {
    console.error('❌ Error updating auto-lock timeout:', error);
    return NextResponse.json(
      { error: 'Failed to update auto-lock timeout' },
      { status: 500 }
    );
  }
}

