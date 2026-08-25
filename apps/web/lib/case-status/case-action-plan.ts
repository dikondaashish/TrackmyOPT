import { getStatusNextSteps } from "@/lib/case-status/status-next-steps";
import {
  getStatusExplainer,
  USCIS_CASE_STATUS_URL,
} from "@/lib/uscis/status-explainer";

export type CaseActionPriority = "urgent" | "review" | "monitor" | "complete";

export type CaseAction = {
  label: string;
  description?: string;
  href: string;
  external?: boolean;
};

export type CaseActionPlan = {
  priority: CaseActionPriority;
  title: string;
  summary: string;
  nextStep: string;
  actions: CaseAction[];
  officialSource: { label: string; href: string };
};

function priorityForCategory(category: ReturnType<typeof getStatusExplainer>["category"]): CaseActionPriority {
  if (category === "rfe") return "urgent";
  if (category === "denied" || category === "withdrawn" || category === "other") {
    return "review";
  }
  if (category === "approved") return "complete";
  return "monitor";
}

function titleForCategory(
  category: ReturnType<typeof getStatusExplainer>["category"],
  fallback: string
) {
  if (category === "rfe") return "Prepare your response now";
  if (category === "denied") return "Review the official decision";
  if (category === "approved") return "Protect your next OPT steps";
  if (category === "premium_processing") return "Monitor the official PP clock";
  return fallback;
}

export function buildCaseActionPlan({
  statusText,
  daysSinceFiled,
}: {
  statusText: string | null | undefined;
  daysSinceFiled: number | null;
}): CaseActionPlan {
  const explainer = getStatusExplainer(statusText);
  return {
    priority: priorityForCategory(explainer.category),
    title: titleForCategory(explainer.category, explainer.title),
    summary: explainer.meaning,
    nextStep: explainer.nextStep,
    actions: getStatusNextSteps(explainer.category, daysSinceFiled),
    officialSource: {
      label: "Verify this status on USCIS.gov",
      href: USCIS_CASE_STATUS_URL,
    },
  };
}
