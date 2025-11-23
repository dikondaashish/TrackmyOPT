/**
 * Document Upload API Endpoint
 * 
 * Handles multipart file upload with full AI processing pipeline:
 * 1. File validation
 * 2. S3 upload
 * 3. Gemini AI analysis (OCR + classification + extraction)
 * 4. Database storage
 * 5. Automatic reminder generation
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { 
  uploadToS3, 
  isValidDocumentType, 
  getFileExtension,
  generateS3Key 
} from '@/lib/s3';
import { analyzeDocument, normalizeText } from '@/lib/gemini-ai';
import { generateRemindersForDocument } from '@/lib/reminders';
import { checkDocumentUploadRateLimit, getTimeUntilReset } from '@/lib/rate-limit';
import { scanFileForViruses, checkSuspiciousFileType } from '@/lib/virus-scan';

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

    // Check premium status from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('premium_status')
      .eq('user_id', user.id)
      .single();

    if (!profile?.premium_status) {
      console.log('⚠️  Non-premium user attempted document upload');
      return NextResponse.json(
        { error: 'Premium feature - please upgrade' },
        { status: 403 }
      );
    }

    console.log('✅ Premium user verified');

    // Check rate limit (20 uploads per day)
    const rateLimit = await checkDocumentUploadRateLimit(user.id);
    
    if (!rateLimit.allowed) {
      console.log(`⚠️  Rate limit exceeded for user: ${user.email}`);
      return NextResponse.json(
        { 
          error: 'Daily upload limit reached',
          message: rateLimit.message,
          resetAt: rateLimit.resetAt,
          timeUntilReset: getTimeUntilReset(rateLimit.resetAt),
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '20',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetAt.toISOString(),
          }
        }
      );
    }

    console.log(`✅ Rate limit OK: ${rateLimit.remaining} uploads remaining today`);

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

    // Quick heuristic check for suspicious file types
    if (checkSuspiciousFileType(file.name, file.type)) {
      console.log('⚠️  Suspicious file type detected, rejecting upload');
      return NextResponse.json(
        { error: 'File type not allowed for security reasons.' },
        { status: 400 }
      );
    }

    // Scan for viruses (if enabled)
    console.log('🔍 Scanning file for viruses...');
    const virusScanResult = await scanFileForViruses(buffer, file.name);
    
    if (!virusScanResult.safe) {
      console.log(`❌ Virus detected: ${virusScanResult.threat}`);
      return NextResponse.json(
        { 
          error: 'File failed virus scan',
          threat: virusScanResult.threat,
        },
        { status: 400 }
      );
    }
    
    console.log(`✅ Virus scan passed (${virusScanResult.scanner}, ${virusScanResult.scanTime}ms)`);

    // Step 1: Upload to S3
    console.log('📤 Step 1/4: Uploading to S3...');
    const s3Key = generateS3Key(user.id, file.name);
    
    await uploadToS3(buffer, s3Key, file.type);
    console.log(`✅ Uploaded to S3: ${s3Key}`);

    // Step 2: Analyze with Gemini AI (OCR + Classification + Extraction)
    console.log('🤖 Step 2/4: Analyzing document with Gemini AI...');
    const analysis = await analyzeDocument(buffer, file.type, file.name);
    const normalizedText = normalizeText(analysis.extractedText);
    console.log(`✅ Classified as: ${analysis.documentType} (${analysis.confidence}% confidence)`);
    console.log(`✅ Extracted ${normalizedText.length} characters`);
    console.log(`✅ Found ${Object.keys(analysis.extractedFields).length} metadata fields`);

    // Step 3: Save to database
    console.log('💾 Step 3/4: Saving to database...');
    const { data: document, error: dbError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        file_name: file.name, // Original column from migration 005
        filename: file.name, // New column from migration 006
        file_type: file.type,
        file_size: file.size,
        s3_key: s3Key,
        s3_bucket: process.env.AWS_S3_BUCKET!,
        category: analysis.documentType, // Use AI-detected type
        document_type: analysis.documentType,
        issue_date: analysis.issueDate,
        expiry_date: analysis.expiryDate,
        extracted_text: normalizedText,
        extracted_fields: analysis.extractedFields,
        ai_confidence: analysis.confidence,
        summary: analysis.summary,
      })
      .select()
      .single();

    if (dbError) {
      console.error('❌ Database error:', dbError);
      throw dbError;
    }

    console.log(`✅ Document saved with ID: ${document.id}`);

    // Step 4: Generate reminders (if expiry date exists)
    if (analysis.expiryDate) {
      console.log('⏰ Step 4/4: Generating reminders...');
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

// Next.js 14 App Router configuration
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes for AI processing

