import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EVerifyEmployerLookup } from "./EVerifyEmployerLookup";

describe("EVerifyEmployerLookup", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders an accessible lookup form and the required disclaimer", () => {
    render(<EVerifyEmployerLookup />);

    expect(
      screen.getByLabelText("Employer legal name or DBA")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Check E-Verify" })
    ).toBeDisabled();
    expect(
      screen.getByText(/Only employers with 5\+ reported employees are listed/)
    ).toBeInTheDocument();
  });

  it("shows enrollment details returned by the endpoint", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          company: "Microsoft",
          found: true,
          employer_name: "Microsoft",
          dba_name: "Microsoft Corporation",
          status: "enrolled",
          enrollment_date: "2026-03-20",
          termination_date: null,
          workforce_size_band: "10,000 and over",
          hiring_site_states: ["WA"],
          source: "cache",
          last_checked: "2026-08-25T04:00:00.000Z",
        }),
        { status: 200, headers: { "content-type": "application/json" } }
      )
    );

    render(<EVerifyEmployerLookup />);
    fireEvent.change(screen.getByLabelText("Employer legal name or DBA"), {
      target: { value: "Microsoft" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Check E-Verify" }));

    expect(await screen.findByText("E-Verify Enrolled")).toBeInTheDocument();
    expect(screen.getByText("Mar 20, 2026")).toBeInTheDocument();
    expect(screen.getByText("10,000 and over")).toBeInTheDocument();
    expect(screen.getByText("WA")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByText(/Cached result/)).toBeInTheDocument()
    );
  });
});
