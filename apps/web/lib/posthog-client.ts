import posthog from "posthog-js";

/** Dispatched when the user accepts/declines analytics cookies (see posthog-browser). */
export const ANALYTICS_CONSENT_CHANGE_EVENT = "trackmyopt:analytics-consent";

export type TrackMyOptPersonProperties = {
  plan_tier?: string | null;
  premium_status?: boolean;
  onboarding_completed?: boolean;
  is_stem_eligible?: boolean;
  has_receipt?: boolean;
  activation_state?: string;
  signup_date?: string;
  provider?: string;
  lifetime_revenue_cents?: number;
  lifetime_payment_count?: number;
  first_payment_date?: string | null;
  last_payment_date?: string | null;
  ltv_currency?: string;
  referred_by?: string | null;
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
    ...(properties.has_receipt !== undefined
      ? { has_receipt: properties.has_receipt }
      : {}),
    ...(properties.activation_state
      ? { activation_state: properties.activation_state }
      : {}),
    ...(properties.signup_date ? { signup_date: properties.signup_date } : {}),
    ...(properties.provider ? { provider: properties.provider } : {}),
  });
}

type AuthUserLike = {
  id: string;
  created_at?: string;
  app_metadata?: Record<string, unknown>;
};

function resolveAuthProvider(user: AuthUserLike): string {
  const provider = user.app_metadata?.provider;
  return typeof provider === "string" ? provider : "email";
}

function resolveSignupDate(createdAt?: string): string | undefined {
  if (!createdAt) return undefined;
  const date = createdAt.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : undefined;
}

/** Identify on login / post-auth before dashboard shell mounts. */
export function identifyLoginSessionUser(user: AuthUserLike): void {
  identifyTrackMyOptUser(user.id, {
    plan_tier: "free",
    premium_status: false,
    onboarding_completed: false,
    activation_state: "onboarding_incomplete",
    signup_date: resolveSignupDate(user.created_at),
    provider: resolveAuthProvider(user),
  });
}

export function captureUserSignedUp(properties: {
  provider: string;
  referred_by?: string;
}): void {
  captureClientEvent("user_signed_up", properties);
}

export function captureUserSignedIn(properties: { provider: string }): void {
  captureClientEvent("user_signed_in", properties);
}

export function captureClientEvent(
  event: string,
  properties?: Record<string, string | number | boolean | null | undefined>
): void {
  if (!isBrowserPostHogReady()) return;
  posthog.capture(event, {
    ...properties,
    capture_source: "client",
  });
}

export function captureInsuranceEligibilityChecked(properties: {
  state: string;
  visa_type: string;
  income_bucket: string;
}): void {
  captureClientEvent("insurance_eligibility_checked", properties);
}

export function captureInsurancePlanClicked(properties: {
  partner: string;
  state: string;
  visa_type: string;
  destination_url: string;
}): void {
  captureClientEvent("insurance_plan_clicked", properties);
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
  skip_reason?: "explicit_skip" | "wizard_dismissed";
};

export function captureOnboardingReceiptSkipped(
  properties: OnboardingReceiptSkippedProperties
): void {
  captureClientEvent("onboarding_receipt_skipped", {
    ...properties,
    source: "onboarding_wizard",
  });
}

export function captureOnboardingReceiptVariantExposed(properties: {
  variant: string;
}): void {
  captureClientEvent("onboarding_receipt_variant_exposed", {
    ...properties,
    source: "onboarding_wizard",
  });
}

export function capturePricingCtaViewed(properties: { variant: string }): void {
  captureClientEvent("pricing_cta_viewed", {
    variant: properties.variant,
    [`$feature/pricing-cta-experiment`]: properties.variant,
    source: "pricing_page",
  });
}

export function captureNpsSubmitted(properties: {
  score: number;
  feedback?: string;
  category: "detractor" | "passive" | "promoter";
}): void {
  captureClientEvent("nps_submitted", {
    score: properties.score,
    ...(properties.feedback ? { feedback: properties.feedback } : {}),
    category: properties.category,
    source: "dashboard_nps",
  });
}

export function captureNpsDismissed(): void {
  captureClientEvent("nps_dismissed", { source: "dashboard_nps" });
}

export function setNpsLastShownPersonProperty(isoTimestamp: string): void {
  if (!isBrowserPostHogReady()) return;
  posthog.people.set({ nps_last_shown: isoTimestamp });
}

export type CaseStatusCheckCompletedClientProperties = {
  trigger: "manual" | "initial" | "cron" | "unknown";
  receipt_prefix?: string | null;
};

/** Client mirror of server `case_status_check_completed` for in-app surveys. */
export function captureCaseStatusCheckCompletedClient(
  properties: CaseStatusCheckCompletedClientProperties
): void {
  captureClientEvent("case_status_check_completed", {
    ...properties,
    source: "case_status_page",
  });
}

export type UniversityPartnerGroupProperties = {
  partner_name: string;
  referral_clicks?: number;
  referral_signups?: number;
  premium_conversions?: number;
  is_active?: boolean;
};

/** Associate the logged-in user with a university partner group (B2B2C). */
export function associateUniversityPartnerGroup(
  groupKey: string,
  properties: UniversityPartnerGroupProperties
): void {
  if (!isBrowserPostHogReady()) return;

  const client = posthog as typeof posthog & {
    group?: (
      groupType: string,
      groupKey: string,
      groupProperties?: Record<string, string | number | boolean>
    ) => void;
  };

  if (typeof client.group === "function") {
    client.group("university_partner", groupKey, {
      partner_name: properties.partner_name,
      ...(properties.referral_clicks !== undefined
        ? { referral_clicks: properties.referral_clicks }
        : {}),
      ...(properties.referral_signups !== undefined
        ? { referral_signups: properties.referral_signups }
        : {}),
      ...(properties.premium_conversions !== undefined
        ? { premium_conversions: properties.premium_conversions }
        : {}),
      ...(properties.is_active !== undefined ? { is_active: properties.is_active } : {}),
    });
  }
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
    captureClientEvent("user_signed_out", { source });
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
  error_message?: string;
};

export function captureErrorBoundaryTriggered(
  properties: ErrorBoundaryTriggeredProperties
): void {
  if (!isBrowserPostHogReady()) return;

  const sessionId =
    typeof posthog.get_session_id === "function" ? posthog.get_session_id() : undefined;

  captureClientEvent("error_boundary_triggered", {
    ...properties,
    ...(sessionId ? { $session_id: sessionId } : {}),
  });
}

export function capturePremiumCheckoutViewed(properties: {
  plan_id?: string | null;
  interval?: string | null;
}): void {
  captureClientEvent("premium_checkout_viewed", {
    plan_id: properties.plan_id ?? null,
    interval: properties.interval ?? null,
    source: "checkout_page",
  });
}

export function captureExtensionDetected(properties: { version: string | null }): void {
  captureClientEvent("extension_detected", {
    version: properties.version,
    source: "dashboard",
  });
}

export function captureActivationCompleted(properties: {
  days_since_signup: number | null;
}): void {
  captureClientEvent("activation_completed", {
    days_since_signup: properties.days_since_signup,
    source: "dashboard",
  });
}

export function capturePremiumCheckoutCompleted(properties: {
  plan_tier?: string | null;
  session_id?: string | null;
}): void {
  captureClientEvent("premium_checkout_completed", {
    plan_tier: properties.plan_tier ?? null,
    stripe_session_id: properties.session_id ?? null,
    source: "success_page",
  });
}
