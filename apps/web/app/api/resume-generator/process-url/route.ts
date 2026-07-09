import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth/getUserId';
import dns from 'dns/promises';

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_SITE_URL || 'https://www.trackmyopt.com',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

/**
 * Check if an IP address is a private/reserved range (SSRF protection).
 * Blocks localhost, RFC-1918 privates, link-local (cloud metadata), and loopback.
 */
function isPrivateIp(ip: string): boolean {
    // IPv6 loopback
    if (ip === '::1' || ip === '::') return true;
    // Strip IPv6-mapped IPv4 prefix
    const addr = ip.replace(/^::ffff:/, '');
    const parts = addr.split('.').map(Number);
    if (parts.length !== 4 || parts.some((n) => isNaN(n))) return false;
    const [a, b] = parts;
    return (
        a === 127 ||                          // 127.0.0.0/8  loopback
        a === 10 ||                           // 10.0.0.0/8   RFC-1918
        (a === 172 && b >= 16 && b <= 31) || // 172.16.0.0/12 RFC-1918
        (a === 192 && b === 168) ||           // 192.168.0.0/16 RFC-1918
        (a === 169 && b === 254) ||           // 169.254.0.0/16 link-local (AWS metadata)
        a === 0                               // 0.0.0.0/8  invalid
    );
}

/**
 * Validate that a URL is safe to fetch: well-formed, HTTPS, and resolves to a
 * public address. Resolves ALL DNS records and rejects if any is private
 * (defends against multi-record answers). Reused per redirect hop so a redirect
 * cannot bounce the fetch to an internal/metadata address.
 *
 * ponytail: known ceiling — a single-hop DNS-rebinding TOCTOU remains between
 * this lookup and fetch's own resolution. Closing it fully needs the request
 * pinned to the validated IP via a custom undici dispatcher (connect-time
 * check). Manual redirect re-validation below covers the practical SSRF path.
 */
async function validatePublicHttpsUrl(
    raw: string
): Promise<{ ok: true; parsed: URL } | { ok: false; error: string }> {
    let parsed: URL;
    try {
        parsed = new URL(raw);
    } catch {
        return { ok: false, error: 'Invalid URL format' };
    }
    if (parsed.protocol !== 'https:') {
        return { ok: false, error: 'Only HTTPS URLs are supported.' };
    }
    let addresses: { address: string }[];
    try {
        addresses = await dns.lookup(parsed.hostname, { all: true });
    } catch {
        return { ok: false, error: 'Could not resolve URL hostname.' };
    }
    if (addresses.length === 0 || addresses.some((a) => isPrivateIp(a.address))) {
        return { ok: false, error: 'URL resolves to a private or reserved address.' };
    }
    return { ok: true, parsed };
}

/**
 * POST /api/resume-generator/process-url
 * Extract content from a URL (job posting, cloud resume link)
 */
