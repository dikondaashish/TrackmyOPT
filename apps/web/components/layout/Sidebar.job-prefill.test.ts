import { describe, expect, it } from "vitest";

import { SIDEBAR_CONFIG } from "./Sidebar";

describe("job prefill dashboard navigation", () => {
  it("keeps the dedicated Chrome Job Prefill entry directly below Help", () => {
    const links = SIDEBAR_CONFIG.flatMap((entry) =>
      entry.type === "link" ? [entry.item] : []
    );
    const helpIndex = links.findIndex((link) => link.label === "Help");
    const prefillIndex = links.findIndex(
      (link) => link.label === "Chrome Job Prefill"
    );

    expect(helpIndex).toBeGreaterThanOrEqual(0);
    expect(prefillIndex).toBe(helpIndex + 1);
    expect(links[prefillIndex]?.href).toBe("/dashboard/extension");
  });
});

