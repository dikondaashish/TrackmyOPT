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

    it("joins PDF glyph selections that arrive as spaced letters", () => {
        const latex = String.raw`\item Python and SQL`;
        const match = findTextInLatex(latex, "P y t h o n");
        expect(match?.index).toBe(latex.indexOf("Python"));
        expect(match?.length).toBe("Python".length);
    });

    it("finds PDF text that latex escaped", () => {
        const latex = String.raw`Improved coverage to 100\% of endpoints`;
        const match = findTextInLatex(latex, "100%");
        expect(match?.index).toBe(latex.indexOf("100"));
    });

    it("returns null for very short selections", () => {
        expect(findTextInLatex("\\item Python", "P")).toBeNull();
        expect(normalizeSearchText("  hi  ")).toBe("hi");
    });
});
