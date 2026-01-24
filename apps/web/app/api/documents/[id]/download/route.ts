/**
 * Document Download API
 * 
 * GET /api/documents/[id]/download - Download document file
 * Streams file from S3 through server to avoid CORS issues
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateSignedUrl } from '@/lib/s3';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch document to get S3 key and filename
    const { data: document, error: dbError } = await supabase
      .from('documents')
      .select('s3_key, filename, file_name, file_type')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (dbError || !document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Generate signed URL
    const signedUrl = await generateSignedUrl(document.s3_key);

    // Fetch file from S3
    const s3Response = await fetch(signedUrl);
    
    if (!s3Response.ok) {
      throw new Error('Failed to fetch file from storage');
    }

    const fileBuffer = await s3Response.arrayBuffer();
    const filename = document.filename || document.file_name || 'document';
    const contentType = document.file_type || s3Response.headers.get('content-type') || 'application/octet-stream';

    // Return file with download headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        'Content-Length': fileBuffer.byteLength.toString(),
      },
    });

  } catch (error) {
    console.error('❌ Error downloading document:', error);
    return NextResponse.json(
      { error: 'Failed to download document' },
      { status: 500 }
    );
  }
}
