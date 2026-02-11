
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
    requiredSections.forEach(section => {
        const regex = new RegExp(`\\\\section\\*?\\{.*${section}.*\\}`, 'i');
        if (!regex.test(latex)) {
            issues.push(`MISSING SECTION: Could not find standard '${section}' section. ATS may fail to categorize data.`);
        }
    });

    return {
        passed: issues.length === 0,
        issues
    };
}
