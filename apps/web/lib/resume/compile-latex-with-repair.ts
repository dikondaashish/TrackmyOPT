import type { CompileResult } from './latex-compiler';

export type CompileLatexWithRepairResult = CompileResult & {
    finalLatex: string;
    repaired: boolean;
    repairAttempts: number;
};

/**
 * Compile LaTeX, then repair-and-retry up to `maxRepairs` times on failure.
 */
export async function compileLatexWithRepair(input: {
    initialLatex: string;
    maxRepairs?: number;
    compile: (latex: string) => Promise<CompileResult>;
    repair: (latex: string, error: string) => Promise<string | undefined>;
}): Promise<CompileLatexWithRepairResult> {
    const maxRepairs = input.maxRepairs ?? 2;
    let finalLatex = input.initialLatex;
    let repaired = false;
    let repairAttempts = 0;

    for (let attempt = 0; attempt <= maxRepairs; attempt++) {
        const compiled = await input.compile(finalLatex);
        if (compiled.ok) {
            return { ...compiled, finalLatex, repaired, repairAttempts };
        }

        if (attempt === maxRepairs) {
            return { ok: false, error: compiled.error, finalLatex, repaired, repairAttempts };
        }

        const repairedLatex = await input.repair(finalLatex, compiled.error);
        if (!repairedLatex?.trim()) {
            return { ok: false, error: compiled.error, finalLatex, repaired, repairAttempts };
        }

        finalLatex = repairedLatex;
        repaired = true;
        repairAttempts += 1;
    }

    return {
        ok: false,
        error: 'Compilation failed after repair attempts',
        finalLatex,
        repaired,
        repairAttempts,
    };
}
