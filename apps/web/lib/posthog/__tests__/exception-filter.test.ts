import { describe, expect, it } from "vitest";
import {
  extractExceptionMessages,
  isBenignReactDomTeardownError,
  isBenignWebSocketUnavailableError,
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
});
