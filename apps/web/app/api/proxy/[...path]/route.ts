import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000').replace(
  /\/+$/,
  '',
);
const API_SECRET_KEY = process.env.API_SECRET_KEY || '';

/** Single-resume fetch/delete: `resume/<uuid>` */
const RESUME_BY_ID_PATH =
  /^resume\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function normalizeBackendPath(pathArray: string[]): string | null {
  if (pathArray.length === 0) return null;
  if (pathArray.some((seg) => seg === '..' || seg === '.')) return null;
  return pathArray.join('/');
}

function isProxyAllowed(path: string, method: string): boolean {
  const m = method.toUpperCase();
  if (m === 'GET') {
    if (path === 'resume/list') return true;
    return RESUME_BY_ID_PATH.test(path);
  }
  if (m === 'POST') {
    return (
      path === 'resume/save' ||
      path === 'resume/download-url' ||
      path === 'ocr/direct'
    );
  }
  if (m === 'DELETE') {
    return RESUME_BY_ID_PATH.test(path);
  }
  return false;
}

function buildOutboundHeaders(req: NextRequest): Headers {
  const out = new Headers();
  const contentType = req.headers.get('content-type');
  if (contentType) {
    out.set('content-type', contentType);
  }
  const accept = req.headers.get('accept');
  if (accept) {
    out.set('accept', accept);
  }
  const lang = req.headers.get('accept-language');
  if (lang) {
    out.set('accept-language', lang);
  }
  if (API_SECRET_KEY) {
    out.set('x-api-key', API_SECRET_KEY);
  }
  return out;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const resolvedParams = await params;
  return handleProxyRequest(req, resolvedParams.path);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const resolvedParams = await params;
  return handleProxyRequest(req, resolvedParams.path);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const resolvedParams = await params;
  return handleProxyRequest(req, resolvedParams.path);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const resolvedParams = await params;
  return handleProxyRequest(req, resolvedParams.path);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const resolvedParams = await params;
  return handleProxyRequest(req, resolvedParams.path);
}

async function handleProxyRequest(req: NextRequest, pathArray: string[]) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const path = normalizeBackendPath(pathArray);
    if (!path) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!isProxyAllowed(path, req.method)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const searchParams = req.nextUrl.searchParams.toString();
    const query = searchParams ? `?${searchParams}` : '';
    const targetUrl = `${API_URL}/${path}${query}`;

    const headers = buildOutboundHeaders(req);

    const fetchOptions: RequestInit = {
      method: req.method,
      headers,
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const contentType = req.headers.get('content-type') || '';

      if (contentType.includes('multipart/form-data')) {
        const formData = await req.formData();
        fetchOptions.body = formData;
        headers.delete('content-type');
      } else {
        const body = await req.text();
        if (body) fetchOptions.body = body;
      }
    }

    const response = await fetch(targetUrl, fetchOptions);

    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete('content-encoding');
    responseHeaders.delete('transfer-encoding');
    responseHeaders.delete('content-length');
    responseHeaders.delete('set-cookie');
    responseHeaders.delete('access-control-allow-origin');
    responseHeaders.delete('access-control-allow-credentials');

    const data = await response.arrayBuffer();

    return new Response(data, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'unknown error';
    console.error('Proxy error:', { message, url: req.url });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
