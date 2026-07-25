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

function request(questionText: string): NextRequest {
  return new NextRequest(
    'https://www.trackmyopt.com/api/extension/screening-answer',
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ questionText }),
    }
  );
}

describe('screening-answer sensitive-question boundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
});
