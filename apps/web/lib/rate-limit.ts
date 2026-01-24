/**
 * Rate Limiting Utility
 * 
 * Prevents upload abuse by limiting the number of uploads per user per day
 * Premium users: 20 uploads/day
 * Uses database for persistent tracking across deployments
 */

import { createClient } from '@supabase/supabase-js';

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  message?: string;
}

const PREMIUM_DAILY_LIMIT = 20; // 20 uploads per day for premium users

/**
 * Check if user is within rate limit for document uploads
 */
export async function checkDocumentUploadRateLimit(
  userId: string
): Promise<RateLimitResult> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.toISOString();
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const todayEnd = tomorrow.toISOString();

    // Count uploads today
    const { count, error } = await supabase
      .from('documents')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('uploaded_at', todayStart)
      .lt('uploaded_at', todayEnd);

    if (error) {
      console.error('Rate limit check error:', error);
      // Allow upload if we can't check (fail open)
      return {
        allowed: true,
        remaining: PREMIUM_DAILY_LIMIT,
        resetAt: tomorrow,
      };
    }

    const uploadCount = count || 0;
    const remaining = Math.max(0, PREMIUM_DAILY_LIMIT - uploadCount);
    const allowed = uploadCount < PREMIUM_DAILY_LIMIT;


    return {
      allowed,
      remaining,
      resetAt: tomorrow,
      message: allowed 
        ? `${remaining} uploads remaining today`
        : `Daily upload limit reached. Resets at midnight.`,
    };

  } catch (error) {
    console.error('Rate limit check failed:', error);
    // Fail open - allow upload if rate limit check fails
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    return {
      allowed: true,
      remaining: PREMIUM_DAILY_LIMIT,
      resetAt: tomorrow,
    };
  }
}

/**
 * Get rate limit status for a user (without checking if allowed)
 */
export async function getRateLimitStatus(
  userId: string
): Promise<RateLimitResult> {
  return await checkDocumentUploadRateLimit(userId);
}

/**
 * Format time until reset
 */
export function getTimeUntilReset(resetAt: Date): string {
  const now = new Date();
  const diff = resetAt.getTime() - now.getTime();
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

