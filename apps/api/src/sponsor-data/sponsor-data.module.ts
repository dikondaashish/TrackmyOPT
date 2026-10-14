import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OracleH1bFilingsReader } from './oracle-h1b-filings-reader';
import {
  H1B_FILINGS_READER,
  SponsorDataController,
} from './sponsor-data.controller';

@Module({
  controllers: [SponsorDataController],
  providers: [
    {
      provide: H1B_FILINGS_READER,
      inject: [ConfigService],
      // Lazy: no Oracle connection is opened until the first request.
      useFactory: (config: ConfigService) =>
        new OracleH1bFilingsReader({
          ORACLE_JOB_DB_CONNECT_STRING: config.get<string>(
            'ORACLE_JOB_DB_CONNECT_STRING',
          ),
          ORACLE_JOB_DB_USER: config.get<string>('ORACLE_JOB_DB_USER'),
          ORACLE_JOB_DB_PASSWORD: config.get<string>('ORACLE_JOB_DB_PASSWORD'),
        }),
    },
  ],
})
export class SponsorDataModule {}
