import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import * as Bull from 'bull';
import { APP_GUARD } from '@nestjs/core';
import { OcrModule } from './ocr/ocr.module';
import { UscisModule } from './uscis/uscis.module';
import { ResumeModule } from './resume/resume.module';
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
  USCIS_API_BASE_URL: Joi.string().uri().required(),
  USCIS_TOKEN_URL: Joi.string().uri().required(),
  NEXT_PUBLIC_SITE_URL: Joi.string().uri().required(),
  CRON_SECRET: Joi.string().min(8).required(),
});

const runtimeImports =
  process.env.NODE_ENV === 'test'
    ? []
    : [
        BullModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService): Bull.QueueOptions => {
            const url = configService.get<string>('REDIS_URL');
            if (url) {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              return { redis: { url } as any }; // Production (Render/Upstash)
            }
            return {
              redis: {
                host: configService.get<string>('REDIS_HOST') || 'localhost',
                port: configService.get<number>('REDIS_PORT') || 6379,
              },
            };
          },
          inject: [ConfigService],
        }),
        OcrModule,
        UscisModule,
        ResumeModule,
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
