// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { withSentryApiErrors } from './api-errors';

const captureMessage = vi.hoisted(() => vi.fn());
vi.mock('@sentry/nextjs', () => ({ captureMessage }));
beforeEach(() => {
  captureMessage.mockReset();
});

describe('API failure reporting', () => {
  it.each([200, 201, 204, 302, 400, 401, 403, 404, 409, 429])(
    'preserves HTTP %i without reporting expected responses',
    async (status) => {
      const response = new Response(null, { status });
      const handler = withSentryApiErrors(
        () => response,
        '/api/example',
        'GET'
      );
      expect(await handler()).toBe(response);
      expect(captureMessage).not.toHaveBeenCalled();
    }
  );

  it.each([500, 502, 503, 504, 599])(
    'reports handled HTTP %i while preserving the untouched response',
    async (status) => {
      const response = new Response('private applicant contents', {
        status,
        headers: { 'set-cookie': 'session=private', 'x-custom': 'preserved' },
      });
      const request = new Request(
        'https://example.test/api/private/id?token=private',
        {
          method: 'POST',
          body: 'private applicant form',
        }
      );
      const original = vi.fn().mockResolvedValue(response);
      const context = { params: Promise.resolve({ id: 'private-record' }) };
      const handler = withSentryApiErrors(
        original,
        '/api/private/[id]',
        'POST'
      );
      expect(await handler(request, context)).toBe(response);
      expect(original).toHaveBeenCalledWith(request, context);
      expect(captureMessage).toHaveBeenCalledExactlyOnceWith(
        `POST /api/private/[id] returned HTTP ${status}`,
        'error'
      );
      expect(JSON.stringify(captureMessage.mock.calls)).not.toContain(
        'private-record'
      );
      expect(response.bodyUsed).toBe(false);
      expect(response.headers.get('x-custom')).toBe('preserved');
      expect(await response.text()).toBe('private applicant contents');
    }
  );

  it('keeps thrown exceptions available to Next.js automatic capture', async () => {
    const error = new Error('synthetic failure');
    const handler = withSentryApiErrors(
      async () => {
        throw error;
      },
      '/api/example',
      'GET'
    );
    await expect(handler()).rejects.toBe(error);
    expect(captureMessage).not.toHaveBeenCalled();
  });

  it('reports a delegated response once', async () => {
    const response = new Response(null, { status: 503 });
    const get = withSentryApiErrors(() => response, '/api/example', 'GET');
    const post = withSentryApiErrors(() => get(), '/api/example', 'POST');
    expect(await post()).toBe(response);
    expect(captureMessage).toHaveBeenCalledOnce();
  });

  it('preserves responses when monitoring itself fails', async () => {
    captureMessage.mockImplementation(() => {
      throw new Error('SDK unavailable');
    });
    const response = new Response(null, { status: 503 });
    const handler = withSentryApiErrors(() => response, '/api/example', 'GET');
    expect(await handler()).toBe(response);
  });
});
