// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as Sentry from '@sentry/nextjs';
import type { ErrorEvent } from '@sentry/nextjs';
import {
  applyApiErrorFingerprint,
  isAnalyticsTransportFailure,
  isExpectedAuthRefreshEvent,
  isPageUnloadAbortEvent,
  isProviderOutageHttpEvent,
  isBrowserFeatureConsoleEvent,
  isNodeRuntimeNoticeEvent,
  isBrowserNetworkError,
  isBrowserNetworkFailure,
  isForeignScriptEvent,
  isInjectedPageScriptEvent,
  isOriginReachable,
  isThirdPartyScriptEvent,
  networkFailureOrigin,
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

describe('Sentry ad and third-party script filtering', () => {
  const withFrames = (...filenames: string[]): ErrorEvent => ({
    type: undefined,
    exception: {
      values: [
        { type: 'Error', value: 'int64', stacktrace: { frames: filenames.map((filename) => ({ filename })) } },
      ],
    },
  });
  const sdk =
    'node_modules/.pnpm/@sentry+core@11.6.0/node_modules/@sentry/core/src/integration.ts';

  it('drops AdSense and executors script errors wrapped by the SDK', () => {
    expect(
      isThirdPartyScriptEvent(
        withFrames(sdk, 'app:///pagead/js/r20261015/r20190131/rum_fy2021.js')
      )
    ).toBe(true);
    expect(isThirdPartyScriptEvent(withFrames('app:///executors/200.js'))).toBe(true);
    const beforeSend = sentryOptions('https://key@example.test/1')?.beforeSend;
    expect(beforeSend?.(withFrames('app:///executors/200.js'), {})).toBeNull();
  });

  it('keeps errors with any first-party frame, and SDK-only stacks', () => {
    expect(
      isThirdPartyScriptEvent(
        withFrames('app:///pagead/js/x.js', 'app:///_next/static/chunks/app.js')
      )
    ).toBe(false);
    expect(isThirdPartyScriptEvent(withFrames(sdk))).toBe(false);
    expect(isThirdPartyScriptEvent(withFrames('app:///_next/executors/200.js.map'))).toBe(false);
  });
});

describe('Sentry browser-bundled SDK frames', () => {
  const event = (mechanism: string, value: string, ...files: string[]): ErrorEvent => ({
    type: undefined,
    exception: {
      values: [
        {
          type: 'Error',
          value,
          mechanism: { type: mechanism, handled: false },
          stacktrace: { frames: files.map((filename) => ({ filename })) },
        },
      ],
    },
  });
  const chunk = 'https://www.trackmyopt.com/_next/static/chunks/4821-abc.js';
  const ad = 'https://pagead2.googlesyndication.com/pagead/js/r20261015/r20190131/rum_fy2021.js';
  const listener = 'auto.browser.browserapierrors.addEventListener';

  it('drops ad-script errors behind the minified SDK listener wrapper', () => {
    expect(isThirdPartyScriptEvent(event(listener, 'int64', chunk, ad, ad))).toBe(true);
    const beforeSend = sentryOptions('https://key@example.test/1')?.beforeSend;
    expect(beforeSend?.(event(listener, 'int64', chunk, ad), {})).toBeNull();
  });

  it('keeps errors where our bundle code is called by, or throws inside, the ad script', () => {
    expect(isThirdPartyScriptEvent(event(listener, 'x', chunk, ad, chunk))).toBe(false);
    expect(isThirdPartyScriptEvent(event('generic', 'x', chunk, ad))).toBe(false);
    expect(isThirdPartyScriptEvent(event(listener, 'x', chunk, chunk))).toBe(false);
  });

  it("drops Chrome page-translate console errors from injected script only", () => {
    const translate = 'Web translate error: received error callback from translatePage';
    const consoleMechanism = 'auto.core.capture_console';
    expect(
      isBrowserFeatureConsoleEvent(
        event(consoleMechanism, translate, chunk, '<anonymous>', chunk, chunk)
      )
    ).toBe(true);
    expect(
      isBrowserFeatureConsoleEvent(event(consoleMechanism, translate, chunk, chunk))
    ).toBe(false);
    expect(
      isBrowserFeatureConsoleEvent(
        event(consoleMechanism, 'Profile save failed', chunk, '<anonymous>')
      )
    ).toBe(false);
    expect(
      isBrowserFeatureConsoleEvent(event('generic', translate, '<anonymous>'))
    ).toBe(false);
  });

  it('drops Node.js experimental and deprecation notices logged to the console (TRACKMYOPT-1T)', () => {
    const consoleMechanism = 'auto.core.capture_console';
    const experimental =
      '(node:8) ExperimentalWarning: vm.USE_MAIN_CONTEXT_DEFAULT_LOADER is an experimental feature and might change at any time\n(Use `node --trace-warnings ...` to show where the warning was created)';
    const deprecation = '(node:12) [DEP0040] DeprecationWarning: The `punycode` module is deprecated.';
    expect(isNodeRuntimeNoticeEvent(event(consoleMechanism, experimental))).toBe(true);
    expect(isNodeRuntimeNoticeEvent(event(consoleMechanism, deprecation))).toBe(true);
    const beforeSend = sentryOptions('https://key@example.test/1')?.beforeSend;
    expect(beforeSend?.(event(consoleMechanism, experimental), {})).toBeNull();
    // Other process warnings and real errors still report.
    expect(
      isNodeRuntimeNoticeEvent(
        event(consoleMechanism, '(node:8) MaxListenersExceededWarning: Possible EventEmitter memory leak detected.')
      )
    ).toBe(false);
    expect(isNodeRuntimeNoticeEvent(event(consoleMechanism, 'Oracle MERGE failed'))).toBe(false);
    expect(isNodeRuntimeNoticeEvent(event('generic', experimental))).toBe(false);
  });
});

describe('Sentry injected page-script filtering', () => {
  type Frame = { filename?: string; lineno?: number; colno?: number };
  const overflow = (...frames: Frame[]): ErrorEvent => ({
    type: undefined,
    exception: {
      values: [
        {
          type: 'RangeError',
          value: 'Maximum call stack size exceeded.',
          stacktrace: { frames },
        },
      ],
    },
  });

  it('drops errors whose frames sit deep inside page documents', () => {
    // Shape of TRACKMYOPT-Z: lines 228/200 of HTML that has at most 22 lines.
    const event = overflow(
      { filename: 'app:///login', lineno: 188 },
      { filename: 'app:///login', lineno: 200 },
      { filename: 'app:///', lineno: 228 },
      { filename: '[native code]' }
    );
    expect(isInjectedPageScriptEvent(event)).toBe(true);
    const beforeSend = sentryOptions('https://key@example.test/1')?.beforeSend;
    expect(beforeSend?.(event, {})).toBeNull();
  });

  it('drops overflows whose only frames have no script URL (Safari, TRACKMYOPT-1Q)', () => {
    const event = overflow({ lineno: 194, colno: 70 });
    expect(isInjectedPageScriptEvent(event)).toBe(true);
    expect(isInjectedPageScriptEvent(overflow({ filename: '', lineno: 194 }))).toBe(true);
    const beforeSend = sentryOptions('https://key@example.test/1')?.beforeSend;
    expect(beforeSend?.(event, {})).toBeNull();
    // Still reported: an unlocated frame next to our bundle, or without a line.
    expect(
      isInjectedPageScriptEvent(
        overflow({ lineno: 194 }, { filename: 'app:///_next/static/chunks/app.js', lineno: 3 })
      )
    ).toBe(false);
    expect(isInjectedPageScriptEvent(overflow({}))).toBe(false);
    expect(isInjectedPageScriptEvent(overflow({ lineno: 12 }))).toBe(false);
  });

  it('keeps errors that involve bundled code, early page lines, or no frames', () => {
    expect(
      isInjectedPageScriptEvent(
        overflow(
          { filename: 'app:///login', lineno: 200 },
          { filename: 'app:///_next/static/chunks/app.js', lineno: 1 }
        )
      )
    ).toBe(false);
    expect(
      isInjectedPageScriptEvent(
        overflow({ filename: 'https://www.trackmyopt.com/x.js', lineno: 900 })
      )
    ).toBe(false);
    // Our own inline one-liners can only fail within the served HTML lines.
    expect(
      isInjectedPageScriptEvent(
        overflow({ filename: 'app:///login', lineno: 1 })
      )
    ).toBe(false);
    expect(
      isInjectedPageScriptEvent(overflow({ filename: 'app:///login' }))
    ).toBe(false);
    expect(
      isInjectedPageScriptEvent(overflow({ filename: '<anonymous>' }))
    ).toBe(false);
    expect(isInjectedPageScriptEvent(overflow())).toBe(false);
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
      isBrowserNetworkError(new TypeError('Cannot read properties of null'))
    ).toBe(false);
  });

  it('shares the once-per-page budget with uncaught network failures', async () => {
    const event = {
      exception: { values: [{ type: 'TypeError', value: 'Load failed' }] },
    } as ErrorEvent;
    const pending = shouldDropNetworkFailure(event, online, () =>
      Promise.resolve(false)
    );
    // A caught failure during the probe is coalesced with it.
    expect(shouldReportCaughtNetworkFailure(online)).toBe(false);
    await expect(pending).resolves.toBe(false);
    expect(shouldReportCaughtNetworkFailure(online)).toBe(false);
  });

  it('skips offline or hidden pages and reports the first visible failure', () => {
    expect(
      shouldReportCaughtNetworkFailure({ offline: true, hidden: false })
    ).toBe(false);
    expect(
      shouldReportCaughtNetworkFailure({ offline: false, hidden: true })
    ).toBe(false);
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
            {
              type: 'PostHogFetchHttpError',
              value: 'HTTP error while fetching PostHog: 401',
            },
          ],
        },
      })
    ).toBe(false);
    expect(
      isAnalyticsTransportFailure({
        type: undefined,
        exception: {
          values: [
            {
              type: 'PostHogFetchNetworkError',
              value: 'Network error while fetching PostHog',
            },
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

describe('Sentry grouping and expected outcomes (2026-10-19 review)', () => {
  const beforeSend = () => sentryOptions('https://key@example.test/1')?.beforeSend;

  it('keeps custom fingerprints and only allowlisted diagnostic tags through the scrubber', () => {
    const result = scrubSentryEvent(
      {
        type: undefined,
        message: 'Job-board ingestion failed for 1 source(s)',
        fingerprint: ['job-board-ingestion', 'failed-source'],
        tags: { job_board_health: 'failed-source', db_error_code: '23514', passport: 'private passport' },
      },
      {}
    );
    expect(result.fingerprint).toEqual(['job-board-ingestion', 'failed-source']);
    expect(result.tags).toEqual({ job_board_health: 'failed-source', db_error_code: '23514' });
  });

  it('groups withSentryApiErrors reports by method, route and status (TRACKMYOPT-P)', () => {
    const refresh: ErrorEvent = { type: undefined, message: 'POST /api/case-status/refresh returned HTTP 502' };
    applyApiErrorFingerprint(refresh);
    expect(refresh.fingerprint).toEqual(['api-http-error', 'POST', '/api/case-status/refresh', '502']);
    const other: ErrorEvent = { type: undefined, message: 'Something else failed' };
    applyApiErrorFingerprint(other);
    expect(other.fingerprint).toBeUndefined();
    const sent = beforeSend()?.(
      { type: undefined, message: 'PUT /api/private-application-answers returned HTTP 500' },
      {}
    ) as ErrorEvent;
    expect(sent.fingerprint).toEqual(['api-http-error', 'PUT', '/api/private-application-answers', '500']);
  });

  it('drops the frameless AbortError of a page unloading (TRACKMYOPT-22)', () => {
    const unload: ErrorEvent = {
      type: undefined,
      exception: {
        values: [
          {
            type: 'AbortError',
            value: 'Promise was rejected because the browsing context is going away',
            mechanism: { type: 'auto.browser.global_handlers.onunhandledrejection', handled: false },
          },
        ],
      },
    };
    expect(isPageUnloadAbortEvent(unload)).toBe(true);
    expect(beforeSend()?.(unload, {})).toBeNull();
    const withFrames = structuredClone(unload);
    withFrames.exception!.values![0].stacktrace = {
      frames: [{ filename: 'https://www.trackmyopt.com/_next/static/chunks/app.js' }],
    };
    expect(isPageUnloadAbortEvent(withFrames)).toBe(false);
  });

  it("drops Supabase's console report of a reused refresh token only (TRACKMYOPT-1Z)", () => {
    const authEvent = (value: string, mechanism = 'auto.core.capture_console'): ErrorEvent => ({
      type: undefined,
      exception: { values: [{ type: 'AuthApiError', value, mechanism: { type: mechanism, handled: true } }] },
    });
    expect(isExpectedAuthRefreshEvent(authEvent('Invalid Refresh Token: Already Used'))).toBe(true);
    expect(isExpectedAuthRefreshEvent(authEvent('Invalid Refresh Token: Refresh Token Not Found'))).toBe(true);
    expect(isExpectedAuthRefreshEvent(authEvent('Database error saving new user'))).toBe(false);
    expect(isExpectedAuthRefreshEvent(authEvent('Invalid Refresh Token: Already Used', 'generic'))).toBe(false);
  });

  it("drops the refresh route's USCIS-outage 503 from the browser but keeps 502s (TRACKMYOPT-21/23)", () => {
    const http = (status: number, url: string): ErrorEvent => ({
      type: undefined,
      message: `HTTP Client Error with status code: ${status}`,
      request: { url },
      contexts: { response: { status_code: status } },
      exception: {
        values: [{ type: 'Error', mechanism: { type: 'auto.http.client.fetch', handled: false } }],
      },
    });
    expect(isProviderOutageHttpEvent(http(503, 'https://www.trackmyopt.com/api/case-status/refresh'))).toBe(true);
    expect(isProviderOutageHttpEvent(http(502, 'https://www.trackmyopt.com/api/case-status/refresh'))).toBe(false);
    expect(isProviderOutageHttpEvent(http(503, 'https://www.trackmyopt.com/api/job-board/jobs'))).toBe(false);
  });

  it("treats MetaMask's injected inpage.js as foreign script (TRACKMYOPT-1Y)", () => {
    const metamask: ErrorEvent = {
      type: undefined,
      exception: {
        values: [
          {
            type: 'i',
            value: 'Failed to connect to MetaMask',
            stacktrace: { frames: [{ filename: 'app:///scripts/inpage.js', lineno: 12, colno: 4822 }] },
          },
          {
            type: 'Error',
            value: 'MetaMask extension not found',
            stacktrace: { frames: [{ filename: 'app:///scripts/inpage.js', lineno: 12, colno: 1696 }] },
          },
        ],
      },
    };
    expect(isForeignScriptEvent(metamask)).toBe(true);
    const ours = structuredClone(metamask);
    ours.exception!.values![0].stacktrace!.frames!.push({
      filename: 'https://www.trackmyopt.com/_next/static/chunks/app.js',
    });
    expect(isForeignScriptEvent(ours)).toBe(false);
  });
});
