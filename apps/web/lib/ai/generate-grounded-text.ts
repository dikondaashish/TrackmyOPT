import { generateAiContent } from './google-ai';

/**
 * Generate reviewable plain text with the same primary/fallback model policy
 * as resume generation. Callers own prompt construction and output limits.
 */
export async function generateGroundedText(
  prompt: string,
  userId?: string
): Promise<string> {
  const response = await generateAiContent({
    task: 'screening_answer',
    contents: prompt,
    userId,
  });

  const text = response.text
    ?.replace(/^```(?:text|markdown)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();
  if (!text) throw new Error('AI returned an empty response');
  return text;
}
