/**
 * Google Gemini AI Integration
 * 
 * Uses Gemini 1.5 Pro for both OCR and document analysis
 * Single API for complete document processing pipeline
 */

import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const PRIMARY_MODEL = 'gemini-3.1-pro-preview';
const FALLBACK_MODEL = 'gemini-2.5-pro';

/** Lightweight models for pre-generation job fit preview (analyze-gap). */
const GAP_ANALYSIS_PRIMARY_MODEL = 'gemini-3.5-flash';
const GAP_ANALYSIS_FALLBACK_MODEL = 'gemini-3.1-flash-lite';

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

    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const imagePart = {
      inlineData: {
        data: fileBuffer.toString('base64'),
        mimeType: contentType,
      },
    };

    let result;
    try {
      result = await ai.models.generateContent({
        model: PRIMARY_MODEL,
        contents: [
          { role: 'user', parts: [{ text: GEMINI_ANALYSIS_PROMPT }, imagePart] },
        ],
      });
    } catch {
      result = await ai.models.generateContent({
        model: FALLBACK_MODEL,
        contents: [
          { role: 'user', parts: [{ text: GEMINI_ANALYSIS_PROMPT }, imagePart] },
        ],
      });
    }
    const text = result.text || '';


    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from Gemini response');
    }

    const analysis: DocumentAnalysis = JSON.parse(jsonMatch[0]);


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


// ==========================================
// RESUME ENHANCEMENT CAPABILITIES
// ==========================================

export interface AtsGapAnalysis {
  matchScore: number;
  missingKeywords: string[];
  foundKeywords: string[];
  gapAnalysis: string;
  recommendations: string[];
}

export interface BulletRewrite {
  original: string;
  improved: string;
  reasoning: string;
}

/**
 * Rewrite resume bullet points to match a specific Job Description
 */
export async function rewriteBulletPoints(
  resumeText: string,
  jobDescription: string
): Promise<BulletRewrite[]> {
  try {
    const prompt = `
You are an elite ATS resume optimization expert. Analyze the resume against the job description and identify the 3-5 weakest bullet points that are relevant to this role but poorly written.

For each weak bullet, rewrite it using the XYZ formula:
"Accomplished [X] as measured by [Y] by doing [Z]"

Rules for rewriting:
- Start with a STRONG past-tense action verb (Led, Engineered, Architected, Automated, Optimized, Delivered, Spearheaded — NEVER "Helped", "Assisted", "Worked on")
- Include a specific metric or quantifiable result (%, $, time saved, team size, user count)
- Weave in 1-2 exact keywords from the job description naturally
- If no specific metric exists, describe scope (e.g., "across 3 product lines", "serving 50K+ users")

RESUME:
${resumeText.substring(0, 8000)}

JOB DESCRIPTION:
${jobDescription.substring(0, 5000)}

Respond in strict JSON array format only (no markdown):
[
  {
    "original": "Managed a team",
    "improved": "Spearheaded a cross-functional team of 8 engineers, delivering 3 microservices that reduced API latency by 45% and supported 2M daily requests",
    "reasoning": "Added team size metric, quantified impact (45% latency reduction), included JD keywords 'microservices' and 'cross-functional'"
  }
]
`;

    let result;
    try {
      result = await ai.models.generateContent({
        model: PRIMARY_MODEL,
        contents: prompt,
      });
    } catch {
      result = await ai.models.generateContent({
        model: FALLBACK_MODEL,
        contents: prompt,
      });
    }
    const text = result.text || '';
    const jsonMatch = text.match(/\[[\s\S]*\]/);

    return jsonMatch ? JSON.parse(jsonMatch[0]) : [];

  } catch (error) {
    console.error('❌ AI Rewrite Error:', error);
    return [];
  }
}

/**
 * Analyze Resume vs Job Description Gap (ATS Simulator)
 * Uses Flash models — fast/cheap pre-check before full resume generation.
 */
export async function analyzeAtsGap(
  resumeText: string,
  jobDescription: string
): Promise<AtsGapAnalysis> {
  try {
    const prompt = `
You are an enterprise ATS (Applicant Tracking System) simulator. Parse and score this resume against the job description exactly as Workday, Greenhouse, or Taleo would.

RESUME:
${resumeText.substring(0, 8000)}

JOB DESCRIPTION:
${jobDescription.substring(0, 5000)}

Analysis steps:
1. Extract ALL required and preferred hard skills from the JD
2. Check each keyword against the resume (exact match only — "Python" does not match "scripting")
3. Check if keywords appear in multiple locations (Skills section + Experience bullets = higher score)
4. Evaluate bullet point quality (action verb + metric + result)
5. Check for Professional Summary containing target job title and core keywords

Output JSON ONLY (no markdown fences):
{
  "matchScore": 0-100,
  "missingKeywords": ["exact keyword from JD not found in resume"],
  "foundKeywords": ["keywords from JD that ARE in the resume"],
  "gapAnalysis": "Detailed paragraph explaining the primary gaps and why they matter for this specific role",
  "recommendations": [
    "Add [specific keyword] to your Skills section and reference it in your [Company] experience",
    "Rewrite your [role] bullet about [topic] to include metrics: e.g., 'Reduced deployment time by X%'",
    "Add a Professional Summary that includes the job title '[title from JD]' and mentions [key skills]"
  ]
}
`;

    let result;
    try {
      result = await ai.models.generateContent({
        model: GAP_ANALYSIS_PRIMARY_MODEL,
        contents: prompt,
      });
    } catch {
      result = await ai.models.generateContent({
        model: GAP_ANALYSIS_FALLBACK_MODEL,
        contents: prompt,
      });
    }
    const text = result.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) throw new Error('Failed to parse AI response');

    return JSON.parse(jsonMatch[0]);

  } catch (error) {
    console.error('❌ ATS Gap Analysis Error:', error);
    return {
      matchScore: 0,
      missingKeywords: [],
      foundKeywords: [],
      gapAnalysis: 'AI Analysis Failed',
      recommendations: []
    };
  }
}

/**
 * Generate a Professional Executive Summary
 */
export async function generateExecutiveSummary(resumeText: string, jobTitle: string): Promise<string> {
  try {
    const prompt = `
Write a powerful 3-sentence professional summary for a "${jobTitle}" role.

Rules:
- Sentence 1: "[X] years of experience in [domain] with expertise in [3-4 core skills from the resume]"
- Sentence 2: Highlight the candidate's most impressive quantified achievement relevant to the role
- Sentence 3: Bridge their background to the target role, mentioning 2-3 more relevant skills
- Include the exact job title "${jobTitle}" in the first sentence
- Use confident, active language — no "seeking" or "looking for opportunities"
- Keep it under 60 words total

RESUME:
${resumeText.substring(0, 5000)}

Return ONLY the summary text, no quotes or formatting.
`;

    let result;
    try {
      result = await ai.models.generateContent({
        model: PRIMARY_MODEL,
        contents: prompt,
      });
    } catch {
      result = await ai.models.generateContent({
        model: FALLBACK_MODEL,
        contents: prompt,
      });
    }
    return (result.text || '').trim();

  } catch (error) {
    console.error('❌ Summary Gen Error:', error);
    return '';
  }
}
