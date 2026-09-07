export type GenerationStepStatus = "pending" | "active" | "completed" | "warning" | "failed";

export type GenerationStep = {
    id: "tailor" | "compile" | "ats" | "improve";
    label: string;
    detail?: string;
    status: GenerationStepStatus;
};

export type GenerationSignals = {
    isGenerating: boolean;
    isCompiling: boolean;
    isScanning: boolean;
    isAutoFixing: boolean;
    hasLatex: boolean;
    hasPdf: boolean;
    compileFailed: boolean;
    pdfParseOk: boolean | null;
    atsScore: number | null;
};

/**
 * Maps the resume pipeline's real state onto the steps a user waits through.
 * Generation, compilation, the ATS scan and the auto-improve pass all report
 * their own status, so nothing here is on a timer.
 */
export function deriveGenerationSteps(signals: GenerationSignals): GenerationStep[] {
    const {
        isGenerating,
        isCompiling,
        isScanning,
        isAutoFixing,
        hasLatex,
        hasPdf,
        compileFailed,
        pdfParseOk,
        atsScore,
    } = signals;

    // `isGenerating` stays true across the whole pipeline because compilation and
    // scanning are awaited inside the generate call, so a later stage running is
    // what tells us the tailoring request itself already came back.
    const isTailoring = isGenerating && !isCompiling && !isScanning && !isAutoFixing;

    const steps: GenerationStep[] = [
        {
            id: "tailor",
            label: "Tailoring content to the job description",
            status: isTailoring ? "active" : hasLatex ? "completed" : "pending",
        },
        {
            id: "compile",
            label: "Compiling the PDF preview",
            status: isCompiling
                ? "active"
                : compileFailed
                    ? "failed"
                    : hasPdf
                        ? "completed"
                        : "pending",
            detail: !isCompiling && compileFailed ? "This LaTeX could not be compiled" : undefined,
        },
        {
            id: "ats",
            label: "Checking ATS readability",
            status: isScanning
                ? "active"
                : pdfParseOk === false
                    ? "warning"
                    : atsScore !== null
                        ? "completed"
                        : "pending",
            detail: !isScanning && pdfParseOk === false
                ? "The PDF text layer may not parse cleanly"
                : !isScanning && atsScore !== null
                    ? `Match score ${atsScore}/100`
                    : undefined,
        },
    ];

    // Only runs when the scan came back below target with missing keywords, so it
    // is listed only once it is actually happening.
    if (isAutoFixing) {
        steps.push({
            id: "improve",
            label: "Improving keyword coverage",
            status: "active",
        });
    }

    return steps;
}
