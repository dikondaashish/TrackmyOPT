/**
 * OpenAI Document Analysis Integration
 * 
 * Uses latest OpenAI models to classify documents and extract metadata
 * Supports 9 document types with intelligent field extraction
 */

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

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
  extractedFields: Record<string, any>;
  issueDate: string | null;
  expiryDate: string | null;
  summary: string;
}

/**
 * Analyze document using OpenAI
 * Classifies document type and extracts relevant metadata
 */
export async function analyzeDocument(
  ocrText: string,
  filename: string
): Promise<DocumentAnalysis> {
  try {
    console.log('🤖 Starting OpenAI document analysis...');
    console.log(`📄 Analyzing: ${filename}`);
    console.log(`📊 OCR text length: ${ocrText.length} characters`);

    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const prompt = buildAnalysisPrompt(ocrText, filename);

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1, // Low temperature for consistent results
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const analysis: DocumentAnalysis = JSON.parse(content);

    console.log(`✅ Document classified as: ${analysis.documentType}`);
    console.log(`📊 Confidence: ${analysis.confidence}%`);
    console.log(`📊 Extracted ${Object.keys(analysis.extractedFields).length} fields`);

    return analysis;
  } catch (error) {
    console.error('❌ OpenAI analysis error:', error);
    
    // Return default analysis
    return {
      documentType: 'other',
      confidence: 0,
      extractedFields: {},
      issueDate: null,
      expiryDate: null,
      summary: 'Could not analyze document',
    };
  }
}

const SYSTEM_PROMPT = `You are an expert immigration document analyzer. Your job is to:
1. Identify the document type from the provided text
2. Extract all relevant metadata fields
3. Find issue and expiry dates
4. Provide a brief summary

Document types you can identify:
- passport: International passport
- visa: US visa stamp or document
- i20: Form I-20 (Certificate of Eligibility for F-1 Student Status)
- ead_card: Employment Authorization Document (EAD card)
- i983: Form I-983 (STEM OPT Training Plan)
- offer_letter: Job offer letter
- paystub: Salary paystub/payslip
- receipt_notice: USCIS receipt notice (Form I-797)
- other: Any other document type

Always respond with valid JSON in this exact format:
{
  "documentType": "passport",
  "confidence": 95,
  "extractedFields": {
    "field_name": "value"
  },
  "issueDate": "2020-01-15",
  "expiryDate": "2030-01-15",
  "summary": "Brief description of document"
}

Field extraction guidelines by document type:

**Passport:**
- full_name, passport_number, nationality, date_of_birth, place_of_birth, sex

**I-20:**
- sevis_id, student_name, school_name, program_end_date, dso_name, dso_signature_date, major, degree_level

**EAD Card:**
- full_name, uscis_number, card_number, category (e.g., C03B, C03C), date_of_birth, country_of_birth

**Receipt Notice (I-797):**
- receipt_number, case_type, applicant_name, received_date, notice_date, priority_date

**Offer Letter:**
- employer_name, job_title, start_date, salary, employee_name, department

**Paystub:**
- employer_name, employee_name, pay_period_start, pay_period_end, pay_date, gross_pay, net_pay

**I-983:**
- employer_name, employer_ein, student_name, sevis_id, training_start_date, training_end_date, supervisor_name

**Visa:**
- visa_type, visa_number, nationality, full_name, control_number

Extract dates in YYYY-MM-DD format. If exact day unknown, use 01. If month unknown, use 01-01.
If a field cannot be found, omit it from extractedFields.`;

function buildAnalysisPrompt(ocrText: string, filename: string): string {
  return `Analyze this document and extract all relevant information.

Filename: ${filename}

Document Text:
${ocrText.substring(0, 4000)} 

${ocrText.length > 4000 ? '...(truncated)' : ''}

Provide your analysis in the specified JSON format.`;
}

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
export function getExpiryStatus(expiryDate: string | null): 'good' | 'attention' | 'warning' | 'critical' | 'expired' | 'no_expiry' {
  if (!expiryDate) return 'no_expiry';

  const days = getDaysUntilExpiry(expiryDate);

  if (days < 0) return 'expired';
  if (days <= 7) return 'critical';
  if (days <= 30) return 'warning';
  if (days <= 90) return 'attention';
  return 'good';
}

