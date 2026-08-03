import { getStatusExplainer, isPlaceholderStatus } from "@/lib/uscis/status-explainer";

export type DashboardNextStepState =
  | "no_receipt"
  | "free_upsell"
  | "status_live"
  | "pro_active";

export type DashboardNextStepAction =
  | "add_receipt"
  | "upgrade_pro"
  | "view_case_status"
  | "pro_manage";

type DashboardNextStepInput = {
  isPremium: boolean;
  hasReceipt: boolean;
  lastCheckedAt: string | null;
  currentStatus: string | null;
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
  const { isPremium, hasReceipt, lastCheckedAt, currentStatus } = input;

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
