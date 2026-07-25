import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  Query,
  Headers,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ResumeService } from './resume.service';
import { ApiKeyGuard } from '../common/guards/api-key.guard';

@Controller('resume')
@UseGuards(ApiKeyGuard)
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  private requireTrustedUserId(userId: string | undefined): string {
    if (!userId) {
      throw new HttpException(
        'Authenticated user context is required',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return userId;
  }

  @Post('save')
  async saveResume(
    @Headers('x-trackmyopt-user-id') trustedUserId: string | undefined,
    @Body()
    body: {
      userId?: unknown;
      filename: string;
      content: string;
      structuredData: Record<string, unknown>;
      filePath?: string;
    },
  ) {
    try {
      const userId = this.requireTrustedUserId(trustedUserId);
      const resumeData = { ...body };
      delete resumeData.userId;
      return await this.resumeService.saveResume(userId, resumeData);
    } catch (error: unknown) {
      if (error instanceof HttpException) throw error;
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('download-url')
  async getDownloadUrl(
    @Headers('x-trackmyopt-user-id') trustedUserId: string | undefined,
    @Body() body: { s3Key: string },
  ) {
    if (!body.s3Key)
      throw new HttpException('s3Key is required', HttpStatus.BAD_REQUEST);
    try {
      const userId = this.requireTrustedUserId(trustedUserId);
      const url = await this.resumeService.getDownloadUrl(userId, body.s3Key);
      return { url };
    } catch (error: unknown) {
      if (error instanceof HttpException) throw error;
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('list')
  async listResumes(
    @Headers('x-trackmyopt-user-id') trustedUserId: string | undefined,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('search') search?: string,
  ) {
    try {
      const userId = this.requireTrustedUserId(trustedUserId);
      return await this.resumeService.getResumes(userId, {
        limit: limit ? Number(limit) : undefined,
        offset: offset ? Number(offset) : undefined,
        search,
      });
    } catch (error: unknown) {
      if (error instanceof HttpException) throw error;
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async getResume(
    @Headers('x-trackmyopt-user-id') trustedUserId: string | undefined,
    @Param('id') id: string,
  ) {
    try {
      const userId = this.requireTrustedUserId(trustedUserId);
      return await this.resumeService.getResumeById(id, userId);
    } catch (error: unknown) {
      if (error instanceof HttpException) throw error;
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(errorMessage, HttpStatus.NOT_FOUND);
    }
  }

  @Delete(':id')
  async deleteResume(
    @Headers('x-trackmyopt-user-id') trustedUserId: string | undefined,
    @Param('id') id: string,
  ) {
    try {
      const userId = this.requireTrustedUserId(trustedUserId);
      return await this.resumeService.deleteResume(id, userId);
    } catch (error: unknown) {
      if (error instanceof HttpException) throw error;
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
