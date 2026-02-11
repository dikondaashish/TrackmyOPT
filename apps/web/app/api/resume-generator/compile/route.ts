
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
        const COMPILER_URL = process.env.LATEX_COMPILER_URL || 'https://latex.ytotech.com/builds/sync';

        const response = await fetch(COMPILER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                compiler: 'pdflatex',
                resources: [
                    {
                        main: true,
                        content: latexCode,
                    },
                ],
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Compilation Service Error:', errorText);

            // Try fallback compiler if primary fails
            // Fallback to latex.online (requires URL encoding or multipart, simple content POST might differ)
            // For now, return detailed error so client knows
            throw new Error(`Compilation failed: ${response.statusText}. Log: ${errorText.substring(0, 200)}...`);
        }

        const pdfBuffer = await response.arrayBuffer();

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
