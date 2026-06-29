import { describe, expect, it } from "vitest";
import { evaluateApplyReadiness, isDownloadGateRequired } from "../apply-readiness";

const baseLatex = String.raw`
\def\name{Jane Smith}
\def\role{Senior Data Analyst}
\section{Experience}
\item Increased revenue by 40% using Python
\item Reduced costs by 25% for 1M users
\item Led team of 5 engineers
`;

describe("evaluateApplyReadiness", () => {
    it("marks ready when all checks pass", () => {
        const result = evaluateApplyReadiness({
            latex: baseLatex,
            jobDescription: "Role: Senior Data Analyst",
            jobTitle: "Senior Data Analyst",
            templateId: "professional",
            atsAnalysis: { score: 82, issues: [] },
            pdfParseOk: true,
        });
        expect(result.ready).toBe(true);
        expect(result.checks.every((c) => c.passed)).toBe(true);
    });

    it("requires download gate when score is low", () => {
        expect(
            isDownloadGateRequired({
                latex: baseLatex,
                jobDescription: "Role: Senior Data Analyst",
                atsAnalysis: { score: 62, issues: [] },
                pdfParseOk: true,
            })
        ).toBe(true);
    });
});
