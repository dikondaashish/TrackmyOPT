import { describe, expect, it } from "vitest";
import { calculateAtsFinalScore } from "../ats-score";

describe("calculateAtsFinalScore", () => {
    it("does not double-penalize content recommendations already included by the AI rubric", () => {
        expect(
            calculateAtsFinalScore({
                overallScore: 69,
                keywordScore: 64,
                issues: [
                    "LOW METRICS: 2/6 bullets include measurable results.",
                    "RECOMMENDED: Add a professional summary.",
                ],
            })
        ).toEqual({ contentScore: 69, formatPenalty: 0, finalScore: 69 });
    });

    it("penalizes only actual ATS parsing and section problems", () => {
        expect(
            calculateAtsFinalScore({
                overallScore: 90,
                keywordScore: 80,
                issues: [
                    "CRITICAL: Contains images.",
                    "WARNING: Multi-column layout detected.",
                ],
            })
        ).toEqual({ contentScore: 90, formatPenalty: 20, finalScore: 70 });
    });

    it("uses a normalized keyword score when the overall score is malformed", () => {
        expect(
            calculateAtsFinalScore({
                overallScore: "not-a-score",
                keywordScore: "76",
                issues: [],
            })
        ).toEqual({ contentScore: 76, formatPenalty: 0, finalScore: 76 });
    });
});
