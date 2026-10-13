/** Only these provider fields may become visible through an explicit free refresh. */
const STATUS_FIELDS = [
  'current_status',
  'case_type',
  'received_date',
  'status_history',
  'last_checked_at',
  'last_status_change_at',
  'last_check_failed_at',
  'last_check_error_code',
  'last_check_error_message',
] as const;

export function visibleStatusSnapshot(row: Record<string, unknown>) {
  return Object.fromEntries(
    STATUS_FIELDS.map((key) => [key, row[key] ?? null])
  );
}

export function caseForViewer<T extends Record<string, unknown>>(
  row: T,
  isPremium: boolean
): T {
  const {
    free_visible_status,
    free_first_refresh_pending,
    last_manual_check_at,
    ...metadata
  } = row;
  void free_first_refresh_pending;
  void last_manual_check_at;
  if (isPremium) return metadata as T;
  const snapshot =
    free_visible_status && typeof free_visible_status === 'object'
      ? (free_visible_status as Record<string, unknown>)
      : {};
  return {
    ...metadata,
    ...visibleStatusSnapshot(snapshot),
    change_log: [],
    pp_start_date: null,
    consecutive_failures: 0,
    status_last_changed_at: null,
    last_change_alert_suppressed: false,
    last_nearby_scan_at: null,
  } as unknown as T;
}
