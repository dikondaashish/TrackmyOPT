export type CaseStatusHistoryEntry = {
  status: string;
  date: string;
  description?: string;
};

/** Coerce Supabase/realtime JSON into a safe timeline array for rendering. */
export function normalizeStatusHistory(value: unknown): CaseStatusHistoryEntry[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (item == null || typeof item !== "object") return [];

    const record = item as Record<string, unknown>;
    const status =
      typeof record.status === "string"
        ? record.status
        : typeof record.completedText === "string"
          ? record.completedText
          : "";
    const date = typeof record.date === "string" ? record.date : "";
    const description =
      typeof record.description === "string" ? record.description : undefined;

    if (!status && !date && !description) return [];

    return [
      {
        status,
        date,
        ...(description ? { description } : {}),
      },
    ];
  });
}

export function withNormalizedStatusHistory<T extends { status_history?: unknown }>(
  row: T
): T & { status_history: CaseStatusHistoryEntry[] } {
  return {
    ...row,
    status_history: normalizeStatusHistory(row.status_history),
  };
}
