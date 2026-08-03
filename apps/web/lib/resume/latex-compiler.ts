/**
 * Shared LaTeX -> PDF compilation.
 *
 * IMPORTANT: the remote compiler receives a SINGLE file. Templates must be
 * self-contained — a template that does `\usepackage{SomeLocal}` will fail in
 * production even though it compiles locally, because no project-local .sty is
 * ever uploaded alongside it.
 */

type CompileResult =
    | { ok: true; pdf: ArrayBuffer; compiler: string }
    | { ok: false; error: string };

type CompilerConfig = {
    name: string;
    url: (code: string) => string;
    method: 'GET' | 'POST';
    payload?: (code: string) => unknown;
};

const COMPILERS: CompilerConfig[] = [
    {
        name: 'Primary (Ytotech)',
        url: () => process.env.LATEX_COMPILER_URL || 'https://latex.ytotech.com/builds/sync',
        method: 'POST',
        payload: (code: string) => ({
            compiler: 'pdflatex',
            resources: [{ main: true, content: code }],
        }),
    },
    {
        name: 'Fallback (LaTeX.Online)',
        url: (code: string) => 'https://latex.online/compile?text=' + encodeURIComponent(code),
        method: 'GET',
    },
];

export async function compileLatex(latexCode: string): Promise<CompileResult> {
    let lastError = '';

    for (const compiler of COMPILERS) {
        try {
            const response =
                compiler.method === 'GET'
                    ? await fetch(compiler.url(latexCode))
                    : await fetch(compiler.url(latexCode), {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(compiler.payload?.(latexCode) ?? {}),
                      });

            if (!response.ok) {
                const errorText = await response.text();
                // Keep the compiler's actual log (truncated) — fix-latex needs
                // the real error to repair the LaTeX, not just the status text.
                lastError = `${compiler.name} (${response.status}): ${errorText.substring(0, 800)}`;
                continue;
            }

            return { ok: true, pdf: await response.arrayBuffer(), compiler: compiler.name };
        } catch (err) {
            lastError = `${compiler.name} Exception: ${err instanceof Error ? err.message : String(err)}`;
        }
    }

    return { ok: false, error: `All compilers failed. Last error: ${lastError}` };
}
