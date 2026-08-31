import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import EVerifyEmployerSearchPage from "./page";

describe("EVerifyEmployerSearchPage", () => {
  it("publishes the official search with STEM OPT guidance and internal next steps", () => {
    const { container } = render(<EVerifyEmployerSearchPage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "E-Verify employer search",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByTitle("USCIS E-Verify Employer Search")
    ).toHaveAttribute(
      "src",
      expect.stringContaining("bigdataanalyticspub-sb.uscis.dhs.gov")
    );
    expect(
      screen.getByRole("heading", { name: "E-Verify employer search FAQ" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Track USCIS case status/ })
    ).toHaveAttribute("href", "/features/case-status");
    expect(
      screen.getByRole("link", { name: /Research H-1B sponsors/ })
    ).toHaveAttribute("href", "/features/sponsors");

    const jsonLd = container.querySelector('script[type="application/ld+json"]');
    expect(jsonLd?.textContent).toContain('"@type":"FAQPage"');
    expect(jsonLd?.textContent).toContain('"@type":"BreadcrumbList"');
  });
});
