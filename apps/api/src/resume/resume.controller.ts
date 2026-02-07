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
      structuredData: any;
      filePath?: string;
    },
  ) {
    try {
      return await this.resumeService.saveResume(body.userId, body);
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('download-url')
  async getDownloadUrl(@Body() body: { s3Key: string }) {
    if (!body.s3Key)
      throw new HttpException('s3Key is required', HttpStatus.BAD_REQUEST);
    try {
      const url = await this.resumeService.getDownloadUrl(body.s3Key);
      return { url };
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('list')
  async listResumes(@Query('userId') userId: string) {
    if (!userId)
      throw new HttpException('userId is required', HttpStatus.BAD_REQUEST);
    try {
      return await this.resumeService.getResumes(userId);
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async getResume(@Param('id') id: string) {
    try {
      return await this.resumeService.getResumeById(id);
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Delete(':id')
  async deleteResume(@Param('id') id: string, @Query('userId') userId: string) {
    if (!userId)
      throw new HttpException('userId is required', HttpStatus.BAD_REQUEST);
    try {
      return await this.resumeService.deleteResume(id, userId);
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
