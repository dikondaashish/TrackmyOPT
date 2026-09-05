import { describe, expect, it } from "vitest";
import { getRelatedPostsForSlug } from "./related-posts";

describe("getRelatedPostsForSlug", () => {
  it("returns related posts without self-links", () => {
    const stem = getRelatedPostsForSlug("stem-opt-employer-requirements");
    expect(stem.length).toBeGreaterThanOrEqual(2);
    expect(stem.every((p) => p.href.startsWith("/") && p.title)).toBe(true);
    expect(stem.some((p) => p.href.endsWith("/stem-opt-employer-requirements"))).toBe(
      false,
    );

    const self = getRelatedPostsForSlug("stem-opt-extension-guide");
    expect(self.some((p) => p.href.includes("stem-opt-extension-guide"))).toBe(false);
  });
});
