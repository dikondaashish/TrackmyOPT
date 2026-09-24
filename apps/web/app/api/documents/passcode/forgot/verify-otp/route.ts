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
import { deleteManyFromS3 } from '@/lib/aws/s3';

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

    // Remove stored files before removing their database records. Keep the
    // reset request available for a retry if storage cannot be cleaned up.
    const pageSize = 1000;
    const { data: firstPage, count, error: listError } = await supabase
      .from('documents')
      .select('s3_key', { count: 'exact' })
      .eq('user_id', user.id)
      .order('id', { ascending: true })
      .range(0, pageSize - 1);
    if (listError || count === null) {
      console.error('forgot/verify-otp: document lookup failed', listError);
      return NextResponse.json({ error: 'Could not reset the vault. Please try again.' }, { status: 500 });
    }
    const remainingPageCount = Math.max(0, Math.ceil(count / pageSize) - 1);
    const remainingPages = await Promise.all(Array.from({ length: remainingPageCount }, (_, index) =>
      supabase.from('documents').select('s3_key').eq('user_id', user.id).order('id', { ascending: true })
        .range((index + 1) * pageSize, (index + 2) * pageSize - 1)
    ));
    if (remainingPages.some(page => page.error)) {
      console.error('forgot/verify-otp: document pagination failed');
      return NextResponse.json({ error: 'Could not reset the vault. Please try again.' }, { status: 500 });
    }
    const keys = [firstPage, ...remainingPages.map(page => page.data)]
      .flatMap(page => page || [])
      .map(document => document.s3_key);
    if (keys.length !== count) {
      return NextResponse.json({ error: 'Vault contents changed during reset. Please try again.' }, { status: 409 });
    }
    try {
      if (keys.length > 0) await deleteManyFromS3(keys);
    } catch (storageError) {
      console.error('forgot/verify-otp: storage cleanup failed', storageError);
      return NextResponse.json({ error: 'Could not remove vault files. Please try again.' }, { status: 502 });
    }

    const { error: documentsError } = await supabase.from('documents').delete().eq('user_id', user.id);
    if (documentsError) {
      console.error('forgot/verify-otp: document deletion failed', documentsError);
      return NextResponse.json({ error: 'Could not reset the vault. Please try again.' }, { status: 500 });
    }
    const { error: remindersError } = await supabase.from('document_reminders').delete().eq('user_id', user.id);
    if (remindersError) {
      console.error('forgot/verify-otp: reminder deletion failed', remindersError);
      return NextResponse.json({ error: 'Could not reset reminders. Please try again.' }, { status: 500 });
    }

    const newHash = await hashPasscode(newPasscode);
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
      return NextResponse.json({ error: 'Vault files were removed, but the new passcode could not be saved. Please try again.' }, { status: 500 });
    }

    // Remove OTP
    await supabase.from('passcode_otps').delete().eq('user_id', user.id);

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown';
    console.error('forgot/verify-otp:', msg);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
