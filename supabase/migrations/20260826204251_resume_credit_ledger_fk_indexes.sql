-- Ledger lookups join through these optional foreign keys during fulfillment
-- and support. Partial indexes keep the common balance-query index compact.
create index if not exists resume_credit_ledger_purchase_id_idx
  on public.resume_credit_ledger (purchase_id)
  where purchase_id is not null;

create index if not exists resume_credit_ledger_resume_generation_id_idx
  on public.resume_credit_ledger (resume_generation_id)
  where resume_generation_id is not null;
