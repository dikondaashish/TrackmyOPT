/**
 * USCIS Case Status Checker
 * Uses official USCIS Case Status API (developer.uscis.gov)
 * 
 * Authentication: OAuth 2.0 Client Credentials
 * Rate Limits:
 * - Sandbox: 5 TPS, 1,000 requests/day
 * - Production: 10 TPS, 400,000 requests/day
 */

import { sanitizeError } from '@/lib/secure-logger';

export interface USCISHistoryItem {
  date: string;
  completedText: string;
}

export interface USCISStatus {
  receiptNumber: string;
  status: string;
  caseType: string;
  receivedDate: string | null;
  description: string;
  histCaseStatus: USCISHistoryItem[];
}

// Error response structure for USCIS API errors
export interface USCISError {
  code: number;
  message: string;
  userMessage: string;  // User-friendly message for UI display
  details?: string;     // Additional technical details for logging
}

// Result type that can be either success or error
export type USCISResult =
  | { success: true; data: USCISStatus }
  | { success: false; error: USCISError };

interface USCISAPIResponse {
  case_status: {
    receiptNumber: string;
    formType: string;
    submittedDate: string;
    modifiedDate: string;
    current_case_status_text_en: string;
    current_case_status_desc_en: string;
    hist_case_status?: Array<{
      date: string;
      completed_text_en: string;
    }>;
  };
  message: string;
}

// Token cache to avoid unnecessary OAuth requests
let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Get OAuth 2.0 access token for USCIS API
 * Caches token until it expires to avoid unnecessary requests
 */
async function getUSCISAccessToken(): Promise<string | null> {
  try {
    // Check if we have a valid cached token
    if (cachedToken && Date.now() < cachedToken.expiresAt) {
      return cachedToken.token;
    }


    const clientId = process.env.USCIS_CLIENT_ID;
    const clientSecret = process.env.USCIS_CLIENT_SECRET;
    const tokenUrl = process.env.USCIS_TOKEN_URL || 'https://api-int.uscis.gov/oauth/accesstoken';


    if (!clientId || !clientSecret) {
      console.error('❌ USCIS credentials not configured');
      console.error('💡 Please set USCIS_CLIENT_ID and USCIS_CLIENT_SECRET in Vercel environment variables');
      return null;
    }

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'demo_id': '3333',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      }).toString(),
    });


    if (!response.ok) {
      console.error(`❌ USCIS OAuth failed with status ${response.status}`);
      console.error('💡 Check if Client ID and Client Secret are correct in Vercel');
      return null;
    }

    const data = await response.json();

    const { access_token, expires_in } = data;

    if (!access_token) {
      console.error('❌ No access token in response');
      return null;
    }

    // Cache token (subtract 5 minutes for safety)
    const expiresInMs = (expires_in - 300) * 1000;
    cachedToken = {
      token: access_token,
      expiresAt: Date.now() + expiresInMs,
    };

    return access_token;
  } catch (error) {
    console.error('❌ Error getting USCIS access token:', sanitizeError(error));
    return null;
  }
}

/**
 * Fetch case status from official USCIS API
 * @param receiptNumber - USCIS receipt number (e.g., IOE1234567890)
 * @returns USCISResult with either success data or structured error
 */
