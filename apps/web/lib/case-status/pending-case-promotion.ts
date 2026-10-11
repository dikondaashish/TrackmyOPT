/** Conservative, shared display/send eligibility for successfully checked cases. */
export function isVerifiedPendingCase(
  c: {
    current_status?: string | null;
    last_checked_at?: string | null;
    last_check_failed_at?: string | null;
  },
  now = Date.now()
) {
  const status = c.current_status ?? '';
  const checked = Date.parse(c.last_checked_at ?? '');
  return (
    !c.last_check_failed_at &&
    Number.isFinite(checked) &&
    checked <= now &&
    checked > now - 72 * 3600_000 &&
    /case was received|case is being actively reviewed|case is being processed|case is under review|case remains pending|fingerprints were taken|fingerprints.*applied|case was transferred|response.*evidence.*received/i.test(
      status
    ) &&
    !/approved|denied|rejected|withdraw|closed|terminated|revoked|produced|delivered|scheduled|notice of intent|request for|invalid|unable|failed|error|unknown|will be fetched/i.test(
      status
    )
  );
}
