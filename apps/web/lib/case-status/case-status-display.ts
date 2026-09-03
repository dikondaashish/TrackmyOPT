function getDaysSince(iso: string | null | undefined, now = new Date()): number | null {
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

const SERVICE_CENTER_BY_PREFIX: Record<string, { name: string; location: string }> = {
  IOE: { name: "National Benefits Center", location: "Lee's Summit, MO" },
  EAC: { name: "Vermont Service Center", location: "St. Albans, VT" },
  WAC: { name: "California Service Center", location: "Laguna Niguel, CA" },
  LIN: { name: "Nebraska Service Center", location: "Lincoln, NE" },
  SRC: { name: "Texas Service Center", location: "Irving, TX" },
  MSC: { name: "National Benefits Center", location: "Lee's Summit, MO" },
  NBC: { name: "National Benefits Center", location: "Lee's Summit, MO" },
  YSC: { name: "Potomac Service Center", location: "Arlington, VA" },
};

function getServiceCenterFromReceipt(receiptNumber: string | null | undefined) {
  const normalized = (receiptNumber ?? "").trim().toUpperCase();
  if (normalized.length < 3) return null;
  return SERVICE_CENTER_BY_PREFIX[normalized.substring(0, 3)] ?? null;
}

export function getServiceCenterLabel(receiptNumber: string | null | undefined): string {
  return getServiceCenterFromReceipt(receiptNumber)?.name ?? "USCIS Service Center";
}

export function getServiceCenterLocation(receiptNumber: string | null | undefined): string | null {
  return getServiceCenterFromReceipt(receiptNumber)?.location ?? null;
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

  const isoDateMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoDateMatch) {
    const [, year, month, day] = isoDateMatch;
    const parsed = new Date(Number(year), Number(month) - 1, Number(day));
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }
  }

  if (trimmed.includes("T")) {
    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }
  }

  return trimmed;
}
