import { describe, expect, it } from 'vitest';
import {
  extractExceptionMessages,
  isBenignAdSenseNetworkError,
  isBenignExtensionContentScriptError,
  isBenignInjectedBridgeRejection,
  isBenignInjectedOpenGraphProbeError,
  isBenignNavigationAbortError,
  isBenignWebkitMessageHandlersError,
  isBenignWebSocketUnavailableError,
  isOpaqueCrossOriginScriptError,
  shouldDropExceptionEvent,
} from '@/lib/posthog/posthog-browser';

describe('shouldDropExceptionEvent', () => {
  it('keeps DOM mutation failures without provenance', () => {
    expect(
      shouldDropExceptionEvent({
        $exception_values: [
          "Cannot read properties of null (reading 'removeChild')",
        ],
      })
    ).toBe(false);
  });

  it('keeps DOM mutation failures from nested exception payloads', () => {
    expect(
      shouldDropExceptionEvent({
        $exception_list: [
          {
            type: 'TypeError',
            value:
              "null is not an object (evaluating '(n=n.parentNode).parentNode.removeChild')",
          },
        ],
      })
    ).toBe(false);
  });

  it('keeps real product errors', () => {
    expect(
      shouldDropExceptionEvent({
        $exception_values: ['Failed to compile resume PDF'],
      })
    ).toBe(false);
  });

  it('handles empty properties', () => {
    expect(shouldDropExceptionEvent(undefined)).toBe(false);
    expect(extractExceptionMessages(undefined)).toBe('');
  });

  it('drops Supabase Realtime WebSocket unavailable', () => {
    expect(isBenignWebSocketUnavailableError('WebSocket not available')).toBe(
      true
    );
    expect(
      shouldDropExceptionEvent({
        $exception_values: ['WebSocket not available'],
      })
    ).toBe(true);
    expect(
      shouldDropExceptionEvent({
        $exception_values: [
          'The operation is insecure. WebSocket connection failed',
        ],
      })
    ).toBe(true);
  });

  it('drops network failures proven to originate inside AdSense', () => {
    const properties = {
      $exception_values: ['Failed to fetch'],
      $exception_list: [
        {
          type: 'TypeError',
          value: 'Failed to fetch',
          stacktrace: {
            frames: [
              {
                source: '/pagead/js/adsbygoogle.js',
                filename:
                  'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
              },
            ],
          },
        },
      ],
    };

    expect(isBenignAdSenseNetworkError(properties)).toBe(true);
    expect(shouldDropExceptionEvent(properties)).toBe(true);
  });

  it('keeps first-party network failures observable', () => {
    const properties = {
      $exception_values: ['Failed to fetch'],
      $exception_list: [
        {
          value: 'Failed to fetch',
          stacktrace: {
            frames: [{ source: '/_next/static/chunks/app.js' }],
          },
        },
      ],
    };

    expect(isBenignAdSenseNetworkError(properties)).toBe(false);
    expect(shouldDropExceptionEvent(properties)).toBe(false);
  });

  it('drops opaque cross-origin Script error placeholders', () => {
    const properties = {
      $exception_list: [{ type: 'Error', value: 'Script error.' }],
    };

    expect(isOpaqueCrossOriginScriptError(properties)).toBe(true);
    expect(shouldDropExceptionEvent(properties)).toBe(true);
  });

  it('keeps generic Safari Load failed errors without third-party evidence', () => {
    const properties = {
      $exception_values: ['Load failed'],
    };

    expect(isBenignAdSenseNetworkError(properties)).toBe(false);
    expect(shouldDropExceptionEvent(properties)).toBe(false);
  });

  it('drops Instagram/iOS webkit.messageHandlers bridge noise', () => {
    expect(
      isBenignWebkitMessageHandlersError(
        "undefined is not an object (evaluating 'window.webkit.messageHandlers')"
      )
    ).toBe(true);
    expect(
      shouldDropExceptionEvent({
        $exception_values: [
          "undefined is not an object (evaluating 'window.webkit.messageHandlers')",
        ],
      })
    ).toBe(true);
  });

  it('drops an injected script probing a missing og:type tag', () => {
    const message = `null is not an object (evaluating 'document.querySelector("meta[property='og:type']").content')`;

    expect(isBenignInjectedOpenGraphProbeError(message)).toBe(true);
    expect(
      shouldDropExceptionEvent({
        $exception_values: [message],
        $exception_list: [
          {
            value: message,
            stacktrace: { frames: [{ source: '/features/resume-ai' }] },
          },
        ],
      })
    ).toBe(true);
  });

  it('keeps unrelated querySelector failures observable', () => {
    expect(
      isBenignInjectedOpenGraphProbeError(
        `null is not an object (evaluating 'document.querySelector("#checkout").content')`
      )
    ).toBe(false);
  });

  it('keeps React hydration #418 observable', () => {
    expect(
      shouldDropExceptionEvent({
        $exception_values: [
          'Minified React error #418; visit https://react.dev/errors/418?args[]=text&args[]=',
        ],
      })
    ).toBe(false);
  });

  it('drops the exact Brave iOS wallet-injection failure', () => {
    expect(
      shouldDropExceptionEvent({
        $browser: 'Brave',
        $os: 'iOS',
        $exception_list: [
          {
            type: 'TypeError',
            value:
              "undefined is not an object (evaluating 'window.ethereum.selectedAddress = undefined')",
            stacktrace: {
              frames: [
                {
                  source: '/blog/h1b-approval-rates-by-company',
                  function: 'global code',
                  lineno: 1,
                  colno: 16,
                },
              ],
            },
          },
        ],
      })
    ).toBe(true);
  });

  it.each([
    { $browser: 'Chrome', $os: 'iOS' },
    { $browser: 'Brave', $os: 'Windows' },
    {},
    {
      $browser: 'Brave',
      $os: 'iOS',
      $exception_list: [
        {
          value:
            "undefined is not an object (evaluating 'window.ethereum.selectedAddress = undefined')",
          stacktrace: {
            frames: [
              {
                filename:
                  'https://www.trackmyopt.com/_next/static/chunks/app.js',
              },
            ],
          },
        },
      ],
    },
    {
      $browser: 'Brave',
      $os: 'iOS',
      $exception_list: [{ value: 'Failed to compile resume PDF' }],
    },
  ])(
    'keeps wallet-like failures without browser-injection evidence: %j',
    (properties) => {
      expect(
        shouldDropExceptionEvent({
          $exception_values: [
            "undefined is not an object (evaluating 'window.ethereum.selectedAddress = undefined')",
          ],
          ...properties,
        })
      ).toBe(false);
    }
  );

  it('reports insertBefore failures from application bundles', () => {
    const message =
      "NotFoundError: Failed to execute 'insertBefore' on 'Node': The node before which the new node is to be inserted is not a child of this node.";

    expect(
      shouldDropExceptionEvent({
        $exception_values: [message],
        $exception_list: [
          {
            value: message,
            stacktrace: { frames: [{ source: '/_next/static/chunks/app.js' }] },
          },
        ],
      })
    ).toBe(false);
  });

  it('drops injected page-bridge rejections', () => {
    const message =
      'Non-Error promise rejection captured with value: Object Not Found Matching Id:5, MethodName:update, ParamCount:4';

    expect(isBenignInjectedBridgeRejection(message)).toBe(true);
    expect(shouldDropExceptionEvent({ $exception_values: [message] })).toBe(
      true
    );
  });

  it('drops extension content-script globals', () => {
    const message =
      "'TypeError' captured as exception with message: 'undefined is not an object (evaluating 'contentScriptData.init_ts')'";

    expect(isBenignExtensionContentScriptError(message)).toBe(true);
    expect(shouldDropExceptionEvent({ $exception_values: [message] })).toBe(
      true
    );
  });

  it('drops promise aborts caused by navigating away', () => {
    const message =
      'AbortError: Promise was rejected because the browsing context is going away';

    expect(isBenignNavigationAbortError(message)).toBe(true);
    expect(shouldDropExceptionEvent({ $exception_values: [message] })).toBe(
      true
    );
  });

  it('drops ResizeObserver loop noise', () => {
    expect(
      shouldDropExceptionEvent({
        $exception_values: [
          'ResizeObserver loop completed with undelivered notifications.',
        ],
      })
    ).toBe(true);
  });

  it('drops AdSense fluid width TagErrors', () => {
    expect(
      shouldDropExceptionEvent({
        $exception_values: [
          'TagError: adsbygoogle.push() error: Fluid responsive ads must be at least 250px wide: availableWidth=139',
        ],
      })
    ).toBe(true);
  });

  it('drops AdSense empty-slot and duplicate-ins TagErrors', () => {
    expect(
      shouldDropExceptionEvent({
        $exception_values: [
          'TagError: adsbygoogle.push() error: No slot size for availableWidth=0',
        ],
      })
    ).toBe(true);
    expect(
      shouldDropExceptionEvent({
        $exception_values: [
          "TagError: adsbygoogle.push() error: All 'ins' elements in the DOM with class=adsbygoogle already have ads in them.",
        ],
      })
    ).toBe(true);
  });

  it('keeps genuine aborts and unrelated rejections observable', () => {
    expect(
      isBenignNavigationAbortError('AbortError: The user aborted a request.')
    ).toBe(false);
    expect(
      isBenignInjectedBridgeRejection(
        'Object Not Found in case status response'
      )
    ).toBe(false);
    expect(
      shouldDropExceptionEvent({
        $exception_values: ['RangeError: Maximum call stack size exceeded.'],
      })
    ).toBe(false);
  });
});
