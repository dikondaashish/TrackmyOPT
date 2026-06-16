export function getDaysSince(iso: string | null | undefined, now = new Date()): number | null {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  return Math.max(0, Math.floor((now.getTime() - then) / (1000 * 60 * 60 * 24)));
}

export function formatDaysAgoLabel(dateString: string | null | undefined): string {
  const days = getDaysSince(dateString);
  if (days === null) return "N/A";
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

export function getServiceCenterLabel(receiptNumber: string | null | undefined): string {
  const normalized = (receiptNumber ?? "").trim().toUpperCase();
  if (normalized.length < 3) return "USCIS Service Center";
  const prefix = normalized.substring(0, 3);
  const centerMap: Record<string, string> = {
    IOE: "National Benefits Center",
    EAC: "Vermont Service Center",
    WAC: "California Service Center",
    LIN: "Nebraska Service Center",
    SRC: "Texas Service Center",
    MSC: "National Benefits Center",
    NBC: "National Benefits Center",
    YSC: "Potomac Service Center",
  };
  return centerMap[prefix] ?? "USCIS Service Center";
}

export function calculateNextAutoCheck(lastCheckedAt: string | null): string {
  if (!lastCheckedAt) return "Checking soon...";
  const lastCheck = new Date(lastCheckedAt);
  const nextCheck = new Date(lastCheck.getTime() + 24 * 60 * 60 * 1000);
  const now = new Date();

  if (nextCheck <= now) return "Checking soon...";

  const hoursLeft = Math.floor((nextCheck.getTime() - now.getTime()) / (1000 * 60 * 60));
  const minutesLeft = Math.floor(
    ((nextCheck.getTime() - now.getTime()) % (1000 * 60 * 60)) / (1000 * 60)
  );

  if (hoursLeft > 0) {
    return `Next auto-check in ${hoursLeft}h ${minutesLeft}m`;
  }
  return `Next auto-check in ${minutesLeft}m`;
}

export function formatStatusLabel(
  status: string | null | undefined,
  fallback = "Checking USCIS status…"
): string {
  const normalized = (status ?? "").trim();
  return normalized || fallback;
}

/** Format ISO or USCIS date strings for display (e.g. "May 12, 2026"). */
export function formatUscisStatusDate(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}/.test(trimmed) && !trimmed.includes("T")) {
    return trimmed;
  }
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return trimmed;
  return parsed.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
