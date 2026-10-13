import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OracleJobDataStore } from './oracle-job-data-store';

/** Returns only a well-formed ORA-/NJS-/DPI- code; never the error message. */
export function safeOracleErrorCode(error: unknown): string | undefined {
  const code = (error as { code?: unknown } | null)?.code;
  return typeof code === 'string' && /^(ORA|NJS|DPI)-\d{3,5}$/.test(code)
    ? code
    : undefined;
}

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
    let errorCode: string | undefined;

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
    } catch (error) {
      // Deliberately suppress the underlying message: credentials, descriptors,
      // SQL errors, and server metadata must never reach application logs.
      // Only a bare driver code (e.g. ORA-01017, NJS-500) is kept to diagnose.
      succeeded = false;
      errorCode = safeOracleErrorCode(error);
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
      const code = errorCode ? `, ${errorCode}` : '';
      this.logger.error(`Oracle shadow probe failed (${elapsedMs}ms${code})`);
    }
  }

  private isEnabled() {
    return this.config.get<boolean>('ORACLE_SHADOW_PROBE_ON_BOOT') === true;
  }
}
