import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import JSZip from 'jszip';

/**
 * POST /api/user/export-zip
 * 
 * Verify OTP and export user data as ZIP file
 * Includes: profile, OPT dates, case status, and all documents
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { otp } = body;

    if (!otp || otp.length !== 6) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    // Verify OTP
    const { data: otpRecord, error: otpError } = await supabase
      .from('export_otps')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (otpError || !otpRecord) {
      return NextResponse.json({ error: 'No OTP found. Please request a new code.' }, { status: 400 });
    }

    // Check if OTP expired
    if (new Date(otpRecord.expires_at) < new Date()) {
      return NextResponse.json({ error: 'OTP expired. Please request a new code.' }, { status: 400 });
    }

    // Verify OTP matches
    if (otpRecord.otp_hash !== otp) {
      return NextResponse.json({ error: 'Invalid OTP. Please try again.' }, { status: 400 });
    }

    // Delete used OTP
    await supabase.from('export_otps').delete().eq('user_id', user.id);

    // Create ZIP file
    const zip = new JSZip();

    // 1. Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // 2. Get OPT dates
    const { data: optDates } = await supabase
      .from('opt_dates')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // 3. Get case status settings
    const { data: caseStatus } = await supabase
      .from('case_status_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // 4. Get all documents metadata
    const { data: documents } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', user.id);

    // Create main data JSON
    const exportData = {
      exportedAt: new Date().toISOString(),
      user: {
        email: user.email,
        createdAt: user.created_at,
      },
      profile: profile || {},
      optDates: optDates || {},
      caseStatus: caseStatus || {},
      documentsMetadata: documents || [],
    };

    // Add JSON file
    zip.file('data.json', JSON.stringify(exportData, null, 2));

    // Create CSV for OPT dates
    const csvHeaders = ['Field', 'Value'];
    const csvRows = [
      csvHeaders.join(','),
      `Email,${user.email}`,
      `OPT Start Date,${optDates?.opt_start_date || 'Not set'}`,
      `OPT End Date,${optDates?.opt_end_date || 'Not set'}`,
      `Employment Start Date,${optDates?.employment_start_date || 'Not set'}`,
      `STEM Extension Start,${optDates?.stem_extension_start || 'Not set'}`,
      `STEM Extension End,${optDates?.stem_extension_end || 'Not set'}`,
      `Receipt Number,${caseStatus?.receipt_number || 'Not set'}`,
      `Last Status,${caseStatus?.last_status || 'Not set'}`,
    ];
    zip.file('opt_data.csv', csvRows.join('\n'));

    // 5. Download and add documents
    if (documents && documents.length > 0) {
      const documentsFolder = zip.folder('documents');

      for (const doc of documents) {
        try {
          // Get file from S3/storage
          const { data: fileData } = await supabase.storage
            .from('documents')
            .download(doc.file_path);

          if (fileData) {
            const arrayBuffer = await fileData.arrayBuffer();
            const fileName = doc.original_filename || `document_${doc.id}`;
            documentsFolder?.file(fileName, arrayBuffer);
          }
        } catch (err) {
          console.error(`Failed to download document ${doc.id}:`, err);
          // Continue with other documents
        }
      }
    }

    // Generate ZIP as Blob
    const zipBlob = await zip.generateAsync({ type: 'blob' });

    // Return ZIP file
    return new Response(zipBlob, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="trackmyopt-export-${new Date().toISOString().split('T')[0]}.zip"`,
      },
    });
  } catch (error) {
    console.error('❌ Error exporting ZIP:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}
