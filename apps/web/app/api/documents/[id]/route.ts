/**
 * Single Document API
 * 
 * GET /api/documents/[id] - Get document details with signed URL
 * PATCH /api/documents/[id] - Update document metadata
 * DELETE /api/documents/[id] - Delete document
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateSignedUrl, deleteFromS3 } from '@/lib/aws/s3';
import { generateRemindersForDocument } from '@/lib/notifications/reminders';

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


    // Transform snake_case to camelCase for frontend
    return NextResponse.json({
      document: {
        id: document.id,
        filename: document.filename || document.file_name,
        documentType: document.document_type || document.category || 'other',
        category: document.category || document.document_type || 'other',
        issueDate: document.issue_date || null,
        expiryDate: document.expiry_date || null,
        summary: document.summary || '',
        extractedFields: document.extracted_fields || {},
        aiConfidence: document.ai_confidence || 0,
        uploadedAt: document.uploaded_at || document.created_at,
        fileType: document.file_type,
        fileSize: document.file_size,
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

    // ISS-016: when user adds/changes an expiry date, schedule reminders so
    // documents that AI failed to parse still get the 60/45/30/.../1-day alerts.
    if (expiryDate) {
      try {
        await generateRemindersForDocument(
          user.id,
          document.id,
          document.filename || document.file_name || 'document',
          expiryDate,
        );
      } catch (remErr) {
        console.error('Failed to (re)generate reminders for document', document.id, remErr);
      }
    }

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

