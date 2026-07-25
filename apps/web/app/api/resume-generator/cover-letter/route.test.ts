import { NextRequest } from 'next/server';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getUserId } from '@/lib/auth/getUserId';
import { consumeAiGeneration } from '@/lib/ai-generation-limits';

import { POST } from './route';

vi.mock('@/lib/auth/getUserId', () => ({
  getUserId: vi.fn(),
}));
vi.mock('@/lib/ai-generation-limits', () => ({
  consumeAiGeneration: vi.fn(),
}));

const userId = '00000000-0000-4000-8000-000000000001';
const snapshot = {
  contact: { fullName: 'Ada Applicant' },
  skills: ['TypeScript'],
  experience: [],
  education: [],
  certifications: [],
};

function request(isRegeneration: boolean): NextRequest {
  return new NextRequest(
    'https://www.trackmyopt.com/api/resume-generator/cover-letter',
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        snapshot,
        sourceContentHash: 'a'.repeat(64),
        isRegeneration,
        job: {
          companyName: 'Acme',
          roleTitle: 'Engineer',
          jobDescription: 'Build reliable software.',
        },
      }),
    }
  );
}

describe('cover-letter generation quota semantics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getUserId).mockResolvedValue(userId);
    vi.mocked(consumeAiGeneration).mockResolvedValue({
      allowed: true,
      dailyLimit: 25,
      dailyRemaining: 24,
      itemRegenerationLimit: 3,
      itemRegenerationsRemaining: 3,
      resetsAt: '2026-07-26T00:00:00.000Z',
    });
  });

  it('does not mark the first generation as a regeneration', async () => {
    const response = await POST(request(false));

    expect(response.status).toBe(200);
    expect(consumeAiGeneration).toHaveBeenCalledWith(
      userId,
      `Acme|Engineer|${'a'.repeat(64)}`,
      false
    );
  });

  it('marks an explicit repeat generation as a regeneration', async () => {
    const response = await POST(request(true));

    expect(response.status).toBe(200);
    expect(consumeAiGeneration).toHaveBeenCalledWith(
      userId,
      `Acme|Engineer|${'a'.repeat(64)}`,
      true
    );
  });
});
