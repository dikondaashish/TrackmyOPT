/**
 * Single Document API
 * 
 * GET /api/documents/[id] - Get document details with signed URL
 * PATCH /api/documents/[id] - Update document metadata
 * DELETE /api/documents/[id] - Delete document
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateSignedUrl, deleteFromS3 } from '@/lib/s3';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * GET - Fetch single document with signed URL for viewing
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    console.log(`📄 Fetching document: ${id}`);

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch document
    const { data: document, error: dbError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (dbError || !document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Generate signed URL for viewing (5 minutes)
    const viewUrl = await generateSignedUrl(document.s3_key);

    console.log(`✅ Document fetched: ${document.filename}`);

    return NextResponse.json({
      document: {
        ...document,
        extractedFields: document.extracted_fields || {},
        documentType: document.document_type || 'other',
        aiConfidence: document.ai_confidence || 0,
        viewUrl,
      },
    });

  } catch (error) {
    console.error('❌ Error fetching document:', error);
    return NextResponse.json(
      { error: 'Failed to fetch document' },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Update document metadata
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    console.log(`✏️  Updating document: ${id}`);

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { category, notes, issueDate, expiryDate } = body;

    // Update document
    const { data: document, error: dbError } = await supabase
      .from('documents')
      .update({
        category: category || undefined,
        notes: notes || undefined,
        issue_date: issueDate || undefined,
        expiry_date: expiryDate || undefined,
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (dbError || !document) {
      console.error('❌ Update error:', dbError);
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    console.log(`✅ Document updated: ${document.filename}`);

    return NextResponse.json({
      success: true,
      document,
    });

  } catch (error) {
    console.error('❌ Error updating document:', error);
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete document (from DB and S3)
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    console.log(`🗑️  Deleting document: ${id}`);

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch document to get S3 key
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('s3_key, filename')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Delete from S3
    try {
      await deleteFromS3(document.s3_key);
      console.log(`✅ Deleted from S3: ${document.s3_key}`);
    } catch (s3Error) {
      console.error('⚠️  S3 deletion failed:', s3Error);
      // Continue anyway - DB cleanup is more important
    }

    // Delete from database (cascade will delete reminders)
    const { error: dbError } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (dbError) {
      console.error('❌ Database deletion error:', dbError);
      throw dbError;
    }

    console.log(`✅ Document deleted: ${document.filename}`);

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully',
    });

  } catch (error) {
    console.error('❌ Error deleting document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}

