export interface LatexCompileResult {
  pdf?: ArrayBuffer;
  error?: string;
}

export interface CompileLatexWithRepairResult extends LatexCompileResult {
  finalLatex: string;
  repaired: boolean;
}

/**
 * Compile once, then make at most one repair-and-retry attempt. The returned
 * finalLatex is the exact source that produced `pdf` and must be the only input
 * used for snapshot extraction, content hashing, scoring, and editor handoff.
 */
export async function compileLatexWithSingleRepair(input: {
  initialLatex: string;
  compile: (latex: string) => Promise<LatexCompileResult>;
  repair: (latex: string, error: string) => Promise<string | undefined>;
}): Promise<CompileLatexWithRepairResult> {
  let finalLatex = input.initialLatex;
  let compiled = await input.compile(finalLatex);
  if (compiled.pdf) {
    return { ...compiled, finalLatex, repaired: false };
  }

  try {
    const repairedLatex = await input.repair(
      finalLatex,
      compiled.error || 'Compilation failed'
    );
    if (repairedLatex?.trim()) {
      finalLatex = repairedLatex;
      compiled = await input.compile(finalLatex);
      return { ...compiled, finalLatex, repaired: true };
    }
  } catch {
    // Preserve the original compile failure when repair is unavailable.
  }

  return { ...compiled, finalLatex, repaired: false };
}
