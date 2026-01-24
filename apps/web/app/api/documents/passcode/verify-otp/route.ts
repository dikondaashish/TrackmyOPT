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
import { hashPasscode, isValidPasscode } from '@/lib/passcode';

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

    // Check if OTP expired
    if (new Date(otpRecord.expires_at) < new Date()) {
      // Delete expired OTP
      await supabase
        .from('passcode_otps')
        .delete()
        .eq('user_id', user.id);

      return NextResponse.json(
        { error: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Verify OTP matches
    if (otpRecord.otp_hash !== otp) {
      return NextResponse.json(
        { error: 'Invalid OTP. Please try again.' },
        { status: 400 }
      );
    }

    // OTP verified - now change the passcode
    const hashedPasscode = await hashPasscode(newPasscode);

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
