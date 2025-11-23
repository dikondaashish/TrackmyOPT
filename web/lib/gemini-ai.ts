/**
 * Google Gemini AI Integration
 * 
 * Uses Gemini 1.5 Pro for both OCR and document analysis
 * Single API for complete document processing pipeline
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Use Gemini 1.5 Pro for best OCR and analysis results
const MODEL_NAME = 'gemini-1.5-pro';

// Document types we support
export type DocumentType = 
  | 'passport'
  | 'visa'
  | 'i20'
  | 'ead_card'
  | 'i983'
  | 'offer_letter'
  | 'paystub'
  | 'receipt_notice'
  | 'other';

export interface DocumentAnalysis {
  documentType: DocumentType;
  confidence: number;
  extractedText: string;
  extractedFields: Record<string, any>;
  issueDate: string | null;
  expiryDate: string | null;
  summary: string;
}

/**
 * Analyze document using Gemini AI
 * Performs OCR, classification, and metadata extraction in one call
 */
export async function analyzeDocument(
  fileBuffer: Buffer,
  contentType: string,
  filename: string
): Promise<DocumentAnalysis> {
  try {
    console.log('🤖 Starting Gemini AI document analysis...');
    console.log(`📄 File: ${filename}`);
    console.log(`📊 Size: ${(fileBuffer.length / 1024).toFixed(2)} KB`);
    console.log(`📦 Type: ${contentType}`);

    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    // Get Gemini model
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    // Convert buffer to Gemini format
    const imagePart = {
      inlineData: {
        data: fileBuffer.toString('base64'),
        mimeType: contentType,
      },
    };

    console.log('📤 Sending to Gemini API...');

    // Single prompt for everything: OCR + Classification + Extraction
    const prompt = GEMINI_ANALYSIS_PROMPT;

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    console.log('✅ Received response from Gemini');

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from Gemini response');
    }

    const analysis: DocumentAnalysis = JSON.parse(jsonMatch[0]);

    console.log(`✅ Document classified as: ${analysis.documentType}`);
    console.log(`📊 Confidence: ${analysis.confidence}%`);
    console.log(`📊 Extracted ${analysis.extractedText.length} characters`);
    console.log(`📊 Found ${Object.keys(analysis.extractedFields).length} fields`);

    return analysis;

  } catch (error) {
    console.error('❌ Gemini AI error:', error);
    
    // Return fallback analysis
    return {
      documentType: 'other',
      confidence: 0,
      extractedText: '',
      extractedFields: {},
      issueDate: null,
      expiryDate: null,
      summary: 'Could not analyze document',
    };
  }
}

const GEMINI_ANALYSIS_PROMPT = `You are an expert immigration document analyzer. Analyze this document image and provide a comprehensive analysis.

Your tasks:
1. **OCR**: Extract ALL text from the document (complete text extraction)
2. **Classification**: Identify the document type
3. **Field Extraction**: Extract all relevant metadata fields
4. **Date Detection**: Find issue and expiry dates
5. **Summary**: Provide a brief description

## Document Types:
- **passport**: International passport
- **visa**: US visa stamp or document
- **i20**: Form I-20 (Certificate of Eligibility for F-1 Student Status)
- **ead_card**: Employment Authorization Document (EAD card)
- **i983**: Form I-983 (STEM OPT Training Plan)
- **offer_letter**: Job offer letter
- **paystub**: Salary paystub/payslip
- **receipt_notice**: USCIS receipt notice (Form I-797)
- **other**: Any other document type

## Field Extraction by Document Type:

**Passport:**
- full_name, passport_number, nationality, date_of_birth, place_of_birth, sex, issuing_country

**Visa:**
- visa_type, visa_number, nationality, full_name, control_number, entries (single/multiple)

**I-20:**
- sevis_id, student_name, school_name, program_end_date, dso_name, dso_signature_date, major, degree_level

**EAD Card:**
- full_name, uscis_number, card_number, category (e.g., C03B, C03C), date_of_birth, country_of_birth

**Receipt Notice (I-797):**
- receipt_number, case_type, applicant_name, received_date, notice_date, priority_date, valid_from, valid_to

**Offer Letter:**
- employer_name, job_title, start_date, salary, employee_name, department, location

**Paystub:**
- employer_name, employee_name, pay_period_start, pay_period_end, pay_date, gross_pay, net_pay, employee_id

**I-983:**
- employer_name, employer_ein, student_name, sevis_id, training_start_date, training_end_date, supervisor_name, supervisor_title

**Other:**
- Extract any key information visible

## Response Format:

Respond with ONLY valid JSON (no markdown, no extra text):

{
  "documentType": "passport",
  "confidence": 95,
  "extractedText": "Full OCR text from the document...",
  "extractedFields": {
    "field_name": "value",
    "another_field": "value"
  },
  "issueDate": "2020-01-15",
  "expiryDate": "2030-01-15",
  "summary": "Brief description of the document"
}

## Important Rules:
1. **extractedText**: Include COMPLETE text from the document (all visible text)
2. **Dates**: Format as YYYY-MM-DD. If day unknown, use 01. If month unknown, use 01-01.
3. **confidence**: 0-100 (how confident you are in the classification)
4. **extractedFields**: Only include fields you can confidently read
5. **summary**: 1-2 sentences describing the document
6. **JSON only**: No markdown code blocks, no extra text, just pure JSON

Analyze the document now:`;

/**
 * Extract specific field from analysis result
 */
export function getField(analysis: DocumentAnalysis, fieldName: string): string | null {
  return analysis.extractedFields[fieldName] || null;
}

/**
 * Check if document has expiry date
 */
export function hasExpiryDate(analysis: DocumentAnalysis): boolean {
  return !!analysis.expiryDate;
}

/**
 * Calculate days until expiry
 */
export function getDaysUntilExpiry(expiryDate: string): number {
  const expiry = new Date(expiryDate);
  const today = new Date();
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Get expiry status color
 */
export function getExpiryStatus(
  expiryDate: string | null
): 'good' | 'attention' | 'warning' | 'critical' | 'expired' | 'no_expiry' {
  if (!expiryDate) return 'no_expiry';

  const days = getDaysUntilExpiry(expiryDate);

  if (days < 0) return 'expired';
  if (days <= 7) return 'critical';
  if (days <= 30) return 'warning';
  if (days <= 90) return 'attention';
  return 'good';
}

/**
 * Normalize extracted text
 * Cleans up OCR text for better readability
 */
export function normalizeText(text: string): string {
  return text
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[^\S\n]+/g, ' ') // Remove extra spaces
    .replace(/\n{3,}/g, '\n\n') // Max 2 newlines
    .trim();
}

