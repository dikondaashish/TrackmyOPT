import { NextRequest } from 'next/server';
import { beforeEach, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ auth: vi.fn(), limit: vi.fn(), capture: vi.fn(), tags: {} as Record<string, string> }));
vi.mock('@/lib/auth/get-user-id', () => ({ getUserId: mocks.auth }));
vi.mock('@/lib/auth/rate-limit', () => ({ default: () => ({ check: mocks.limit }) }));
vi.mock('@sentry/nextjs', () => ({
  withScope: (fn: (scope: unknown) => void) => fn({ setFingerprint: vi.fn(), setTag: (key: string, value: string) => { mocks.tags[key] = value; } }),
  captureMessage: mocks.capture,
}));
import { POST } from './route';

const post = (body: unknown) => POST(new NextRequest('https://www.trackmyopt.com/api/extension/diagnostic', {
  method: 'POST', body: typeof body === 'string' ? body : JSON.stringify(body),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.auth.mockResolvedValue('user-1');
  mocks.limit.mockResolvedValue({ isRateLimited: false });
});

it('turns a closed-enum signal into a fixed-format Sentry message', async () => {
  const res = await post({ code: 'tracker_sync_failed', stage: 'http', platform: 'workday', status: 503, extensionVersion: '0.2.5' });
  expect(res.status).toBe(202);
  expect(mocks.capture).toHaveBeenCalledWith(
    'Extension tracker_sync_failed (stage=http, platform=workday, status=503, version=0.2.5)', 'error');
  expect(mocks.tags).toMatchObject({ source: 'chrome_extension', extension_code: 'tracker_sync_failed' });
});

it('rejects anything carrying free text, URLs, or unknown keys', async () => {
  for (const body of [
    { code: 'tracker_sync_failed', stage: 'http', extensionVersion: '0.2.5', url: 'https://acme.example/apply?email=a@b.c' },
    { code: 'custom message with applicant name', stage: 'http', extensionVersion: '0.2.5' },
    { code: 'tracker_sync_failed', stage: 'http', extensionVersion: 'beta <script>' },
    { code: 'tracker_sync_failed', stage: 'http', status: 'Bearer abc', extensionVersion: '0.2.5' },
    '{',
  ]) expect((await post(body)).status).toBe(400);
  expect(mocks.capture).not.toHaveBeenCalled();
});

it('drops signals when rate limited instead of failing the extension', async () => {
  mocks.limit.mockResolvedValueOnce({ isRateLimited: true });
  expect((await post({ code: 'review_panel_error', stage: 'processing', extensionVersion: '0.2.5' })).status).toBe(202);
  expect(mocks.capture).not.toHaveBeenCalled();
});
