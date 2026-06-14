export type CaseWithPrimary = {
  id: string;
  is_primary?: boolean | null;
  created_at?: string | null;
};

/** Pick the dashboard primary case, falling back to oldest row. */
export function pickPrimaryCase<T extends CaseWithPrimary>(
  cases: T[]
): T | null {
  if (cases.length === 0) return null;
  const primary = cases.find((c) => c.is_primary);
  if (primary) return primary;
  const sorted = [...cases].sort((a, b) => {
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
    return aTime - bTime;
  });
  return sorted[0] ?? null;
}
