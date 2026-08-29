import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OfficialEVerifyEmployerSearch } from "./OfficialEVerifyEmployerSearch";

describe("OfficialEVerifyEmployerSearch", () => {
  it("shows the official USCIS search with an accessible fallback link", () => {
    render(<OfficialEVerifyEmployerSearch />);

    expect(
      screen.getByRole("heading", {
        name: "Official USCIS E-Verify Employer Search",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByTitle("USCIS E-Verify Employer Search")
    ).toHaveAttribute(
      "src",
      expect.stringContaining("bigdataanalyticspub-sb.uscis.dhs.gov")
    );
    expect(screen.getByRole("link", { name: /Open on USCIS/ })).toHaveAttribute(
      "href",
      "https://www.e-verify.gov/e-verify-employer-search"
    );
  });
});
