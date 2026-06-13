-- Bounded backfill: status_last_changed_at for free users with a recent REAL status change.
-- Source: latest change_log entry with old_status (matches live wedge semantics; excludes first-check-only rows).
-- Do not backfill changes older than 14 days.

UPDATE public.case_status cs
SET
  status_last_changed_at = sub.real_change_at,
  last_change_alert_suppressed = true,
  updated_at = NOW()
FROM (
  SELECT
    cs.id,
    MAX((entry->>'date')::timestamptz) AS real_change_at
  FROM public.case_status cs
  INNER JOIN public.profiles p ON p.user_id = cs.user_id
  CROSS JOIN LATERAL jsonb_array_elements(
    CASE
      WHEN jsonb_typeof(cs.change_log) = 'array' THEN cs.change_log
      ELSE '[]'::jsonb
    END
  ) AS entry
  WHERE cs.receipt_number IS NOT NULL
    AND cs.current_status IS NOT NULL
    AND btrim(cs.current_status) <> ''
    AND COALESCE(p.premium_status, false) = false
    AND cs.status_last_changed_at IS NULL
    AND entry ? 'date'
    AND NULLIF(btrim(entry->>'old_status'), '') IS NOT NULL
  GROUP BY cs.id
  HAVING MAX((entry->>'date')::timestamptz) >= NOW() - INTERVAL '14 days'
) sub
WHERE cs.id = sub.id;
