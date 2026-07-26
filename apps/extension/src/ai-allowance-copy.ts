export interface AiAllowanceLike {
  quotaPeriod?: 'day' | 'month';
  quotaLimit?: number;
  quotaRemaining?: number;
  dailyRemaining: number;
}

export function remainingAiAllowance(limits: AiAllowanceLike): number {
  const value =
    typeof limits.quotaRemaining === 'number'
      ? limits.quotaRemaining
      : limits.dailyRemaining;
  return Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0;
}

export function formatAiAllowanceCopy(limits: AiAllowanceLike): string {
  const remaining = remainingAiAllowance(limits);
  return limits.quotaPeriod === 'month'
    ? `${remaining} AI generations left this month.`
    : `${remaining} AI generations left today.`;
}
