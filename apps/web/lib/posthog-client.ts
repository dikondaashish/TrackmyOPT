import posthog from "posthog-js";

export type TrackMyOptPersonProperties = {
  plan_tier?: string | null;
  premium_status?: boolean;
  onboarding_completed?: boolean;
  is_stem_eligible?: boolean;
  provider?: string;
};

function isBrowserPostHogReady(): boolean {
  return typeof window !== "undefined" && typeof posthog?.capture === "function";
}

/** Link anonymous PostHog activity to the Supabase user id (no email / PII). */
export function identifyTrackMyOptUser(
  userId: string,
  properties: TrackMyOptPersonProperties
): void {
  if (!isBrowserPostHogReady()) return;

  posthog.identify(userId, {
    plan_tier: properties.plan_tier ?? "free",
    premium_status: properties.premium_status ?? false,
    onboarding_completed: properties.onboarding_completed ?? false,
    is_stem_eligible: properties.is_stem_eligible ?? false,
    ...(properties.provider ? { provider: properties.provider } : {}),
  });
}

export function captureClientEvent(
  event: string,
  properties?: Record<string, string | number | boolean | null | undefined>
): void {
  if (!isBrowserPostHogReady()) return;
  posthog.capture(event, properties);
}

export type OnboardingCompletedProperties = {
  skipped: boolean;
  status: string | null;
  is_stem_eligible: boolean;
  degree_level: string | null;
};

export function captureOnboardingCompleted(
  properties: OnboardingCompletedProperties
): void {
  captureClientEvent("onboarding_completed", {
    ...properties,
    capture_source: "client",
  });
}

export function captureOnboardingReceiptPromptShown(): void {
  captureClientEvent("onboarding_receipt_prompt_shown", {
    capture_source: "client",
    source: "onboarding_wizard",
  });
}

export type OnboardingReceiptSkippedProperties = {
  receipt_prefix: string | null;
};

export function captureOnboardingReceiptSkipped(
  properties: OnboardingReceiptSkippedProperties
): void {
  captureClientEvent("onboarding_receipt_skipped", {
    ...properties,
    capture_source: "client",
    source: "onboarding_wizard",
  });
}

export type CaseStatusExplainerViewedProperties = {
  status_category: string;
};

export function captureCaseStatusExplainerViewed(
  properties: CaseStatusExplainerViewedProperties
): void {
  captureClientEvent("case_status_explainer_viewed", {
    ...properties,
    capture_source: "client",
    source: "case_status_page",
  });
}

export type UpgradePromptTrigger =
  | "status_change_wedge"
  | "second_manual_refresh";

export type UpgradePromptShownProperties = {
  trigger: UpgradePromptTrigger;
};

export function captureUpgradePromptShown(
  properties: UpgradePromptShownProperties
): void {
  captureClientEvent("upgrade_prompt_shown", {
    ...properties,
    capture_source: "client",
    source: "case_status_page",
  });
}

export type CheckoutStartedProperties = {
  trigger: UpgradePromptTrigger;
};

export function captureCheckoutStarted(
  properties: CheckoutStartedProperties
): void {
  captureClientEvent("checkout_started", {
    ...properties,
    capture_source: "client",
    source: "case_status_page",
  });
}

export type SignOutSource = "profile_menu" | "navbar" | "sidebar" | "unknown";

const SIGN_OUT_FLUSH_MS = 250;

/** Capture sign-out, best-effort flush, then reset identity for the next browser user. */
export async function captureSignOut(source: SignOutSource): Promise<void> {
  if (!isBrowserPostHogReady()) return;
  try {
    posthog.capture("user_signed_out", { source });
    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, SIGN_OUT_FLUSH_MS);
    });
    posthog.reset();
  } catch {
    try {
      posthog.reset();
    } catch {
      /* analytics must not break sign-out */
    }
  }
}

export type DashboardViewedProperties = {
  has_receipt: boolean;
  has_status: boolean;
  is_pending: boolean;
  plan_tier: string;
  premium_status: boolean;
  onboarding_completed: boolean;
};

export function captureDashboardViewed(properties: DashboardViewedProperties): void {
  captureClientEvent("dashboard_viewed", properties);
}

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

export type DashboardNextStepShownProperties = {
  state: DashboardNextStepState;
  status_category?: string;
};

export function captureDashboardNextStepShown(
  properties: DashboardNextStepShownProperties
): void {
  captureClientEvent("dashboard_next_step_shown", {
    ...properties,
    capture_source: "client",
    source: "dashboard_hub",
  });
}

export type DashboardNextStepClickedProperties = {
  action: DashboardNextStepAction;
};

export function captureDashboardNextStepClicked(
  properties: DashboardNextStepClickedProperties
): void {
  captureClientEvent("dashboard_next_step_clicked", {
    ...properties,
    capture_source: "client",
    source: "dashboard_hub",
  });
}

export type CaseStatusSummaryViewedProperties = DashboardViewedProperties;

export function captureCaseStatusSummaryViewed(
  properties: CaseStatusSummaryViewedProperties
): void {
  captureClientEvent("case_status_summary_viewed", properties);
}

export type ErrorBoundaryArea =
  | "global"
  | "dashboard"
  | "case_status"
  | "billing"
  | "unknown";

export type ErrorBoundaryTriggeredProperties = {
  route: string;
  component_area: ErrorBoundaryArea;
  error_digest?: string;
};

export function captureErrorBoundaryTriggered(
  properties: ErrorBoundaryTriggeredProperties
): void {
  captureClientEvent("error_boundary_triggered", properties);
}
