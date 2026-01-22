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

/**
 * POST /api/resume-generator/process-url
 * Extract content from a URL (job posting, cloud resume link)
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { url, type } = body;

        if (!url) {
            return NextResponse.json(
                { success: false, error: 'URL is required' },
                { status: 400, headers: corsHeaders }
            );
        }

        // Validate URL format
        try {
            new URL(url);
        } catch {
            return NextResponse.json(
                { success: false, error: 'Invalid URL format' },
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

        // Fetch the URL content
        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                },
                signal: AbortSignal.timeout(15000), // 15 second timeout
            });

            if (!response.ok) {
                return NextResponse.json(
                    { success: false, error: `Failed to fetch URL: ${response.status} ${response.statusText}` },
                    { status: 400, headers: corsHeaders }
                );
            }

            const contentType = response.headers.get('content-type') || '';

            // Handle different content types
            if (contentType.includes('application/pdf')) {
                // Direct PDF link - use pdf-parse v1.1.1
                const buffer = await response.arrayBuffer();
                try {
                    const pdfParse = require('pdf-parse');
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
                } catch (pdfError: any) {
                    console.error('PDF URL parsing error:', pdfError);
                    return NextResponse.json(
                        { success: false, error: 'Failed to parse PDF from URL.' },
                        { status: 400, headers: corsHeaders }
                    );
                }
            }

            // Handle HTML content
            const html = await response.text();

            // Extract text content from HTML
            // Remove script, style, and other non-content elements
            let textContent = html
                .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')
                .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
                .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
                .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
                .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '')
                .replace(/<!--[\s\S]*?-->/g, '')
                .replace(/<[^>]+>/g, ' ')
                .replace(/&nbsp;/g, ' ')
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'")
                .replace(/\s+/g, ' ')
                .trim();

            // Extract title from HTML
            const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
            const title = titleMatch ? titleMatch[1].trim() : 'Extracted Content';

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
