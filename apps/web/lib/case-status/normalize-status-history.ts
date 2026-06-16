export type CaseStatusHistoryEntry = {
  status: string;
  date: string;
  description?: string;
};

type UscisHistoryItem = { date: string; completedText: string };

function normalizeStatusText(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

/** Merge USCIS current status + long description into timeline entries for storage. */
export function buildStatusHistoryFromUscis(
  currentStatus: string,
  currentDescription: string,
  histCaseStatus: UscisHistoryItem[]
): CaseStatusHistoryEntry[] {
  if (!histCaseStatus.length) {
    if (!currentStatus.trim()) return [];
    return [
      {
        status: currentStatus,
        date: new Date().toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        description: currentDescription.trim() || currentStatus,
      },
    ];
  }

  const mapped = histCaseStatus.map((item, index) => {
    const isLatest = index === 0;
    const matchesCurrent =
      item.completedText === currentStatus ||
      normalizeStatusText(item.completedText) === normalizeStatusText(currentStatus);
    const useFullDescription =
      isLatest && matchesCurrent && Boolean(currentDescription.trim());

    return {
      status: item.completedText,
      date: item.date,
      description: useFullDescription ? currentDescription.trim() : item.completedText,
    };
  });

  const latest = mapped[0];
  const latestMatchesCurrent =
    latest &&
    (latest.status === currentStatus ||
      normalizeStatusText(latest.status) === normalizeStatusText(currentStatus));

  if (currentStatus.trim() && !latestMatchesCurrent) {
    return [
      {
        status: currentStatus,
        date:
          latest?.date ||
          new Date().toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          }),
        description: currentDescription.trim() || currentStatus,
      },
      ...mapped,
    ];
  }

  return mapped;
}

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
