import { resolveJobTitle } from "./resume-job-title";

/** Sanitize a string for use in a download filename segment. */
function toFilenameSegment(value: string): string {
    return value
        .trim()
        .replace(/[^a-zA-Z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .slice(0, 80)
        .replace(/_+$/g, "");
}

const LATEX_NAME_PATTERNS = [
    /\\def\\name\{([^}]+)\}/,
    /\\name\{([^}]+)\}\{([^}]+)\}/,
    /\\name\{([^}]+)\}/,
    /\\textbf\{\\Huge\s+([^}]+)\}/,
    /\\textbf\{\\huge\s+([^}]+)\}/,
    /\\begin\{center\}\s*\\textbf\{([^}]+)\}/,
    /\\section\*?\{([^}]+)\}\s*%\s*name/i,
];

const LATEX_ROLE_PATTERN = /\\def\\role\{([^}]+)\}/;

/** Extract candidate name from generated LaTeX resume source. */
export function extractNameFromLatex(latex: string): string {
    for (const pattern of LATEX_NAME_PATTERNS) {
        const match = latex.match(pattern);
        if (match) {
            const name = match[2] ? `${match[1].trim()} ${match[2].trim()}` : match[1].trim();
            if (name.length > 1) return name;
        }
    }
    return "";
}

/** Extract target role from generated LaTeX when templates define \\def\\role{...}. */
export function extractRoleFromLatex(latex: string): string {
    const match = latex.match(LATEX_ROLE_PATTERN);
    return match?.[1]?.trim() ?? "";
}

export function buildResumePdfFilename(options: {
    latex: string;
    jobDescription: string;
    jobTitle?: string | null;
    templateId?: string | null;
}): string {
    const namePart = toFilenameSegment(extractNameFromLatex(options.latex));
    const roleFromJd = resolveJobTitle(options.jobTitle, options.jobDescription);
    const rolePart = toFilenameSegment(
        roleFromJd || extractRoleFromLatex(options.latex)
    );

    if (namePart && rolePart) return `${namePart}_Resume_${rolePart}.pdf`;
    if (namePart) return `${namePart}_Resume.pdf`;
    if (rolePart) return `Resume_${rolePart}.pdf`;
    return `Resume_${toFilenameSegment(options.templateId ?? '') || "generated"}.pdf`;
}
