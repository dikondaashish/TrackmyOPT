/**
 * Strip LaTeX to plain text for ATS scanning and clipboard export.
 * Not perfect — good enough for keyword matching and readability checks.
 */

function decodeLatexEscapes(text: string): string {
    return text
        .replace(/\\%/g, "%")
        .replace(/\\&/g, "&")
        .replace(/\\#/g, "#")
        .replace(/\\_/g, "_")
        .replace(/\\\$/g, "$")
        .replace(/\\textbackslash\{\}/g, "\\")
        .replace(/\\textbf\{([^}]*)\}/g, "$1")
        .replace(/\\textit\{([^}]*)\}/g, "$1")
        .replace(/\\emph\{([^}]*)\}/g, "$1")
        .replace(/\\href\{[^}]*\}\{([^}]*)\}/g, "$1")
        .replace(/\\url\{([^}]*)\}/g, "$1");
}

/** Remove common LaTeX preamble / document wrapper noise. */
function stripPreamble(latex: string): string {
    const beginDoc = latex.indexOf("\\begin{document}");
    if (beginDoc >= 0) {
        const endDoc = latex.lastIndexOf("\\end{document}");
        const body =
            endDoc > beginDoc
                ? latex.slice(beginDoc + "\\begin{document}".length, endDoc)
                : latex.slice(beginDoc + "\\begin{document}".length);
        return body;
    }
    return latex;
}

export function latexToPlainText(latex: string): string {
    if (!latex?.trim()) return "";

    let text = stripPreamble(latex);

    // \def\name{Full Name} → line with name
    text = text.replace(/\\def\\name\{([^}]+)\}/g, "$1\n");
    text = text.replace(/\\def\\role\{([^}]+)\}/g, "Role: $1\n");

    // Section headers
    text = text.replace(
        /\\(?:section|subsection|cvsection|resumeSection)\*?\{([^}]+)\}/gi,
        "\n\n$1\n"
    );

    // List items → bullet lines
    text = text.replace(/\\item\s+/g, "\n• ");

    // Remove remaining commands with braced args (keep inner text)
    for (let i = 0; i < 5; i++) {
        text = text.replace(/\\[a-zA-Z@]+\*?(?:\[[^\]]*\])?\{([^{}]*)\}/g, "$1");
    }

    // Remove leftover commands
    text = text.replace(/\\[a-zA-Z@]+\*?(?:\[[^\]]*\])?/g, " ");
    text = text.replace(/[{}]/g, " ");
    text = decodeLatexEscapes(text);

    return text
        .split("\n")
        .map((line) => line.replace(/\s+/g, " ").trim())
        .filter(Boolean)
        .join("\n");
}

export interface ResumeSections {
    summary: string;
    skills: string;
    experience: string;
    education: string;
    full: string;
}

/** Split plain resume text into major sections for keyword placement. */
export function splitResumeSections(plainText: string): ResumeSections {
    const lines = plainText.split("\n");
    const sections: ResumeSections = {
        summary: "",
        skills: "",
        experience: "",
        education: "",
        full: plainText,
    };

    type SectionKey = keyof Omit<ResumeSections, "full">;
    let current: SectionKey | null = null;

    const matchers: { key: SectionKey; pattern: RegExp }[] = [
        { key: "summary", pattern: /^(professional\s+)?summary|objective|profile/i },
        { key: "skills", pattern: /^skills|technical\s+skills|competencies/i },
        { key: "experience", pattern: /^experience|work\s+history|employment/i },
        { key: "education", pattern: /^education|academic/i },
    ];

    const buckets: Record<SectionKey, string[]> = {
        summary: [],
        skills: [],
        experience: [],
        education: [],
    };

    for (const line of lines) {
        const header = matchers.find((m) => m.pattern.test(line.trim()));
        if (header && line.length < 80) {
            current = header.key;
            continue;
        }
        if (current) buckets[current].push(line);
    }

    sections.summary = buckets.summary.join("\n");
    sections.skills = buckets.skills.join("\n");
    sections.experience = buckets.experience.join("\n");
    sections.education = buckets.education.join("\n");

    return sections;
}
