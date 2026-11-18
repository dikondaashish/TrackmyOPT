import { getStatusExplainer, isPlaceholderStatus } from "@/lib/uscis/status-explainer";
import { isAfterApprovalPhase } from "@/lib/case-status/after-approval";
import { deriveJourneyPhase } from "@/lib/community-opt/stages";

export type DashboardNextStepState =
  | "after_approval"
  | "no_receipt"
  | "free_upsell"
  | "status_live"
  | "pro_active";

export type DashboardNextStepAction =
  | "after_approval_steps"
  | "add_receipt"
  | "upgrade_pro"
  | "view_case_status"
  | "pro_manage";

type DashboardNextStepInput = {
  isPremium: boolean;
  hasReceipt: boolean;
  lastCheckedAt: string | null;
  currentStatus: string | null;
  /** Initial OPT or STEM OPT. The after-approval steps are about the EAD. */
  isOptCase?: boolean;
};

type ResolvedDashboardNextStep = {
  state: DashboardNextStepState;
  action: DashboardNextStepAction;
  href: string;
  plainEnglishStatus: string | null;
  statusCategory: string | null;
  lastCheckedLabel: string | null;
};

function formatLastChecked(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function resolveDashboardNextStep(
  input: DashboardNextStepInput
): ResolvedDashboardNextStep {
  const { isPremium, hasReceipt, lastCheckedAt, currentStatus, isOptCase } =
    input;

  if (!hasReceipt) {
    return {
      state: "no_receipt",
      action: "add_receipt",
      href: "/dashboard/case-status",
      plainEnglishStatus: null,
      statusCategory: null,
      lastCheckedLabel: null,
    };
  }

  // An approved case has nothing left to check; the next job is the EAD dates
  // and the unemployment count, on every plan.
  if (
    hasReceipt &&
    isOptCase === true &&
    !isPlaceholderStatus(currentStatus) &&
    isAfterApprovalPhase(deriveJourneyPhase(currentStatus))
  ) {
    return {
      state: "after_approval",
      action: "after_approval_steps",
      href: "/dashboard/case-status#after-approval",
      plainEnglishStatus: null,
      statusCategory: "approved",
      lastCheckedLabel: null,
    };
  }

  if (isPremium) {
    return {
      state: "pro_active",
      action: "pro_manage",
      href: "/dashboard/case-status",
      plainEnglishStatus: null,
      statusCategory: null,
      lastCheckedLabel: lastCheckedAt ? formatLastChecked(lastCheckedAt) : null,
    };
  }

  const hasLiveCheck =
    Boolean(lastCheckedAt) && !isPlaceholderStatus(currentStatus);

  if (hasLiveCheck) {
    const explainer = getStatusExplainer(currentStatus);
    return {
      state: "status_live",
      action: "view_case_status",
      href: "/dashboard/case-status",
      plainEnglishStatus: explainer.title,
      statusCategory: explainer.category,
      lastCheckedLabel: formatLastChecked(lastCheckedAt!),
    };
  }

  return {
    state: "free_upsell",
    action: "upgrade_pro",
    href: "/premium/checkout?planId=pro&interval=year",
    plainEnglishStatus: null,
    statusCategory: null,
    lastCheckedLabel: null,
  };
}
