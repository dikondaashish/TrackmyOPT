import {
  calculateUnemploymentDays,
  type EmploymentSpan,
} from "@/lib/immigration/optCalculations";
import {
  isEmploymentTrackingIncomplete,
  shouldShowUnemploymentComplianceNumbers,
  type EmploymentSetupAcknowledgment,
} from "@/lib/immigration/employmentTracking";

export interface OptDatesFormData {
  program_end_date?: string;
  dso_recommendation_date?: string;
  opt_start_date?: string;
  opt_ead_end_date?: string;
  stem_start_date?: string;
}

/** Parse MM/DD/YYYY or ISO date string to local midnight Date. */
export function parseOptDateInput(value: string | undefined | null): Date | null {
  if (!value?.trim()) return null;
  const str = value.trim();
  const mmddyyyy = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mmddyyyy) {
    const month = Number(mmddyyyy[1]) - 1;
    const day = Number(mmddyyyy[2]);
    const year = Number(mmddyyyy[3]);
    const d = new Date(year, month, day);
    if (Number.isNaN(d.getTime())) return null;
    d.setHours(0, 0, 0, 0);
    return d;
  }
  const iso = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    const d = new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
    if (Number.isNaN(d.getTime())) return null;
    d.setHours(0, 0, 0, 0);
    return d;
  }
  const d = new Date(str);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
}

function toCalcDateString(value: string): string {
  const d = parseOptDateInput(value);
  if (!d) return value;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function daysBetween(from: Date, to: Date): number {
  return Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

export interface OptDatesStatusSnapshot {
  hasProgramEnd: boolean;
  hasOptStart: boolean;
  hasEmployment: boolean;
  clockActive: boolean;
  trackingIncomplete: boolean;
  unemploymentLabel: string;
  unemploymentDetail: string;
  unemploymentTone: "neutral" | "good" | "warning" | "critical";
  optEndLabel: string;
  optEndDetail: string;
  optEndDaysLeft: number | null;
  filingLabel: string;
  filingDetail: string;
  filingTone: "neutral" | "good" | "warning" | "critical";
  checklistComplete: number;
  checklistTotal: number;
}

export function buildOptDatesStatusSnapshot(
  savedDates: OptDatesFormData,
  employmentSpanCount: number,
  setupAck: EmploymentSetupAcknowledgment | null,
  employmentSpans: EmploymentSpan[] = []
): OptDatesStatusSnapshot {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const hasProgramEnd = !!savedDates.program_end_date?.trim();
  const hasOptStart = !!savedDates.opt_start_date?.trim();
  const hasEmployment = employmentSpanCount > 0;
  const trackingIncomplete = isEmploymentTrackingIncomplete(
    savedDates.opt_start_date,
    employmentSpanCount,
    setupAck
  );
  const clockActive = shouldShowUnemploymentComplianceNumbers(
    savedDates.opt_start_date,
    employmentSpanCount,
    setupAck
  );

  let unemploymentLabel = "—";
  let unemploymentDetail = "Add OPT start date";
  let unemploymentTone: OptDatesStatusSnapshot["unemploymentTone"] = "neutral";

  if (hasOptStart) {
    if (trackingIncomplete) {
      unemploymentLabel = "Setup needed";
      unemploymentDetail = "Add job history below";
      unemploymentTone = "warning";
    } else if (!savedDates.opt_ead_end_date?.trim()) {
      unemploymentLabel = "—";
      unemploymentDetail = "Add EAD end date to calculate";
      unemploymentTone = "neutral";
    } else if (savedDates.opt_start_date && savedDates.opt_ead_end_date) {
      const spansForCalc = employmentSpans.map((s) => ({
        ...s,
        is_current: s.is_current ?? !s.end_date,
      }));
      const calc = calculateUnemploymentDays(
        toCalcDateString(savedDates.opt_start_date),
        toCalcDateString(savedDates.opt_ead_end_date),
        spansForCalc,
        savedDates.stem_start_date ? toCalcDateString(savedDates.stem_start_date) : null
      );
      unemploymentLabel = `${calc.used} / ${calc.max}`;
      unemploymentDetail = `${calc.remaining} days remaining`;
      if (calc.exceededCumulativeCap || calc.exceededInitialOptCap) {
        unemploymentTone = "critical";
      } else if (calc.used / calc.max >= 0.75) {
        unemploymentTone = "warning";
      } else {
        unemploymentTone = "good";
      }
    }
  }

  let optEndLabel = "—";
  let optEndDetail = "Not set";
  let optEndDaysLeft: number | null = null;
  const optEnd = parseOptDateInput(savedDates.opt_ead_end_date);
  if (optEnd) {
    const daysLeft = daysBetween(today, optEnd);
    optEndDaysLeft = daysLeft;
    if (daysLeft < 0) {
      optEndLabel = "Expired";
      optEndDetail = "EAD end date passed";
    } else {
      optEndLabel = `${daysLeft} days`;
      optEndDetail = "Until OPT/EAD expires";
    }
  }

  let filingLabel = "—";
  let filingDetail = "Add program end date";
  let filingTone: OptDatesStatusSnapshot["filingTone"] = "neutral";
  const programEnd = parseOptDateInput(savedDates.program_end_date);
  if (programEnd) {
    const earliestFile = new Date(programEnd);
    earliestFile.setDate(earliestFile.getDate() - 90);
    const daysUntilOpen = daysBetween(today, earliestFile);
    if (daysUntilOpen > 0) {
      filingLabel = `${daysUntilOpen} days`;
      filingDetail = "Until filing window opens";
      filingTone = daysUntilOpen <= 30 ? "warning" : "neutral";
    } else {
      const hardDeadline = new Date(programEnd);
      hardDeadline.setDate(hardDeadline.getDate() + 60);
      const daysUntilDeadline = daysBetween(today, hardDeadline);
      if (daysUntilDeadline >= 0) {
        filingLabel = "Open";
        filingDetail =
          daysUntilDeadline <= 14
            ? `${daysUntilDeadline} days to file`
            : "Filing window is open";
        filingTone = daysUntilDeadline <= 14 ? "critical" : daysUntilDeadline <= 30 ? "warning" : "good";
      } else {
        filingLabel = "Closed";
        filingDetail = "Filing deadline passed";
        filingTone = "neutral";
      }
    }
  }

  const steps = [hasProgramEnd, hasOptStart, hasEmployment, clockActive];
  const checklistComplete = steps.filter(Boolean).length;

  return {
    hasProgramEnd,
    hasOptStart,
    hasEmployment,
    clockActive,
    trackingIncomplete,
    unemploymentLabel,
    unemploymentDetail,
    unemploymentTone,
    optEndLabel,
    optEndDetail,
    optEndDaysLeft,
    filingLabel,
    filingDetail,
    filingTone,
    checklistComplete,
    checklistTotal: steps.length,
  };
}

export function areOptDatesEqual(a: OptDatesFormData, b: OptDatesFormData): boolean {
  const keys: (keyof OptDatesFormData)[] = [
    "program_end_date",
    "dso_recommendation_date",
    "opt_start_date",
    "opt_ead_end_date",
    "stem_start_date",
  ];
  return keys.every((k) => (a[k] || "").trim() === (b[k] || "").trim());
}
