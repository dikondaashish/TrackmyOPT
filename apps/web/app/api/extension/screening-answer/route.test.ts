import { NextRequest } from 'next/server';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getUserId } from '@/lib/auth/get-user-id';
import { consumeAiGeneration } from '@/lib/ai-generation-limits';
import { generateGroundedText } from '@/lib/ai/generate-grounded-text';
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
vi.mock('@/lib/premium/user-plan-tier', () => ({
  getActiveUserPlanTier: vi.fn(),
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
        origin: 'chrome-extension://hfljbefkccdmlnhclfojlafipjnjbajm',
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
    vi.mocked(getActiveUserPlanTier).mockResolvedValue('free');
    vi.mocked(consumeAiGeneration).mockResolvedValue({
      allowed: true,
      quotaPeriod: 'month',
      quotaLimit: 5,
      quotaRemaining: 4,
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
      'chrome-extension://hfljbefkccdmlnhclfojlafipjnjbajm'
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
      false,
      {
        feature: 'screening_answer',
        planTier: 'free',
      },
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
      true,
      {
        feature: 'screening_answer',
        planTier: 'free',
      },
    );
  });

  it.each([
    'NEEDS_USER_INPUT',
    'I am very excited about this wonderful opportunity and would love to join your team.',
  ])(
    'rejects an ungrounded model draft: "%s"',
    async (draft) => {
      vi.mocked(generateGroundedText).mockResolvedValue(draft);

      const response = await POST(
        request('Why are you interested in this role?')
      );

      expect(response.status).toBe(422);
      await expect(response.json()).resolves.toMatchObject({
        ok: false,
        error: 'insufficient_context',
      });
    }
  );

  it('rejects a model draft that introduces a sensitive fact', async () => {
    vi.mocked(generateGroundedText).mockResolvedValue(
      'I enjoy TypeScript work and will require visa sponsorship.'
    );

    const response = await POST(
      request('Why are you interested in this role?')
    );

    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: 'insufficient_context',
    });
  });
});
