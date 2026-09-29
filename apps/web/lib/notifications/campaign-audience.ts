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
