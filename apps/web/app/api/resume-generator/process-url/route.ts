import { NextRequest, NextResponse } from 'next/server';

import { getUserId } from '@/lib/auth/get-user-id';
import {
  checkRateLimitByIP,
  checkRateLimitByUser,
  rateLimitResponse,
  type RateLimitConfig,
} from '@/lib/auth/api-rate-limit';
import { sanitizeError, secureLog } from '@/lib/secure-logger';
import {
  ResponseTooLargeError,
  SafeFetchTimeoutError,
  UnsafeUrlError,
  safeFetchPublicHttps,
} from '@/lib/security/safe-url-fetch';

export const runtime = 'nodejs';

const MAX_REMOTE_BYTES = 5 * 1024 * 1024;
const MAX_OUTPUT_CHARS = 20_000;
const URL_RATE_LIMIT: RateLimitConfig = {
  limit: 10,
  windowSeconds: 60,
  name: 'resume-process-url',
};

const corsHeaders = {
  'Access-Control-Allow-Origin':
    process.env.NEXT_PUBLIC_SITE_URL || 'https://www.trackmyopt.com',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function withCors(response: NextResponse): NextResponse {
  for (const [name, value] of Object.entries(corsHeaders)) {
    response.headers.set(name, value);
  }
  return response;
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

function errorResponse(error: string, status: number) {
  return NextResponse.json(
    { success: false, error },
    { status, headers: corsHeaders },
  );
}

/**
 * POST /api/resume-generator/process-url
 * Extract content from a public HTTPS job posting or resume document.
 */
export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) {
    return errorResponse('Unauthorized', 401);
  }

  const ipLimit = await checkRateLimitByIP(req, URL_RATE_LIMIT);
  if (!ipLimit.success) {
    return withCors(
      rateLimitResponse(
        ipLimit,
        'Too many URL imports. Please try again later.',
      ),
    );
  }
  const userLimit = await checkRateLimitByUser(userId, URL_RATE_LIMIT);
  if (!userLimit.success) {
    return withCors(
      rateLimitResponse(
        userLimit,
        'Too many URL imports. Please try again later.',
      ),
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse('Invalid JSON body.', 400);
  }
  if (typeof body !== 'object' || body === null) {
    return errorResponse('Invalid request body.', 400);
  }

  const rawUrl = (body as { url?: unknown }).url;
  if (
    typeof rawUrl !== 'string' ||
    rawUrl.trim().length === 0 ||
    rawUrl.length > 2_048
  ) {
    return errorResponse('A valid URL is required.', 400);
  }
  if (rawUrl.toLowerCase().includes('linkedin.com')) {
    return errorResponse(
      'LinkedIn URLs require authentication and cannot be imported. Please copy and paste the content manually.',
      400,
    );
  }

  try {
    const response = await safeFetchPublicHttps(rawUrl.trim(), {
      maxBytes: MAX_REMOTE_BYTES,
      timeoutMs: 15_000,
      maxRedirects: 3,
    });

    if (response.status < 200 || response.status >= 300) {
      return errorResponse(
        `Failed to fetch URL: ${response.status} ${response.statusText}`.trim(),
        400,
      );
    }

    const contentType = (response.headers.get('content-type') || '')
      .split(';', 1)[0]
      ?.trim()
      .toLowerCase();

    if (contentType === 'application/pdf') {
      try {
        const pdfParseModule = (await import('pdf-parse')) as {
          default?: (buffer: Buffer) => Promise<{ text?: string }>;
        };
        const pdfParse =
          pdfParseModule.default ||
          (pdfParseModule as unknown as (
            buffer: Buffer,
          ) => Promise<{ text?: string }>);
        const pdfData = await pdfParse(response.body);
        const content = pdfData.text?.trim() || '';
        if (content.length < 50) {
          return errorResponse(
            'Could not extract text from the PDF. Please download and upload the file instead.',
            400,
          );
        }
        return NextResponse.json(
          {
            success: true,
            content: content.slice(0, MAX_OUTPUT_CHARS),
            title: 'PDF Document',
            type: 'pdf',
          },
          { headers: corsHeaders },
        );
      } catch (error) {
        secureLog.warn('PDF URL parsing failed:', sanitizeError(error));
        return errorResponse('Failed to parse PDF from URL.', 400);
      }
    }

    if (
      contentType !== 'text/html' &&
      contentType !== 'application/xhtml+xml' &&
      contentType !== 'text/plain'
    ) {
      return errorResponse('Unsupported remote content type.', 415);
    }

    if (contentType === 'text/plain') {
      const content = response.body.toString('utf8').replace(/\s+/g, ' ').trim();
      if (content.length < 50) {
        return errorResponse(
          'Could not extract meaningful text from the URL.',
          400,
        );
      }
      return NextResponse.json(
        {
          success: true,
          content: content.slice(0, MAX_OUTPUT_CHARS),
          title: 'Text Document',
          type: 'text',
        },
        { headers: corsHeaders },
      );
    }

    const cheerio = await import('cheerio');
    const $ = cheerio.load(response.body.toString('utf8'));
    $('script, style, noscript, header, footer, nav, aside, iframe').remove();

    let textContent = (
      $('main').text() ||
      $('article').text() ||
      $('body').text()
    )
      .replace(/\s+/g, ' ')
      .trim();
    const title = $('title').text().trim() || 'Extracted Content';

    if (textContent.length < 50) {
      return errorResponse(
        'Could not extract meaningful text from the URL. Please copy and paste the content manually.',
        400,
      );
    }
    if (textContent.length > MAX_OUTPUT_CHARS) {
      textContent = `${textContent.slice(0, MAX_OUTPUT_CHARS)}...`;
    }

    return NextResponse.json(
      {
        success: true,
        content: textContent,
        title,
        type: 'html',
      },
      { headers: corsHeaders },
    );
  } catch (error) {
    secureLog.warn('URL import rejected:', sanitizeError(error));
    if (error instanceof ResponseTooLargeError) {
      return errorResponse('Remote file is too large to import.', 413);
    }
    if (error instanceof SafeFetchTimeoutError) {
      return errorResponse('Request timed out. Please try again.', 408);
    }
    if (error instanceof UnsafeUrlError) {
      return errorResponse(error.message, 400);
    }
    return errorResponse(
      'Failed to fetch URL. Please check the URL and try again.',
      400,
    );
  }
}
