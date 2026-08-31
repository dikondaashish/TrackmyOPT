import {
  Controller,
  Headers,
  HttpException,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { Public } from '../common/decorators/public.decorator';
import { bearerMatches } from './bearer-token';
import { scanUploadBytes } from './scan-file';

@Controller()
export class ScanController {
  constructor(private readonly config: ConfigService) {}

  @Public()
  @Post('scan')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }),
  )
  scan(
    @Headers('authorization') authorization: string | undefined,
    @UploadedFile() file?: { buffer?: Buffer; originalname?: string },
  ) {
    const token = this.config.get<string>('MALWARE_SCAN_TOKEN');
    if (!token?.trim()) {
      throw new HttpException(
        'Malware scanner is not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    if (!bearerMatches(authorization, token)) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    if (!file?.buffer?.length) {
      throw new HttpException('file is required', HttpStatus.BAD_REQUEST);
    }
    return scanUploadBytes(file.buffer, file.originalname ?? 'upload');
  }
}
