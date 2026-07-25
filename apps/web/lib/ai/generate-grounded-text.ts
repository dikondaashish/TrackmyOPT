import { GoogleGenAI } from '@google/genai';

const PRIMARY_MODEL = 'gemini-3.1-pro-preview';
const FALLBACK_MODEL = 'gemini-2.5-pro';

function client(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('AI generation is not configured');
  return new GoogleGenAI({ apiKey });
}

/**
 * Generate reviewable plain text with the same primary/fallback model policy
 * as resume generation. Callers own prompt construction and output limits.
 */
export async function generateGroundedText(prompt: string): Promise<string> {
  const ai = client();
  let response;
  try {
    response = await ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents: prompt,
    });
  } catch (error) {
    console.warn(
      '[autofill-ai] Primary model failed; using fallback:',
      error instanceof Error ? error.message : 'unknown error'
    );
    response = await ai.models.generateContent({
      model: FALLBACK_MODEL,
      contents: prompt,
    });
  }

  const text = response.text
    ?.replace(/^```(?:text|markdown)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();
  if (!text) throw new Error('AI returned an empty response');
  return text;
}
