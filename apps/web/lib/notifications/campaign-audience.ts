/** An inactive account has existed for 14 days without a sign-in during that window. */
export function isInactiveAccount(user: {
  created_at: string; last_sign_in_at?: string | null; deleted_at?: string | null;
  email?: string | null; email_confirmed_at?: string | null;
}, cutoffMs: number): boolean {
  if (!user.email?.trim() || user.deleted_at || !user.email_confirmed_at) return false;
  const createdMs = Date.parse(user.created_at);
  const lastSignInMs = user.last_sign_in_at ? Date.parse(user.last_sign_in_at) : createdMs;
  return Number.isFinite(createdMs) && createdMs < cutoffMs &&
    Number.isFinite(lastSignInMs) && lastSignInMs < cutoffMs;
}

export interface FreeCampaignProfile {
  user_id: string;
  email: string | null;
  first_name: string | null;
  premium_status: boolean | null;
  pro_free_trial_consumed: boolean | null;
}

export interface CampaignAuthAccount {
  id: string;
  email?: string | null;
  email_confirmed_at?: string | null;
  deleted_at?: string | null;
}

/** Auth owns the verified address; a missing profile with no payment is also Free. */
export function selectFreeCampaignRecipients(
  profiles: FreeCampaignProfile[], accounts: CampaignAuthAccount[],
  optedOutIds: Set<string>, blockedEmails: Set<string>, paymentUserIds = new Set<string>(),
) {
  const profileById = new Map(profiles.map(profile => [profile.user_id, profile]));
  const seenEmails = new Set<string>();
  const recipients: Array<{ userId: string; email: string; firstName: string | null; introUsed: boolean; hasProfile: boolean }> = [];
  for (const account of accounts) {
    const profile = profileById.get(account.id);
    if ((profile && profile.premium_status !== false) || (!profile && paymentUserIds.has(account.id)) ||
      optedOutIds.has(account.id) || !account.email?.trim() || !account.email_confirmed_at || account.deleted_at) continue;
    const email = account.email.trim().toLowerCase();
    if ((profile?.email && profile.email.trim().toLowerCase() !== email) ||
      blockedEmails.has(email) || seenEmails.has(email)) continue;
    seenEmails.add(email);
    recipients.push({ userId: account.id, email, firstName: profile?.first_name ?? null,
      introUsed: profile?.pro_free_trial_consumed ?? false, hasProfile: !!profile });
  }
  return recipients.sort((a, b) => a.userId.localeCompare(b.userId));
}
