import {
  Controller,
  Param,
  Post,
  ServiceUnavailableException,
} from '@nestjs/common';
import { OracleIngestionRepairService } from './oracle-ingestion-repair.service';

/** App-wide API key guard applies. No public decorator or arbitrary payload. */
@Controller('job-board/ops/oracle-ingestion-repair')
export class OracleIngestionRepairController {
  constructor(private readonly repair: OracleIngestionRepairService) {}

  @Post(':index/:offset/:mode')
  async page(
    @Param('index') index: string,
    @Param('offset') offset: string,
    @Param('mode') mode: string,
  ) {
    if (!['inspect', 'repair'].includes(mode))
      throw new ServiceUnavailableException('invalid_mode');
    try {
      return await this.repair.page(
        Number(index),
        Number(offset),
        mode === 'repair',
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      // Never propagate driver errors, SQL, or connection details to HTTP.
      throw new ServiceUnavailableException(
        /^[a-z_]+$/.test(message) ? message : 'oracle_parity_operation_failed',
      );
    }
  }
}
