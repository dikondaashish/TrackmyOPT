/**
 * USCIS Case Status Checker
 * Uses official USCIS Case Status API (developer.uscis.gov)
 *
 * Authentication: OAuth 2.0 Client Credentials
 * Rate Limits (Production): 10 TPS, 400,000 requests/day
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

export interface USCISError {
  code: number;
  message: string;
  userMessage: string;
  details?: string;
}

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

let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Get OAuth 2.0 access token for USCIS API.
 * Caches token until expiry (minus 5-min safety buffer).
 */
async function getUSCISAccessToken(): Promise<string | null> {
  try {
    if (cachedToken && Date.now() < cachedToken.expiresAt) {
      return cachedToken.token;
    }

    const clientId = process.env.USCIS_CLIENT_ID;
    const clientSecret = process.env.USCIS_CLIENT_SECRET;
    const tokenUrl = process.env.USCIS_TOKEN_URL || 'https://api.uscis.gov/oauth/accesstoken';

    if (!clientId || !clientSecret) {
      console.error('[USCIS] Missing USCIS_CLIENT_ID or USCIS_CLIENT_SECRET');
      return null;
    }

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      }).toString(),
    });

    if (!response.ok) {
      console.error(`[USCIS] OAuth failed with status ${response.status}`);
      return null;
    }

    const data = await response.json();
    const { access_token, expires_in } = data;

    if (!access_token) {
      console.error('[USCIS] No access_token in OAuth response');
      return null;
    }

    cachedToken = {
      token: access_token,
      expiresAt: Date.now() + (expires_in - 300) * 1000,
    };

    return access_token;
  } catch (error) {
    console.error('[USCIS] OAuth error:', sanitizeError(error));
    return null;
  }
}

/**
 * Fetch case status from official USCIS API.
 * @param receiptNumber - USCIS receipt number (e.g., IOE1234567890)
 */
export async function checkUSCISStatus(
  receiptNumber: string
): Promise<USCISResult> {
  try {
    const accessToken = await getUSCISAccessToken();
    if (!accessToken) {
      return {
        success: false,
        error: {
          code: 401,
          message: 'Authentication failed',
          userMessage: 'Unable to connect to USCIS at this time. Please try again later.',
          details: 'Failed to obtain OAuth access token',
        },
      };
    }

    const baseUrl = process.env.USCIS_API_BASE_URL || 'https://api.uscis.gov/case-status';
    const url = `${baseUrl}/${receiptNumber}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.message || 'Unknown error';

      console.error(`[USCIS] ${response.status} for ${receiptNumber}: ${errorMessage}`);

      // Invalidate cached token on auth failure so the next request gets a fresh one
      if (response.status === 401) {
        cachedToken = null;
      }

      switch (response.status) {
        case 401:
          return {
            success: false,
            error: {
              code: 401,
              message: errorMessage,
              userMessage: 'Session expired. Please refresh the page and try again.',
              details: 'Access token is invalid or expired',
            },
          };

        case 404:
          return {
            success: false,
            error: {
              code: 404,
              message: errorMessage,
              userMessage: `Case not found. USCIS does not recognize receipt number "${receiptNumber}". Please double-check the number and try again.`,
              details: 'Receipt number not found in USCIS system',
            },
          };

        case 422:
          return {
            success: false,
            error: {
              code: 422,
              message: errorMessage,
              userMessage: `Invalid receipt number format. "${receiptNumber}" should be 13 characters: a 3-letter prefix followed by 10 digits (e.g., IOE1234567890).`,
              details: 'Receipt number format validation failed',
            },
          };

        case 429:
          return {
            success: false,
            error: {
              code: 429,
              message: errorMessage,
              userMessage: 'Too many requests. Please wait a moment and try again.',
              details: 'USCIS API rate limit exceeded',
            },
          };

        case 503:
          return {
            success: false,
            error: {
              code: 503,
              message: errorMessage,
              userMessage: 'USCIS service is temporarily unavailable. Please try again later.',
              details: 'USCIS API is temporarily unavailable',
            },
          };

        default:
          return {
            success: false,
            error: {
              code: response.status,
              message: errorMessage,
              userMessage: `Unable to check case status (error ${response.status}). Please try again later.`,
              details: `Unexpected HTTP ${response.status}`,
            },
          };
      }
    }

    const data: USCISAPIResponse = await response.json();

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
    console.error('[USCIS] Exception:', sanitizeError(error));
    return {
      success: false,
      error: {
        code: 500,
        message: 'Connection error',
        userMessage: 'Unable to connect to USCIS. Please check your internet connection and try again.',
        details: 'Network or unexpected exception',
      },
    };
  }
}

/**
 * Parse USCIS date format "MM-DD-YYYY HH:MM:SS" → "Month Day, Year"
 */
function parseUSCISDate(dateString: string | null): string | null {
  if (!dateString) return null;

  try {
    const parts = dateString.split(' ')[0].split('-');
    if (parts.length !== 3) return null;

    const [month, day, year] = parts;
    const date = new Date(`${year}-${month}-${day}`);

    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return null;
  }
}

/** Determine if status indicates approval */
export function isApproved(status: string): boolean {
  const approvedKeywords = ['approved', 'card was mailed', 'card was delivered'];
  return approvedKeywords.some((keyword) =>
    status.toLowerCase().includes(keyword)
  );
}

/** Determine if status indicates rejection */
export function isRejected(status: string): boolean {
  const rejectedKeywords = ['denied', 'rejected', 'terminated'];
  return rejectedKeywords.some((keyword) =>
    status.toLowerCase().includes(keyword)
  );
}

/** Determine if status indicates pending */
export function isPending(status: string): boolean {
  return !isApproved(status) && !isRejected(status);
}

/**
 * Mock function for local development only.
 * Returns fake status data matching USCIS API shape.
 */
export function mockUSCISStatus(receiptNumber: string): USCISStatus {
  const statuses = [
    'Case Was Received',
    'Case Was Approved',
    'Request for Additional Evidence Was Sent',
    'Case is Being Actively Reviewed by USCIS',
    'Card Was Mailed To Me',
  ];

  const formTypes = ['I-765', 'I-130', 'I-485', 'I-140', 'I-539'];

  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
  const randomForm = formTypes[Math.floor(Math.random() * formTypes.length)];

  return {
    receiptNumber,
    status: randomStatus,
    caseType: randomForm,
    receivedDate: 'January 15, 2024',
    description: `On January 15, 2024, we received your Form ${randomForm}, and sent you the acceptance notice.`,
    histCaseStatus: [
      { date: '2024-01-20', completedText: `We approved your Form ${randomForm}.` },
      { date: '2024-01-18', completedText: `We are actively reviewing your Form ${randomForm}.` },
      { date: '2024-01-15', completedText: `We received your Form ${randomForm}.` },
    ],
  };
}
