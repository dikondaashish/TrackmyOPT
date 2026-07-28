import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  checkRateLimit: vi.fn(),
  captureServerEvent: vi.fn(),
  getUserId: vi.fn(),
}));

vi.mock('@/lib/auth/getUserId', () => ({
  getUserId: mocks.getUserId,
}));
vi.mock('@/lib/auth/rate-limit', () => ({
  default: () => ({ check: mocks.checkRateLimit }),
}));
vi.mock('@/lib/posthog-server', () => ({
  captureServerEvent: mocks.captureServerEvent,
}));

import { POST } from './route';

function request(): NextRequest {
  return new NextRequest(
    'https://www.trackmyopt.com/api/extension/widget-event',
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        origin: 'chrome-extension://hfljbefkccdmlnhclfojlafipjnjbajm',
      },
      body: JSON.stringify({
        event: 'extension_widget_shown',
        properties: {
          site_family: 'linkedin',
          default_view: 'expanded',
        },
      }),
    }
  );
}

describe('extension widget analytics availability', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUserId.mockResolvedValue('user-1');
    mocks.checkRateLimit.mockResolvedValue({
      isRateLimited: false,
      unavailable: false,
    });
    mocks.captureServerEvent.mockResolvedValue(undefined);
  });

  it('drops telemetry without a 5xx when the durable limiter is unavailable', async () => {
    mocks.checkRateLimit.mockResolvedValue({
      isRateLimited: true,
      unavailable: true,
    });

    const response = await POST(request());

    expect(response.status).toBe(202);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      accepted: false,
    });
    expect(mocks.captureServerEvent).not.toHaveBeenCalled();
  });

  it('keeps a real traffic limit as a 429', async () => {
    mocks.checkRateLimit.mockResolvedValue({
      isRateLimited: true,
      unavailable: false,
    });

    const response = await POST(request());

    expect(response.status).toBe(429);
    expect(mocks.captureServerEvent).not.toHaveBeenCalled();
  });

  it('captures an allowed event normally', async () => {
    const response = await POST(request());

    expect(response.status).toBe(200);
    expect(mocks.captureServerEvent).toHaveBeenCalledWith(
      'user-1',
      'extension_widget_shown',
      {
        source: 'chrome_extension',
        site_family: 'linkedin',
        default_view: 'expanded',
      }
    );
  });
});
