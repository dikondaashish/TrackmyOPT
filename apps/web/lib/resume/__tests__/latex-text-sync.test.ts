import { describe, expect, it } from "vitest";
import { findTextInLatex, normalizeSearchText } from "../latex-text-sync";

describe("findTextInLatex", () => {
    it("finds exact phrase in latex source", () => {
        const latex = String.raw`\item Built dashboards with Python and SQL`;
        const match = findTextInLatex(latex, "Python and SQL");
        expect(match).toEqual({ index: latex.indexOf("Python"), length: "Python and SQL".length });
    });

    it("finds a significant word when phrase differs slightly", () => {
        const latex = String.raw`\item Optimized PostgreSQL queries`;
        const match = findTextInLatex(latex, "PostgreSQL performance");
        expect(match?.index).toBe(latex.indexOf("PostgreSQL"));
    });

    it("returns null for very short selections", () => {
        expect(findTextInLatex("\\item Python", "P")).toBeNull();
        expect(normalizeSearchText("  hi  ")).toBe("hi");
    });
});
