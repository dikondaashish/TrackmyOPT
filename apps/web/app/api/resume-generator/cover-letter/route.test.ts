import { readFileSync } from 'node:fs';

import { NextRequest } from 'next/server';
import { describe, expect, it, vi } from 'vitest';

import { getUserId } from '@/lib/auth/getUserId';
import { consumeAiGeneration } from '@/lib/ai-generation-limits';

import { POST } from './route';

vi.mock('@/lib/auth/getUserId', () => ({
  getUserId: vi.fn(),
}));
vi.mock('@/lib/ai-generation-limits', () => ({
  consumeAiGeneration: vi.fn(),
}));

describe('cover-letter generation containment', () => {
  it('returns 501 before auth or quota work and contains no fake PDF emitter', async () => {
    const response = await POST(
      new NextRequest(
        'https://www.trackmyopt.com/api/resume-generator/cover-letter',
        { method: 'POST' }
      )
    );

    expect(response.status).toBe(501);
    await expect(response.json()).resolves.toEqual({
      error: 'feature_disabled',
    });
    expect(getUserId).not.toHaveBeenCalled();
    expect(consumeAiGeneration).not.toHaveBeenCalled();

    const source = readFileSync(
      'app/api/resume-generator/cover-letter/route.ts',
      'utf8'
    );
    expect(source).not.toContain('%PDF-1.4');
    expect(source).not.toContain('Buffer.from');
  });
});
