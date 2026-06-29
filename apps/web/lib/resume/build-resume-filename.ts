import { resolveJobTitle } from "./extract-job-title";

/** Sanitize a string for use in a download filename segment. */
export function toFilenameSegment(value: string): string {
    return value
        .trim()
        .replace(/[^a-zA-Z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
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

    if (namePart && rolePart) return `resume_${namePart}_${rolePart}.pdf`;
    if (namePart) return `resume_${namePart}.pdf`;
    if (rolePart) return `resume_${rolePart}.pdf`;
    return `resume_${options.templateId ?? "generated"}.pdf`;
}
