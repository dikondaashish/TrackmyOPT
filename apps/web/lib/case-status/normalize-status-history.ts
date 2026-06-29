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
  const sanitizedDescription = currentDescription.trim();

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
        description: sanitizedDescription || currentStatus,
      },
    ];
  }

  const mapped = histCaseStatus.map((item, index) => {
    const isLatest = index === 0;
    const matchesCurrent =
      item.completedText === currentStatus ||
      normalizeStatusText(item.completedText) === normalizeStatusText(currentStatus);
    const useFullDescription =
      isLatest && matchesCurrent && Boolean(sanitizedDescription);

    return {
      status: item.completedText,
      date: item.date,
      description: useFullDescription ? sanitizedDescription : item.completedText,
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
        description: sanitizedDescription || currentStatus,
      },
      ...mapped,
    ];
  }

  if (sanitizedDescription && mapped.length > 0) {
    mapped[0] = {
      ...mapped[0]!,
      status: currentStatus || mapped[0]!.status,
      description: sanitizedDescription,
    };
  }

  return mapped;
}

function resolveStatusString(record: Record<string, unknown>): string | null {
  if (typeof record.status === "string" && record.status.trim()) {
    return record.status.trim();
  }
  if (typeof record.completedText === "string" && record.completedText.trim()) {
    return record.completedText.trim();
  }
  return null;
}

function resolveDateString(record: Record<string, unknown>): string {
  if (typeof record.date === "string" && record.date.trim()) {
    return record.date.trim();
  }
  if (typeof record.timestamp === "string" && record.timestamp.trim()) {
    return record.timestamp.trim();
  }
  if (record.timestamp != null && typeof record.timestamp !== "object") {
    return String(record.timestamp);
  }
  return "";
}

function resolveDescription(
  record: Record<string, unknown>,
  status: string
): string | undefined {
  if (typeof record.description === "string" && record.description.trim()) {
    return record.description.trim();
  }
  if (typeof record.label === "string" && record.label.trim()) {
    return record.label.trim();
  }
  return status;
}

/** Coerce Supabase/realtime JSON into a safe timeline array for rendering. */
export function normalizeStatusHistory(value: unknown): CaseStatusHistoryEntry[] {
  if (value == null || !Array.isArray(value)) return [];

  const normalized: CaseStatusHistoryEntry[] = [];

  for (const item of value) {
    if (item == null || typeof item !== "object") continue;

    const record = item as Record<string, unknown>;
    const status = resolveStatusString(record);
    if (!status) continue;

    const date = resolveDateString(record);
    const description = resolveDescription(record, status);

    normalized.push({
      status,
      date,
      ...(description !== status ? { description } : {}),
    });
  }

  return normalized;
}

export function withNormalizedStatusHistory<T extends { status_history?: unknown }>(
  row: T
): T & { status_history: CaseStatusHistoryEntry[] } {
  return {
    ...row,
    status_history: normalizeStatusHistory(row.status_history),
  };
}
