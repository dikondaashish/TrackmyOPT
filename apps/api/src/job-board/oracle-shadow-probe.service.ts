import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OracleJobDataStore } from './oracle-job-data-store';

/**
 * Performs one optional, read-only Oracle connectivity check at API startup.
 * This service deliberately has no job-data responsibilities and never
 * participates in the production Supabase store selection.
 */
@Injectable()
export class OracleShadowProbeService implements OnModuleInit {
  private readonly logger = new Logger(OracleShadowProbeService.name);

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    if (!this.isEnabled()) return;
    // Startup must not wait on an external database. runProbe catches every
    // failure, so the detached promise cannot crash the API process.
    void this.runProbe();
  }

  async runProbe() {
    if (!this.isEnabled()) return;

    const startedAt = Date.now();
    this.logger.log('Oracle shadow probe started');
    let store: OracleJobDataStore | undefined;
    let succeeded = false;

    try {
      const poolMax = this.config.get<number>('ORACLE_JOB_DB_POOL_MAX');
      const oracleEnvironment: Record<string, string | undefined> = {
        ORACLE_JOB_DB_CONNECT_STRING: this.config.get<string>(
          'ORACLE_JOB_DB_CONNECT_STRING',
        ),
        ORACLE_JOB_DB_USER: this.config.get<string>('ORACLE_JOB_DB_USER'),
        ORACLE_JOB_DB_PASSWORD: this.config.get<string>(
          'ORACLE_JOB_DB_PASSWORD',
        ),
      };
      if (poolMax !== undefined) {
        oracleEnvironment.ORACLE_JOB_DB_POOL_MAX = String(poolMax);
      }

      store = OracleJobDataStore.fromEnvironment(oracleEnvironment);
      await store.healthCheck();
      succeeded = true;
    } catch {
      // Deliberately suppress the underlying error: credentials, descriptors,
      // SQL errors, and server metadata must never reach application logs.
      succeeded = false;
    } finally {
      if (store) {
        try {
          await store.close();
        } catch {
          // Closing is best-effort and must remain free of sensitive logging.
          succeeded = false;
        }
      }
    }

    const elapsedMs = Date.now() - startedAt;
    if (succeeded) {
      this.logger.log(`Oracle shadow probe succeeded (${elapsedMs}ms)`);
    } else {
      this.logger.error(`Oracle shadow probe failed (${elapsedMs}ms)`);
    }
  }

  private isEnabled() {
    return this.config.get<boolean>('ORACLE_SHADOW_PROBE_ON_BOOT') === true;
  }
}
