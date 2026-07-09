/**
 * Sole USCIS Case Status HTTP entry point for the NestJS API worker.
 */

import { Logger } from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  assertReceiptEnrolledByUser,
  UnauthorizedReceiptLookupError,
} from './enrollment-guard';

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

export type FetchCaseStatusInput = {
  receiptNumber: string;
  userId: string;
  callSite: string;
  supabase: SupabaseClient;
  clientId: string;
  clientSecret: string;
  baseUrl: string;
  tokenUrl: string;
  cachedToken: { token: string; expiresAt: number } | null;
  setCachedToken: (token: { token: string; expiresAt: number } | null) => void;
  logger: Logger;
};

async function getAccessToken(input: {
  clientId: string;
  clientSecret: string;
  tokenUrl: string;
  cachedToken: { token: string; expiresAt: number } | null;
  setCachedToken: (token: { token: string; expiresAt: number } | null) => void;
  logger: Logger;
}): Promise<string | null> {
  if (input.cachedToken && Date.now() < input.cachedToken.expiresAt) {
    return input.cachedToken.token;
  }

  if (!input.clientId || !input.clientSecret) {
    input.logger.error('USCIS credentials missing');
    return null;
  }

  try {
    const response = await fetch(input.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: input.clientId,
        client_secret: input.clientSecret,
      }).toString(),
    });

    if (!response.ok) throw new Error('Auth Failed');

    const rawData: unknown = await response.json();
    const data = rawData as { access_token: string; expires_in: number };
    const { access_token, expires_in } = data;

    const cached = {
      token: String(access_token),
      expiresAt: Date.now() + (Number(expires_in) - 60) * 1000,
    };
    input.setCachedToken(cached);
    return cached.token;
  } catch (error) {
    input.logger.error(
      `Failed to get Access Token: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
    return null;
  }
}

export async function fetchCaseStatus(
  input: FetchCaseStatusInput,
): Promise<USCISStatus> {
  const normalizedReceipt = await assertReceiptEnrolledByUser(input.supabase, {
    userId: input.userId,
    receiptNumber: input.receiptNumber,
    callSite: input.callSite,
  });

  const accessToken = await getAccessToken(input);
  if (!accessToken) {
    throw new UnauthorizedReceiptLookupError(
      'Failed to obtain USCIS access token; lookup blocked.',
    );
  }

  const url = `${input.baseUrl}/${normalizedReceipt}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      input.setCachedToken(null);
    }
    throw new Error(
      `USCIS API Error ${response.status}: ${response.statusText}`,
    );
  }

  const data = (await response.json()) as USCISAPIResponse;

  const histCaseStatus: USCISHistoryItem[] = (
    data.case_status.hist_case_status || []
  ).map((item) => ({
    date: String(item.date),
    completedText: String(item.completed_text_en),
  }));

  return {
    receiptNumber: String(data.case_status.receiptNumber),
    status: String(data.case_status.current_case_status_text_en),
    caseType: String(data.case_status.formType),
    receivedDate: data.case_status.submittedDate
      ? String(data.case_status.submittedDate)
      : null,
    description: String(data.case_status.current_case_status_desc_en),
    histCaseStatus,
  };
}
