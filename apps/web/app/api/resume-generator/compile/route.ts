
import { NextRequest, NextResponse } from 'next/server';

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { latexCode } = body;

        if (!latexCode) {
            return NextResponse.json(
                { success: false, error: 'No LaTeX code provided' },
                { status: 400, headers: corsHeaders }
            );
        }

        // Use external LaTeX compiler (latex-on-http or similar)
        // For production, we recommend a robust service like LaTeX.Online or your own container
        // Using a public reliable API endpoint for demonstration/MVP
        // NOTE: If using a paid/private service, add API key here

        // This is a common public latex compiler endpoint (Ytotech) or similar
        // If this is flaky, you can use: https://latex.online/compile
        // Compiler Endpoints (Primary + Fallback)
        const COMPILERS = [
            {
                name: 'Primary (Ytotech)',
                url: process.env.LATEX_COMPILER_URL || 'https://latex.ytotech.com/builds/sync',
                payload: (code: string) => ({
                    compiler: 'pdflatex',
                    resources: [{ main: true, content: code }],
                })
            },
            {
                name: 'Fallback (LaTeX.Online)',
                url: 'https://latex.online/compile?text=' + encodeURIComponent(latexCode),
                method: 'GET', // Latex.online supports GET for text
                // payload: null // GET request
            }
        ];

        let pdfBuffer: ArrayBuffer | null = null;
        let lastError = "";

        for (const compiler of COMPILERS) {
            try {
                console.log(`Attempting compilation with ${compiler.name}...`);

                let response;
                if (compiler.method === 'GET') {
                    response = await fetch(compiler.url);
                } else {
                    response = await fetch(compiler.url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(compiler.payload ? compiler.payload(latexCode) : {})
                    });
                }

                if (!response.ok) {
                    const errorText = await response.text();
                    console.warn(`${compiler.name} failed: ${response.status} - ${errorText.substring(0, 100)}`);
                    lastError = `${compiler.name} Error: ${response.statusText}`;
                    continue; // Try next compiler
                }

                pdfBuffer = await response.arrayBuffer();
                console.log(`Success with ${compiler.name}!`);
                break; // Stop loop on success

            } catch (err: any) {
                console.warn(`${compiler.name} network error:`, err.message);
                lastError = `${compiler.name} Exception: ${err.message}`;
            }
        }

        if (!pdfBuffer) {
            throw new Error(`All compilers failed. Last error: ${lastError}`);
        }

        // Return PDF as binary stream
        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="resume.pdf"',
            },
        });

    } catch (error: any) {
        console.error('Compilation Error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to compile LaTeX' },
            { status: 500, headers: corsHeaders }
        );
    }
}
