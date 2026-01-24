import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { OcrModule } from './ocr/ocr.module';
import { UscisModule } from './uscis/uscis.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const url = configService.get('REDIS_URL');
        if (url) {
          return { redis: { url } }; // Production (Render/Upstash)
        }
        return {
          redis: {
            host: configService.get('REDIS_HOST') || 'localhost',
            port: configService.get('REDIS_PORT') || 6379,
          },
        };
      },
      inject: [ConfigService],
    }),
    OcrModule,
    UscisModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
