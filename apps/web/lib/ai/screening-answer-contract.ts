import type { ResumeAutofillSnapshotV1 } from '@/lib/resume/autofill-schema';

export interface ScreeningQuestionDraftRequest {
  questionText: string;
  characterLimit?: number;
  job: { companyName: string; roleTitle: string; jobDescription: string };
  snapshot: ResumeAutofillSnapshotV1;
  sourceContentHash: string;
  regenerate?: boolean;
}
export interface AiGenerationLimitState {
  allowed: boolean; dailyLimit: number; dailyRemaining: number;
  itemRegenerationLimit: number; itemRegenerationsRemaining: number;
  resetsAt?: string; error?: 'ai_daily_limit_reached'|'ai_item_regeneration_limit_reached'|'ai_rate_limited';
}
export interface ScreeningQuestionDraftResponse extends Omit<AiGenerationLimitState, 'error'> {
  ok: boolean; questionHash: string; draft?: string; sourceContentHash?: string;
  error?: 'sensitive'|'insufficient_context'|'limit'|'generation_failed'|'feature_disabled'|'not_implemented'|'ai_daily_limit_reached'|'ai_item_regeneration_limit_reached'|'ai_rate_limited';
}
export interface SavedScreeningAnswer { questionHash:string; normalizedQuestionText:string; editedAnswer:string; source:'user_edited_ai_draft'|'user_written'; createdAt:string; updatedAt:string; }
