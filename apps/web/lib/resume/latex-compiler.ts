/**
 * Shared LaTeX -> PDF compilation.
 *
 * IMPORTANT: the remote compiler receives a SINGLE file. Templates must be
 * self-contained — a template that does `\usepackage{SomeLocal}` will fail in
 * production even though it compiles locally, because no project-local .sty is
 * ever uploaded alongside it.
 *
 * Production uses the private Render compiler (LATEX_COMPILER_URL +
 * LATEX_COMPILER_TOKEN). Local dev without those env vars falls back to public
 * compilers.
 */

type CompileResult =
    | { ok: true; pdf: ArrayBuffer; compiler: string }
    | { ok: false; error: string };

/** Auth, upstream, or timeout failures — not bad LaTeX in the document. */
export function isCompilerTransportError(error: string): boolean {
    return /\(401\)|\(403\)|\(502\)|\(503\)|\(504\)|Exception: (?:aborted|AbortError|timeout)/i.test(
        error,
    );
}

type CompilerConfig = {
    name: string;
    url: (code: string) => string;
    method: 'GET' | 'POST';
    headers?: () => Record<string, string>;
    payload?: (code: string) => unknown;
};

function getPrivateCompilerUrl(): string | null {
    const configured = process.env.LATEX_COMPILER_URL?.trim();
    if (!configured) return null;
    try {
        const url = new URL(configured);
        return url.protocol === 'https:' ? configured : null;
    } catch {
        return null;
    }
}

function privateCompilerHeaders(): Record<string, string> {
    const token = process.env.LATEX_COMPILER_TOKEN?.trim();
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

function isPdf(bytes: ArrayBuffer): boolean {
    const header = new Uint8Array(bytes.slice(0, 5));
    return header.length >= 5 && String.fromCharCode(...header) === '%PDF-';
}

function buildCompilers(): CompilerConfig[] {
    const privateUrl = getPrivateCompilerUrl();
    if (privateUrl) {
        return [
            {
                name: 'Private (TrackMyOPT API)',
                url: () => privateUrl,
                method: 'POST',
                headers: privateCompilerHeaders,
                payload: (code: string) => ({
                    compiler: 'pdflatex',
                    resources: [{ main: true, content: code }],
                }),
            },
        ];
    }

    return [
        {
            name: 'Primary (Ytotech)',
            url: () => 'https://latex.ytotech.com/builds/sync',
            method: 'POST',
            headers: () => ({ 'Content-Type': 'application/json' }),
            payload: (code: string) => ({
                compiler: 'pdflatex',
                resources: [{ main: true, content: code }],
            }),
        },
        {
            name: 'Fallback (LaTeX.Online)',
            url: (code: string) =>
                'https://latex.online/compile?text=' + encodeURIComponent(code),
            method: 'GET',
        },
    ];
}

export async function compileLatex(latexCode: string): Promise<CompileResult> {
    let lastError = '';

    for (const compiler of buildCompilers()) {
        try {
            const headers = compiler.headers?.() ?? {};
            const response =
                compiler.method === 'GET'
                    ? await fetch(compiler.url(latexCode), { headers })
                    : await fetch(compiler.url(latexCode), {
                          method: 'POST',
                          headers,
                          body: JSON.stringify(compiler.payload?.(latexCode) ?? {}),
                      });

            if (!response.ok) {
                const errorText = await response.text();
                lastError = `${compiler.name} (${response.status}): ${errorText.substring(0, 800)}`;
                continue;
            }

            const pdf = await response.arrayBuffer();
            if (!isPdf(pdf)) {
                lastError = `${compiler.name}: response was not a PDF`;
                continue;
            }

            return { ok: true, pdf, compiler: compiler.name };
        } catch (err) {
            lastError = `${compiler.name} Exception: ${err instanceof Error ? err.message : String(err)}`;
        }
    }

    return { ok: false, error: `All compilers failed. Last error: ${lastError}` };
}
