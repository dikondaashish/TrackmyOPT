
import {
    analyzeLatexBulletMetrics,
    extractLatexBulletBodies,
} from '@/lib/resume/bullet-metrics';

interface AtsCheckResult {
    passed: boolean;
    issues: string[];
    score: number;
}

const WEAK_VERBS = [
    'helped', 'assisted', 'participated', 'worked on', 'was responsible',
    'contributed to', 'involved in', 'handled', 'dealt with', 'tasked with',
];

export function checkAtsCompliance(latex: string): AtsCheckResult {
    const issues: string[] = [];

    if (!latex || latex.trim().length === 0) {
        return { passed: false, issues: ['No content to analyze'], score: 0 };
    }

    // 1. Graphics/Images — ATS cannot parse these
    if (latex.includes('\\includegraphics')) {
        issues.push("CRITICAL: Contains images (\\includegraphics). ATS parsers cannot read images.");
    }

    // 2. Tables used for layout
    if (latex.includes('\\begin{tabular}') || latex.includes('\\begin{tabularx}')) {
        issues.push("WARNING: Tables detected. ATS parsers may scramble table data.");
    }

    // 3. Multi-column layouts
    if (latex.includes('\\begin{multicols}') || latex.includes('\\twocolumn')) {
        issues.push("WARNING: Multi-column layout detected. ATS parsers may read across columns instead of down.");
    }

    // 4. Required sections
    const requiredSections = ['Education', 'Experience', 'Skills'];
    const sectionCommands = ['section', 'subsection', 'cvsection', 'resumeSection', 'header'];
    const commandPattern = sectionCommands.join('|');

    requiredSections.forEach(section => {
        const regex = new RegExp(`\\\\(${commandPattern})\\*?\\s*\\{[^}]*${section}[^}]*\\}`, 'i');
        if (!regex.test(latex)) {
            const fallbackRegex = new RegExp(`(\\\\textbf\\{|\\\\large\\{|\\\\uppercase\\{).*${section}.*\\}`, 'i');
            if (!fallbackRegex.test(latex)) {
                issues.push(`MISSING SECTION: No '${section}' section found. ATS cannot categorize your data.`);
            }
        }
    });

    // 5. Summary/Objective section (strongly recommended)
    const hasSummary = /\\(section|cvsection|resumeSection)\*?\s*\{[^}]*(Summary|Objective|Profile)[^}]*\}/i.test(latex)
        || /(\\textbf\{|\\large\{).*(Summary|Objective|Profile).*\}/i.test(latex);
    if (!hasSummary) {
        issues.push("RECOMMENDED: No Professional Summary section. Adding one significantly improves ATS match rates.");
    }

    // 6. Weak action verbs in bullet points
    const bulletLines = extractLatexBulletBodies(latex);
    let weakVerbCount = 0;
    bulletLines.forEach(line => {
        const lineText = line.toLowerCase();
        if (WEAK_VERBS.some(verb => lineText.startsWith(verb))) {
            weakVerbCount++;
        }
    });
    if (weakVerbCount > 0) {
        issues.push(`WEAK VERBS: ${weakVerbCount} bullet(s) start with weak action verbs (Helped, Assisted, etc.). Use strong verbs like Led, Engineered, Optimized.`);
    }

    // 7. Metrics check — at least some bullets should have numbers
    const bulletMetrics = analyzeLatexBulletMetrics(latex);
    if (bulletMetrics.total > 3 && bulletMetrics.ratio < 0.6) {
        issues.push(`LOW METRICS: ${bulletMetrics.withMetrics}/${bulletMetrics.total} bullets (${Math.round(bulletMetrics.ratio * 100)}%) include measurable results. Aim for 60%+ with counts, time, scale, percentages, or dollar amounts.`);
    }

    // 8. Resume length check (rough estimate based on content volume)
    const contentLength = latex.replace(/\\[a-zA-Z]+\{[^}]*\}/g, '').replace(/[\\{}%&]/g, '').length;
    if (contentLength < 500) {
        issues.push("TOO SHORT: Resume appears too brief. Add more detail to experience bullets and skills.");
    }

    const criticalCount = issues.filter(i => i.startsWith('CRITICAL')).length;
    const warningCount = issues.filter(i => i.startsWith('WARNING') || i.startsWith('MISSING')).length;
    const recommendCount = issues.filter(i => i.startsWith('RECOMMENDED') || i.startsWith('WEAK') || i.startsWith('LOW') || i.startsWith('TOO')).length;

    const score = Math.max(0, 100 - (criticalCount * 20) - (warningCount * 10) - (recommendCount * 5));

    return {
        passed: criticalCount === 0 && warningCount === 0,
        issues,
        score,
    };
}