export async function POST(req: NextRequest) {
    const userId = await getUserId(req);
    if (!userId) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { url, type } = body;

        if (!url) {
            return NextResponse.json(
                { success: false, error: 'URL is required' },
                { status: 400, headers: corsHeaders }
            );
        }

        // Validate URL format, enforce HTTPS, and reject private/internal IPs (SSRF).
        const initialCheck = await validatePublicHttpsUrl(url);
        if (!initialCheck.ok) {
            return NextResponse.json(
                { success: false, error: initialCheck.error },
                { status: 400, headers: corsHeaders }
            );
        }

        // Check for LinkedIn URLs (not scrape-able)
        if (url.includes('linkedin.com')) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'LinkedIn URLs require authentication and cannot be scraped. Please copy and paste the job description or resume text manually.'
                },
                { status: 400, headers: corsHeaders }
            );
        }

        // Fetch the URL content. Follow redirects MANUALLY, re-validating each
        // hop's target so a redirect can't send us to an internal/metadata
        // address (SSRF). Bounded to a few hops.
        try {
            let currentUrl = initialCheck.parsed.toString();
            let response: Response | null = null;

            for (let hop = 0; hop < 4; hop++) {
                response = await fetch(currentUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                        'Accept-Language': 'en-US,en;q=0.5',
                    },
                    redirect: 'manual',
                    signal: AbortSignal.timeout(15000), // 15 second timeout
                });

                if (response.status >= 300 && response.status < 400) {
                    const location = response.headers.get('location');
                    if (!location) break;
                    const nextUrl = new URL(location, currentUrl).toString();
                    const hopCheck = await validatePublicHttpsUrl(nextUrl);
                    if (!hopCheck.ok) {
                        return NextResponse.json(
                            { success: false, error: hopCheck.error },
                            { status: 400, headers: corsHeaders }
                        );
                    }
                    currentUrl = hopCheck.parsed.toString();
                    continue;
                }
                break;
            }

            if (!response || (response.status >= 300 && response.status < 400)) {
                return NextResponse.json(
                    { success: false, error: 'Too many redirects.' },
                    { status: 400, headers: corsHeaders }
                );
            }

            if (!response.ok) {
                return NextResponse.json(
                    { success: false, error: `Failed to fetch URL: ${response.status} ${response.statusText}` },
                    { status: 400, headers: corsHeaders }
                );
            }

            const contentType = response.headers.get('content-type') || '';

            // Handle different content types
            if (contentType.includes('application/pdf')) {
                // Direct PDF link - use pdf-parse
                const buffer = await response.arrayBuffer();
                try {
                    const pdfParseModule = await import('pdf-parse') as any;
                    const pdfParse = pdfParseModule.default || pdfParseModule;
                    const pdfData = await pdfParse(Buffer.from(buffer));

                    if (!pdfData.text || pdfData.text.trim().length < 50) {
                        return NextResponse.json(
                            { success: false, error: 'Could not extract text from PDF URL. Please download and upload the file instead.' },
                            { status: 400, headers: corsHeaders }
                        );
                    }

                    return NextResponse.json(
                        {
                            success: true,
                            content: pdfData.text.trim(),
                            title: 'PDF Document',
                            type: 'pdf'
                        },
                        { status: 200, headers: corsHeaders }
                    );
                } catch (pdfError) {
                    console.error('PDF URL parsing error:', pdfError);
                    return NextResponse.json(
                        { success: false, error: 'Failed to parse PDF from URL.' },
                        { status: 400, headers: corsHeaders }
                    );
                }
            }

            // Handle HTML content
            const html = await response.text();

            // Extract text content using Cheerio
            const cheerio = await import('cheerio');
            const $ = cheerio.load(html);

            // Remove scripts, styles, and non-content elements
            $('script').remove();
            $('style').remove();
            $('noscript').remove();
            $('header').remove();
            $('footer').remove();
            $('nav').remove();
            $('aside').remove();
            $('iframe').remove();

            // Extract text from main content areas if possible, otherwise body
            let textContent = $('main').text() || $('article').text() || $('body').text();

            // Clean up whitespace
            textContent = textContent.replace(/\s+/g, ' ').trim();

            // Extract title
            const title = $('title').text().trim() || 'Extracted Content';

            if (!textContent || textContent.length < 50) {
                return NextResponse.json(
                    { success: false, error: 'Could not extract meaningful text from URL. Please copy and paste the content manually.' },
                    { status: 400, headers: corsHeaders }
                );
            }

            // Limit content length to prevent overly long responses
            const maxLength = 20000;
            if (textContent.length > maxLength) {
                textContent = textContent.substring(0, maxLength) + '...';
            }

            return NextResponse.json(
                {
                    success: true,
                    content: textContent,
                    title: title,
                    type: 'html'
                },
                { status: 200, headers: corsHeaders }
            );

        } catch (fetchError: any) {
            console.error('URL fetch error:', fetchError);

            if (fetchError.name === 'AbortError' || fetchError.name === 'TimeoutError') {
                return NextResponse.json(
                    { success: false, error: 'Request timed out. Please try again or paste the content manually.' },
                    { status: 408, headers: corsHeaders }
                );
            }

            return NextResponse.json(
                { success: false, error: 'Failed to fetch URL. Please check the URL and try again.' },
                { status: 400, headers: corsHeaders }
            );
        }

    } catch (error) {
        console.error('URL processing error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to process URL. Please try again or paste content manually.' },
            { status: 500, headers: corsHeaders }
        );
    }
}
