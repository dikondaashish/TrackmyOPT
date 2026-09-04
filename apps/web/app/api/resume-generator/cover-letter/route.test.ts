import { readFileSync } from 'node:fs';

import { NextRequest } from 'next/server';
import { describe, expect, it, vi } from 'vitest';

import { getUserId } from '@/lib/auth/get-user-id';
import { consumeAiGeneration } from '@/lib/ai-generation-limits';
import { generateGroundedText } from '@/lib/ai/generate-grounded-text';
import { compileCoverLetterPdf } from '@/lib/resume/cover-letter-pdf';
import { getActiveUserPlanTier } from '@/lib/premium/user-plan-tier';

import { POST } from './route';

vi.mock('@/lib/auth/get-user-id', () => ({
  getUserId: vi.fn(),
}));
vi.mock('@/lib/ai-generation-limits', () => ({
  consumeAiGeneration: vi.fn(),
}));
vi.mock('@/lib/ai/generate-grounded-text', () => ({
  generateGroundedText: vi.fn(),
}));
vi.mock('@/lib/resume/cover-letter-pdf', () => ({
  compileCoverLetterPdf: vi.fn(),
}));
vi.mock('@/lib/premium/user-plan-tier', () => ({
  getActiveUserPlanTier: vi.fn(),
}));

const requestBody = {
  snapshot: {
    contact: { firstName: 'Asha', lastName: 'Patel' },
    skills: ['TypeScript'],
    experience: [],
    education: [],
    certifications: [],
  },
  sourceContentHash: 'a'.repeat(64),
  job: {
    companyName: 'Acme',
    roleTitle: 'Software Engineer',
    jobDescription: 'Build reliable TypeScript products.',
  },
};
const publishedExtensionOrigin =
  'chrome-extension://hfljbefkccdmlnhclfojlafipjnjbajm';

describe('cover-letter generation', () => {
  it('generates, compiles, hashes, and returns a real PDF attachment', async () => {
    vi.mocked(getUserId).mockResolvedValue('user-1');
    vi.mocked(getActiveUserPlanTier).mockResolvedValue('free');
    vi.mocked(consumeAiGeneration).mockResolvedValue({
      allowed: true,
      quotaPeriod: 'month',
      quotaLimit: 1,
      quotaRemaining: 0,
      dailyLimit: 25,
      dailyRemaining: 24,
      itemRegenerationLimit: 3,
      itemRegenerationsRemaining: 3,
      resetsAt: '2026-07-26T00:00:00.000Z',
    });
    vi.mocked(generateGroundedText).mockResolvedValue(
      'Dear Hiring Team,\\n\\nI build reliable products.\\n\\nSincerely,\\nAsha Patel'
    );
    vi.mocked(compileCoverLetterPdf).mockResolvedValue(
      Uint8Array.from(Buffer.from('%PDF-1.7\\nreal compiled bytes')).buffer
    );

    const response = await POST(
      new NextRequest(
        'https://www.trackmyopt.com/api/resume-generator/cover-letter',
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            origin: publishedExtensionOrigin,
          },
          body: JSON.stringify(requestBody),
        }
      )
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('access-control-allow-origin')).toBe(
      publishedExtensionOrigin
    );
    await expect(response.json()).resolves.toMatchObject({
      draftText:
        'Dear Hiring Team,\\n\\nI build reliable products.\\n\\nSincerely,\\nAsha Patel',
      attachment: {
        filename: 'TrackMyOPT-cover-letter.pdf',
        sourceContentHash: 'a'.repeat(64),
      },
    });
    expect(consumeAiGeneration).toHaveBeenCalledWith(
      'user-1',
      expect.stringContaining('cover-letter'),
      false,
      {
        feature: 'cover_letter',
        planTier: 'free',
      },
    );
    expect(compileCoverLetterPdf).toHaveBeenCalledOnce();

    const source = readFileSync(
      'app/api/resume-generator/cover-letter/route.ts',
      'utf8'
    );
    expect(source).not.toContain('%PDF-1.4');
    expect(source).toContain('compileCoverLetterPdf');
  });
});
