import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import * as Bull from 'bull';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

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

@Injectable()
export class UscisService {
  private readonly logger = new Logger(UscisService.name);
  private cachedToken: { token: string; expiresAt: number } | null = null;
  private supabase: SupabaseClient;

  constructor(
    private configService: ConfigService,
    @InjectQueue('uscis') private uscisQueue: Bull.Queue,
  ) {
    this.supabase = createClient(
      this.configService.get<string>('NEXT_PUBLIC_SUPABASE_URL') || '',
      this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') || '',
    ) as SupabaseClient;
  }

  /**
   * Queue jobs for ALL active cases (Cron Entrypoint)
   */
  async queueAllActiveCases() {
    // Fetch all active cases
    const fetchResponse = (await this.supabase
      .from('case_status')
      .select('receipt_number, user_id')) as unknown as {
      data: { receipt_number: string; user_id: string }[] | null;
      error: Error | null;
    };

    const cases = fetchResponse.data;
    const error = fetchResponse.error;

    if (error) {
      throw new Error(`Failed to fetch cases: ${error.message}`);
    }

    if (!cases || cases.length === 0) {
      this.logger.log('No cases found to check');
      return { count: 0 };
    }

    this.logger.log(`Queueing ${cases.length} cases for background check...`);

    // Stagger jobs with 150ms delay between each to stay within USCIS 10 TPS limit
    const jobs = cases.map((c, index) => ({
      name: 'check-status',
      data: { receiptNumber: c.receipt_number, userId: c.user_id },
      opts: {
        removeOnComplete: true,
        removeOnFail: false, // Keep failed jobs for dead letter inspection
        attempts: 3,
        backoff: { type: 'exponential' as const, delay: 5000 },
        delay: index * 150, // Stagger: 0ms, 150ms, 300ms, ...
      },
    }));

    await this.uscisQueue.addBulk(jobs);

    return { count: cases.length };
  }

  /**
   * Queue a single check status job
   */
  async queueCheckStatus(receiptNumber: string, userId: string) {
    this.logger.log(`Queueing check for ${receiptNumber} (User: ${userId})`);
    return this.uscisQueue.add('check-status', {
      receiptNumber,
      userId,
    });
  }

  /**
   * Check Status (Called by Worker)
   */
  async checkUSCISStatus(receiptNumber: string): Promise<USCISStatus> {
    const accessToken = await this.getAccessToken();
    if (!accessToken) {
      throw new Error('Failed to obtain USCIS Access Token');
    }

    const baseUrl =
      this.configService.get<string>('USCIS_API_BASE_URL') ||
      'https://api.uscis.gov/case-status';
    const url = `${baseUrl}/${receiptNumber}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.cachedToken = null;
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
    } catch (error) {
      this.logger.error(
        `Failed to check status for ${receiptNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  private async getAccessToken(): Promise<string | null> {
    if (this.cachedToken && Date.now() < this.cachedToken.expiresAt) {
      return this.cachedToken.token;
    }

    const clientId = this.configService.get<string>('USCIS_CLIENT_ID');
    const clientSecret = this.configService.get<string>('USCIS_CLIENT_SECRET');
    const tokenUrl =
      this.configService.get<string>('USCIS_TOKEN_URL') ||
      'https://api.uscis.gov/oauth/accesstoken';

    if (!clientId || !clientSecret) {
      this.logger.error('USCIS credentials missing');
      return null;
    }

    try {
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: clientId,
          client_secret: clientSecret,
        }).toString(),
      });

      if (!response.ok) throw new Error('Auth Failed');

      const rawData: unknown = await response.json();
      const data = rawData as {
        access_token: string;
        expires_in: number;
      };
      const { access_token, expires_in } = data;

      this.cachedToken = {
        token: String(access_token),
        expiresAt: Date.now() + (Number(expires_in) - 60) * 1000,
      };

      return String(access_token);
    } catch (error) {
      this.logger.error(
        `Failed to get Access Token: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return null;
    }
  }
}