export async function checkUSCISStatus(
  receiptNumber: string
): Promise<USCISResult> {
  try {
    // Get OAuth access token
    const accessToken = await getUSCISAccessToken();
    if (!accessToken) {
      console.error('❌ [USCIS API] ERROR 401: Failed to get OAuth access token');
      console.error('💡 Check USCIS_CLIENT_ID and USCIS_CLIENT_SECRET environment variables');
      return {
        success: false,
        error: {
          code: 401,
          message: 'Authentication failed',
          userMessage: '🔐 Authentication Error: Unable to connect to USCIS. Please try again later.',
          details: 'Failed to obtain OAuth access token from USCIS API',
        },
      };
    }

    // USCIS API endpoint
    const baseUrl = process.env.USCIS_API_BASE_URL || 'https://api-int.uscis.gov/case-status';
    const url = `${baseUrl}/${receiptNumber}`;
    const isSandbox = baseUrl.includes('api-int');

    console.log(`📡 [USCIS API] Calling: GET ${url}`);

    // Make GET request to USCIS API
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'demo_id': '3333',
      },
    });

    // Log the response status
    console.log(`📡 [USCIS API] Response Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.message || 'Unknown error';

      console.error(`❌ [USCIS API] ERROR ${response.status}: ${errorMessage}`);

      // Handle specific error codes with detailed logging
      switch (response.status) {
        case 401:
          console.error('🔐 [USCIS API] 401 Unauthorized - Invalid or expired access token');
          console.error('💡 Your access token may have expired. Will retry with fresh token.');
          return {
            success: false,
            error: {
              code: 401,
              message: errorMessage,
              userMessage: '🔐 Unauthorized (401): Your session has expired. Please refresh and try again.',
              details: 'USCIS API returned 401 - access token is invalid or expired',
            },
          };

        case 404:
          console.error(`🔍 [USCIS API] 404 Not Found - Receipt number: ${receiptNumber}`);
          if (isSandbox) {
            console.error('📋 [SANDBOX MODE] Only staging receipt numbers are accepted:');
            console.error('   ✓ EAC9999103403 (Approved case)');
            console.error('   ✓ SRC9999102777 (Active case)');
            console.error('   ✓ LIN9999106498 (Pending case)');
            console.error('💡 For REAL receipt numbers, request PRODUCTION access: developersupport@uscis.dhs.gov');
            return {
              success: false,
              error: {
                code: 404,
                message: errorMessage,
                userMessage: `� Receipt Not Found (404): "${receiptNumber}" is not valid in Sandbox mode. Please use a staging receipt number like EAC9999103403.`,
                details: 'Sandbox mode only accepts staging receipt numbers',
              },
            };
          }
          return {
            success: false,
            error: {
              code: 404,
              message: errorMessage,
              userMessage: `🔍 Case Not Found (404): USCIS does not recognize receipt number "${receiptNumber}". Please check and try again.`,
              details: 'Receipt number not found in USCIS system',
            },
          };

        case 422:
          console.error(`⚠️ [USCIS API] 422 Unprocessable Entity - Invalid format: ${receiptNumber}`);
          console.error('📋 Receipt number must be 13 characters: 3-letter prefix + 10 digits');
          console.error('   Example: IOE1234567890, EAC9999103403');
          return {
            success: false,
            error: {
              code: 422,
              message: errorMessage,
              userMessage: `⚠️ Invalid Format (422): Receipt number "${receiptNumber}" is not formatted correctly. It should be 13 characters (3-letter prefix + 10 digits). Example: IOE1234567890`,
              details: 'Receipt number does not match expected 13-character format',
            },
          };

        case 429:
          console.error('⏱️ [USCIS API] 429 Too Many Requests - Rate limit exceeded');
          console.error('📋 Sandbox limits: 5 requests/second, 1,000 requests/day');
          console.error('💡 Please wait and try again in a few seconds');
          return {
            success: false,
            error: {
              code: 429,
              message: errorMessage,
              userMessage: '⏱️ Rate Limit Exceeded (429): Too many requests. Please wait a few seconds and try again.',
              details: 'USCIS API rate limit exceeded (5 TPS or 1,000/day in sandbox)',
            },
          };

        case 503:
          console.error('🔴 [USCIS API] 503 Service Unavailable');
          if (isSandbox) {
            console.error('⏰ [SANDBOX] Operating Hours: Monday-Friday, 7:00 AM - 8:00 PM EST');
            console.error('💡 The sandbox API is offline outside business hours');
            return {
              success: false,
              error: {
                code: 503,
                message: errorMessage,
                userMessage: '🔴 Service Unavailable (503): USCIS Sandbox is offline. Operating hours are Monday-Friday, 7:00 AM - 8:00 PM EST.',
                details: 'Sandbox API is only available during business hours',
              },
            };
          }
          return {
            success: false,
            error: {
              code: 503,
              message: errorMessage,
              userMessage: '🔴 Service Unavailable (503): USCIS service is temporarily unavailable. Please try again later.',
              details: 'USCIS API is temporarily unavailable',
            },
          };

        default:
          console.error(`❓ [USCIS API] Unexpected error ${response.status}`);
          return {
            success: false,
            error: {
              code: response.status,
              message: errorMessage,
              userMessage: `❌ Error (${response.status}): Unable to check case status. ${errorMessage}`,
              details: `Unexpected HTTP status code: ${response.status}`,
            },
          };
      }
    }

    // SUCCESS - 200 OK
    console.log(`✅ [USCIS API] SUCCESS 200: Case status retrieved for ${receiptNumber}`);

    const data: USCISAPIResponse = await response.json();
    console.log(`📦 [USCIS API] Response received for ${receiptNumber}: status=${data.case_status.current_case_status_text_en}, formType=${data.case_status.formType}`);

    // Transform API response to our format
    const histCaseStatus: USCISHistoryItem[] = (data.case_status.hist_case_status || []).map(item => ({
      date: item.date,
      completedText: item.completed_text_en,
    }));

    const status: USCISStatus = {
      receiptNumber: data.case_status.receiptNumber,
      status: data.case_status.current_case_status_text_en,
      caseType: data.case_status.formType,
      receivedDate: parseUSCISDate(data.case_status.submittedDate),
      description: data.case_status.current_case_status_desc_en,
      histCaseStatus,
    };

    return { success: true, data: status };
  } catch (error) {
    console.error('❌ [USCIS API] EXCEPTION:', sanitizeError(error));
    return {
      success: false,
      error: {
        code: 500,
        message: String(error),
        userMessage: '❌ Connection Error: Unable to connect to USCIS. Please check your internet connection and try again.',
        details: `Exception: ${String(error)}`,
      },
    };
  }
}

/**
 * Parse USCIS API date format (MM-DD-YYYY HH:MM:SS) to readable format
 */
function parseUSCISDate(dateString: string | null): string | null {
  if (!dateString) return null;

  try {
    // USCIS format: "09-05-2023 14:28:46"
    const parts = dateString.split(' ')[0].split('-');
    if (parts.length !== 3) return null;

    const [month, day, year] = parts;
    const date = new Date(`${year}-${month}-${day}`);

    // Return in "Month Day, Year" format
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return null;
  }
}


/**
 * Mock function for development/testing
 * Returns fake status data matching USCIS API format
 */
export function mockUSCISStatus(receiptNumber: string): USCISStatus {
  const statuses = [
    'Case Was Received',
    'Case Was Approved',
    'Request for Additional Evidence Was Sent',
    'Case is Being Actively Reviewed by USCIS',
    'Interview Was Scheduled',
    'Card Was Mailed To Me',
    'Card Was Delivered To Me By The Post Office',
  ];

  const formTypes = ['I-765', 'I-130', 'I-485', 'I-140', 'I-539'];

  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
  const randomForm = formTypes[Math.floor(Math.random() * formTypes.length)];

  return {
    receiptNumber,
    status: randomStatus,
    caseType: randomForm,
    receivedDate: 'January 15, 2024',
    description: `On January 15, 2024, we received your Form ${randomForm}, and sent you the acceptance notice. Your case is being processed.`,
    histCaseStatus: [
      {
        date: '2024-01-20',
        completedText: `We approved your Form ${randomForm}.`,
      },
      {
        date: '2024-01-18',
        completedText: `We are actively reviewing your Form ${randomForm}.`,
      },
      {
        date: '2024-01-15',
        completedText: `We received your Form ${randomForm} and sent you the acceptance notice.`,
      },
    ],
  };
}

/**
 * Determine if status indicates approval
 */
export function isApproved(status: string): boolean {
  const approvedKeywords = ['approved', 'card was mailed', 'card was delivered'];
  return approvedKeywords.some((keyword) =>
    status.toLowerCase().includes(keyword)
  );
}

/**
 * Determine if status indicates rejection
 */
export function isRejected(status: string): boolean {
  const rejectedKeywords = ['denied', 'rejected', 'terminated'];
  return rejectedKeywords.some((keyword) =>
    status.toLowerCase().includes(keyword)
  );
}

/**
 * Determine if status indicates pending
 */
export function isPending(status: string): boolean {
  return !isApproved(status) && !isRejected(status);
}

