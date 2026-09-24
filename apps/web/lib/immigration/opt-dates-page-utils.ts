import {
  calculateUnemploymentDays,
  daysBetween as sharedDaysBetween,
  getFilingWindow,
  type EmploymentSpan,
} from '@/lib/immigration/opt-calculations';
import {
  isEmploymentTrackingIncomplete,
  shouldShowUnemploymentComplianceNumbers,
  type EmploymentSetupAcknowledgment,
} from '@/lib/immigration/employment-tracking';
import {
  calendarDateISO,
  estimatedStemEndISO,
  localTodayISO,
} from './calendar-days';

export interface OptDatesFormData {
  program_end_date?: string | null;
  dso_recommendation_date?: string | null;
  opt_start_date?: string | null;
  opt_ead_end_date?: string | null;
  stem_start_date?: string | null;
  stem_ead_end_date?: string | null;
  stem_dso_recommendation_date?: string | null;
}

/** Convert a complete, valid form date to the shared calculator's ISO format. */
export function optDateInputToISO(value: string): string | null {
  const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const [, month, day, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getDate() !== Number(day)
  )
    return null;
  return `${year}-${month}-${day}`;
}

/** Parse MM/DD/YYYY or ISO date string to local midnight Date. */
export function parseOptDateInput(
  value: string | undefined | null
): Date | null {
  const iso = value ? calendarDateISO(value) : null;
  return iso ? new Date(`${iso}T00:00:00`) : null;
}

