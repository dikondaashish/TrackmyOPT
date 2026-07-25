import { NextRequest } from 'next/server';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getUserId } from '@/lib/auth/getUserId';
import { consumeAiGeneration } from '@/lib/ai-generation-limits';
import { generateGroundedText } from '@/lib/ai/generate-grounded-text';

import { POST } from './route';

vi.mock('@/lib/auth/getUserId', () => ({
  getUserId: vi.fn(),
}));
vi.mock('@/lib/ai-generation-limits', () => ({
  consumeAiGeneration: vi.fn(),
}));
vi.mock('@/lib/ai/generate-grounded-text', () => ({
  generateGroundedText: vi.fn(),
}));

const snapshot = {
  contact: { firstName: 'Asha', lastName: 'Patel' },
  skills: ['TypeScript'],
  experience: [],
  education: [],
  certifications: [],
};

function request(
  questionText: string,
  overrides: Record<string, unknown> = {}
): NextRequest {
  return new NextRequest(
    'https://www.trackmyopt.com/api/extension/screening-answer',
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        origin: 'chrome-extension://abcdefghijklmnop',
      },
      body: JSON.stringify({
        questionText,
        job: {
          companyName: 'Acme',
          roleTitle: 'Software Engineer',
          jobDescription: 'Build reliable TypeScript products.',
        },
        snapshot,
        sourceContentHash: 'a'.repeat(64),
        ...overrides,
      }),
    }
  );
}

describe('screening-answer sensitive-question boundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getUserId).mockResolvedValue('user-1');
    vi.mocked(consumeAiGeneration).mockResolvedValue({
      allowed: true,
      dailyLimit: 25,
      dailyRemaining: 24,
      itemRegenerationLimit: 3,
      itemRegenerationsRemaining: 3,
      resetsAt: '2026-07-26T00:00:00.000Z',
    });
    vi.mocked(generateGroundedText).mockResolvedValue(
      'I enjoy building reliable TypeScript products.'
    );
  });

  it.each([
    'Do you have a work permit?',
    'Are you authorized to work in the United States?',
    'Please complete the equal opportunity questionnaire.',
    'Answer this EEO question.',
    'Are you eligible to work in the United States?',
    'Will you need visa sponsorship?',
    'What is your citizenship status?',
    'State your desired salary.',
    'Provide your date of birth.',
    'Enter your SSN.',
    'Do you have a disability?',
    'What is your veteran status?',
    'Do you hold a security clearance?',
  ])(
    'rejects "%s" before auth, quota, or generation work',
    async (questionText) => {
      const response = await POST(request(questionText));

      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toMatchObject({
        ok: false,
        error: 'sensitive',
      });
      expect(getUserId).not.toHaveBeenCalled();
      expect(consumeAiGeneration).not.toHaveBeenCalled();
    }
  );

  it('generates a grounded draft with durable quota metadata', async () => {
    const response = await POST(request('Why are you interested in this role?'));

    expect(response.status).toBe(200);
    expect(response.headers.get('access-control-allow-origin')).toBe(
      'chrome-extension://abcdefghijklmnop'
    );
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      draft: 'I enjoy building reliable TypeScript products.',
      dailyRemaining: 24,
      sourceContentHash: 'a'.repeat(64),
    });
    expect(getUserId).toHaveBeenCalledOnce();
    expect(consumeAiGeneration).toHaveBeenCalledWith(
      'user-1',
      expect.stringMatching(/^screening:[a-f0-9]{64}:a{64}$/),
      false
    );
  });

  it('uses regeneration quota only when regenerate is explicitly true', async () => {
    const response = await POST(
      request('Why are you interested in this role?', { regenerate: true })
    );

    expect(response.status).toBe(200);
    expect(consumeAiGeneration).toHaveBeenCalledWith(
      'user-1',
      expect.any(String),
      true
    );
  });
});
