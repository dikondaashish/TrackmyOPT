import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

/** Only service-assigned app metadata grants access; user_metadata is editable. */
export function canReadEmailCampaigns(
  user: Pick<User, 'app_metadata' | 'email_confirmed_at' | 'is_anonymous'>
): boolean {
  return (
    user.app_metadata?.email_campaign_admin === true &&
    Boolean(user.email_confirmed_at) &&
    user.is_anonymous !== true
  );
}

export type EmailCampaignAdmin =
  | { status: 'admin'; email: string }
  | { status: 'signed_out' | 'forbidden' | 'unavailable' };

export async function getEmailCampaignAdmin(): Promise<EmailCampaignAdmin> {
  try {
    const supabase = await createClient();
    // Fetch a server-verified, current user, including current permission grants.
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) {
      return {
        status:
          error.name === 'AuthSessionMissingError' ||
          error.status === 401 ||
          error.status === 403
            ? 'signed_out'
            : 'unavailable',
      };
    }
    if (!user) return { status: 'signed_out' };
    if (!canReadEmailCampaigns(user)) return { status: 'forbidden' };
    return { status: 'admin', email: user.email || '' };
  } catch {
    return { status: 'unavailable' };
  }
}
