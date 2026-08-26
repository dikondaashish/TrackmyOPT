import { describe, expect, it } from "vitest";
import {
    analyzeLatexBulletMetrics,
    bulletHasMeasurableMetric,
    extractLatexBulletBodies,
} from "../bullet-metrics";

describe("resume bullet metrics", () => {
    it.each([
        "Reduced outages by 60\\%",
        "Maintained 100+ production servers",
        "Supported 24/7 data-center operations",
        "Reduced MTTR to 47 minutes",
        "Processed 500K daily requests",
        "Saved \\$2.4M annually",
    ])("recognizes measurable impact in %s", (bullet) => {
        expect(bulletHasMeasurableMetric(bullet)).toBe(true);
    });

    it("does not count an unquantified responsibility as a metric", () => {
        expect(
            bulletHasMeasurableMetric("Responsible for maintaining production infrastructure")
        ).toBe(false);
    });

    it("extracts wrapped LaTeX items and reports a transparent ratio", () => {
        const latex = String.raw`
\begin{rBullets}
  \item Maintained 100+ Linux servers across
        three production sites.
  \item Documented operating procedures for the support team.
  \item Reduced incident response time by 35\%.
\end{rBullets}`;

        expect(extractLatexBulletBodies(latex)).toHaveLength(3);
        expect(analyzeLatexBulletMetrics(latex)).toEqual({
            total: 3,
            withMetrics: 2,
            ratio: 2 / 3,
        });
    });
});
