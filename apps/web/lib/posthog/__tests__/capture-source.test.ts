import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi, beforeEach } from "vitest";

const captureMock = vi.fn();
const shutdownMock = vi.fn().mockResolvedValue(undefined);

vi.mock("posthog-node", () => ({
  PostHog: class MockPostHog {
    identify = vi.fn();
    capture = captureMock;
    shutdown = shutdownMock;
  },
}));

vi.mock("posthog-js", () => ({
  default: {
    capture: vi.fn(),
    reset: vi.fn(),
  },
}));

import posthog from "posthog-js";
import { captureServerEvent } from "@/lib/posthog-server";
import {
  captureInsuranceEligibilityChecked,
  captureSignOut,
} from "@/lib/posthog-client";

const WEB_ROOT = join(__dirname, "../../..");

/** Phase 2.6 migration sites — must use wrappers, not raw posthog.capture. */
const SERVER_CAPTURE_SITES = [
  "app/api/documents/upload/route.ts",
  "app/api/extension/job-application/route.ts",
  "app/auth/signout/route.ts",
  "app/dashboard/career/job-tracker/actions.ts",
] as const;

const CLIENT_CAPTURE_SITES = [
  "app/dashboard/opt-health-insurance-finder/page.tsx",
  "app/dashboard/opt-health-insurance-finder/results/page.tsx",
] as const;

describe("capture_source standardization (2.6)", () => {
  beforeEach(() => {
    captureMock.mockClear();
    shutdownMock.mockClear();
    vi.mocked(posthog.capture).mockClear();
    vi.mocked(posthog.reset).mockClear();
    process.env.POSTHOG_PROJECT_API_KEY = "phc_test";
  });

  it("captureServerEvent always sets capture_source server last", async () => {
    await captureServerEvent("user-1", "document_uploaded", {
      document_type: "ead",
      capture_source: "client",
    });

    expect(captureMock).toHaveBeenCalledWith(
      expect.objectContaining({
        distinctId: "user-1",
        event: "document_uploaded",
        properties: expect.objectContaining({
          document_type: "ead",
          capture_source: "server",
        }),
      })
    );
  });

  it("captureSignOut routes through captureClientEvent", async () => {
    vi.useFakeTimers();
    const signOutPromise = captureSignOut("profile_menu");
    await vi.runAllTimersAsync();
    await signOutPromise;
    vi.useRealTimers();

    expect(posthog.capture).toHaveBeenCalledWith(
      "user_signed_out",
      expect.objectContaining({
        source: "profile_menu",
        capture_source: "client",
      })
    );
    expect(posthog.reset).toHaveBeenCalled();
  });

  it("insurance helpers include capture_source via captureClientEvent", () => {
    captureInsuranceEligibilityChecked({
      state: "CA",
      visa_type: "F-1",
      income_bucket: "0-2000",
    });

    expect(posthog.capture).toHaveBeenCalledWith(
      "insurance_eligibility_checked",
      expect.objectContaining({
        capture_source: "client",
        state: "CA",
      })
    );
  });

  for (const relPath of SERVER_CAPTURE_SITES) {
    it(`${relPath} uses captureServerEvent (no raw posthog.capture)`, () => {
      const content = readFileSync(join(WEB_ROOT, relPath), "utf8");
      expect(content).toMatch(/captureServerEvent/);
      expect(content).not.toMatch(/posthog\.capture/);
    });
  }

  for (const relPath of CLIENT_CAPTURE_SITES) {
    it(`${relPath} uses posthog-client helpers (no raw posthog.capture)`, () => {
      const content = readFileSync(join(WEB_ROOT, relPath), "utf8");
      expect(content).toMatch(/@\/lib\/posthog-client/);
      expect(content).not.toMatch(/posthog\.capture/);
    });
  }
});
