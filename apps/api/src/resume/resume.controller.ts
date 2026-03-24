import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  Query,
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

  @Post('save')
  async saveResume(
    @Body()
    body: {
      userId: string;
      filename: string;
      content: string;
      structuredData: Record<string, unknown>;
      filePath?: string;
    },
  ) {
    try {
      return await this.resumeService.saveResume(body.userId, body);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('download-url')
  async getDownloadUrl(@Body() body: { s3Key: string }) {
    if (!body.s3Key)
      throw new HttpException('s3Key is required', HttpStatus.BAD_REQUEST);
    try {
      const url = await this.resumeService.getDownloadUrl(body.s3Key);
      return { url };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('list')
  async listResumes(
    @Query('userId') userId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('search') search?: string,
  ) {
    if (!userId)
      throw new HttpException('userId is required', HttpStatus.BAD_REQUEST);
    try {
      return await this.resumeService.getResumes(userId, {
        limit: limit ? Number(limit) : undefined,
        offset: offset ? Number(offset) : undefined,
        search,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async getResume(@Param('id') id: string) {
    try {
      return await this.resumeService.getResumeById(id);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(errorMessage, HttpStatus.NOT_FOUND);
    }
  }

  @Delete(':id')
  async deleteResume(@Param('id') id: string, @Query('userId') userId: string) {
    if (!userId)
      throw new HttpException('userId is required', HttpStatus.BAD_REQUEST);
    try {
      return await this.resumeService.deleteResume(id, userId);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
