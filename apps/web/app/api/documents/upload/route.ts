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
  deleteFromS3,
  generateS3Key
} from '@/lib/aws/s3';
import { analyzeDocument, normalizeText } from '@/lib/ai/gemini-ai';
import { generateRemindersForDocument } from '@/lib/notifications/reminders';
import { checkDocumentUploadRateLimit, getTimeUntilReset } from '@/lib/auth/rate-limit';
import {
  checkSuspiciousFileType,
  detectDocumentMimeType,
  hasMatchingDocumentExtension,
  isValidDocumentType,
  scanFileForViruses,
} from '@/lib/aws/virus-scan';
import { captureServerEvent } from '@/lib/posthog-server';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {

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


    // Check premium status from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('premium_status')
      .eq('user_id', user.id)
      .single();

    if (!profile?.premium_status) {
      return NextResponse.json(
        { error: 'Premium feature - please upgrade' },
        { status: 403 }
      );
    }


    // Check rate limit (20 uploads per day)
    const rateLimit = await checkDocumentUploadRateLimit(user.id);
    
    if (!rateLimit.allowed) {
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


    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }


    // Validate file
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const detectedMimeType = detectDocumentMimeType(buffer);
    if (
      !detectedMimeType ||
      !isValidDocumentType(file.type) ||
      !hasMatchingDocumentExtension(file.name, detectedMimeType)
    ) {
      return NextResponse.json(
        { error: 'Invalid file. Upload a valid PDF, JPEG, PNG, or WebP document.' },
        { status: 400 }
      );
    }

    // Quick heuristic check for suspicious file types
    if (checkSuspiciousFileType(file.name, file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed for security reasons.' },
        { status: 400 }
      );
    }

    // Scan for viruses (if enabled)
    const virusScanResult = await scanFileForViruses(
      buffer,
      file.name,
      detectedMimeType,
    );
    
    if (!virusScanResult.safe) {
      return NextResponse.json(
        virusScanResult.unavailable
          ? {
              error: 'Document scanning is temporarily unavailable. Please try again later.',
              code: 'document_scan_unavailable',
            }
          : { error: 'File failed the security scan.', code: 'document_scan_failed' },
        { status: virusScanResult.unavailable ? 503 : 400 }
      );
    }
    

    // Step 1: Upload to S3
    const s3Key = generateS3Key(user.id, file.name);
    
    await uploadToS3(buffer, s3Key, detectedMimeType);

    // Step 2: Analyze with Gemini AI (OCR + Classification + Extraction)
    const analysis = await analyzeDocument(buffer, detectedMimeType, file.name, user.id);
    const normalizedText = normalizeText(analysis.extractedText);

    // Step 3: Save to database
    const { data: document, error: dbError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        file_name: file.name, // Original column from migration 005
        filename: file.name, // New column from migration 006
        file_type: detectedMimeType,
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
      .select('id, filename, file_name, document_type, category, issue_date, expiry_date, summary, extracted_fields, ai_confidence, uploaded_at')
      .single();

    if (dbError) {
      console.error('❌ Database error:', dbError);
      // ISS-017: compensating S3 delete so we don't accumulate orphaned PII.
      try {
        await deleteFromS3(s3Key);
      } catch (cleanupErr) {
        console.error('❌ S3 cleanup after DB error failed (orphan possible):', cleanupErr);
      }
      throw dbError;
    }


    // Step 4: Generate reminders (if expiry date exists)
    if (analysis.expiryDate) {
      await generateRemindersForDocument(
        user.id,
        document.id,
        file.name,
        analysis.expiryDate
      );
    } else {
    }


    await captureServerEvent(user.id, "document_uploaded", {
      document_type: document.document_type || analysis.documentType || 'other',
      file_type: detectedMimeType,
      file_size_bytes: file.size,
      ai_confidence: analysis.confidence,
      has_expiry_date: !!analysis.expiryDate,
    });

    // ISS-016: signal when AI couldn't detect an expiry so client can prompt
    // the user to enter one manually. Otherwise reminders never schedule.
    const needsManualExpiry =
      !analysis.expiryDate || (typeof analysis.confidence === 'number' && analysis.confidence < 0.5);

    return NextResponse.json({
      success: true,
      needsManualExpiry,
      document: {
        id: document.id,
        filename: document.filename || document.file_name || file.name,
        documentType: document.document_type || analysis.documentType || 'other',
        category: document.category || analysis.documentType || 'other',
        issueDate: document.issue_date || null,
        expiryDate: document.expiry_date || null,
        summary: document.summary || '',
        extractedFields: document.extracted_fields || {},
        aiConfidence: document.ai_confidence || analysis.confidence || 0,
        uploadedAt: document.uploaded_at || new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to upload document'
      },
      { status: 500 }
    );
  }
}

// Next.js 16 App Router configuration
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes for AI processing
