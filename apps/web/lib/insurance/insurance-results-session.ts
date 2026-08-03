/** Session-scoped insurance finder answers for the results page (kept out of URLs). */

const INSURANCE_RESULTS_SESSION_KEY = "trackmyopt_insurance_results_v1";

export type InsuranceResultsPayload = {
  state: string;
  visaType: string;
  monthlyIncome: string;
  dateOfBirth: string;
  gender: string;
  isPregnant: boolean;
};

export function setInsuranceResultsPayload(payload: InsuranceResultsPayload): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(INSURANCE_RESULTS_SESSION_KEY, JSON.stringify(payload));
}

export function getInsuranceResultsPayload(): InsuranceResultsPayload | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(INSURANCE_RESULTS_SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as InsuranceResultsPayload;
    if (!parsed.state || !parsed.visaType || !parsed.dateOfBirth) return null;
    return parsed;
  } catch {
    return null;
  }
}
