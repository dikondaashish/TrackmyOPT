import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import * as Bull from 'bull';
import { APP_GUARD } from '@nestjs/core';
import { OcrModule } from './ocr/ocr.module';
import { UscisModule } from './uscis/uscis.module';
import { ResumeModule } from './resume/resume.module';
import { JobBoardModule } from './job-board/job-board.module';
import { OracleShadowProbeModule } from './job-board/oracle-shadow-probe.module';
import { DocumentSecurityModule } from './document-security/document-security.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApiKeyGuard } from './common/guards/api-key.guard';

import * as Joi from 'joi';

export const appConfigValidationSchema = Joi.object({
  PORT: Joi.number().default(3000),
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'local')
    .default('development'),
  API_SECRET_KEY: Joi.string().min(8).required(),
  CORS_ORIGINS: Joi.string().optional(),
  REDIS_URL: Joi.string().uri().optional(),
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  NEXT_PUBLIC_SUPABASE_URL: Joi.string().uri().required(),
  SUPABASE_SERVICE_ROLE_KEY: Joi.string().min(1).required(),
  AWS_REGION: Joi.string().required(),
  AWS_ACCESS_KEY_ID: Joi.string().required(),
  AWS_SECRET_ACCESS_KEY: Joi.string().required(),
  AWS_S3_BUCKET: Joi.string().required(),
  USCIS_CLIENT_ID: Joi.string().required(),
  USCIS_CLIENT_SECRET: Joi.string().required(),
  // Defaults match uscis.service.ts so Render can omit them.
  USCIS_API_BASE_URL: Joi.string()
    .uri()
    .default('https://api.uscis.gov/case-status'),
  USCIS_TOKEN_URL: Joi.string()
    .uri()
    .default('https://api.uscis.gov/oauth/accesstoken'),
  // Optional: notification fan-out skips when unset (uscis.processor).
  NEXT_PUBLIC_SITE_URL: Joi.string().uri().optional(),
  CRON_SECRET: Joi.string().min(8).optional(),
  MALWARE_SCAN_TOKEN: Joi.string().min(16).optional(),
  LATEX_COMPILER_TOKEN: Joi.string().min(16).optional(),
  // Supabase remains the production default. Oracle is intentionally only a
  // validated opt-in until its shadow adapter has passed production checks.
  JOB_DATA_STORE: Joi.string().valid('supabase', 'oracle').default('supabase'),
  ORACLE_SHADOW_PROBE_ON_BOOT: Joi.boolean().default(false),
  ORACLE_JOB_DB_CONNECT_STRING: Joi.string().min(1).optional(),
  ORACLE_JOB_DB_USER: Joi.string().min(1).optional(),
  ORACLE_JOB_DB_PASSWORD: Joi.string().min(1).optional(),
  ORACLE_JOB_DB_POOL_MAX: Joi.number().integer().min(1).max(10).default(4),
});

/** Fail fast on bad Redis instead of hanging Render health checks for ~15m. */
export function bullRedisOptions(opts: {
  url?: string;
  host?: string;
  port?: number;
}): Bull.QueueOptions {
  const shared = {
    connectTimeout: 10_000,
    maxRetriesPerRequest: 3,
    // Keep offline queue on — Bull issues commands during boot before the
    // socket is writable; enableOfflineQueue:false crashes the process.
    retryStrategy(times: number) {
      if (times > 5) return null;
      return Math.min(times * 200, 2000);
    },
  };

  if (opts.url) {
    const parsed = new URL(opts.url);
    return {
      redis: {
        ...shared,
        host: parsed.hostname,
        port: Number(parsed.port || 6379),
        username: parsed.username || undefined,
        password: parsed.password
          ? decodeURIComponent(parsed.password)
          : undefined,
        tls: parsed.protocol === 'rediss:' ? {} : undefined,
      },
    };
  }

  return {
    redis: {
      ...shared,
      host: opts.host || 'localhost',
      port: opts.port || 6379,
    },
  };
}

const runtimeImports =
  process.env.NODE_ENV === 'test'
    ? []
    : [
        BullModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService): Bull.QueueOptions =>
            bullRedisOptions({
              url: configService.get<string>('REDIS_URL'),
              host: configService.get<string>('REDIS_HOST'),
              port: configService.get<number>('REDIS_PORT'),
            }),
          inject: [ConfigService],
        }),
        OcrModule,
        UscisModule,
        ResumeModule,
        JobBoardModule,
        OracleShadowProbeModule,
        DocumentSecurityModule,
      ];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: appConfigValidationSchema,
    }),
    ...runtimeImports,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ApiKeyGuard,
    },
  ],
})
export class AppModule {}
