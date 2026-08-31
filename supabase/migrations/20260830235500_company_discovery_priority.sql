-- Rank unchecked H-1B sponsor seeds by recent petition activity while keeping
-- the queue resumable: null/old last_checked_at wins before priority.

ALTER TABLE public.companies
  ADD COLUMN discovery_priority bigint NOT NULL DEFAULT 0
  CHECK (discovery_priority >= 0);

UPDATE public.companies AS company
SET discovery_priority =
  coalesce(sponsor.approvals_2025, 0)::bigint * 4
  + coalesce(sponsor.approvals_2024, 0)::bigint * 2
  + coalesce(sponsor.approvals_2023, 0)::bigint
FROM public.h1b_sponsors AS sponsor
WHERE sponsor.id = company.h1b_sponsor_id;

DROP INDEX public.companies_discovery_queue_idx;
CREATE INDEX companies_discovery_queue_idx
  ON public.companies (
    discovery_status,
    last_checked_at NULLS FIRST,
    discovery_priority DESC,
    id
  );

NOTIFY pgrst, 'reload schema';
