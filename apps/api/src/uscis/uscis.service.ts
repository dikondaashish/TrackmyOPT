import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import * as Bull from 'bull';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { fetchCaseStatus, type USCISStatus } from './uscis-client';
import { filterCasesForPremiumAutoCheck } from './premium-auto-check';

export type { USCISHistoryItem, USCISStatus } from './uscis-client';

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
   * Queue daily auto-checks for Pro/Dedicated (premium_status) cases only.
   * Free users refresh manually via case-status/check.
   */
  async queueAllActiveCases() {
    const casesResponse = (await this.supabase
      .from('case_status')
      .select('receipt_number, user_id')) as unknown as {
      data: { receipt_number: string; user_id: string }[] | null;
      error: Error | null;
    };

    if (casesResponse.error) {
      throw new Error(`Failed to fetch cases: ${casesResponse.error.message}`);
    }

    const premiumResponse = (await this.supabase
      .from('profiles')
      .select('user_id')
      .eq('premium_status', true)) as unknown as {
      data: { user_id: string }[] | null;
      error: Error | null;
    };

    if (premiumResponse.error) {
      throw new Error(
        `Failed to fetch premium profiles: ${premiumResponse.error.message}`,
      );
    }

    const cases = casesResponse.data;
    if (!cases || cases.length === 0) {
      this.logger.log('No cases found to check');
      return { count: 0, skippedFree: 0 };
    }

    const premiumIds = (premiumResponse.data ?? []).map((p) => p.user_id);
    const { premiumCases, skippedFree } = filterCasesForPremiumAutoCheck(
      cases,
      premiumIds,
    );

    if (premiumCases.length === 0) {
      this.logger.log(
        `No premium cases to auto-check (skipped ${skippedFree} free)`,
      );
      return { count: 0, skippedFree };
    }

    this.logger.log(
      `Queueing ${premiumCases.length} premium cases for auto-check (skipped ${skippedFree} free)`,
    );

    // Stagger jobs with 150ms delay between each to stay within USCIS 10 TPS limit
    const jobs = premiumCases.map((c, index) => ({
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

    return { count: premiumCases.length, skippedFree };
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
   * Check Status (Called by Worker) — enrollment guard enforced in fetchCaseStatus.
   */
  async checkUSCISStatus(
    receiptNumber: string,
    userId: string,
  ): Promise<USCISStatus> {
    const clientId = this.configService.get<string>('USCIS_CLIENT_ID') || '';
    const clientSecret =
      this.configService.get<string>('USCIS_CLIENT_SECRET') || '';
    const baseUrl =
      this.configService.get<string>('USCIS_API_BASE_URL') ||
      'https://api.uscis.gov/case-status';
    const tokenUrl =
      this.configService.get<string>('USCIS_TOKEN_URL') ||
      'https://api.uscis.gov/oauth/accesstoken';

    return fetchCaseStatus({
      receiptNumber,
      userId,
      callSite: 'api/uscis.processor',
      supabase: this.supabase,
      clientId,
      clientSecret,
      baseUrl,
      tokenUrl,
      cachedToken: this.cachedToken,
      setCachedToken: (token) => {
        this.cachedToken = token;
      },
      logger: this.logger,
    });
  }
}
