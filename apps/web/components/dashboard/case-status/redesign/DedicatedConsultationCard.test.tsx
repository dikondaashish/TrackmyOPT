import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DedicatedConsultationCard } from "./DedicatedConsultationCard";

const usePremiumStatusMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/premium/usePremiumStatus", () => ({
  usePremiumStatus: usePremiumStatusMock,
}));

const basePremiumStatus = {
  isLoading: false,
  error: null,
  expiresAt: null,
  customerId: null,
  refresh: vi.fn(),
};

describe("DedicatedConsultationCard", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date("2026-08-24T12:00:00.000Z"));
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("explains the Dedicated benefit without promising placement", () => {
    const onCompareDedicated = vi.fn();
    usePremiumStatusMock.mockReturnValue({
      ...basePremiumStatus,
      isPremium: false,
      planName: null,
      dedicatedStartedAt: null,
    });

    render(
      <DedicatedConsultationCard
        caseId="0ab1f4cb-95bd-41de-bae3-0c475984b1a0"
        onCompareDedicated={onCompareDedicated}
      />
    );

    expect(screen.getByText(/subject to availability, conflict checks and attorney acceptance/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Compare Dedicated" }));
    expect(onCompareDedicated).toHaveBeenCalledOnce();
  });

  it("keeps the request form locked until seven continuous days", async () => {
    usePremiumStatusMock.mockReturnValue({
      ...basePremiumStatus,
      isPremium: true,
      planName: "dedicated",
      dedicatedStartedAt: "2026-08-24T12:00:00.000Z",
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ ok: true, request: null }),
      })
    );

    render(
      <DedicatedConsultationCard
        caseId="0ab1f4cb-95bd-41de-bae3-0c475984b1a0"
        onCompareDedicated={vi.fn()}
      />
    );

    expect(await screen.findByText("Eligibility unlocks in 7 days")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Request consultation" })).not.toBeInTheDocument();
  });

  it("shows the structured request form to an eligible Dedicated member", async () => {
    usePremiumStatusMock.mockReturnValue({
      ...basePremiumStatus,
      isPremium: true,
      planName: "dedicated",
      dedicatedStartedAt: "2026-08-01T12:00:00.000Z",
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ ok: true, request: null }),
      })
    );

    render(
      <DedicatedConsultationCard
        caseId="0ab1f4cb-95bd-41de-bae3-0c475984b1a0"
        onCompareDedicated={vi.fn()}
      />
    );

    expect(await screen.findByRole("button", { name: "Request consultation" })).toBeInTheDocument();
    expect(screen.getByLabelText("Topic")).toBeInTheDocument();
    expect(screen.getByText(/do not enter an SSN/i)).toBeInTheDocument();

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
  });
});
