import { describe, expect, it } from "vitest";
import { latexToPlainText, splitResumeSections } from "../latex-to-plain-text";

describe("latexToPlainText", () => {
    it("extracts name and role from def commands", () => {
        const latex = String.raw`
\begin{document}
\def\name{Jane Smith}
\def\role{Senior Data Analyst}
\section{Skills}
\item Python
\item SQL
\end{document}`;
        const text = latexToPlainText(latex);
        expect(text).toContain("Jane Smith");
        expect(text).toContain("Role: Senior Data Analyst");
        expect(text).toContain("Python");
    });

    it("returns empty string for empty input", () => {
        expect(latexToPlainText("")).toBe("");
    });
});

describe("splitResumeSections", () => {
    it("splits skills and experience sections", () => {
        const plain = [
            "Summary",
            "Data analyst with 5 years experience",
            "Skills",
            "Python, SQL, AWS",
            "Experience",
            "Built dashboards at Acme",
        ].join("\n");

        const sections = splitResumeSections(plain);
        expect(sections.skills).toContain("Python");
        expect(sections.experience).toContain("Built dashboards");
    });
});
