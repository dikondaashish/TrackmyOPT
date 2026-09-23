import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PremiumProcessingCountdown } from "./PremiumProcessingCountdown";

const props = {
  caseId: "test-case",
  ppStartDate: "2026-05-12",
  currentStatus: "Premium Processing Clock Was Started",
  statusHistory: [{ status: "Premium Processing Clock Was Started", date: "2026-05-15", description: "Your premium processing clock started on May 12, 2026." }],
  onSaved: vi.fn(),
};

describe("PremiumProcessingCountdown", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-09-23T12:00:00Z"));
  });
  afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); vi.clearAllMocks(); });

  it.each(["Case Was Approved", "Case Was Denied", "Card Was Produced"])("hides the countdown after %s", (currentStatus) => {
    const { container } = render(<PremiumProcessingCountdown {...props} currentStatus={currentStatus} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows stopped guidance after an RFE without an overdue warning or date override", () => {
    render(<PremiumProcessingCountdown {...props} currentStatus="Request for Additional Evidence Was Sent" />);
    expect(screen.getByRole("heading")).toHaveTextContent(/clock stopped/i);
    expect(screen.queryByText(/overdue by/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Premium Processing start date")).not.toBeInTheDocument();
    expect(screen.getByText(/new 30-business-day period/i)).toBeInTheDocument();
  });

  it("shows an estimate of USCIS action, with no approval guarantee", () => {
    vi.setSystemTime(new Date("2026-05-12T12:00:00Z"));
    render(<PremiumProcessingCountdown {...props} />);
    expect(screen.getByRole("heading")).toHaveTextContent("30 business days remaining");
    expect(screen.getByText(/estimated action date/i)).toHaveTextContent("Jun 25, 2026");
    expect(screen.getByText(/does not guarantee approval/i)).toBeInTheDocument();
    expect(screen.getByText(/office closures/i)).toBeInTheDocument();
  });

  it("asks for a confirmed date without claiming an unknown clock is active", () => {
    render(<PremiumProcessingCountdown {...props} ppStartDate={null} currentStatus="Changed to Premium Processing" statusHistory={[]} />);
    expect(screen.getByRole("heading")).toHaveTextContent("Clock start unconfirmed");
    expect(screen.queryByText(/overdue by/i)).not.toBeInTheDocument();
  });

  it("rejects a future manual start before making a request", () => {
    const fetchMock = vi.fn(); vi.stubGlobal("fetch", fetchMock);
    render(<PremiumProcessingCountdown {...props} ppStartDate={null} statusHistory={[]} />);
    fireEvent.change(screen.getByLabelText("Premium Processing start date"), { target: { value: "2027-01-01" } });
    fireEvent.click(screen.getByRole("button", { name: "Save PP start date" }));
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByText(/valid start date that is not in the future/i)).toBeInTheDocument();
  });

  it("preserves the save contract for a confirmed manual start", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
    vi.stubGlobal("fetch", fetchMock);
    render(<PremiumProcessingCountdown {...props} ppStartDate={null} statusHistory={[]} />);
    fireEvent.change(screen.getByLabelText("Premium Processing start date"), { target: { value: "2026-05-12" } });
    fireEvent.click(screen.getByRole("button", { name: "Save PP start date" }));
    await waitFor(() => expect(props.onSaved).toHaveBeenCalledOnce());
    expect(fetchMock).toHaveBeenCalledWith("/api/case-status/pp-start", expect.objectContaining({ method: "PATCH", body: JSON.stringify({ case_id: "test-case", pp_start_date: "2026-05-12" }) }));
  });
});
