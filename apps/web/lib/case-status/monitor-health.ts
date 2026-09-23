import { parseValidDate } from './safe-dates';

/** Daily monitoring has a grace period, not a promise of an exact queue time. */
export function monitorHealth(
  enabled: boolean,
  checked: string | null,
  failed: string | null,
  nowMs: number
) {
  if (!enabled) return 'off';
  const successAt = parseValidDate(checked)?.getTime();
  const failureAt = parseValidDate(failed)?.getTime();
  if (
    failureAt != null &&
    failureAt <= nowMs &&
    (successAt == null || failureAt >= successAt)
  )
    return 'failed';
  if (successAt == null || !Number.isFinite(nowMs) || successAt > nowMs)
    return 'unconfirmed';
  return nowMs - successAt > 36 * 60 * 60 * 1000 ? 'delayed' : 'recent';
}
