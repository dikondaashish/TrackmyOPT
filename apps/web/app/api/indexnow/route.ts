import { NextRequest, NextResponse } from "next/server";
import { verifyCronAuth } from "@/lib/api/verify-cron-auth";

/**
 * IndexNow API Endpoint
 * Submits URLs to Bing's IndexNow service for instant indexing
 * 
 * This endpoint receives a JSON payload with URLs to submit:
 * {
 *   "urlList": ["https://trackmyopt.com/blog/article-1", "https://trackmyopt.com/blog/article-2"]
 * }
 * 
 * Environment variables required:
 * - INDEXNOW_KEY: Your IndexNow API key
 * - CRON_SECRET: Bearer token for POST (same secret as cron routes)
 * 
 * Bing will verify ownership by checking:
 * https://trackmyopt.com/{INDEXNOW_KEY}.txt
 */

export async function POST(request: NextRequest) {
  const cronAuthError = verifyCronAuth(request);
  if (cronAuthError) return cronAuthError;

  try {
    const body = await request.json();
    const { urlList } = body;

    // Validate input
    if (!urlList || !Array.isArray(urlList) || urlList.length === 0) {
      return NextResponse.json(
        { error: 'urlList must be a non-empty array of URLs' },
        { status: 400 }
      );
    }

    // Validate INDEXNOW_KEY environment variable
    const indexNowKey = process.env.INDEXNOW_KEY;
    if (!indexNowKey) {
      console.error('INDEXNOW_KEY environment variable not set');
      return NextResponse.json(
        { error: 'IndexNow API key not configured' },
        { status: 500 }
      );
    }

    // Prepare IndexNow API request
    const indexNowPayload = {
      host: 'trackmyopt.com',
      key: indexNowKey,
      keyLocation: `https://trackmyopt.com/${indexNowKey}.txt`,
      urlList: urlList.slice(0, 10000), // IndexNow limits to 10,000 URLs per request
    };

    // Submit to IndexNow API
    const response = await fetch('https://api.indexnow.org/IndexNow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(indexNowPayload),
    });

    // Handle response
    if (response.status === 200) {
      return NextResponse.json(
        {
          success: true,
          message: `Successfully submitted ${urlList.length} URL(s) to IndexNow`,
          submittedCount: urlList.length,
        },
        { status: 200 }
      );
    } else if (response.status === 202) {
      // 202 Accepted - request accepted for processing
      return NextResponse.json(
        {
          success: true,
          message: `IndexNow accepted ${urlList.length} URL(s) for processing`,
          submittedCount: urlList.length,
        },
        { status: 202 }
      );
    } else {
      console.error('IndexNow API error:', response.status);
      return NextResponse.json(
        {
          success: false,
          error: `IndexNow API returned status ${response.status}`,
        },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('IndexNow endpoint error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'IndexNow submission failed',
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for health check / API documentation
 */
export async function GET() {
  return NextResponse.json({
    message: 'IndexNow API endpoint',
    usage: {
      method: 'POST',
      endpoint: '/api/indexnow',
      headers: { Authorization: 'Bearer <CRON_SECRET>' },
      body: {
        urlList: ['https://trackmyopt.com/page1', 'https://trackmyopt.com/page2'],
      },
    },
    documentation: 'https://www.indexnow.org/documentation',
  });
}
