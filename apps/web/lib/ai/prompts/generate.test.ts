import { describe, expect, it } from 'vitest';
import { buildGeneratePrompt, SYSTEM_PROMPT } from '@/lib/ai/prompts/generate';

describe('buildGeneratePrompt analysis focus', () => {
  it('carries analyzed missing keywords into tailoring without authorizing fabrication', () => {
    const prompt = buildGeneratePrompt(
      'Resume evidence',
      'Job description',
      '\\documentclass{article}',
      ['Kubernetes', 'AWS']
    );

    expect(prompt).toContain('ANALYSIS-IDENTIFIED KEYWORD GAPS');
    expect(prompt).toContain('Kubernetes, AWS');
    expect(prompt).toContain('Do not fabricate');
  });

  it('preserves official job titles instead of normalizing them to the target role', () => {
    expect(SYSTEM_PROMPT).toContain(
      'Official job titles (keep exactly as written; never normalize them to the target role)'
    );
    expect(SYSTEM_PROMPT).toContain(
      'Every official job title matches the source resume exactly'
    );
    expect(SYSTEM_PROMPT).not.toContain(
      'JOB TITLES — Match the target JD role directly'
    );
    expect(SYSTEM_PROMPT).not.toContain(
      'This is the single most impactful ATS change'
    );
  });
});
