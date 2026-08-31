import { NextRequest, NextResponse } from 'next/server';
import { captureServerEvent } from '@/lib/posthog-server';
import { getUserId } from '@/lib/auth/get-user-id';
import { corsHeadersWebAndExtension } from '@/lib/api/cors-policy';
import { compileLatex, isCompilerTransportError } from '@/lib/resume/latex-compiler';

const MAX_LATEX_CHARS = 200_000;

export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { headers: corsHeadersWebAndExtension(req) });
}

function unavailableResponse(corsHeaders: Record<string, string>) {
  return NextResponse.json(
    {
      success: false,
      error: 'Resume compilation is temporarily unavailable. Please try again later.',
      code: 'resume_compiler_unavailable',
    },
    { status: 503, headers: corsHeaders },
  );
}

export async function POST(req: NextRequest) {
  const corsHeaders = corsHeadersWebAndExtension(req);
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401, headers: corsHeaders },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid request body.' },
      { status: 400, headers: corsHeaders },
    );
  }

  const latexCode =
    typeof body === 'object' && body !== null && 'latexCode' in body
      ? (body as { latexCode?: unknown }).latexCode
      : null;
  if (typeof latexCode !== 'string' || !latexCode.trim()) {
    return NextResponse.json(
      { success: false, error: 'No LaTeX code provided.' },
      { status: 400, headers: corsHeaders },
    );
  }
  if (latexCode.length > MAX_LATEX_CHARS) {
    return NextResponse.json(
      { success: false, error: 'Resume source is too large to compile.' },
      { status: 413, headers: corsHeaders },
    );
  }

  if (!process.env.LATEX_COMPILER_URL?.trim()) {
    return unavailableResponse(corsHeaders);
  }

  const result = await compileLatex(latexCode);
  if (!result.ok) {
    if (isCompilerTransportError(result.error)) {
      return unavailableResponse(corsHeaders);
    }

    return NextResponse.json(
      {
        success: false,
        error: 'The resume could not be compiled. Please check the content and try again.',
        code: 'resume_compile_failed',
      },
      { status: 422, headers: corsHeaders },
    );
  }

  await captureServerEvent(userId, 'resume_compiled', {
    compiler: 'private_compiler',
    latex_size_bytes: latexCode.length,
  });

  return new NextResponse(result.pdf, {
    status: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="resume.pdf"',
      'Cache-Control': 'no-store',
    },
  });
}
