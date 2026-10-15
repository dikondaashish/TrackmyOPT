// @vitest-environment node
import { afterEach, describe, expect, it } from 'vitest';
import * as Sentry from '@sentry/nextjs';
import type { ErrorEvent } from '@sentry/nextjs';
import {
  isAnalyticsTransportFailure,
  isBrowserNetworkError,
  isBrowserNetworkFailure,
  isForeignScriptEvent,
  resetNetworkFailureReporting,
  sentryOptions,
  scrubSentryEvent,
  shouldDropNetworkFailure,
  shouldReportCaughtNetworkFailure,
} from './options';

afterEach(async () => {
  await Sentry.close();
});

describe('Sentry diagnostic privacy', () => {
  it('retains fixed request stages and HTTP status through the privacy scrubber', () => {
    const message =
      'OPT tools: failed to load saved dates (stage=http, status=503)';
    const result = scrubSentryEvent(
      {
        type: undefined,
        message,
        logentry: { message },
        exception: { values: [{ value: message }] },
        extra: { response: 'Synthetic private response' },
      },
      {}
    );
    expect(result.message).toBe(message);
    expect(result.logentry?.message).toBe(message);
    expect(result.exception?.values?.[0].value).toBe(message);
    expect(JSON.stringify(result)).not.toContain('Synthetic private response');
  });

  it.each([
    `Cannot create property 'user' on string '{"access_token":"synthetic-access","user_metadata":{"full_name":"Synthetic Person","provider_id":"synthetic-provider","avatar_url":"https://example.test/private-avatar"}}'`,
    `Cannot create property 'user' on string '{"access_token":"synthetic-access","user_metadata":{"full_name":"Synthetic Person"`,
    'Unexpected response: ["Synthetic Person", "synthetic-private-answer"]',
  ])(
    'removes serialized payloads from every diagnostic text field: %s',
    (message) => {
      const result = scrubSentryEvent(
        {
          type: undefined,
          message,
          logentry: { message },
          exception: { values: [{ type: 'TypeError', value: message }] },
        },
        {}
      );
      const payload = JSON.stringify(result);
      expect(payload).not.toContain('Synthetic Person');
      expect(payload).not.toContain('synthetic-access');
      expect(payload).not.toContain('synthetic-provider');
      expect(payload).not.toContain('private-avatar');
      expect(payload).not.toContain('synthetic-private-answer');
      expect(payload).toContain('[REDACTED_PAYLOAD]');
      expect(result.exception?.values?.[0].type).toBe('TypeError');
    }
  );

  it('preserves diagnostic bracket labels and hydration errors', () => {
    const result = scrubSentryEvent(
      {
        type: undefined,
        message: '[Sentry] static trace lifecycle; Minified React error #418',
      },
      {}
    );
    expect(result.message).toBe(
      '[Sentry] static trace lifecycle; Minified React error #418'
    );
  });
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

describe('Sentry third-party script filtering', () => {
  const withFrames = (...filenames: string[]): ErrorEvent => ({
    type: undefined,
    exception: {
      values: [
        {
          type: 'TypeError',
          value: "Cannot read properties of null (reading 'postMessage')",
          stacktrace: { frames: filenames.map((filename) => ({ filename })) },
        },
      ],
    },
  });

  it('drops errors raised entirely by userscripts or extensions', () => {
    expect(
      isForeignScriptEvent(withFrames('<anonymous>', 'app:///userscript.html'))
    ).toBe(true);
    expect(
      isForeignScriptEvent(withFrames('chrome-extension://abc/content.js'))
    ).toBe(true);
    const beforeSend = sentryOptions('https://key@example.test/1')?.beforeSend;
    expect(beforeSend?.(withFrames('app:///userscript.html'), {})).toBeNull();
  });

  it('keeps errors that involve first-party frames', () => {
    expect(
      isForeignScriptEvent(
        withFrames('chrome-extension://abc/content.js', 'app:///_next/app.js')
      )
    ).toBe(false);
    expect(isForeignScriptEvent(withFrames('<anonymous>'))).toBe(false);
    expect(isForeignScriptEvent({ type: undefined, message: 'x' })).toBe(false);
  });
});

describe('Sentry browser connectivity noise', () => {
  const failure = (value: string, type = 'TypeError') =>
    ({ exception: { values: [{ type, value }] } }) as ErrorEvent;
  const online = { offline: false, hidden: false };
  afterEach(() => resetNetworkFailureReporting());

  it('recognises each browser network-failure wording only', () => {
    expect(isBrowserNetworkFailure(failure('Failed to fetch'))).toBe(true);
    expect(
      isBrowserNetworkFailure(failure('Failed to fetch (www.trackmyopt.com)'))
    ).toBe(true);
    expect(isBrowserNetworkFailure(failure('Load failed'))).toBe(true);
    expect(
      isBrowserNetworkFailure(
        failure('NetworkError when attempting to fetch resource.')
      )
    ).toBe(true);
    expect(isBrowserNetworkFailure(failure('Failed to fetch', 'Error'))).toBe(
      false
    );
    expect(
      isBrowserNetworkFailure(
        failure("Cannot read properties of null (reading 'x')")
      )
    ).toBe(false);
  });
  it('drops failures while offline or hidden', () => {
    const e = failure('Failed to fetch');
    expect(shouldDropNetworkFailure(e, { offline: true, hidden: false })).toBe(
      true
    );
    expect(shouldDropNetworkFailure(e, { offline: false, hidden: true })).toBe(
      true
    );
  });
  it('keeps the first visible online failure per page load so outages still report', () => {
    const e = failure('Failed to fetch');
    expect(shouldDropNetworkFailure(e, online)).toBe(false);
    expect(shouldDropNetworkFailure(e, online)).toBe(true);
    expect(shouldDropNetworkFailure(failure('Load failed'), online)).toBe(true);
  });
  it('never drops other errors or server-side events', () => {
    expect(shouldDropNetworkFailure(failure('Boom', 'Error'), online)).toBe(
      false
    );
    expect(shouldDropNetworkFailure(failure('Failed to fetch'), null)).toBe(
      false
    );
  });
});

describe('caught browser network failures', () => {
  const online = { offline: false, hidden: false };
  afterEach(() => resetNetworkFailureReporting());

  it('recognises only fetch rejections without an HTTP response', () => {
    expect(isBrowserNetworkError(new TypeError('Load failed'))).toBe(true);
    expect(isBrowserNetworkError(new TypeError('Failed to fetch'))).toBe(true);
    expect(isBrowserNetworkError(new SyntaxError('Unexpected token <'))).toBe(
      false
    );
    expect(
      isBrowserNetworkError(new TypeError("Cannot read properties of null"))
    ).toBe(false);
  });

  it('shares the once-per-page budget with uncaught network failures', () => {
    expect(
      shouldDropNetworkFailure(
        { exception: { values: [{ type: 'TypeError', value: 'Load failed' }] } } as ErrorEvent,
        online
      )
    ).toBe(false);
    expect(shouldReportCaughtNetworkFailure(online)).toBe(false);
  });

  it('skips offline or hidden pages and reports the first visible failure', () => {
    expect(shouldReportCaughtNetworkFailure({ offline: true, hidden: false })).toBe(false);
    expect(shouldReportCaughtNetworkFailure({ offline: false, hidden: true })).toBe(false);
    expect(shouldReportCaughtNetworkFailure(online)).toBe(true);
    expect(shouldReportCaughtNetworkFailure(online)).toBe(false);
    expect(shouldReportCaughtNetworkFailure(null)).toBe(true);
  });
});

describe('server analytics transport noise', () => {
  const timeout =
    '[PostHog] Timeout while shutting down PostHog. Some events may not have been sent. [object Object]';

  it('drops PostHog network failures and shutdown timeouts', () => {
    expect(
      isAnalyticsTransportFailure({
        type: undefined,
        exception: {
          values: [
            { type: 'AbortError', value: 'Request timed out after 10000ms' },
            {
              type: 'PostHogFetchNetworkError',
              value: 'Network error while fetching PostHog',
            },
          ],
        },
      })
    ).toBe(true);
    expect(
      isAnalyticsTransportFailure({
        type: undefined,
        message: timeout,
        logentry: { message: timeout },
        exception: { values: [{ type: 'Error', value: timeout }] },
      })
    ).toBe(true);
    const beforeSend = sentryOptions('https://key@example.test/1')?.beforeSend;
    expect(
      beforeSend?.(
        { type: undefined, message: timeout, logentry: { message: timeout } },
        {}
      )
    ).toBeNull();
  });

  it('keeps PostHog HTTP errors and product failures reportable', () => {
    expect(
      isAnalyticsTransportFailure({
        type: undefined,
        exception: {
          values: [
            { type: 'PostHogFetchHttpError', value: 'HTTP error while fetching PostHog: 401' },
          ],
        },
      })
    ).toBe(false);
    expect(
      isAnalyticsTransportFailure({
        type: undefined,
        exception: {
          values: [
            { type: 'PostHogFetchNetworkError', value: 'Network error while fetching PostHog' },
            { type: 'Error', value: 'USCIS case persistence failed' },
          ],
        },
      })
    ).toBe(false);
    expect(
      isAnalyticsTransportFailure({
        type: undefined,
        message: 'USCIS case persistence failed',
      })
    ).toBe(false);
    expect(isAnalyticsTransportFailure({ type: undefined })).toBe(false);
  });
});
