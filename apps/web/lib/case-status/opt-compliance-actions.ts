import {
  calendarDateISO,
  localTodayISO,
} from '@/lib/immigration/calendar-days';
import {
  addBusinessDays,
  formatIsoDate,
  parseBusinessDate,
} from '@/lib/case-status/business-days';

export type OptComplianceActionStatus = 'open' | 'done' | 'overdue';

export type OptComplianceAction = {
  id: string;
  title: string;
  description: string;
  dueDate?: string;
  status: OptComplianceActionStatus;
  sourceHref: string;
};

type OptComplianceDates = {
  /** Accepted for backwards-compatible callers; intentionally not used for reporting deadlines. */
  uscisFiledDate?: string | null;
  employmentChangeDate?: string | null;
  stemStartDate?: string | null;
  stemEndDate?: string | null;
  completedIds?: string[];
  now?: Date;
};

const STUDY_IN_STATES_REPORTING_URL =
  'https://studyinthestates.dhs.gov/assets/sevpstemoptreportingrequirementsfinal.pdf';
const FORM_I983_URL = 'https://studyinthestates.dhs.gov/form-i-983-overview';

function addBusinessDaysIso(iso: string | null | undefined, days: number) {
  const normalized = iso ? calendarDateISO(iso) : null;
  if (!normalized) return undefined;
  const parsed = parseBusinessDate(normalized);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return formatIsoDate(addBusinessDays(parsed, days));
}

/** Operate on document calendar dates, never local midnight/DST instants. */
function addDaysIso(value: string | null | undefined, days: number) {
  const iso = value ? calendarDateISO(value) : null;
  if (!iso) return undefined;
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function addMonthsIso(value: string | null | undefined, months: number) {
  const iso = value ? calendarDateISO(value) : null;
  if (!iso) return undefined;
  const date = new Date(`${iso}T00:00:00Z`);
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + months);
  const lastDay = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)
  ).getUTCDate();
  date.setUTCDate(Math.min(day, lastDay));
  return date.toISOString().slice(0, 10);
}

function dateOnly(iso: string | null | undefined) {
  return iso ? iso.slice(0, 10) : undefined;
}

export function buildOptComplianceActions({
  employmentChangeDate,
  stemStartDate,
  stemEndDate,
  completedIds = [],
  now = new Date(),
}: OptComplianceDates): OptComplianceAction[] {
  const completed = new Set(completedIds);
  const employmentReportDue = dateOnly(addDaysIso(employmentChangeDate, 10));
  const sixMonthReportDue = addBusinessDaysIso(
    addMonthsIso(stemStartDate, 6),
    10
  );
  const annualEvaluationDue = dateOnly(
    addDaysIso(addMonthsIso(stemStartDate, 12), 10)
  );
  const eighteenMonthReportDue = addBusinessDaysIso(
    addMonthsIso(stemStartDate, 18),
    10
  );
  const finalEvaluationDue = dateOnly(addDaysIso(stemEndDate, 10));

  const rows: Array<Omit<OptComplianceAction, 'status'>> = [
    {
      id: 'report-employment-change',
      title: 'Report employment or address changes',
      description:
        'Report relevant changes to your DSO within 10 days. Add the actual change date before relying on a deadline here.',
      dueDate: employmentReportDue,
      sourceHref: STUDY_IN_STATES_REPORTING_URL,
    },
  ];

  if (stemStartDate || stemEndDate) {
    for (const month of [12, 24]) {
      rows.push({
        id: `stem-${month}-month-validation`,
        title: `${month}-month STEM validation report`,
        description:
          'Confirm your name, address and employment information with your DSO. This validation is separate from your Form I-983 evaluation.',
        dueDate: addBusinessDaysIso(addMonthsIso(stemStartDate, month), 10),
        sourceHref: STUDY_IN_STATES_REPORTING_URL,
      });
    }
    rows.push(
      {
        id: 'stem-six-month-validation',
        title: '6-month STEM validation report',
        description:
          'Confirm your name, address and employment information with your DSO.',
        dueDate: sixMonthReportDue,
        sourceHref: STUDY_IN_STATES_REPORTING_URL,
      },
      {
        id: 'stem-annual-evaluation',
        title: '12-month Form I-983 evaluation',
        description:
          'Complete the annual evaluation with your employer and submit it to your DSO.',
        dueDate: annualEvaluationDue,
        sourceHref: FORM_I983_URL,
      },
      {
        id: 'stem-eighteen-month-validation',
        title: '18-month STEM validation report',
        description:
          'Reconfirm your name, address and employment information with your DSO.',
        dueDate: eighteenMonthReportDue,
        sourceHref: STUDY_IN_STATES_REPORTING_URL,
      },
      {
        id: 'stem-final-evaluation',
        title: 'Final Form I-983 evaluation',
        description:
          'Submit the final evaluation within 10 days after the STEM period or training opportunity ends.',
        dueDate: finalEvaluationDue,
        sourceHref: FORM_I983_URL,
      }
    );
  }

  return rows.map((row) => ({
    ...row,
    status: completed.has(row.id)
      ? 'done'
      : row.dueDate && row.dueDate < localTodayISO(now)
        ? 'overdue'
        : 'open',
  }));
}
