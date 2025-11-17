/**
 * USCIS Case Status Checker
 * Fetches case status from USCIS website
 */

export interface USCISStatus {
  receiptNumber: string;
  status: string;
  caseType: string;
  receivedDate: string | null;
  description: string;
}

/**
 * Fetch case status from USCIS
 * @param receiptNumber - USCIS receipt number (e.g., IOE1234567890)
 * @returns Case status information or null if not found
 */
export async function checkUSCISStatus(
  receiptNumber: string
): Promise<USCISStatus | null> {
  try {
    console.log(`🔍 Checking USCIS status for: ${receiptNumber}`);

    // USCIS Case Status API endpoint
    const url = 'https://egov.uscis.gov/casestatus/mycasestatus.do';

    // Make POST request to USCIS
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      body: `appReceiptNum=${receiptNumber}&caseStatusSearchBtn=CHECK+STATUS`,
    });

    if (!response.ok) {
      console.error(`❌ USCIS API returned ${response.status}`);
      return null;
    }

    const html = await response.text();

    // Parse HTML response
    const status = parseUSCISResponse(html, receiptNumber);

    if (status) {
      console.log(`✅ Found status: ${status.status}`);
    } else {
      console.log(`❌ Could not parse status for ${receiptNumber}`);
    }

    return status;
  } catch (error) {
    console.error('❌ Error checking USCIS status:', error);
    return null;
  }
}

/**
 * Parse USCIS HTML response to extract status information
 */
function parseUSCISResponse(html: string, receiptNumber: string): USCISStatus | null {
  try {
    // Try to extract status title (h1)
    const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
    if (!titleMatch) {
      console.log('❌ Could not find status title');
      return null;
    }

    const status = titleMatch[1].trim().replace(/<[^>]*>/g, ''); // Remove HTML tags

    // Try to extract case description
    const descMatch = html.match(/<p[^>]*>(.*?)<\/p>/i);
    const description = descMatch
      ? descMatch[1].trim().replace(/<[^>]*>/g, '')
      : 'No description available';

    // Extract case type from receipt number (first 3 letters)
    const caseTypeCode = receiptNumber.substring(0, 3).toUpperCase();
    const caseType = getCaseTypeName(caseTypeCode);

    // Try to extract received date
    const dateMatch = description.match(/(\w+ \d{1,2}, \d{4})/);
    const receivedDate = dateMatch ? dateMatch[1] : null;

    return {
      receiptNumber,
      status,
      caseType,
      receivedDate,
      description,
    };
  } catch (error) {
    console.error('❌ Error parsing USCIS response:', error);
    return null;
  }
}

/**
 * Get human-readable case type name from code
 */
function getCaseTypeName(code: string): string {
  const caseTypes: Record<string, string> = {
    IOE: 'ELIS',
    WAC: 'California Service Center',
    LIN: 'Nebraska Service Center',
    EAC: 'Vermont Service Center',
    SRC: 'Texas Service Center',
    MSC: 'National Benefits Center',
    YSC: 'Potomac Service Center',
  };

  return caseTypes[code] || code;
}

/**
 * Mock function for development/testing
 * Returns fake status data
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

  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
  const caseTypeCode = receiptNumber.substring(0, 3).toUpperCase();

  return {
    receiptNumber,
    status: randomStatus,
    caseType: getCaseTypeName(caseTypeCode),
    receivedDate: 'January 15, 2024',
    description: `On January 15, 2024, we received your Form I-765, Application for Employment Authorization, and sent you the acceptance notice. Your case is being processed at ${getCaseTypeName(caseTypeCode)}.`,
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

