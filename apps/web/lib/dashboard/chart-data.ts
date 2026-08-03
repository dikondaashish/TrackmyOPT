import {
  calculateUnemploymentDays,
  type EmploymentSpan,
} from "@/lib/immigration/opt-calculations";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function toUTCDate(dateLike: string | Date): Date {
  const d = typeof dateLike === "string" ? new Date(dateLike) : new Date(dateLike);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

interface OptDistributionSlice {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

interface WeeklyUnemploymentPoint {
  day: string;
  days: number;
}

export function buildOptDistributionData(
  unemploymentDays: number,
  maxUnemploymentDays: number
): OptDistributionSlice[] {
  const used = Math.max(0, Math.min(unemploymentDays, maxUnemploymentDays));
  const remaining = Math.max(0, maxUnemploymentDays - used);
  return [
    { name: "Employed / covered", value: remaining, color: "#3b82f6" },
    { name: "Unemployment days used", value: used, color: "#ef4444" },
  ];
}

/** Cumulative unemployment through each of the last 7 calendar days (UTC). */
export function buildWeeklyUnemploymentTrend(
  optStartDate: string,
  optEadEndDate: string,
  employmentSpans: EmploymentSpan[],
  stemStartDate?: string | null,
  stemEndDate?: string | null
): WeeklyUnemploymentPoint[] {
  const today = toUTCDate(new Date());
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const optStart = toUTCDate(optStartDate);

  const points: WeeklyUnemploymentPoint[] = [];

  for (let offset = 6; offset >= 0; offset--) {
    const ref = new Date(today.getTime() - offset * MS_PER_DAY);

    if (ref.getTime() < optStart.getTime()) {
      points.push({ day: dayLabels[ref.getUTCDay()], days: 0 });
      continue;
    }

    const calc = calculateUnemploymentDays(
      optStartDate,
      optEadEndDate,
      employmentSpans,
      stemStartDate,
      stemEndDate,
      ref
    );

    points.push({
      day: dayLabels[ref.getUTCDay()],
      days: calc.used,
    });
  }

  return points;
}
