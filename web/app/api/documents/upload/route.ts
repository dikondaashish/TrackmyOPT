/**
 * Document Upload API Endpoint
 * 
 * Handles multipart file upload with full AI processing pipeline:
 * 1. File validation
 * 2. S3 upload
 * 3. OCR text extraction (Megallm.io)
 * 4. AI analysis (OpenAI)
 * 5. Database storage
 * 6. Automatic reminder generation
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { 
  uploadToS3, 
  isValidDocumentType, 
  getFileExtension,
  generateS3Key 
} from '@/lib/s3';
import { extractTextFromDocument, normalizeOCRText } from '@/lib/megallm';
import { analyzeDocument } from '@/lib/document-ai';
import { generateRemindersForDocument } from '@/lib/reminders';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    console.log('📤 Starting document upload...');

    // Get user from session
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('❌ Authentication failed:', authError);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log(`👤 User: ${user.email}`);

    // Check premium status
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_premium')
      .eq('user_id', user.id)
      .single();

    if (!profile?.is_premium) {
      console.log('⚠️  Non-premium user attempted document upload');
      return NextResponse.json(
        { error: 'Premium feature - please upgrade' },
        { status: 403 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string || 'other';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log(`📄 File: ${file.name}`);
    console.log(`📊 Size: ${(file.size / 1024).toFixed(2)} KB`);
    console.log(`📦 Type: ${file.type}`);

    // Validate file
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    if (!isValidDocumentType(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF, JPEG, PNG, and WebP are allowed.' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Step 1: Upload to S3
    console.log('📤 Step 1/5: Uploading to S3...');
    const s3Key = generateS3Key(user.id, file.name);
    
    await uploadToS3(buffer, s3Key, file.type);
    console.log(`✅ Uploaded to S3: ${s3Key}`);

    // Step 2: Extract text with Megallm.io OCR
    console.log('📄 Step 2/5: Extracting text with OCR...');
    const ocrResult = await extractTextFromDocument(buffer, file.type);
    const normalizedText = normalizeOCRText(ocrResult.text);
    console.log(`✅ Extracted ${normalizedText.length} characters (confidence: ${ocrResult.confidence}%)`);

    // Step 3: Analyze with OpenAI
    console.log('🤖 Step 3/5: Analyzing document with AI...');
    const analysis = await analyzeDocument(normalizedText, file.name);
    console.log(`✅ Classified as: ${analysis.documentType} (${analysis.confidence}% confidence)`);

    // Step 4: Save to database
    console.log('💾 Step 4/5: Saving to database...');
    const { data: document, error: dbError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        filename: file.name,
        file_type: file.type,
        file_size: file.size,
        s3_key: s3Key,
        category: analysis.documentType, // Use AI-detected type
        document_type: analysis.documentType,
        issue_date: analysis.issueDate,
        expiry_date: analysis.expiryDate,
        extracted_text: normalizedText,
        extracted_fields: analysis.extractedFields,
        ai_confidence: analysis.confidence,
        ocr_confidence: ocrResult.confidence,
        summary: analysis.summary,
      })
      .select()
      .single();

    if (dbError) {
      console.error('❌ Database error:', dbError);
      throw dbError;
    }

    console.log(`✅ Document saved with ID: ${document.id}`);

    // Step 5: Generate reminders (if expiry date exists)
    if (analysis.expiryDate) {
      console.log('⏰ Step 5/5: Generating reminders...');
      await generateRemindersForDocument(
        user.id,
        document.id,
        file.name,
        analysis.expiryDate
      );
      console.log('✅ Reminders created');
    } else {
      console.log('ℹ️  No expiry date - skipping reminder generation');
    }

    console.log('🎉 Document upload complete!');

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        filename: document.filename,
        documentType: document.document_type,
        category: document.category,
        issueDate: document.issue_date,
        expiryDate: document.expiry_date,
        summary: document.summary,
        extractedFields: document.extracted_fields,
        aiConfidence: document.ai_confidence,
        ocrConfidence: document.ocr_confidence,
        uploadedAt: document.uploaded_at,
      },
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to upload document',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Configure Next.js to handle large uploads
export const config = {
  api: {
    bodyParser: false, // Disable built-in body parser for multipart/form-data
  },
};

