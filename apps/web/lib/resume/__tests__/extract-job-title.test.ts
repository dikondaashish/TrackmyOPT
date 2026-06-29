import { describe, expect, it } from "vitest";
import {
    extractJobTitle,
    isLikelyFilename,
    normalizeRoleTitle,
    resolveJobTitle,
} from "../extract-job-title";
import { buildResumePdfFilename, extractRoleFromLatex } from "../build-resume-filename";

describe("extractJobTitle", () => {
    it("reads Role: label", () => {
        const jd = "Company: Acme\nRole: Senior Data Analyst\n\nRequirements...";
        expect(extractJobTitle(jd)).toBe("Senior Data Analyst");
    });

    it("reads Job Title: label", () => {
        expect(extractJobTitle("Job Title: Software Engineer II")).toBe("Software Engineer II");
    });

    it("uses first line when it looks like a title", () => {
        expect(extractJobTitle("Senior Data Analyst\nAcme Corp\nFull job text")).toBe(
            "Senior Data Analyst"
        );
    });

    it("strips at-company suffix from stored title", () => {
        expect(normalizeRoleTitle("Senior Data Analyst at Zomato")).toBe("Senior Data Analyst");
    });
});

describe("resolveJobTitle", () => {
    it("prefers JD extraction over filename stored title", () => {
        expect(
            resolveJobTitle("job_posting.pdf", "Role: Senior Data Analyst\nLong description")
        ).toBe("Senior Data Analyst");
    });

    it("detects upload filenames", () => {
        expect(isLikelyFilename("job_description.pdf")).toBe(true);
    });
});

describe("buildResumePdfFilename", () => {
    it("includes name and role from JD labels", () => {
        const latex = String.raw`\name{Jane}{Smith}`;
        const filename = buildResumePdfFilename({
            latex,
            jobDescription: "Role: Senior Data Analyst",
            jobTitle: null,
        });
        expect(filename).toBe("resume_Jane_Smith_Senior_Data_Analyst.pdf");
    });

    it("includes name from \\def\\name and role from \\def\\role", () => {
        const latex = String.raw`\def\name{Jane Smith}` + "\n" + String.raw`\def\role{Senior Data Analyst}`;
        const filename = buildResumePdfFilename({
            latex,
            jobDescription: "",
            jobTitle: null,
        });
        expect(filename).toBe("resume_Jane_Smith_Senior_Data_Analyst.pdf");
    });

    it("extracts role from latex def", () => {
        expect(extractRoleFromLatex(String.raw`\def\role{Software Engineer}`)).toBe(
            "Software Engineer"
        );
    });
});
