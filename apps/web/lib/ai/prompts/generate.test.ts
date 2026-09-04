import { describe, expect, it } from 'vitest';
import { buildGeneratePrompt, SYSTEM_PROMPT } from '@/lib/ai/prompts/generate';

describe('buildGeneratePrompt analysis focus', () => {
  it('carries analyzed missing keywords into aggressive JD tailoring', () => {
    const prompt = buildGeneratePrompt(
      'Resume evidence',
      'Job description',
      '\\documentclass{article}',
      { focusKeywords: ['Kubernetes', 'AWS'] }
    );

    expect(prompt).toContain('ANALYSIS-IDENTIFIED KEYWORD GAPS');
    expect(prompt).toContain('Kubernetes, AWS');
    expect(prompt.indexOf('--- CANDIDATE RESUME ---')).toBeLessThan(
      prompt.indexOf('<role>')
    );
  });

  it('escapes LaTeX-special characters in focus keywords', () => {
    const prompt = buildGeneratePrompt('r', 'j', '\\documentclass{article}', { focusKeywords: ['R&D'] });
    expect(prompt).toContain('R\\&D');
  });

  it('preserves official job titles instead of normalizing them to the target role', () => {
    expect(SYSTEM_PROMPT).toContain(
      'Official job titles (keep exactly as written)'
    );
    expect(SYSTEM_PROMPT).toContain(
      'Every official job title matches the source exactly'
    );
  });
});

describe('template structure is locked to the selected template', () => {
  it('forbids inventing layouts, sections, and macros outside the template', () => {
    expect(SYSTEM_PROMPT).toContain('<template_is_law>');
    expect(SYSTEM_PROMPT).toContain('Never invent a new macro');
    expect(SYSTEM_PROMPT).toContain(
      'Replace ALL of it'
    );
  });

  it('requires self-contained LaTeX because the compiler receives one file', () => {
    expect(SYSTEM_PROMPT).toContain('SELF-CONTAINED');
  });
});

describe('length follows the candidate\'s actual content', () => {
  it('rejects a years-of-experience page threshold', () => {
    expect(SYSTEM_PROMPT).toContain('<page_budget>');
    expect(SYSTEM_PROMPT).not.toContain('0–5 years of professional experience  -> EXACTLY 1 page.');
  });

  it('defines bullet minimums once in page_budget', () => {
    expect(SYSTEM_PROMPT).toContain('BULLET MINIMUMS (canonical');
    expect((SYSTEM_PROMPT.match(/minimum 4 bullets/g) ?? []).length).toBe(1);
  });

  it('never drops internships or any other real position', () => {
    expect(SYSTEM_PROMPT).toContain('NOTHING REAL MAY BE DROPPED');
    expect(SYSTEM_PROMPT).toContain(
      'Do NOT delete, merge, or silently drop any position the candidate listed'
    );
  });
});

describe('Gemini output and LaTeX safety rules', () => {
  it('requires raw LaTeX with no fences or preamble text', () => {
    expect(SYSTEM_PROMPT).toContain('First character of output is');
    expect(SYSTEM_PROMPT).toContain('If you emit markdown code fences');
    expect(SYSTEM_PROMPT).toContain('No preamble text, no closing remarks');
  });

  it('requires LaTeX escaping for special characters', () => {
    expect(SYSTEM_PROMPT).toContain('<latex_escaping>');
    expect(SYSTEM_PROMPT).toContain('& → \\&');
  });

  it('preserves date granularity and OCR proper nouns', () => {
    expect(SYSTEM_PROMPT).toContain('if source has only a year, keep year only');
    expect(SYSTEM_PROMPT).toContain('never "correct" proper-noun spelling');
  });

  it('ends with the priority reminder block', () => {
    const prompt = buildGeneratePrompt('r', 'j', '\\documentclass{article}');
    expect(prompt.trim().endsWith('No preamble or closing remarks.')).toBe(true);
    expect(prompt).toContain('THE JOB DESCRIPTION IS THE MISSION');
  });
});

describe('JD-first positioning', () => {
  it('treats the job description as the primary mission', () => {
    expect(SYSTEM_PROMPT).toContain('The JD is law');
    expect(SYSTEM_PROMPT).toContain('<jd_first_positioning>');
    expect(SYSTEM_PROMPT).toContain('STRUCTURAL ANCHORS ARE IMMUTABLE');
    expect(buildGeneratePrompt('r', 'j', '\\documentclass{article}')).toContain(
      'THE JOB DESCRIPTION IS THE MISSION'
    );
  });

  it('strips template demo personas before sending the template to the model', () => {
    const prompt = buildGeneratePrompt(
      'Ashish Dikonda',
      'Data Analyst role',
      String.raw`\documentclass{article}
\def\name{Marcus Feld}
\begin{document}
\rRole{Engineer}{Developer Tools Company}{}{}
\end{document}`,
    );

    expect(prompt).not.toContain('Marcus Feld');
    expect(prompt).not.toContain('Developer Tools Company');
    expect(prompt).toContain('CANDIDATE NAME');
  });
});
