import { NextRequest } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const API_SECRET_KEY = process.env.API_SECRET_KEY || "";

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return handleProxyRequest(req, resolvedParams.path);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return handleProxyRequest(req, resolvedParams.path);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return handleProxyRequest(req, resolvedParams.path);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return handleProxyRequest(req, resolvedParams.path);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return handleProxyRequest(req, resolvedParams.path);
}

async function handleProxyRequest(req: NextRequest, pathArray: string[]) {
  try {
    const path = pathArray.join('/');
    const searchParams = req.nextUrl.searchParams.toString();
    const query = searchParams ? `?${searchParams}` : '';
    
    const targetUrl = `${API_URL}/${path}${query}`;
    
    // Forward headers from original request
    const headers = new Headers(req.headers);
    
    // Inject secure API Key
    if (API_SECRET_KEY) {
      headers.set('x-api-key', API_SECRET_KEY);
    }
    
    // Clean headers that might cause issues when proxying
    headers.delete('host');
    headers.delete('origin'); // Optional, depending on CORS setup

    const fetchOptions: RequestInit = {
      method: req.method,
      headers: headers,
      // Pass credentials if needed
      // credentials: 'omit',
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
        const contentType = req.headers.get('content-type') || '';
        
        if (contentType.includes('multipart/form-data')) {
             // For multipart, we need to pass the incoming form data directly
             const formData = await req.formData();
             fetchOptions.body = formData;
             
             // Important: Remove content-type so fetch can set it with correct boundary automatically
             headers.delete('content-type');
        } else {
             const body = await req.text();
             if (body) fetchOptions.body = body;
        }
    }

    const response = await fetch(targetUrl, fetchOptions);

    // Clean up response headers to avoid mismatches
    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete('content-encoding');
    responseHeaders.delete('transfer-encoding');
    responseHeaders.delete('content-length');
    
    // Add CORS headers if missing
    if (!responseHeaders.has('Access-Control-Allow-Origin')) {
      responseHeaders.set('Access-Control-Allow-Origin', '*');
    }

    const data = await response.arrayBuffer();
    
    return new Response(data, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders
    });
    
  } catch (error: any) {
    console.error('Proxy Error:', {
      message: error.message,
      stack: error.stack,
      url: req.url
    });
    return new Response(JSON.stringify({ 
      error: 'Internal Server Error',
      details: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
