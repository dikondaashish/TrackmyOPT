/**
 * Forgot-passcode OTP verify + reset (ISS-020).
 *
 * On success:
 *  - sets the new passcode hash on document_passcodes
 *  - deletes all existing documents and document_reminders for the user
 *    (forgot-passcode is a vault-reset by policy — see send-otp email body)
 *  - removes the OTP row
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { hashPasscode, isValidPasscode } from '@/lib/auth/passcode';
import bcrypt from 'bcryptjs';

const MAX_OTP_ATTEMPTS = 5;
const OTP_LOCKOUT_MS = 15 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { otp, newPasscode } = await req.json();
    if (!otp || otp.length !== 6) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }
    if (!isValidPasscode(newPasscode)) {
      return NextResponse.json({ error: 'New passcode must be 6 digits' }, { status: 400 });
    }

    const { data: row, error: fetchErr } = await supabase
      .from('passcode_otps')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (fetchErr || !row || row.purpose !== 'reset') {
      return NextResponse.json({ error: 'No active reset request. Request a new one.' }, { status: 400 });
    }

    if (row.locked_until && new Date(row.locked_until) > new Date()) {
      const mins = Math.ceil((new Date(row.locked_until).getTime() - Date.now()) / 60000);
      return NextResponse.json({ error: `Locked. Try again in ${mins} minute(s).` }, { status: 429 });
    }

    if (new Date(row.expires_at) < new Date()) {
      await supabase.from('passcode_otps').delete().eq('user_id', user.id);
      return NextResponse.json({ error: 'Code expired. Request a new one.' }, { status: 400 });
    }

    const otpValid = await bcrypt.compare(otp, row.otp_hash);
    if (!otpValid) {
      const nextAttempts = (row.attempts || 0) + 1;
      const shouldLock = nextAttempts >= MAX_OTP_ATTEMPTS;
      await supabase
        .from('passcode_otps')
        .update({
          attempts: nextAttempts,
          locked_until: shouldLock ? new Date(Date.now() + OTP_LOCKOUT_MS).toISOString() : null,
        })
        .eq('user_id', user.id);
      return NextResponse.json(
        { error: shouldLock ? 'Locked for 15 minutes.' : 'Invalid code.' },
        { status: shouldLock ? 429 : 400 },
      );
    }

    // Verified — proceed with reset
    const newHash = await hashPasscode(newPasscode);

    // Replace document passcode row
    const { error: pwErr } = await supabase
      .from('document_passcodes')
      .upsert({
        user_id: user.id,
        passcode_hash: newHash,
        failed_attempts: 0,
        locked_until: null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
    if (pwErr) {
      console.error('forgot/verify-otp: passcode upsert failed', pwErr);
      return NextResponse.json({ error: 'Could not set new passcode' }, { status: 500 });
    }

    // Wipe vault contents (documents + reminders cascade). This is the
    // documented behavior surfaced to the user in the email & UI.
    await supabase.from('documents').delete().eq('user_id', user.id);
    await supabase.from('document_reminders').delete().eq('user_id', user.id);

    // Remove OTP
    await supabase.from('passcode_otps').delete().eq('user_id', user.id);

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown';
    console.error('forgot/verify-otp:', msg);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
