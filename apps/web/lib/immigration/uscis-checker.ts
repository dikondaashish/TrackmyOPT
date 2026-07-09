/**
 * USCIS Case Status types and dev helpers.
 *
 * Production HTTP calls MUST go through lib/uscis/client.ts → fetchCaseStatus().
 */

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

/** @deprecated Use fetchCaseStatus from @/lib/uscis/client */
export async function checkUSCISStatus(
  _receiptNumber: string
): Promise<USCISResult> {
  return {
    success: false,
    error: {
      code: 403,
      message: "checkUSCISStatus is removed",
      userMessage: "Internal error. Please try again later.",
      details: "Use fetchCaseStatus({ receiptNumber, userId, callSite })",
    },
  };
}

/** Determine if status indicates approval */
export function isApproved(status: string | null | undefined): boolean {
  const normalized = (status ?? "").trim().toLowerCase();
  if (!normalized) return false;
  const approvedKeywords = ["approved", "card was mailed", "card was delivered"];
  return approvedKeywords.some((keyword) => normalized.includes(keyword));
}

/** Determine if status indicates rejection */
export function isRejected(status: string | null | undefined): boolean {
  const normalized = (status ?? "").trim().toLowerCase();
  if (!normalized) return false;
  const rejectedKeywords = ["denied", "rejected", "terminated"];
  return rejectedKeywords.some((keyword) => normalized.includes(keyword));
}

/** Determine if status indicates pending */
export function isPending(status: string | null | undefined): boolean {
  const normalized = (status ?? "").trim();
  if (!normalized) return true;
  return !isApproved(status) && !isRejected(status);
}

/**
 * Mock function for local development only.
 * Returns fake status data matching USCIS API shape.
 */
export function mockUSCISStatus(receiptNumber: string): USCISStatus {
  const statuses = [
    "Case Was Received",
    "Case Was Approved",
    "Request for Additional Evidence Was Sent",
    "Case is Being Actively Reviewed by USCIS",
    "Card Was Mailed To Me",
  ];

  const formTypes = ["I-765", "I-130", "I-485", "I-140", "I-539"];

  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
  const randomForm = formTypes[Math.floor(Math.random() * formTypes.length)];

  return {
    receiptNumber,
    status: randomStatus,
    caseType: randomForm,
    receivedDate: "January 15, 2024",
    description: `On January 15, 2024, we received your Form ${randomForm}, and sent you the acceptance notice.`,
    histCaseStatus: [
      { date: "2024-01-20", completedText: `We approved your Form ${randomForm}.` },
      { date: "2024-01-18", completedText: `We are actively reviewing your Form ${randomForm}.` },
      { date: "2024-01-15", completedText: `We received your Form ${randomForm}.` },
    ],
  };
}
