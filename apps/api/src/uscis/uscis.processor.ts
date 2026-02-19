import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import * as Bull from 'bull';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UscisService } from './uscis.service';

@Processor('uscis')
export class UscisProcessor {
  private readonly logger = new Logger(UscisProcessor.name);
  private supabase: SupabaseClient;

  constructor(
    private readonly uscisService: UscisService,
    private readonly configService: ConfigService,
  ) {
    this.supabase = createClient(
      this.configService.get('NEXT_PUBLIC_SUPABASE_URL') || '',
      this.configService.get('SUPABASE_SERVICE_ROLE_KEY') || '',
    );
  }

  @Process('check-status')
  async handleCheckStatus(
    job: Bull.Job<{ receiptNumber: string; userId: string }>,
  ) {
    const { receiptNumber, userId } = job.data;
    this.logger.log(
      `Checking status for ${receiptNumber} (User: ${userId})...`,
    );

    try {
      // 1. Perform Check
      const result = await this.uscisService.checkUSCISStatus(receiptNumber);

      // 2. Update Database
      const { error } = await this.supabase
        .from('case_status')
        .update({
          current_status: result.status,
          last_checked_at: new Date().toISOString(),
          // Store full history in JSONB column if schema supports it
          history: result.histCaseStatus,
        })
        .eq('receipt_number', receiptNumber)
        .eq('user_id', userId);

      if (error) {
        this.logger.error(
          `Failed to update DB for ${receiptNumber}: ${error.message}`,
        );
        throw new Error(error.message);
      }

      this.logger.log(`Updated status for ${receiptNumber}: ${result.status}`);
      return result;
    } catch (error: any) {
      this.logger.error(
        `Job failed for ${receiptNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }
}
