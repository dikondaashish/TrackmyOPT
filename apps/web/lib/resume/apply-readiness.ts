import { buildResumePdfFilename, extractNameFromLatex, extractRoleFromLatex } from "./build-resume-filename";
import { resolveJobTitle } from "./extract-job-title";
import type { KeywordPlacement } from "./keyword-placement";

export interface AtsAnalysisLike {
    passed?: boolean;
    score?: number;
    issues?: string[];
    keywordMatch?: {
        found?: string[];
        missing?: string[];
        score?: number;
    };
    keywordPlacement?: KeywordPlacement[];
}

export interface ReadinessInput {
    latex: string;
    jobDescription: string;
    jobTitle?: string | null;
    templateId?: string | null;
    atsAnalysis: AtsAnalysisLike | null;
    pdfParseOk?: boolean | null;
}

interface ReadinessCheck {
    id: string;
    label: string;
    passed: boolean;
    detail?: string;
}

interface ApplyReadinessResult {
    checks: ReadinessCheck[];
    ready: boolean;
    score: number;
}

const PASS_SCORE = 75;

function hasCriticalIssues(issues: string[] = []): boolean {
    return issues.some((i) => i.startsWith("CRITICAL") || i.startsWith("MISSING SECTION"));
}

function metricsRatioFromLatex(latex: string): number {
    const bullets = latex.match(/\\item\s+.+/g) ?? [];
    if (bullets.length === 0) return 0;
    const withMetrics = bullets.filter((line) =>
        /\d+[%$kKmMbB]|\d+\s*(percent|million|users|customers)/i.test(line)
    ).length;
    return withMetrics / bullets.length;
}

export function evaluateApplyReadiness(input: ReadinessInput): ApplyReadinessResult {
    const score = input.atsAnalysis?.score ?? 0;
    const issues = input.atsAnalysis?.issues ?? [];
    const role = resolveJobTitle(input.jobTitle, input.jobDescription);
    const roleInLatex = extractRoleFromLatex(input.latex);
    const filename = buildResumePdfFilename({
        latex: input.latex,
        jobDescription: input.jobDescription,
        jobTitle: input.jobTitle,
        templateId: input.templateId,
    });
    const nameInFilename = extractNameFromLatex(input.latex).length > 0;
    const roleInFilename = role.length > 0 && filename.toLowerCase().includes(role.split(" ")[0]?.toLowerCase() ?? "___");

    const checks: ReadinessCheck[] = [
        {
            id: "ats-score",
            label: `ATS score ≥ ${PASS_SCORE}`,
            passed: score >= PASS_SCORE,
            detail: score > 0 ? `${score}/100` : "Run analysis first",
        },
        {
            id: "format",
            label: "No critical format issues",
            passed: !hasCriticalIssues(issues),
            detail: issues.find((i) => i.startsWith("CRITICAL") || i.startsWith("MISSING")) ?? undefined,
        },
        {
            id: "role",
            label: "Target role in resume",
            passed: Boolean(roleInLatex || /summary|objective/i.test(input.latex) && role.length > 0),
            detail: role || "Add role from JD",
        },
        {
            id: "metrics",
            label: "≥ 60% bullets with metrics",
            passed: metricsRatioFromLatex(input.latex) >= 0.6,
            detail: `${Math.round(metricsRatioFromLatex(input.latex) * 100)}% with numbers`,
        },
        {
            id: "filename",
            label: "Filename includes name + role",
            passed: nameInFilename && roleInFilename,
            detail: filename,
        },
        {
            id: "pdf-parse",
            label: "PDF text extracts cleanly",
            passed: input.pdfParseOk !== false,
            detail:
                input.pdfParseOk === false
                    ? "ATS may not parse this PDF — review layout"
                    : input.pdfParseOk === true
                      ? "Text extraction OK"
                      : "Pending compile check",
        },
    ];

    const ready = checks.every((c) => c.passed);

    return { checks, ready, score };
}

export function isDownloadGateRequired(input: ReadinessInput): boolean {
    const { ready, score } = evaluateApplyReadiness(input);
    if (ready) return false;
    return score < PASS_SCORE || hasCriticalIssues(input.atsAnalysis?.issues);
}
