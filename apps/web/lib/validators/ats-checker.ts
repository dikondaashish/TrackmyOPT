
interface AtsCheckResult {
    passed: boolean;
    issues: string[];
}

export function checkAtsCompliance(latex: string): AtsCheckResult {
    const issues: string[] = [];

    // 1. Check for Forbidden Commands (Graphics/Images)
    if (latex.includes('\\includegraphics')) {
        issues.push("CRITICAL: Resume contains images/graphics via \\includegraphics. ATS parsers cannot read these.");
    }

    // 2. Check for Tables used for layout
    // (Data tables are sometimes OK, but risky. For MVP, we warn on any table)
    if (latex.includes('\\begin{tabular}') || latex.includes('\\begin{tabularx}')) {
        issues.push("WARNING: Tables detected. ATS parsers often scramble table data. Use columns or lists instead.");
    }

    // 3. Check for Multi-column layouts
    if (latex.includes('\\begin{multicols}') || latex.includes('\\twocolumn')) {
        issues.push("WARNING: Multi-column layout detected. Some older ATS parsers read across columns instead of down.");
    }

    // 4. Check for Standard Sections
    const requiredSections = [
        'Education',
        'Experience',
        'Skills'
    ];

    // Simple check: look for section commands containing these words
    // \section{Education} or \section*{Education}
    // Standard section commands to look for
    const sectionCommands = ['section', 'subsection', 'cvsection', 'resumeSection', 'header'];

    // Construct regex pattern:
    // \\(section|cvsection|...)\*?\s*\{[^}]*SectionName[^}]*\}
    // Matches: \section{Education}, \cvsection{ Education }, \section{\textbf{Education}}, etc.
    const commandPattern = sectionCommands.join('|');

    requiredSections.forEach(section => {
        // Create case-insensitive regex
        const regex = new RegExp(`\\\\(${commandPattern})\\*?\\s*\\{[^}]*${section}[^}]*\\}`, 'i');

        if (!regex.test(latex)) {
            // Fallback: Check for just "Education" in uppercase/bold if section command missing
            // This is less reliable but catches some custom templates
            const fallbackRegex = new RegExp(`(\\\\textbf\\{|\\\\large\\{|\\\\uppercase\\{).*${section}.*\\}`, 'i');
            if (!fallbackRegex.test(latex)) {
                issues.push(`MISSING SECTION: Could not find standard '${section}' section. ATS may fail to categorize data.`);
            }
        }
    });

    return {
        passed: issues.length === 0,
        issues
    };
}
