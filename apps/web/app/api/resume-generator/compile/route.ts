import { NextRequest, NextResponse } from 'next/server';
import { captureServerEvent } from '@/lib/posthog-server';
import { getUserId } from '@/lib/auth/get-user-id';
import { corsHeadersWebAndExtension } from '@/lib/api/cors-policy';

const MAX_LATEX_CHARS = 200_000;
const COMPILER_TIMEOUT_MS = 45_000;

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

function getPrivateCompilerUrl(): URL | null {
  const configured = process.env.LATEX_COMPILER_URL?.trim();
  if (!configured) return null;
  try {
    const url = new URL(configured);
    return url.protocol === 'https:' ? url : null;
  } catch {
    return null;
  }
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

  const compilerUrl = getPrivateCompilerUrl();
  if (!compilerUrl) return unavailableResponse(corsHeaders);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), COMPILER_TIMEOUT_MS);
  try {
    const token = process.env.LATEX_COMPILER_TOKEN?.trim();
    const response = await fetch(compilerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        compiler: 'pdflatex',
        resources: [{ main: true, content: latexCode }],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      // Compiler responses can include the submitted resume. Do not reflect or
      // persist their body in logs or in the client response.
      return NextResponse.json(
        {
          success: false,
          error: 'The resume could not be compiled. Please check the content and try again.',
          code: 'resume_compile_failed',
        },
        { status: 422, headers: corsHeaders },
      );
    }

    const pdfBuffer = await response.arrayBuffer();
    const pdfBytes = new Uint8Array(pdfBuffer);
    if (
      pdfBytes.length < 5 ||
      String.fromCharCode(...pdfBytes.subarray(0, 5)) !== '%PDF-'
    ) {
      return unavailableResponse(corsHeaders);
    }

    await captureServerEvent(userId, 'resume_compiled', {
      compiler: 'private_compiler',
      latex_size_bytes: latexCode.length,
    });

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="resume.pdf"',
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return unavailableResponse(corsHeaders);
  } finally {
    clearTimeout(timeout);
  }
}
