import { normalizeStatusCategory } from "@/lib/posthog/uscis-status-category";

export type StatusExplainerCategory = ReturnType<typeof normalizeStatusCategory>;

type StatusExplainerContent = {
  category: StatusExplainerCategory;
  title: string;
  meaning: string;
  nextStep: string;
  showUscisLink: boolean;
  tone: "neutral" | "positive" | "caution" | "urgent";
};

const USCIS_CASE_STATUS_URL = "https://egov.uscis.gov/casestatus";

export { USCIS_CASE_STATUS_URL };

const EXPLAINER_BY_CATEGORY: Record<StatusExplainerCategory, Omit<StatusExplainerContent, "category">> = {
  pending: {
    title: "Still in progress",
    meaning: "Normal — USCIS is still processing your case.",
    nextStep: "No action needed right now. We'll keep checking and update you when something changes.",
    showUscisLink: false,
    tone: "neutral",
  },
  received: {
    title: "Case received",
    meaning: "USCIS has received your application and assigned your case number.",
    nextStep: "No action needed yet. Processing times vary — we'll keep checking for updates.",
    showUscisLink: false,
    tone: "neutral",
  },
  approved: {
    title: "Approved or completed step",
    meaning: "USCIS reports an approval or completion milestone on your case (for example, card produced or delivered).",
    nextStep: "Watch for official USCIS mail and verify details on your approval notice or EAD card when it arrives.",
    showUscisLink: false,
    tone: "positive",
  },
  rfe: {
    title: "More information requested",
    meaning: "USCIS may need additional documents or information before it can continue reviewing your case.",
    nextStep: "Check your mail and USCIS online account for a Request for Evidence (RFE) and respond by the deadline on the notice.",
    showUscisLink: true,
    tone: "urgent",
  },
  denied: {
    title: "Not approved",
    meaning: "USCIS reports a denial or unfavorable decision on your case based on the latest status update.",
    nextStep: "Review your official USCIS notice for the reason and any options listed. Consider speaking with your DSO or a licensed immigration attorney.",
    showUscisLink: true,
    tone: "caution",
  },
  withdrawn: {
    title: "Withdrawn",
    meaning: "USCIS shows that this case was withdrawn.",
    nextStep: "Review your official USCIS notice for details. Contact your DSO if you have questions about your status.",
    showUscisLink: true,
    tone: "caution",
  },
  transferred: {
    title: "Case transferred",
    meaning: "USCIS transferred your case to another office or service center.",
    nextStep: "Updates may take a few extra days after a transfer. We'll keep checking — no action needed unless USCIS contacts you.",
    showUscisLink: false,
    tone: "neutral",
  },
  premium_processing: {
    title: "Premium Processing active",
    meaning: "USCIS upgraded your Form I-765 case to Premium Processing. The published timeframe is 30 business days after all prerequisites are met.",
    nextStep: "Confirm the start date on your I-907 receipt. If the applicable timeframe passes with no USCIS action, use the contact instructions on your receipt notice or contact USCIS.",
    showUscisLink: true,
    tone: "urgent",
  },
  other: {
    title: "Status update",
    meaning: "We received a status update from USCIS that doesn't match a common pattern we recognize.",
    nextStep: "Read the official USCIS status text below and confirm details on USCIS.gov.",
    showUscisLink: true,
    tone: "neutral",
  },
  unknown: {
    title: "Status update",
    meaning: "We checked USCIS but don't have a detailed status message to summarize yet.",
    nextStep: "Try refreshing in a few minutes, or confirm your case on USCIS.gov.",
    showUscisLink: true,
    tone: "neutral",
  },
};

export function getStatusExplainer(
  statusText: string | null | undefined
): StatusExplainerContent {
  const category = normalizeStatusCategory(statusText);
  const base = EXPLAINER_BY_CATEGORY[category] ?? EXPLAINER_BY_CATEGORY.other;
  return { category, ...base };
}

export function isPlaceholderStatus(status: string | null | undefined): boolean {
  const normalized = (status ?? "").trim();
  return (
    !normalized ||
    normalized === "Status will be fetched shortly..." ||
    normalized === "Checking USCIS status…"
  );
}
