import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class ResumeService {
    private readonly logger = new Logger(ResumeService.name);
    private supabase: SupabaseClient;

    constructor(private configService: ConfigService) {
        this.supabase = createClient(
            this.configService.get('NEXT_PUBLIC_SUPABASE_URL') || '',
            this.configService.get('SUPABASE_SERVICE_ROLE_KEY') || ''
        );
    }

    async saveResume(userId: string, data: any) {
        if (!userId) throw new Error('User ID is required');

        const { data: result, error } = await this.supabase
            .from('resumes')
            .insert({
                user_id: userId,
                filename: data.filename,
                content: data.content,
                structured_data: data.structuredData,
                is_parsed: true,
                created_at: new Date(),
            })
            .select()
            .single();

        if (error) {
            this.logger.error(`Failed to save resume: ${error.message}`);
            throw new Error(error.message);
        }
        return result;
    }

    async getResumes(userId: string) {
        const { data, error } = await this.supabase
            .from('resumes')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        return data;
    }

    async getResumeById(id: string) {
        const { data, error } = await this.supabase
            .from('resumes')
            .select('*')
            .eq('id', id)
            .single();

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
}
