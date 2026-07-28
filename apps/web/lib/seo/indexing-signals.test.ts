import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";
import robots from "@/app/robots";

const require = createRequire(import.meta.url);
const nextConfig = require("../../next.config.js") as {
    redirects(): Promise<
        Array<{ source: string; destination: string; permanent: boolean }>
    >;
};

function blogPageFiles(): string[] {
    const blogRoot = path.join(process.cwd(), "app", "blog");
    return fs
        .readdirSync(blogRoot, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => path.join(blogRoot, entry.name, "page.tsx"))
        .filter((file) => fs.existsSync(file));
}

describe("indexing signals", () => {
    it("lets crawlers see login noindex while protecting private routes", () => {
        const serializedRules = JSON.stringify(robots().rules);

        expect(serializedRules).not.toContain('"/login"');
        expect(serializedRules).not.toContain('"/auth/"');
        expect(serializedRules).toContain('"/dashboard/"');
        expect(serializedRules).toContain('"/api/"');
    });

    it("redirects every stale URL reported by Search Console", async () => {
        const redirects = await nextConfig.redirects();
        const redirectMap = Object.fromEntries(
            redirects.map(({ source, destination }) => [source, destination]),
        );

        expect(redirectMap).toMatchObject(
            Object.fromEntries([
                [
                    "/blog/opt-unemployment-rules-90-day-limit",
                    "/blog/90-day-unemployment-rule-opt",
                ],
                [
                    "/blog/opt-job-relevance-letter-guide",
                    "/blog/opt-job-related-to-degree",
                ],
                [
                    "/blog/answering-sponsorship-questions-interviews",
                    "/blog/how-to-answer-sponsorship-question",
                ],
                [
                    "/blog/h1b-cap-gap-extension-guide",
                    "/blog/h1b-cap-gap-extension",
                ],
                [
                    "/blog/opt-taxes-international-students",
                    "/blog/f1-student-tax-filing-guide-2026",
                ],
                [
                    "/blog/h1b-visa-alternatives-opt-expires",
                    "/blog/h1b-alternatives-work-visas",
                ],
                [
                    "/blog/h1b-lottery-registration-opt",
                    "/answers/what-is-h1b-lottery",
                ],
                [
                    "/blog/fall-out-of-f1-status-reinstatement-options",
                    "/blog/fall-out-of-f1-status-options",
                ],
                ["/register", "/login"],
                ["/auth/sign-up", "/login"],
            ]),
        );
    });

    it("keeps blog canonicals and internal account links on live URLs", () => {
        for (const file of blogPageFiles()) {
            const source = fs.readFileSync(file, "utf8");

            expect(source, file).not.toContain("https://trackmyopt.com");
            expect(source, file).not.toMatch(/href=["']\/(?:register|auth\/sign-up)["']/);
        }
    });
});
