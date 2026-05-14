/**
 * Passcode Change OTP Verification API
 * 
 * POST /api/documents/passcode/verify-otp
 * Body: { otp: "123456", newPasscode: "654321" }
 * 
 * Verifies OTP and completes passcode change
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { hashPasscode, isValidPasscode } from '@/lib/auth/passcode';
import bcrypt from 'bcryptjs';

const MAX_OTP_ATTEMPTS = 5;
const OTP_LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { otp, newPasscode } = body;

    if (!otp || otp.length !== 6) {
      return NextResponse.json(
        { error: 'Invalid OTP. Must be 6 digits.' },
        { status: 400 }
      );
    }

    if (!isValidPasscode(newPasscode)) {
      return NextResponse.json(
        { error: 'Invalid passcode. Must be exactly 6 digits.' },
        { status: 400 }
      );
    }

    // Verify OTP from database
    const { data: otpRecord, error: otpError } = await supabase
      .from('passcode_otps')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (otpError || !otpRecord) {
      return NextResponse.json(
        { error: 'No OTP request found. Please request a new OTP.' },
        { status: 400 }
      );
    }

    // ISS-033: enforce brute-force lockout
    if (otpRecord.locked_until && new Date(otpRecord.locked_until) > new Date()) {
      const minsLeft = Math.ceil((new Date(otpRecord.locked_until).getTime() - Date.now()) / 60000);
      return NextResponse.json(
        { error: `Too many failed attempts. Try again in ${minsLeft} minute(s).` },
        { status: 429 }
      );
    }

    if (new Date(otpRecord.expires_at) < new Date()) {
      await supabase.from('passcode_otps').delete().eq('user_id', user.id);
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // ISS-033: compare against stored hash, not plaintext
    const otpValid = await bcrypt.compare(otp, otpRecord.otp_hash);
    if (!otpValid) {
      const nextAttempts = (otpRecord.attempts || 0) + 1;
      const shouldLock = nextAttempts >= MAX_OTP_ATTEMPTS;
      await supabase
        .from('passcode_otps')
        .update({
          attempts: nextAttempts,
          locked_until: shouldLock ? new Date(Date.now() + OTP_LOCKOUT_MS).toISOString() : null,
        })
        .eq('user_id', user.id);
      return NextResponse.json(
        { error: shouldLock ? 'Too many failed attempts. Locked for 15 minutes.' : 'Invalid OTP. Please try again.' },
        { status: shouldLock ? 429 : 400 }
      );
    }

    // OTP verified — new_passcode_hash was hashed at issuance (ISS-033)
    const hashedPasscode = otpRecord.new_passcode_hash || (await hashPasscode(newPasscode));

    // Check if passcode exists
    const { data: existing } = await supabase
      .from('document_passcodes')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existing) {
      // Update existing passcode
      const { error: updateError } = await supabase
        .from('document_passcodes')
        .update({
          passcode_hash: hashedPasscode,
          failed_attempts: 0,
          locked_until: null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }
    } else {
      // Create new passcode
      const { error: insertError } = await supabase
        .from('document_passcodes')
        .insert({
          user_id: user.id,
          passcode_hash: hashedPasscode,
        });

      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }
    }

    // Delete the used OTP
    await supabase
      .from('passcode_otps')
      .delete()
      .eq('user_id', user.id);

    return NextResponse.json({
      success: true,
      message: 'Passcode changed successfully!',
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to verify OTP and change passcode' },
      { status: 500 }
    );
  }
}
