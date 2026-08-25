export type EmploymentSetupAcknowledgment = "between_jobs" | "not_on_opt";

const STORAGE_KEY = "trackmyopt_employment_setup_v1";
export const EMPLOYMENT_SETUP_CHANGED_EVENT = "employment-setup-changed";

interface StoredSetup {
  status: EmploymentSetupAcknowledgment;
  at: number;
}

export function getEmploymentSetupAck(): EmploymentSetupAcknowledgment | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSetup;
    if (parsed?.status === "between_jobs" || parsed?.status === "not_on_opt") {
      return parsed.status;
    }
  } catch {
    // ignore corrupt storage
  }
  return null;
}

export function setEmploymentSetupAck(status: EmploymentSetupAcknowledgment): void {
  if (typeof window === "undefined") return;
  const payload: StoredSetup = { status, at: Date.now() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  window.dispatchEvent(new CustomEvent(EMPLOYMENT_SETUP_CHANGED_EVENT));
}

export function clearEmploymentSetupAck(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(EMPLOYMENT_SETUP_CHANGED_EVENT));
}

/**
 * True when OPT start is set but we lack employment records and the user
 * has not confirmed they are between jobs (which would make zero-job stats valid).
 */
export function isEmploymentTrackingIncomplete(
  optStartDate: string | null | undefined,
  employmentSpanCount: number,
  setupAck?: EmploymentSetupAcknowledgment | null
): boolean {
  if (!optStartDate?.trim()) return false;
  if (employmentSpanCount > 0) return false;
  const ack = setupAck ?? getEmploymentSetupAck();
  if (ack === "between_jobs") return false;
  return true;
}

/** Whether unemployment compliance numbers should be shown as authoritative. */
export function shouldShowUnemploymentComplianceNumbers(
  optStartDate: string | null | undefined,
  employmentSpanCount: number,
  setupAck?: EmploymentSetupAcknowledgment | null
): boolean {
  if (!optStartDate?.trim()) return false;
  if (employmentSpanCount > 0) return true;
  const ack = setupAck ?? getEmploymentSetupAck();
  return ack === "between_jobs";
}

export function formatOptDateForDisplay(dateStr: string): string {
  if (!dateStr?.trim()) return dateStr;
  if (dateStr.includes("/")) {
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      const month = parseInt(parts[0], 10);
      const day = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);
      if (!Number.isNaN(month) && !Number.isNaN(day) && !Number.isNaN(year)) {
        const d = new Date(year, month - 1, day);
        if (!Number.isNaN(d.getTime())) {
          return d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
        }
      }
    }
  }
  const d = new Date(dateStr);
  if (!Number.isNaN(d.getTime())) {
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
  return dateStr;
}
