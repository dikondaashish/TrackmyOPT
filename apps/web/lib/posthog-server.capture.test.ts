import { beforeEach, describe, expect, it, vi } from "vitest";

const identifyMock = vi.fn();
const captureMock = vi.fn();
const shutdownMock = vi.fn().mockResolvedValue(undefined);

vi.mock("posthog-node", () => {
  class PostHog {
    identify = identifyMock;
    capture = captureMock;
    shutdown = shutdownMock;
    constructor(_apiKey: string, _opts?: unknown) {}
  }
  return { PostHog };
});

describe("captureServerEvent", () => {
  beforeEach(() => {
    identifyMock.mockClear();
    captureMock.mockClear();
    shutdownMock.mockClear();
    process.env.POSTHOG_PROJECT_API_KEY = "phc_test";
    process.env.NEXT_PUBLIC_POSTHOG_HOST = "https://us.i.posthog.com";
    vi.resetModules();
  });

  it("identifies then captures with the same distinctId", async () => {
    const { captureServerEvent } = await import("./posthog-server");
    await captureServerEvent("user-42", "checkout_started", {
      plan_tier: "pro",
    });

    expect(identifyMock).toHaveBeenCalledWith({
      distinctId: "user-42",
      properties: { capture_source: "server" },
    });
    expect(captureMock).toHaveBeenCalledWith(
      expect.objectContaining({
        distinctId: "user-42",
        event: "checkout_started",
        properties: expect.objectContaining({
          plan_tier: "pro",
          capture_source: "server",
          supabase_user_id: "user-42",
        }),
      })
    );
    expect(identifyMock.mock.invocationCallOrder[0]).toBeLessThan(
      captureMock.mock.invocationCallOrder[0]
    );
  });

  it("skips empty distinctId", async () => {
    const { captureServerEvent } = await import("./posthog-server");
    await captureServerEvent("", "checkout_started");
    expect(identifyMock).not.toHaveBeenCalled();
    expect(captureMock).not.toHaveBeenCalled();
  });
});
