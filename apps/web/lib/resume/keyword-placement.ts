import { splitResumeSections } from "./latex-to-plain-text";

export interface KeywordPlacement {
    keyword: string;
    inSummary: boolean;
    inSkills: boolean;
    inExperience: boolean;
    /** True when keyword appears in only one section (ATS prefers multiple). */
    needsBetterPlacement: boolean;
}

function containsKeyword(haystack: string, keyword: string): boolean {
    if (!haystack || !keyword) return false;
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`\\b${escaped}\\b`, "i").test(haystack);
}

/** Map JD keywords to section placement in generated resume text. */
export function computeKeywordPlacement(
    plainResumeText: string,
    keywords: string[]
): KeywordPlacement[] {
    const sections = splitResumeSections(plainResumeText);
    const unique = [...new Set(keywords.map((k) => k.trim()).filter(Boolean))];

    return unique.map((keyword) => {
        const inSummary = containsKeyword(sections.summary, keyword);
        const inSkills = containsKeyword(sections.skills, keyword);
        const inExperience = containsKeyword(sections.experience, keyword);
        const placementCount = [inSummary, inSkills, inExperience].filter(Boolean).length;

        return {
            keyword,
            inSummary,
            inSkills,
            inExperience,
            needsBetterPlacement: placementCount === 1,
        };
    });
}

export function formatPlacementHint(placement: KeywordPlacement): string {
    const parts: string[] = [];
    if (placement.inSummary) parts.push("Summary ✓");
    else parts.push("Summary ✗");
    if (placement.inSkills) parts.push("Skills ✓");
    else parts.push("Skills ✗");
    if (placement.inExperience) parts.push("Experience ✓");
    else parts.push("Experience ✗");

    if (placement.needsBetterPlacement) {
        return `${placement.keyword} — ${parts.join(" | ")} (add to another section)`;
    }
    return `${placement.keyword} — ${parts.join(" | ")}`;
}
