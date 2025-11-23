/**
 * Megallm.io OCR Integration
 * 
 * Extracts text from document images and PDFs using Megallm.io API
 */

export interface OCRResult {
  text: string;
  confidence: number;
  language?: string;
}

const MEGALLM_API_KEY = process.env.MEGALLM_API_KEY!;
const MEGALLM_API_URL = 'https://api.megallm.io/v1/ocr';

/**
 * Extract text from document using Megallm.io OCR
 * @param fileBuffer - Document file buffer
 * @param contentType - MIME type
 * @returns Extracted text and metadata
 */
export async function extractTextFromDocument(
  fileBuffer: Buffer,
  contentType: string
): Promise<OCRResult> {
  try {
    console.log('📄 Starting Megallm.io OCR extraction...');
    console.log(`📊 File size: ${(fileBuffer.length / 1024).toFixed(2)} KB`);
    console.log(`📄 Content type: ${contentType}`);

    if (!MEGALLM_API_KEY) {
      throw new Error('MEGALLM_API_KEY is not configured');
    }

    // Convert buffer to base64 for API
    const base64Data = fileBuffer.toString('base64');

    const response = await fetch(MEGALLM_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MEGALLM_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64Data,
        format: getFormatFromMimeType(contentType),
        language: 'auto', // Auto-detect language
        enhanced: true, // Use enhanced OCR
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Megallm.io API error (${response.status}):`, errorText);
      throw new Error(`OCR extraction failed: ${response.statusText}`);
    }

    const result = await response.json();

    console.log(`✅ OCR extraction complete`);
    console.log(`📊 Extracted ${result.text?.length || 0} characters`);
    console.log(`📊 Confidence: ${result.confidence || 0}%`);

    return {
      text: result.text || '',
      confidence: result.confidence || 0,
      language: result.language,
    };
  } catch (error) {
    console.error('❌ Megallm.io OCR error:', error);
    
    // Fallback: Return empty result instead of failing completely
    console.log('⚠️  Falling back to empty OCR result');
    return {
      text: '',
      confidence: 0,
      language: 'unknown',
    };
  }
}

/**
 * Get format string from MIME type for Megallm.io API
 */
function getFormatFromMimeType(contentType: string): string {
  const formats: Record<string, string> = {
    'application/pdf': 'pdf',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpeg',
    'image/png': 'png',
    'image/webp': 'webp',
  };

  return formats[contentType.toLowerCase()] || 'auto';
}

/**
 * Clean and normalize OCR text
 * Removes extra whitespace, fixes common OCR errors
 */
export function normalizeOCRText(text: string): string {
  return text
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[^\S\n]+/g, ' ') // Remove extra spaces
    .replace(/\n{3,}/g, '\n\n') // Max 2 newlines
    .trim();
}

