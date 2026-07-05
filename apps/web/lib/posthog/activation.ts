/** Days from ISO signup date (YYYY-MM-DD) to today, UTC. */
export function daysSinceSignupDate(signupDate?: string | null): number | null {
  if (!signupDate || !/^\d{4}-\d{2}-\d{2}$/.test(signupDate)) return null;
  const start = Date.parse(`${signupDate}T00:00:00.000Z`);
  if (!Number.isFinite(start)) return null;
  const diffMs = Date.now() - start;
  return Math.max(0, Math.floor(diffMs / (24 * 60 * 60 * 1000)));
}

export function isActivatedUser(input: {
  onboardingCompleted: boolean;
  hasReceipt: boolean;
  hasStatus: boolean;
}): boolean {
  return input.onboardingCompleted && input.hasReceipt && input.hasStatus;
}
