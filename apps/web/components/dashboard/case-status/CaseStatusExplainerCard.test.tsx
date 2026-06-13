import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { CaseStatusExplainerCard } from "./CaseStatusExplainerCard";
import { ANALYTICS_CONSENT_CHANGE_EVENT } from "@/lib/posthog-client";

const captureCaseStatusExplainerViewed = vi.fn();

vi.mock("@/lib/posthog-client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/posthog-client")>();
  return {
    ...actual,
    captureCaseStatusExplainerViewed: (...args: unknown[]) =>
      captureCaseStatusExplainerViewed(...args),
  };
});

const hasAnalyticsConsent = vi.fn();

vi.mock("@/lib/cookie-consent", () => ({
  hasAnalyticsConsent: () => hasAnalyticsConsent(),
}));

describe("CaseStatusExplainerCard analytics", () => {
  beforeEach(() => {
    captureCaseStatusExplainerViewed.mockClear();
    hasAnalyticsConsent.mockReturnValue(false);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("fires case_status_explainer_viewed with status_category when card renders and consent is granted", async () => {
    hasAnalyticsConsent.mockReturnValue(true);

    render(
      <CaseStatusExplainerCard
        currentStatus="Case Is Still Being Processed By USCIS"
        lastCheckedAt="2026-06-13T12:00:00.000Z"
        formatLastChecked={() => "Jun 13, 2026"}
      />
    );

    await waitFor(() => {
      expect(captureCaseStatusExplainerViewed).toHaveBeenCalledTimes(1);
    });

    expect(captureCaseStatusExplainerViewed).toHaveBeenCalledWith({
      status_category: "pending",
    });
  });

  it("does not capture before analytics consent", async () => {
    hasAnalyticsConsent.mockReturnValue(false);

    render(
      <CaseStatusExplainerCard
        currentStatus="Card Was Delivered To Me By The Post Office"
        lastCheckedAt="2026-06-13T12:00:00.000Z"
        formatLastChecked={() => "Jun 13, 2026"}
      />
    );

    await waitFor(() => {
      expect(captureCaseStatusExplainerViewed).not.toHaveBeenCalled();
    });
  });

  it("captures after analytics consent is accepted", async () => {
    hasAnalyticsConsent.mockReturnValue(false);

    render(
      <CaseStatusExplainerCard
        currentStatus="Case Was Received and A Receipt Notice Was Sent"
        lastCheckedAt="2026-06-13T12:00:00.000Z"
        formatLastChecked={() => "Jun 13, 2026"}
      />
    );

    hasAnalyticsConsent.mockReturnValue(true);
    window.dispatchEvent(
      new CustomEvent(ANALYTICS_CONSENT_CHANGE_EVENT, { detail: { accepted: true } })
    );

    await waitFor(() => {
      expect(captureCaseStatusExplainerViewed).toHaveBeenCalledTimes(1);
    });

    expect(captureCaseStatusExplainerViewed).toHaveBeenCalledWith({
      status_category: "received",
    });
  });

  it("does not render or capture without last_checked_at", () => {
    hasAnalyticsConsent.mockReturnValue(true);

    const { container } = render(
      <CaseStatusExplainerCard
        currentStatus="Case Is Still Being Processed By USCIS"
        lastCheckedAt={null}
        formatLastChecked={() => "—"}
      />
    );

    expect(container).toBeEmptyDOMElement();
    expect(captureCaseStatusExplainerViewed).not.toHaveBeenCalled();
  });
});
