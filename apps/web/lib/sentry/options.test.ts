// @vitest-environment node
import { afterEach, describe, expect, it } from 'vitest';
import * as Sentry from '@sentry/nextjs';
import type { ErrorEvent } from '@sentry/nextjs';
import { sentryOptions, scrubSentryEvent } from './options';

afterEach(async () => {
  await Sentry.close();
});

describe('Sentry diagnostic privacy', () => {
  it('removes private scope data, attachments, and source locals while preserving a useful stack', () => {
    const event: ErrorEvent = {
      type: undefined,
      event_id: 'test-event',
      release: 'test-release',
      user: { email: 'applicant@example.com', ip_address: '192.0.2.1' },
      extra: { resume: 'private resume contents' },
      tags: { passport: 'private passport' },
      breadcrumbs: [{ message: 'private click contents' }],
      contexts: {
        custom: { prompt: 'private AI prompt' },
        trace: {
          trace_id: 'trace',
          span_id: 'span',
          data: { answer: 'private answer' },
        },
      },
      request: {
        method: 'POST',
        url: 'https://www.trackmyopt.com/api?token=private',
        headers: { authorization: 'private bearer' },
        cookies: { session: 'private session' },
        data: 'private form',
      },
      exception: {
        values: [
          {
            type: 'Error',
            value:
              'Failed for applicant@example.com IOE1234567890 Bearer synthetic-token-value at https://user:password@example.com/callback?code=private#private',
            mechanism: {
              type: 'generic',
              handled: false,
              data: { address: 'private address' },
            },
            stacktrace: {
              frames: [
                {
                  filename:
                    'https://www.trackmyopt.com/_next/static/app.js?token=private',
                  function: 'loadCase',
                  lineno: 42,
                  colno: 7,
                  vars: { ssn: 'private ssn' },
                  pre_context: ['private source'],
                  context_line: 'private source',
                },
              ],
            },
          },
        ],
      },
    };
    const hint = {
      attachments: [{ filename: 'resume.txt', data: 'private attachment' }],
    };
    const result = scrubSentryEvent(event, hint);
    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain('private');
    expect(serialized).not.toContain('applicant@example.com');
    expect(serialized).not.toContain('IOE1234567890');
    expect(serialized).not.toContain('synthetic-token-value');
    expect(result.release).toBe('test-release');
    expect(result.exception?.values?.[0].stacktrace?.frames?.[0]).toMatchObject(
      {
        filename: 'https://www.trackmyopt.com/_next/static/app.js',
        function: 'loadCase',
        lineno: 42,
        colno: 7,
      }
    );
    expect(result.contexts?.trace).toEqual({
      trace_id: 'trace',
      span_id: 'span',
    });
    expect(result.request).toEqual({ method: 'POST' });
    expect(hint.attachments).toEqual([]);
    expect(event.user?.email).toBe('applicant@example.com');
  });

  it('filters console messages and private record IDs', () => {
    const result = scrubSentryEvent(
      {
        type: undefined,
        message:
          'Failed cus_synthetic and 11111111-2222-3333-4444-555555555555',
        logentry: {
          message: 'Failed for applicant@example.com',
          params: ['private body'],
        },
      },
      {}
    );
    expect(JSON.stringify(result)).not.toContain('cus_synthetic');
    expect(JSON.stringify(result)).not.toContain(
      '11111111-2222-3333-4444-555555555555'
    );
    expect(JSON.stringify(result)).not.toContain('private body');
    expect(result.message).toContain('Failed');
  });

  it('applies the privacy filter to the actual SDK transport', async () => {
    const envelopes: unknown[] = [];
    Sentry.init({
      ...sentryOptions('https://public@example.com/1'),
      enabled: true,
      defaultIntegrations: false,
      integrations: [Sentry.captureConsoleIntegration({ levels: ['error'] })],
      transport: () => ({
        send: async (envelope: unknown) => {
          envelopes.push(envelope);
          return { statusCode: 200 };
        },
        flush: async () => true,
      }),
    });
    Sentry.withScope((scope) => {
      scope.setUser({ email: 'applicant@example.com' });
      scope.setExtra('resume', 'private resume');
      Sentry.captureException(
        new Error('Synthetic failure for applicant@example.com IOE1234567890')
      );
      Sentry.captureException(new Error('Minified React error #418'));
      console.error('OPT tools: failed to load saved dates');
    });
    expect(await Sentry.flush(2000)).toBe(true);
    const payload = JSON.stringify(envelopes);
    expect(payload).toContain('Synthetic failure');
    expect(payload).toContain('Minified React error #418');
    expect(payload).toContain('OPT tools: failed to load saved dates');
    expect(payload).not.toContain('applicant@example.com');
    expect(payload).not.toContain('IOE1234567890');
    expect(payload).not.toContain('private resume');
    expect(envelopes.length).toBeGreaterThan(0);
  });
});
