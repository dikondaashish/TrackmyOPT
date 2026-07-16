import { describe, expect, it } from 'vitest';
import { buildGeneratePrompt } from '@/lib/ai/prompts/generate';

describe('buildGeneratePrompt analysis focus', () => {
  it('carries analyzed missing keywords into tailoring without authorizing fabrication', () => {
    const prompt = buildGeneratePrompt(
      'Resume evidence',
      'Job description',
      '\\documentclass{article}',
      ['Kubernetes', 'AWS'],
    );

    expect(prompt).toContain('ANALYSIS-IDENTIFIED KEYWORD GAPS');
    expect(prompt).toContain('Kubernetes, AWS');
    expect(prompt).toContain('Do not fabricate');
  });
});
