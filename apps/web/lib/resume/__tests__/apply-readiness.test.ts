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

    it("recognizes escaped percentages and infrastructure scale in generated LaTeX", () => {
        const latex = String.raw`
\def\name{Ashish Dikonda}
\def\role{Data Center Technician}
\section{Summary}
Data Center Technician supporting resilient infrastructure.
\section{Experience}
\begin{rBullets}
  \item Maintained 100+ Linux servers across three production sites.
  \item Supported 24/7 data-center operations and incident response.
  \item Reduced equipment-related downtime by 35\%.
\end{rBullets}`;

        const result = evaluateApplyReadiness({
            latex,
            jobDescription: "Role: Data Center Technician",
            jobTitle: "Data Center Technician",
            templateId: "professional",
            atsAnalysis: { score: 82, issues: [] },
            pdfParseOk: true,
        });
        const metrics = result.checks.find((check) => check.id === "metrics");

        expect(metrics).toMatchObject({
            passed: true,
            detail: "100% quantified (3/3 bullets)",
        });
    });
});
