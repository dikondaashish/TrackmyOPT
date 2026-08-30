import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const USER_ID = '11111111-1111-4111-8111-111111111111';
const RESUME_ID = '22222222-2222-4222-8222-222222222222';

const mocks = vi.hoisted(() => ({
  getUserId: vi.fn(),
  checkRateLimitByUser: vi.fn(),
  generateAiContent: vi.fn(),
  maybeSingle: vi.fn(),
  update: vi.fn(),
}));

vi.mock('@/lib/auth/get-user-id', () => ({ getUserId: mocks.getUserId }));
vi.mock('@/lib/auth/api-rate-limit', () => ({
  checkRateLimitByUser: mocks.checkRateLimitByUser,
  rateLimitResponse: () => new Response(JSON.stringify({ error: 'rate_limited' }), { status: 429 }),
}));
vi.mock('@/lib/ai/google-ai', () => ({ generateAiContent: mocks.generateAiContent }));
vi.mock('@/lib/supabase/admin', () => ({
  getSupabaseAdminClient: () => ({
    from: () => {
      const builder: Record<string, unknown> = {};
      builder.select = vi.fn(() => builder);
      builder.eq = vi.fn(() => builder);
      builder.maybeSingle = mocks.maybeSingle;
      builder.update = mocks.update.mockImplementation(() => builder);
      return builder;
    },
  }),
}));

const { POST } = await import('./route');

const aiProfile = {
  schemaVersion: 1,
  roleTitles: ['Software Engineer'],
  skills: ['TypeScript', 'React'],
  certifications: [],
  education: [{ level: 'master', field: 'Computer Science' }],
  yearsExperience: 3,
};

function request(body: unknown) {
  return new NextRequest('https://www.trackmyopt.com/api/job-board/resume-match', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/job-board/resume-match', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUserId.mockResolvedValue(USER_ID);
    mocks.checkRateLimitByUser.mockResolvedValue({ success: true });
    mocks.update.mockImplementation(() => ({ eq: vi.fn(() => ({ eq: vi.fn(async () => ({ error: null })) })) }));
  });

  it('requires an authenticated user', async () => {
    mocks.getUserId.mockResolvedValue(null);
    const response = await POST(request({ resumeText: 'x'.repeat(100), filename: 'resume.txt' }));
    expect(response.status).toBe(401);
  });

  it('loads a selected resume only for its owner and caches a validated AI profile', async () => {
    mocks.maybeSingle.mockResolvedValue({
      data: { id: RESUME_ID, filename: 'Asha Resume.pdf', content: 'Software engineer with 3 years using TypeScript and React.'.repeat(3), structured_data: { templateId: 'modern' } },
      error: null,
    });
    mocks.generateAiContent.mockResolvedValue({ text: JSON.stringify(aiProfile) });

    const response = await POST(request({ resumeId: RESUME_ID }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ ok: true, filename: 'Asha Resume.pdf', source: 'ai', profile: aiProfile });
    expect(mocks.generateAiContent).toHaveBeenCalledWith(expect.objectContaining({ task: 'resume_job_profile', userId: USER_ID }));
    expect(mocks.update).toHaveBeenCalledWith(expect.objectContaining({
      structured_data: expect.objectContaining({
        templateId: 'modern',
        jobMatchProfile: expect.objectContaining({ profile: aiProfile }),
      }),
    }));
  });

  it('uses a deterministic profile when the AI response is invalid', async () => {
    mocks.generateAiContent.mockResolvedValue({ text: '{"skills":"not-an-array"}' });

    const response = await POST(request({
      resumeText: 'Backend Engineer with 4 years of TypeScript, Node.js, PostgreSQL, and AWS experience. Master of Science in Computer Science.',
      filename: 'resume.txt',
    }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.source).toBe('deterministic');
    expect(body.profile.skills).toEqual(expect.arrayContaining(['TypeScript', 'Node.js', 'PostgreSQL', 'AWS']));
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it('rejects invalid resume identifiers and oversized raw text before AI use', async () => {
    const invalidId = await POST(request({ resumeId: 'not-a-uuid' }));
    const oversized = await POST(request({ resumeText: 'x'.repeat(25_001), filename: 'resume.txt' }));

    expect(invalidId.status).toBe(400);
    expect(oversized.status).toBe(400);
    expect(mocks.generateAiContent).not.toHaveBeenCalled();
  });
});
