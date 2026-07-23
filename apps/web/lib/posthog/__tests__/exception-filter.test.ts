import { describe, expect, it } from "vitest";
import {
  extractExceptionMessages,
  isBenignAdSenseNetworkError,
  isBenignReactDomTeardownError,
  isBenignWebkitMessageHandlersError,
  isBenignWebSocketUnavailableError,
  isOpaqueCrossOriginScriptError,
  shouldDropExceptionEvent,
} from "@/lib/posthog/posthog-browser";

describe("isBenignReactDomTeardownError", () => {
  it("matches Chrome removeChild null race", () => {
    expect(
      isBenignReactDomTeardownError(
        "Cannot read properties of null (reading 'removeChild')"
      )
    ).toBe(true);
  });

  it("matches Safari parentNode.removeChild race", () => {
    expect(
      isBenignReactDomTeardownError(
        "null is not an object (evaluating '(n=n.parentNode).parentNode.removeChild')"
      )
    ).toBe(true);
  });

  it("does not drop unrelated TypeErrors", () => {
    expect(
      isBenignReactDomTeardownError("Cannot read properties of null (reading 'map')")
    ).toBe(false);
  });

  it("does not drop React hydration #418", () => {
    expect(
      isBenignReactDomTeardownError(
        "Minified React error #418; visit https://react.dev/errors/418"
      )
    ).toBe(false);
  });
});

describe("shouldDropExceptionEvent", () => {
  it("reads $exception_values from PostHog payloads", () => {
    expect(
      shouldDropExceptionEvent({
        $exception_values: [
          "Cannot read properties of null (reading 'removeChild')",
        ],
      })
    ).toBe(true);
  });

  it("reads nested $exception_list.value", () => {
    expect(
      shouldDropExceptionEvent({
        $exception_list: [
          {
            type: "TypeError",
            value:
              "null is not an object (evaluating '(n=n.parentNode).parentNode.removeChild')",
          },
        ],
      })
    ).toBe(true);
  });

  it("keeps real product errors", () => {
    expect(
      shouldDropExceptionEvent({
        $exception_values: ["Failed to compile resume PDF"],
      })
    ).toBe(false);
  });

  it("handles empty properties", () => {
    expect(shouldDropExceptionEvent(undefined)).toBe(false);
    expect(extractExceptionMessages(undefined)).toBe("");
  });

  it("drops Supabase Realtime WebSocket unavailable", () => {
    expect(isBenignWebSocketUnavailableError("WebSocket not available")).toBe(
      true
    );
    expect(
      shouldDropExceptionEvent({
        $exception_values: ["WebSocket not available"],
      })
    ).toBe(true);
    expect(
      shouldDropExceptionEvent({
        $exception_values: [
          "The operation is insecure. WebSocket connection failed",
        ],
      })
    ).toBe(true);
  });

  it("drops network failures proven to originate inside AdSense", () => {
    const properties = {
      $exception_values: ["Failed to fetch"],
      $exception_list: [
        {
          type: "TypeError",
          value: "Failed to fetch",
          stacktrace: {
            frames: [
              {
                source: "/pagead/js/adsbygoogle.js",
                filename:
                  "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js",
              },
            ],
          },
        },
      ],
    };

    expect(isBenignAdSenseNetworkError(properties)).toBe(true);
    expect(shouldDropExceptionEvent(properties)).toBe(true);
  });

  it("keeps first-party network failures observable", () => {
    const properties = {
      $exception_values: ["Failed to fetch"],
      $exception_list: [
        {
          value: "Failed to fetch",
          stacktrace: {
            frames: [{ source: "/_next/static/chunks/app.js" }],
          },
        },
      ],
    };

    expect(isBenignAdSenseNetworkError(properties)).toBe(false);
    expect(shouldDropExceptionEvent(properties)).toBe(false);
  });

  it("drops opaque cross-origin Script error placeholders", () => {
    const properties = {
      $exception_list: [{ type: "Error", value: "Script error." }],
    };

    expect(isOpaqueCrossOriginScriptError(properties)).toBe(true);
    expect(shouldDropExceptionEvent(properties)).toBe(true);
  });

  it("keeps generic Safari Load failed errors without third-party evidence", () => {
    const properties = {
      $exception_values: ["Load failed"],
    };

    expect(isBenignAdSenseNetworkError(properties)).toBe(false);
    expect(shouldDropExceptionEvent(properties)).toBe(false);
  });

  it("drops Instagram/iOS webkit.messageHandlers bridge noise", () => {
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

  it("keeps React hydration #418 observable", () => {
    expect(
      shouldDropExceptionEvent({
        $exception_values: [
          "Minified React error #418; visit https://react.dev/errors/418?args[]=text&args[]=",
        ],
      })
    ).toBe(false);
  });
});
