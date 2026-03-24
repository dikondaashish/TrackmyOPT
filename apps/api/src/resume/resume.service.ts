import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class ResumeService {
  private readonly logger = new Logger(ResumeService.name);
  private supabase: SupabaseClient;
  private s3Client: S3Client;
  private bucket: string;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>('NEXT_PUBLIC_SUPABASE_URL') || '',
      this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') || '',
    ) as SupabaseClient;

    // Initialize S3 Client for downloads
    this.bucket = this.configService.get<string>('AWS_S3_BUCKET') || '';
    const region = this.configService.get<string>('AWS_REGION');
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>(
      'AWS_SECRET_ACCESS_KEY',
    );

    if (region && accessKeyId && secretAccessKey) {
      this.s3Client = new S3Client({
        region,
        credentials: { accessKeyId, secretAccessKey },
      });
    }
  }

  async saveResume(
    userId: string,
    data: {
      filename: string;
      content: string;
      structuredData?: Record<string, unknown>;
      filePath?: string;
    },
  ) {
    if (!userId) throw new Error('User ID is required');

    const response = (await this.supabase
      .from('resumes')
      .insert({
        user_id: userId,
        filename: data.filename,
        content: data.content,
        structured_data: data.structuredData,
        is_parsed: true,
        created_at: new Date(),
        file_path: data.filePath || null, // Store S3 key
      })
      .single()) as unknown as {
      data: Record<string, unknown>;
      error: Error | null;
    };

    const result = response.data;
    const error = response.error;

    if (error) {
      this.logger.error(`Failed to save resume: ${error.message}`);
      throw new Error(error.message);
    }
    return result;
  }

  async getResumes(userId: string, options?: { limit?: number; offset?: number; search?: string }) {
    let query = this.supabase
      .from('resumes')
      .select('id, filename, content, created_at, file_path, is_parsed', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (options?.search) {
      query = query.ilike('filename', `%${options.search}%`);
    }

    if (options?.limit) {
      const from = options.offset || 0;
      const to = from + options.limit - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query;

    if (error) throw new Error(error.message);

    // Truncate content for list view to reduce payload size
    const truncatedData = (data as any[]).map(resume => ({
      ...resume,
      content: resume.content ? (resume.content.substring(0, 500) + (resume.content.length > 500 ? '...' : '')) : ''
    }));

    return {
      data: truncatedData,
      total: count || 0
    };
  }

  async getResumeById(id: string) {
    const response = (await this.supabase
      .from('resumes')
      .select('*')
      .eq('id', id)
      .single()) as unknown as {
      data: Record<string, unknown>;
      error: Error | null;
    };

    const data = response.data;
    const error = response.error;

    if (error) throw new Error(error.message);
    return data;
  }

  async deleteResume(id: string, userId: string) {
    const { error } = await this.supabase
      .from('resumes')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
    return { success: true };
  }

  async getDownloadUrl(s3Key: string) {
    if (!this.s3Client) throw new Error('S3 Client not initialized');

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: s3Key,
      });

      // Generate presigned URL valid for 15 minutes
      const url = await getSignedUrl(this.s3Client, command, {
        expiresIn: 900,
      });
      return url;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to generate download URL: ${errorMessage}`);
      throw new Error('Could not generate download link');
    }
  }
}
