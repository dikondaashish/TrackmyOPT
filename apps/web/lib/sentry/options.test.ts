// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as Sentry from '@sentry/nextjs';
import type { ErrorEvent } from '@sentry/nextjs';
import {
  isBrowserNetworkFailure,
  isForeignScriptEvent,
  isInjectedStackOverflow,
  isOriginReachable,
  networkFailureOrigin,
  resetNetworkFailureReporting,
  sentryOptions,
  scrubSentryEvent,
  shouldDropNetworkFailure,
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

describe('Sentry injected stack-overflow filtering', () => {
  const overflow = (...filenames: string[]): ErrorEvent => ({
    type: undefined,
    exception: {
      values: [
        {
          type: 'RangeError',
          value: 'Maximum call stack size exceeded.',
          stacktrace: { frames: filenames.map((filename) => ({ filename })) },
        },
      ],
    },
  });

  it('drops recursion whose frames only point at page documents', () => {
    // Shape of TRACKMYOPT-Z: lines 228/200 of HTML that has one line.
    const event = overflow(
      'app:///login',
      'app:///',
      'app:///',
      '[native code]'
    );
    expect(isInjectedStackOverflow(event)).toBe(true);
    const beforeSend = sentryOptions('https://key@example.test/1')?.beforeSend;
    expect(beforeSend?.(event, {})).toBeNull();
  });

  it('keeps recursion that involves bundled TrackMyOPT code', () => {
    expect(
      isInjectedStackOverflow(
        overflow('app:///login', 'app:///_next/static/chunks/app.js')
      )
    ).toBe(false);
    expect(
      isInjectedStackOverflow(overflow('https://www.trackmyopt.com/x.js'))
    ).toBe(false);
    expect(isInjectedStackOverflow(overflow('<anonymous>'))).toBe(false);
    expect(isInjectedStackOverflow(overflow())).toBe(false);
  });

  it('keeps other page-document errors', () => {
    const event = overflow('app:///login');
    event.exception!.values![0].type = 'TypeError';
    expect(isInjectedStackOverflow(event)).toBe(false);
  });
});

describe('Sentry browser connectivity noise', () => {
  const failure = (value: string, type: string | undefined = 'TypeError') =>
    ({ exception: { values: [{ type, value }] } }) as ErrorEvent;
  const online = {
    offline: false,
    hidden: false,
    origin: 'https://www.trackmyopt.com',
  };
  const reachable = () => Promise.resolve(true);
  const unreachable = () => Promise.resolve(false);
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

  it('recognises fixed TrackMyOPT diagnostics for requests without a response', () => {
    const plan =
      'OPT tools: failed to load plan status (stage=network, status=none)';
    expect(isBrowserNetworkFailure(failure(plan, undefined))).toBe(true);
    expect(
      isBrowserNetworkFailure({ type: undefined, message: plan } as ErrorEvent)
    ).toBe(true);
    expect(
      isBrowserNetworkFailure(
        failure(
          'Pro checkout request failed (stage=network, status=none)',
          'Error'
        )
      )
    ).toBe(true);
    expect(
      isBrowserNetworkFailure(
        failure(
          'OPT tools: failed to load plan status (stage=http, status=503)'
        )
      )
    ).toBe(false);
    expect(
      isBrowserNetworkFailure(
        failure('Activation check failed (stage=payload, status=200)', 'Error')
      )
    ).toBe(false);
  });

  it('probes the host that failed', () => {
    expect(
      networkFailureOrigin(
        failure('Failed to fetch (deknauqkqqzwuvopqott.supabase.co)'),
        online.origin
      )
    ).toBe('https://deknauqkqqzwuvopqott.supabase.co');
    expect(networkFailureOrigin(failure('Load failed'), online.origin)).toBe(
      online.origin
    );
  });

  it('probes with a body-free, credential-free request and one retry', async () => {
    vi.useFakeTimers();
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(new Response(null, { status: 404 }));
    vi.stubGlobal('fetch', fetchMock);
    try {
      const result = isOriginReachable('https://www.trackmyopt.com');
      await vi.advanceTimersByTimeAsync(2_000);
      await expect(result).resolves.toBe(true);
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(fetchMock).toHaveBeenCalledWith(
        'https://www.trackmyopt.com/',
        expect.objectContaining({
          method: 'HEAD',
          mode: 'no-cors',
          credentials: 'omit',
        })
      );
      fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
      const down = isOriginReachable('https://www.trackmyopt.com');
      await vi.advanceTimersByTimeAsync(2_000);
      await expect(down).resolves.toBe(false);
    } finally {
      vi.unstubAllGlobals();
      vi.useRealTimers();
    }
  });

  it('drops failures while offline or hidden without probing', () => {
    const e = failure('Failed to fetch');
    const probe = vi.fn(reachable);
    expect(
      shouldDropNetworkFailure(e, { ...online, offline: true }, probe)
    ).toBe(true);
    expect(
      shouldDropNetworkFailure(e, { ...online, hidden: true }, probe)
    ).toBe(true);
    expect(probe).not.toHaveBeenCalled();
  });

  it('drops a dropped connection when the failed host answers a probe', async () => {
    const probe = vi.fn(reachable);
    await expect(
      shouldDropNetworkFailure(failure('Failed to fetch'), online, probe)
    ).resolves.toBe(true);
    expect(probe).toHaveBeenCalledWith(online.origin);
  });

  it('reports an unreachable host once per page load so outages still report', async () => {
    await expect(
      shouldDropNetworkFailure(failure('Failed to fetch'), online, unreachable)
    ).resolves.toBe(false);
    expect(
      shouldDropNetworkFailure(failure('Load failed'), online, unreachable)
    ).toBe(true);
  });

  it('reports repeated failures against a reachable host as persistent', async () => {
    const e = failure('Failed to fetch');
    await expect(shouldDropNetworkFailure(e, online, reachable)).resolves.toBe(
      true
    );
    await expect(shouldDropNetworkFailure(e, online, reachable)).resolves.toBe(
      true
    );
    await expect(shouldDropNetworkFailure(e, online, reachable)).resolves.toBe(
      false
    );
  });

  it('coalesces failures that arrive while a probe is running', async () => {
    let finish!: (reachable: boolean) => void;
    const probe = vi.fn(
      () =>
        new Promise<boolean>((resolve) => {
          finish = resolve;
        })
    );
    const first = shouldDropNetworkFailure(
      failure('Failed to fetch'),
      online,
      probe
    );
    expect(
      shouldDropNetworkFailure(failure('Load failed'), online, probe)
    ).toBe(true);
    finish(false);
    await expect(first).resolves.toBe(false);
    expect(probe).toHaveBeenCalledOnce();
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
