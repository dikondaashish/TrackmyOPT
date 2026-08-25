import {
  addDaysIso,
  addMonthsIso,
  isDateBeforeMs,
} from "@/lib/case-status/safe-dates";
import {
  addBusinessDays,
  formatIsoDate,
  parseBusinessDate,
} from "@/lib/case-status/business-days";

export type OptComplianceActionStatus = "open" | "done" | "overdue";

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
  "https://studyinthestates.dhs.gov/assets/sevpstemoptreportingrequirementsfinal.pdf";
const FORM_I983_URL = "https://studyinthestates.dhs.gov/form-i-983-overview";

function addBusinessDaysIso(iso: string | null | undefined, days: number) {
  if (!iso) return undefined;
  const parsed = parseBusinessDate(iso);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return formatIsoDate(addBusinessDays(parsed, days));
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
  const annualEvaluationDue = dateOnly(addDaysIso(
    addMonthsIso(stemStartDate, 12),
    10
  ));
  const eighteenMonthReportDue = addBusinessDaysIso(
    addMonthsIso(stemStartDate, 18),
    10
  );
  const finalEvaluationDue = dateOnly(addDaysIso(stemEndDate, 10));

  const rows: Array<Omit<OptComplianceAction, "status">> = [
    {
      id: "report-employment-change",
      title: "Report employment or address changes",
      description:
        "Report relevant changes to your DSO within 10 days. Add the actual change date before relying on a deadline here.",
      dueDate: employmentReportDue,
      sourceHref: STUDY_IN_STATES_REPORTING_URL,
    },
  ];

  if (stemStartDate || stemEndDate) {
    rows.push({
      id: "stem-six-month-validation",
      title: "6-month STEM validation report",
      description:
        "Confirm your name, address and employment information with your DSO.",
      dueDate: sixMonthReportDue,
      sourceHref: STUDY_IN_STATES_REPORTING_URL,
    }, {
      id: "stem-annual-evaluation",
      title: "12-month Form I-983 evaluation",
      description:
        "Complete the annual evaluation with your employer and submit it to your DSO.",
      dueDate: annualEvaluationDue,
      sourceHref: FORM_I983_URL,
    }, {
      id: "stem-eighteen-month-validation",
      title: "18-month STEM validation report",
      description:
        "Reconfirm your name, address and employment information with your DSO.",
      dueDate: eighteenMonthReportDue,
      sourceHref: STUDY_IN_STATES_REPORTING_URL,
    }, {
      id: "stem-final-evaluation",
      title: "Final Form I-983 evaluation",
      description:
        "Submit the final evaluation within 10 days after the STEM period or training opportunity ends.",
      dueDate: finalEvaluationDue,
      sourceHref: FORM_I983_URL,
    });
  }

  return rows.map((row) => ({
    ...row,
    status: completed.has(row.id)
      ? "done"
      : row.dueDate && isDateBeforeMs(row.dueDate, now.getTime())
        ? "overdue"
        : "open",
  }));
}
