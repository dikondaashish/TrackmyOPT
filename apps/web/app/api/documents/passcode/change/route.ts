/**
 * Passcode Change API
 * 
 * POST /api/documents/passcode/change
 * Body: { currentPasscode?: "123456", newPasscode: "654321" }
 * 
 * Changes user's document vault passcode (requires current passcode if exists)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { hashPasscode, verifyPasscode, isValidPasscode } from '@/lib/auth/passcode';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { currentPasscode, newPasscode } = body;

    // Validate new passcode format
    if (!isValidPasscode(newPasscode)) {
      return NextResponse.json(
        { error: 'Invalid passcode. Must be exactly 6 digits.' },
        { status: 400 }
      );
    }

    // Check if passcode already exists
    const { data: existing } = await supabase
      .from('document_passcodes')
      .select('id, passcode_hash')
      .eq('user_id', user.id)
      .single();

    // If passcode exists, verify current passcode
    if (existing && existing.passcode_hash) {
      if (!currentPasscode) {
        return NextResponse.json(
          { error: 'Current passcode is required' },
          { status: 400 }
        );
      }

      const isValid = await verifyPasscode(currentPasscode, existing.passcode_hash);
      if (!isValid) {
        return NextResponse.json(
          { error: 'Current passcode is incorrect' },
          { status: 400 }
        );
      }
    }

    // Hash new passcode
    const hashedPasscode = await hashPasscode(newPasscode);

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
        console.error('❌ Update error:', updateError);
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
        console.error('❌ Insert error:', insertError);
        throw insertError;
      }
    }

    return NextResponse.json({
      success: true,
      message: existing ? 'Passcode changed successfully' : 'Passcode set successfully',
    });

  } catch (error) {
    console.error('❌ Passcode change error:', error);
    return NextResponse.json(
      { error: 'Failed to change passcode' },
      { status: 500 }
    );
  }
}
