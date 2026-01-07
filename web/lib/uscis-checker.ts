/**
 * USCIS Case Status Checker
 * Uses official USCIS Case Status API (developer.uscis.gov)
 * 
 * Authentication: OAuth 2.0 Client Credentials
 * Rate Limits:
 * - Sandbox: 5 TPS, 1,000 requests/day
 * - Production: 10 TPS, 400,000 requests/day
 */

export interface USCISStatus {
  receiptNumber: string;
  status: string;
  caseType: string;
  receivedDate: string | null;
  description: string;
}

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
      console.log('🔑 Using cached USCIS access token');
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

    // Log the request details (mask sensitive data)
    console.log('🔐 USCIS OAuth Token Request:');
    console.log(`   URL: ${tokenUrl}`);
    console.log(`   Method: POST`);
    console.log(`   Headers: Content-Type: application/x-www-form-urlencoded, demo_id: 3333`);
    console.log(`   Client ID: ${clientId.substring(0, 8)}...`);
    console.log(`   Grant Type: client_credentials`);

    const requestBody = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }).toString();

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'demo_id': '3333',
      },
      body: requestBody,
    });

    console.log(`📥 USCIS OAuth Response:`);
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()))}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ USCIS OAuth failed (${response.status}):`, errorText);
      console.error('💡 Check if Client ID and Client Secret are correct in Vercel');
      return null;
    }

    const data = await response.json();
    console.log(`   Token received: ${data.access_token ? 'Yes (length: ' + data.access_token.length + ')' : 'No'}`);
    console.log(`   Expires in: ${data.expires_in} seconds`);

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

    console.log('✅ USCIS access token obtained and cached');
    return access_token;
  } catch (error) {
    console.error('❌ Error getting USCIS access token:', error);
    return null;
  }
}

/**
 * Fetch case status from official USCIS API
 * @param receiptNumber - USCIS receipt number (e.g., IOE1234567890)
 * @returns Case status information or null if not found
 */
export async function checkUSCISStatus(
  receiptNumber: string
): Promise<USCISStatus | null> {
  try {
    console.log('📋 USCIS Case Status Check:');
    console.log(`   Receipt Number: ${receiptNumber}`);

    // Get OAuth access token
    const accessToken = await getUSCISAccessToken();
    if (!accessToken) {
      console.error('❌ Failed to get access token');
      return null;
    }

    // USCIS API endpoint
    const baseUrl = process.env.USCIS_API_BASE_URL || 'https://api-int.uscis.gov/case-status';
    const url = `${baseUrl}/${receiptNumber}`;

    // Log the request details
    console.log('📤 USCIS Case Status API Request:');
    console.log(`   URL: ${url}`);
    console.log(`   Method: GET`);
    console.log(`   Headers: Authorization: Bearer ${accessToken.substring(0, 20)}..., Accept: application/json, demo_id: 3333`);

    // Make GET request to USCIS API
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'demo_id': '3333',
      },
    });

    console.log('📥 USCIS Case Status API Response:');
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()))}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error(`❌ USCIS API returned ${response.status}:`, errorData);

      // Check if using sandbox
      const isSandbox = baseUrl.includes('api-int');

      // Handle specific error codes
      if (response.status === 404) {
        if (isSandbox) {
          console.error(`❌ SANDBOX MODE: Receipt number ${receiptNumber} not found`);
          console.error(`ℹ️  Sandbox only accepts STAGING receipt numbers like:`);
          console.error(`   - EAC9999103403 (Approved case)`);
          console.error(`   - SRC9999102777 (Active case)`);
          console.error(`   - LIN9999106498 (Pending case)`);
          console.error(`💡 For REAL receipt numbers, you need PRODUCTION access.`);
          console.error(`📧 Request production access: developersupport@uscis.dhs.gov`);
        } else {
        }
      } else if (response.status === 422) {
      } else if (response.status === 429) {
      } else if (response.status === 503) {
        if (isSandbox) {
          console.error(`⏰ SANDBOX CLOSED: The USCIS Sandbox API is offline`);
          console.error(`📅 Operating Hours: Monday-Friday, 7:00 AM - 8:00 PM EST`);
          console.error(`💡 Current time is outside business hours.`);
          console.error(`🕐 Please test during: Mon-Fri 7AM-8PM EST`);
        } else {
          console.error(`⚠️  USCIS API temporarily unavailable (503)`);
        }
      }

      return null;
    }

    const data: USCISAPIResponse = await response.json();
    console.log('📥 USCIS Case Status Response Body:');
    console.log(`   Receipt: ${data.case_status?.receiptNumber}`);
    console.log(`   Form Type: ${data.case_status?.formType}`);
    console.log(`   Status: ${data.case_status?.current_case_status_text_en}`);

    // Transform API response to our format
    const status: USCISStatus = {
      receiptNumber: data.case_status.receiptNumber,
      status: data.case_status.current_case_status_text_en,
      caseType: data.case_status.formType,
      receivedDate: parseUSCISDate(data.case_status.submittedDate),
      description: data.case_status.current_case_status_desc_en,
    };

    console.log('✅ USCIS Case Status successfully retrieved');
    return status;
  } catch (error) {
    console.error('❌ Error checking USCIS status:', error);
    return null;
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

