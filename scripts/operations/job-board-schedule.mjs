/**
 * Daily job-board ingestion slots, in America/New_York local time:
 *   Monday–Friday 14:00 and 21:00; Saturday–Sunday 21:00.
 *
 * GitHub cron runs in UTC, so the workflow fires at every UTC minute that can
 * correspond to a slot in either EST or EDT, and this module decides whether
 * "now" falls inside a slot. Daylight saving time is handled by the
 * time-zone database, not by hard-coded offsets.
 *
 * The run ID is derived from the slot's start, not the firing time, so every
 * firing inside one slot maps to the same `job-board-hour-*` ID and the API's
 * scheduler ledger suppresses the duplicates.
 */
export const SCHEDULE_TIME_ZONE = 'America/New_York';
export const WEEKDAY_SLOT_HOURS = [14, 21];
export const WEEKEND_SLOT_HOURS = [21];
/** A delayed GitHub cron still dispatches the slot within this window. */
export const SLOT_GRACE_MINUTES = 90;

const partsFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: SCHEDULE_TIME_ZONE,
  hourCycle: 'h23',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  weekday: 'short',
});

function localParts(date) {
  const parts = Object.fromEntries(
    partsFormatter.formatToParts(date).map(({ type, value }) => [type, value])
  );
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
    weekday: parts.weekday,
  };
}

/** Milliseconds New York local time is ahead of UTC at `date` (negative). */
function zoneOffsetMs(date) {
  const p = localParts(date);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - Math.floor(date.getTime() / 1000) * 1000;
}

/** UTC instant of a New York wall-clock time on the given local date. */
export function newYorkTimeToUtc(year, month, day, hour) {
  const guess = Date.UTC(year, month - 1, day, hour);
  let utc = guess - zoneOffsetMs(new Date(guess));
  // Re-evaluate at the candidate instant so a DST change between the guess
  // and the real instant is accounted for.
  utc = guess - zoneOffsetMs(new Date(utc));
  return new Date(utc);
}

export function slotHoursFor(weekday) {
  return weekday === 'Sat' || weekday === 'Sun'
    ? WEEKEND_SLOT_HOURS
    : WEEKDAY_SLOT_HOURS;
}

/**
 * The slot `now` belongs to, or null outside every slot window.
 * @returns {{ runId: string, slotStart: Date, localSlot: string } | null}
 */
export function scheduledSlot(now = new Date(), graceMinutes = SLOT_GRACE_MINUTES) {
  const local = localParts(now);
  for (const hour of slotHoursFor(local.weekday)) {
    const slotStart = newYorkTimeToUtc(local.year, local.month, local.day, hour);
    const elapsed = now.getTime() - slotStart.getTime();
    if (elapsed >= 0 && elapsed < graceMinutes * 60_000) {
      const date = `${local.year}-${String(local.month).padStart(2, '0')}-${String(local.day).padStart(2, '0')}`;
      return {
        runId: `job-board-hour-${slotStart.toISOString().slice(0, 13)}`,
        slotStart,
        localSlot: `${date} ${String(hour).padStart(2, '0')}:00 ${SCHEDULE_TIME_ZONE} (${local.weekday})`,
      };
    }
  }
  return null;
}

/** Every slot start between two instants, oldest first (for health checks). */
export function slotsBetween(from, to) {
  const slots = [];
  const day = new Date(from.getTime() - 24 * 60 * 60_000);
  for (let t = day.getTime(); t <= to.getTime() + 24 * 60 * 60_000; t += 24 * 60 * 60_000) {
    const local = localParts(new Date(t));
    for (const hour of slotHoursFor(local.weekday)) {
      const start = newYorkTimeToUtc(local.year, local.month, local.day, hour);
      if (start >= from && start <= to && !slots.some((s) => s.getTime() === start.getTime()))
        slots.push(start);
    }
  }
  return slots.sort((a, b) => a - b);
}
