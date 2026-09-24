import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  checkRateLimitByUser: vi.fn(),
  generateAiContent: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({ auth: { getUser: mocks.getUser } }),
}));
vi.mock('@/lib/auth/api-rate-limit', () => ({
  checkRateLimitByUser: mocks.checkRateLimitByUser,
}));
vi.mock('@/lib/ai/google-ai', () => ({
  generateAiContent: mocks.generateAiContent,
}));

const { POST } = await import('./route');

function request(body: Record<string, unknown>) {
  return new NextRequest(
    'https://www.trackmyopt.com/api/career/networking/draft',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );
}

const validBody = {
  companyName: 'Amazon',
  roleTitle: 'Software Engineer',
  contactName: 'Alex',
  contactTitle: 'Recruiter',
  messageIntent: 'Ask for a short conversation about the role.',
  includeEmail: true,
};

describe('POST /api/career/networking/draft', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    mocks.checkRateLimitByUser.mockResolvedValue({ success: true });
    mocks.generateAiContent.mockResolvedValue({
      text: JSON.stringify({
        subject: 'Question about the role',
        emailBody: 'Hi Alex, could we talk about the role?',
        linkedinNote: 'Hi Alex, I would love to connect.',
      }),
    });
  });

  it('requires authentication before using AI', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } });
    const response = await POST(request(validBody));
    expect(response.status).toBe(401);
    expect(mocks.generateAiContent).not.toHaveBeenCalled();
  });

  it('requires a message intent and caps invalid input', async () => {
    const response = await POST(request({ ...validBody, messageIntent: '' }));
    expect(response.status).toBe(400);
    expect(mocks.generateAiContent).not.toHaveBeenCalled();
  });

  it('returns email and LinkedIn drafts when requested', async () => {
    const response = await POST(request(validBody));
    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toContain('no-store');
    expect(await response.json()).toEqual({
      ok: true,
      data: {
        subject: 'Question about the role',
        emailBody: 'Hi Alex, could we talk about the role?',
        linkedinNote: 'Hi Alex, I would love to connect.',
      },
    });
    expect(mocks.generateAiContent).toHaveBeenCalledWith(
      expect.objectContaining({ task: 'networking_draft', userId: 'user-1' })
    );
  });

  it('can draft from contact and message intent without a tracked role', async () => {
    const response = await POST(
      request({ ...validBody, companyName: null, roleTitle: null })
    );
    expect(response.status).toBe(200);
  });

  it('does not expose an email draft for an unverified contact', async () => {
    const response = await POST(request({ ...validBody, includeEmail: false }));
    expect(await response.json()).toEqual({
      ok: true,
      data: {
        subject: null,
        emailBody: null,
        linkedinNote: 'Hi Alex, I would love to connect.',
      },
    });
  });

  it('stops at the daily limit', async () => {
    mocks.checkRateLimitByUser.mockResolvedValue({
      success: false,
      retryAfter: 120,
    });
    const response = await POST(request(validBody));
    expect(response.status).toBe(429);
    expect(mocks.generateAiContent).not.toHaveBeenCalled();
  });
});