function toCalcDateString(value: string): string {
  const d = parseOptDateInput(value);
  if (!d) return value;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function daysBetween(from: Date, to: Date): number {
  return sharedDaysBetween(localTodayISO(from), localTodayISO(to));
}

export interface OptDatesStatusSnapshot {
  hasProgramEnd: boolean;
  hasOptStart: boolean;
  hasEmployment: boolean;
  clockActive: boolean;
  trackingIncomplete: boolean;
  unemploymentLabel: string;
  unemploymentMax: 90 | 150;
  unemploymentWarning: string | null;
  unemploymentDetail: string;
  unemploymentTone: 'neutral' | 'good' | 'warning' | 'critical';
  optEndLabel: string;
  optEndHeading: string;
  optEndDetail: string;
  optEndDaysLeft: number | null;
  filingLabel: string;
  filingDetail: string;
  filingTone: 'neutral' | 'good' | 'warning' | 'critical';
  checklistComplete: number;
  checklistTotal: number;
}

export function buildOptDatesStatusSnapshot(
  savedDates: OptDatesFormData,
  employmentSpanCount: number,
  setupAck: EmploymentSetupAcknowledgment | null,
  employmentSpans: EmploymentSpan[] = [],
  asOfISO = localTodayISO()
): OptDatesStatusSnapshot {
  const today = parseOptDateInput(asOfISO)!;

  const hasProgramEnd = !!parseOptDateInput(savedDates.program_end_date);
  const hasOptStart = !!parseOptDateInput(savedDates.opt_start_date);
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

  let unemploymentLabel = '—';
  let unemploymentMax: 90 | 150 = 90;
  let unemploymentWarning: string | null = null;
  let unemploymentDetail = 'Add OPT start date';
  let unemploymentTone: OptDatesStatusSnapshot['unemploymentTone'] = 'neutral';

  if (hasOptStart) {
    if (trackingIncomplete) {
      unemploymentLabel = 'Setup needed';
      unemploymentDetail = 'Add job history below';
      unemploymentTone = 'warning';
    } else if (!parseOptDateInput(savedDates.opt_ead_end_date)) {
      unemploymentLabel = '—';
      unemploymentDetail = 'Add EAD end date to calculate';
      unemploymentTone = 'neutral';
    } else if (savedDates.opt_start_date && savedDates.opt_ead_end_date) {
      const spansForCalc = employmentSpans.map((s) => ({
        ...s,
        is_current: s.is_current ?? !s.end_date,
      }));
      const calc = calculateUnemploymentDays(
        toCalcDateString(savedDates.opt_start_date),
        toCalcDateString(savedDates.opt_ead_end_date),
        spansForCalc,
        parseOptDateInput(savedDates.stem_start_date)
          ? toCalcDateString(savedDates.stem_start_date!)
          : null,
        savedDates.stem_ead_end_date
          ? calendarDateISO(savedDates.stem_ead_end_date)
          : null,
        asOfISO
      );
      unemploymentMax = calc.max;
      unemploymentWarning = calc.exceededInitialOptCap
        ? 'Recorded initial OPT unemployment exceeds 90 days. Review your history with your DSO; STEM does not reset earlier days.'
        : calc.exceededCumulativeCap
          ? 'Recorded OPT/STEM unemployment exceeds 150 days. Review your history with your DSO.'
          : null;
      unemploymentLabel = `${calc.used} / ${calc.max}`;
      unemploymentDetail = `${calc.remaining} days remaining`;
      if (
        calc.exceededCumulativeCap ||
        calc.exceededInitialOptCap ||
        calc.remaining === 0
      ) {
        unemploymentTone = 'critical';
      } else if (calc.used / calc.max >= 0.75) {
        unemploymentTone = 'warning';
      } else {
        unemploymentTone = 'good';
      }
    }
  }

  let optEndLabel = '—';
  let optEndHeading = 'Initial OPT expires in';
  let optEndDetail = 'Not set';
  let optEndDaysLeft: number | null = null;
  const stemStartISO = savedDates.stem_start_date
    ? calendarDateISO(savedDates.stem_start_date)
    : null;
  const hasStartedStem = !!stemStartISO && stemStartISO <= asOfISO;
  const confirmedStemEnd = savedDates.stem_ead_end_date
    ? calendarDateISO(savedDates.stem_ead_end_date)
    : null;
  const optEnd = parseOptDateInput(
    hasStartedStem
      ? (confirmedStemEnd ?? estimatedStemEndISO(stemStartISO!))
      : savedDates.opt_ead_end_date
  );
  if (hasStartedStem)
    optEndHeading = confirmedStemEnd
      ? 'STEM EAD expires in'
      : 'STEM end estimate';
  if (optEnd) {
    const daysLeft = daysBetween(today, optEnd);
    optEndDaysLeft = daysLeft;
    if (daysLeft < 0) {
      optEndLabel = 'Expired';
      optEndDetail = hasStartedStem
        ? confirmedStemEnd
          ? 'Saved STEM EAD expiration passed'
          : 'STEM estimate passed — verify your EAD'
        : 'Initial OPT EAD end date passed';
    } else {
      optEndLabel = `${daysLeft} days`;
      optEndDetail = hasStartedStem
        ? confirmedStemEnd
          ? 'Until your saved STEM EAD expiration'
          : 'STEM 24-month estimate — verify your EAD'
        : 'Until initial OPT EAD expires';
    }
  }

  let filingLabel = '—';
  let filingDetail = 'Add program end date';
  let filingTone: OptDatesStatusSnapshot['filingTone'] = 'neutral';
  const programEnd = parseOptDateInput(savedDates.program_end_date);
  if (programEnd) {
    const programISO = toCalcDateString(savedDates.program_end_date!);
    const recommendationISO = savedDates.dso_recommendation_date
      ? calendarDateISO(savedDates.dso_recommendation_date)
      : null;
    const window = getFilingWindow(programISO, recommendationISO);
    const earliestFile = parseOptDateInput(window.earliestFile)!;
    const daysUntilOpen = daysBetween(today, earliestFile);
    if (daysUntilOpen > 0) {
      filingLabel = `${daysUntilOpen} days`;
      filingDetail = 'Until filing window opens';
      filingTone = daysUntilOpen <= 30 ? 'warning' : 'neutral';
    } else {
      const hardDeadline = parseOptDateInput(window.hardDeadline)!;
      const daysUntilDeadline = daysBetween(today, hardDeadline);
      if (
        daysUntilDeadline >= 0 &&
        (!recommendationISO || recommendationISO > asOfISO)
      ) {
        filingLabel = 'DSO date needed';
        filingDetail = 'Confirm the actual SEVIS recommendation before filing';
        filingTone = 'warning';
      } else if (daysUntilDeadline >= 0) {
        filingLabel = 'Open';
        filingDetail =
          daysUntilDeadline <= 14
            ? `${daysUntilDeadline} days to file`
            : 'Filing window is open';
        filingTone =
          daysUntilDeadline <= 14
            ? 'critical'
            : daysUntilDeadline <= 30
              ? 'warning'
              : 'good';
      } else {
        filingLabel = 'Closed';
        filingDetail = 'Filing deadline passed';
        filingTone = 'neutral';
      }
    }
    // 91 FR 44976 (effective 2026-09-15) changes filing/admission rules.
    // We do not collect the I-94/admission/filing facts needed to resolve the
    // transition. Never present a historical +60-day estimate as permission.
    if (
      asOfISO >= '2026-09-15' &&
      getFilingWindow(programISO).hardDeadline >= '2026-09-15'
    ) {
      filingLabel = 'DSO review needed';
      filingDetail =
        '2026 rules changed. Confirm your I-94, filing deadline and extension-of-stay requirements with your DSO.';
      filingTone = 'warning';
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
    unemploymentMax,
    unemploymentWarning,
    unemploymentDetail,
    unemploymentTone,
    optEndLabel,
    optEndHeading,
    optEndDetail,
    optEndDaysLeft,
    filingLabel,
    filingDetail,
    filingTone,
    checklistComplete,
    checklistTotal: steps.length,
  };
}

export function areOptDatesEqual(
  a: OptDatesFormData,
  b: OptDatesFormData
): boolean {
  const keys: (keyof OptDatesFormData)[] = [
    'program_end_date',
    'dso_recommendation_date',
    'opt_start_date',
    'opt_ead_end_date',
    'stem_start_date',
    'stem_ead_end_date',
    'stem_dso_recommendation_date',
  ];
  return keys.every((k) => (a[k] || '').trim() === (b[k] || '').trim());
}
