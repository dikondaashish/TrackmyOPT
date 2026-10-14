import {
  BadRequestException,
  Controller,
  Get,
  Inject,
  Logger,
  OnModuleDestroy,
  Query,
  ServiceUnavailableException,
} from '@nestjs/common';
import { OracleH1bFilingsReader } from './oracle-h1b-filings-reader';

export const H1B_FILINGS_READER = Symbol('H1B_FILINGS_READER');

const MAX_LOOKUP_LENGTH = 300;

/**
 * Internal server-to-server read boundary for the Oracle H-1B filings copy.
 * The app-wide API-key guard protects these routes. Sponsor rows, premium
 * checks, and free-tier limits stay in the web/Supabase layer.
 */
@Controller('sponsor-data')
export class SponsorDataController implements OnModuleDestroy {
  private readonly logger = new Logger(SponsorDataController.name);

  constructor(
    @Inject(H1B_FILINGS_READER)
    private readonly reader: OracleH1bFilingsReader,
  ) {}

  @Get('filings')
  async listFilings(
    @Query('sponsorId') sponsorId?: string,
    @Query('employerName') employerName?: string,
  ) {
    const id = sponsorId?.trim();
    const name = employerName?.trim() || undefined;
    if (!id || id.length > MAX_LOOKUP_LENGTH)
      throw new BadRequestException('sponsorId is required');
    if (name && name.length > MAX_LOOKUP_LENGTH)
      throw new BadRequestException('employerName is too long');
    try {
      return { filings: await this.reader.listFilings(id, name) };
    } catch (error) {
      throw this.unavailable('filings lookup', error);
    }
  }

  @Get('filings/health')
  async health() {
    try {
      return { ok: true, ...(await this.reader.healthCheck()) };
    } catch (error) {
      throw this.unavailable('filings health check', error);
    }
  }

  async onModuleDestroy() {
    await this.reader.close();
  }

  /** Log only a bare driver code; never the message, SQL, or binds. */
  private unavailable(operation: string, error: unknown) {
    const code = (error as { code?: unknown } | null)?.code;
    const safeCode =
      typeof code === 'string' && /^(ORA|NJS|DPI)-\d{3,5}$/.test(code)
        ? `, ${code}`
        : '';
    this.logger.error(`Oracle ${operation} failed${safeCode}`);
    return new ServiceUnavailableException('H-1B filings are unavailable');
  }
}
