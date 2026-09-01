import { describe, expect, it } from 'vitest';
import { buildGeneratePrompt } from '@/lib/ai/prompts/generate';
import { buildRegeneratePrompt } from '@/lib/ai/prompts/regenerate';
import { TITLE_LADDER_MODE } from '@/lib/ai/prompts/title-ladder';

describe('align job titles prompt option', () => {
  it('does not include title ladder rules by default', () => {
    const prompt = buildGeneratePrompt('resume', 'job', '\\documentclass{article}');
    expect(prompt).not.toContain('<title_ladder_mode>');
    expect(prompt).toContain('Official job titles (keep exactly as written)');
  });

  it('injects title ladder rules when alignJobTitles is enabled', () => {
    const prompt = buildGeneratePrompt('resume', 'job', '\\documentclass{article}', {
      alignJobTitles: true,
    });
    expect(prompt).toContain(TITLE_LADDER_MODE.trim());
    expect(prompt).toContain('TITLE LADDER ON');
    expect(prompt).toContain('career ladder');
  });

  it('passes alignJobTitles through regenerate prompts', () => {
    const prompt = buildRegeneratePrompt(
      'Senior Data Analyst role',
      '\\documentclass{article}',
      '\\documentclass{article}\\begin{document}\\end{document}',
      'Improve keywords',
      undefined,
      { alignJobTitles: true },
    );
    expect(prompt).toContain('<title_ladder_mode>');
    expect(prompt).toContain('REWRITE job titles as a career ladder');
  });
});
