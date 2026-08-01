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

describe('template structure is locked to the selected template', () => {
  it('forbids inventing layouts, sections, and macros outside the template', () => {
    expect(SYSTEM_PROMPT).toContain('<template_is_law>');
    expect(SYSTEM_PROMPT).toContain('Never invent a new macro');
    expect(SYSTEM_PROMPT).toContain(
      'Do not add sections the template does not have'
    );
    expect(SYSTEM_PROMPT).toContain(
      'drop, merge, rename, or reorder the template'
    );
  });

  it('does not let the model reorder sections for the job description', () => {
    // The previous prompt actively invited section reordering.
    expect(SYSTEM_PROMPT).not.toContain(
      'SECTION ORDER — Lead with the most relevant section for this JD'
    );
    expect(SYSTEM_PROMPT).toContain(
      'SECTION ORDER IS NOT IN THIS LIST. You may not change it.'
    );
  });

  it('requires self-contained LaTeX because the compiler receives one file', () => {
    expect(SYSTEM_PROMPT).toContain('SELF-CONTAINED');
  });
});

describe('length follows the candidate\'s actual content, not a years rule', () => {
  it('rejects a years-of-experience page threshold', () => {
    expect(SYSTEM_PROMPT).toContain('<page_budget>');
    expect(SYSTEM_PROMPT).toContain(
      'NEVER BY A YEARS-OF-EXPERIENCE RULE OF THUMB'
    );
    // The superseded thresholds must not survive anywhere in the prompt.
    expect(SYSTEM_PROMPT).not.toContain('0–5 years of professional experience  -> EXACTLY 1 page.');
    expect(SYSTEM_PROMPT).not.toContain('Never exceed 2 pages');
  });

  it('sizes from counted content and grows rather than truncating', () => {
    expect(SYSTEM_PROMPT).toContain('Count the actual material first');
    expect(SYSTEM_PROMPT).toContain(
      'Use 2 pages the moment the complete record does not fit on 1'
    );
    expect(SYSTEM_PROMPT).toContain('If it does not fit, the resume gets longer');
    expect(SYSTEM_PROMPT).toContain(
      'Running to a third page is still better\n     than deleting real experience'
    );
  });

  it('names the 4-years-4-companies case explicitly', () => {
    expect(SYSTEM_PROMPT).toContain(
      'a candidate with 4 years across 4 companies has far more to'
    );
  });

  it('never drops internships or any other real position', () => {
    expect(SYSTEM_PROMPT).toContain('NOTHING REAL MAY BE DROPPED TO HIT A PAGE COUNT');
    expect(SYSTEM_PROMPT).toContain(
      'Internships count as experience and'
    );
    expect(SYSTEM_PROMPT).toContain(
      'Do NOT delete, merge, or silently drop any position the candidate listed'
    );
    expect(SYSTEM_PROMPT).toContain(
      'Do NOT drop education entries, certifications, or projects the candidate provided'
    );
    // The old prompt discounted internships when inferring seniority.
    expect(SYSTEM_PROMPT).not.toContain('ignore internships');
  });

  it('forbids padding and typographic squeezing to hit a page count', () => {
    expect(SYSTEM_PROMPT).toContain('pad with filler, invented projects');
    expect(SYSTEM_PROMPT).toContain('NEVER shrink fonts, margins, or line spacing');
    expect(SYSTEM_PROMPT).toContain('Do not "fill" it.');
  });

  it('treats supplied years as context only, never as a page mandate', () => {
    const prompt = buildGeneratePrompt('r', 'j', '\\documentclass{article}', [], 3);
    expect(prompt).toContain('(context only, NOT a page rule): 3');
    expect(prompt).toContain('VOLUME OF THIS CANDIDATE\'S REAL CONTENT');
    expect(prompt).not.toContain('exactly 1 page');
  });

  it('gives the same content-driven instruction for a senior candidate', () => {
    const prompt = buildGeneratePrompt('r', 'j', '\\documentclass{article}', [], 12);
    expect(prompt).toContain('(context only, NOT a page rule): 12');
    expect(prompt).toContain('2 pages as soon as it does not');
  });

  it('still requires the full inventory when years are not supplied', () => {
    const prompt = buildGeneratePrompt('r', 'j', '\\documentclass{article}');
    expect(prompt).not.toContain('context only');
    expect(prompt).toContain('including every internship');
    expect(prompt).toContain('All of it must appear in the output');
  });
});
