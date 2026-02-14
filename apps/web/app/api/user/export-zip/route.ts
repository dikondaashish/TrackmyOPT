import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateSignedUrl } from '@/lib/aws/s3';
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
      .eq('user_id', user.id)
      .single();

    // 2. Get OPT status (dates)
    const { data: optStatus } = await supabase
      .from('opt_status')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // 3. Get case status
    const { data: caseStatus } = await supabase
      .from('case_status')
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
      optStatus: optStatus || {},
      caseStatus: caseStatus || {},
      documentsMetadata: documents || [],
    };

    // Add JSON file
    zip.file('data.json', JSON.stringify(exportData, null, 2));

    // Create CSV for OPT data
    const csvHeaders = ['Field', 'Value'];
    const csvRows = [
      csvHeaders.join(','),
      `Email,${user.email}`,
      `Program End Date,${optStatus?.program_end_date || 'Not set'}`,
      `DSO Recommendation Date,${optStatus?.dso_recommendation_date || 'Not set'}`,
      `OPT Start Date,${optStatus?.opt_start_date || 'Not set'}`,
      `OPT EAD End Date,${optStatus?.opt_ead_end_date || 'Not set'}`,
      `STEM Start Date,${optStatus?.stem_start_date || 'Not set'}`,
      `Receipt Number,${caseStatus?.receipt_number || 'Not set'}`,
      `Case Status,${caseStatus?.current_status || 'Not set'}`,
    ];
    zip.file('opt_data.csv', csvRows.join('\n'));

    // 5. Download and add documents from S3
    if (documents && documents.length > 0) {
      const documentsFolder = zip.folder('documents');

      for (const doc of documents) {
        try {
          // Check if document has S3 key
          if (!doc.s3_key) {
            console.log(`Document ${doc.id} has no S3 key, skipping`);
            continue;
          }

          // Generate signed URL for S3
          const signedUrl = await generateSignedUrl(doc.s3_key);
          
          // Fetch file from S3
          const s3Response = await fetch(signedUrl);
          
          if (!s3Response.ok) {
            console.error(`Failed to fetch document ${doc.id} from S3: ${s3Response.status}`);
            continue;
          }

          const arrayBuffer = await s3Response.arrayBuffer();
          const fileName = doc.filename || doc.file_name || doc.original_filename || `document_${doc.id}`;
          documentsFolder?.file(fileName, arrayBuffer);
          
          console.log(`✅ Added document: ${fileName}`);
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
