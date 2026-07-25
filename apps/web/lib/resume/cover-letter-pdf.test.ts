import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  buildCoverLetterLatex,
  compileCoverLetterPdf,
} from './cover-letter-pdf';

describe('cover-letter PDF compilation', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('escapes applicant text before placing it in LaTeX', () => {
    const latex = buildCoverLetterLatex('I delivered 25% growth & reliability.');
    expect(latex).toContain('25\\% growth \\& reliability');
    expect(latex).toContain('\\documentclass');
  });

  it('falls back and accepts only real PDF bytes', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('compiler failed', { status: 500 }))
      .mockResolvedValueOnce(
        new Response(Buffer.from('%PDF-1.7\\ncompiled'), { status: 200 })
      );
    vi.stubGlobal('fetch', fetchMock);

    const pdf = await compileCoverLetterPdf('Dear Hiring Team,');
    expect(Buffer.from(pdf).subarray(0, 5).toString()).toBe('%PDF-');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('rejects placeholder or non-PDF compiler output', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response(Buffer.from('not a pdf'), { status: 200 })
        )
    );

    await expect(compileCoverLetterPdf('Dear Hiring Team,')).rejects.toThrow(
      'compilation failed'
    );
  });
});
