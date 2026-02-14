/**
 * Passcode Setup API
 * 
 * POST /api/documents/passcode/setup
 * Body: { passcode: "123456" }
 * 
 * Creates or updates user's document vault passcode
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { hashPasscode, isValidPasscode } from '@/lib/auth/passcode';

export async function POST(request: NextRequest) {
  try {

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { passcode } = body;

    // Validate passcode format
    if (!isValidPasscode(passcode)) {
      return NextResponse.json(
        { error: 'Invalid passcode. Must be exactly 6 digits.' },
        { status: 400 }
      );
    }

    // Hash passcode
    const hashedPasscode = await hashPasscode(passcode);

    // Check if passcode already exists
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
      message: 'Passcode set successfully',
    });

  } catch (error) {
    console.error('❌ Passcode setup error:', error);
    return NextResponse.json(
      { error: 'Failed to set passcode' },
      { status: 500 }
    );
  }
}

