import posthog from "posthog-js";
import { captureOnceWhenConsented } from "@/lib/posthog/capture-with-consent";
import { isNonFatalBoundaryError } from "@/lib/posthog/error-boundary-report";
import { billingInsertId } from "@/lib/posthog/billing-analytics";

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

export { isBrowserPostHogReady };

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
    // Provisional until PostHogIdentify loads receipt/check state.
    activation_state: "no_receipt",
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

export type OnboardingWizardStep =
  | "welcome"
  | "course"
  | "status"
  | "dates"
  | "receipt"
  | "finishing";

export function captureOnboardingStepViewed(properties: {
  step: OnboardingWizardStep;
}): void {
  captureClientEvent("onboarding_step_viewed", {
    step: properties.step,
    source: "onboarding_wizard",
  });
}

export function captureOnboardingStepCompleted(properties: {
  step: OnboardingWizardStep;
}): void {
  captureClientEvent("onboarding_step_completed", {
    step: properties.step,
    source: "onboarding_wizard",
  });
}

export function captureOnboardingSkipped(properties: {
  step: OnboardingWizardStep;
}): void {
  captureClientEvent("onboarding_skipped", {
    step: properties.step,
    source: "onboarding_wizard",
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

export function capturePricingCtaViewed(properties: {
  variant: string;
  source?: string;
}): void {
  captureOnceWhenConsented(() => {
    captureClientEvent("pricing_cta_viewed", {
      variant: properties.variant,
      [`$feature/pricing-cta-experiment`]: properties.variant,
      source: properties.source ?? "pricing_page",
    });
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

export type UpgradePromptTrigger =
  | "status_change_wedge"
  | "second_manual_refresh"
  | "stale_status"
  | "receipt_added"
  | "h1b_limit"
  | "ats_limit"
  | "pricing_modal";

export type UpgradePromptShownProperties = {
  trigger?: UpgradePromptTrigger;
  source?: string;
  plan_suggested?: "pro" | "dedicated";
};

export function captureUpgradePromptShown(
  properties: UpgradePromptShownProperties
): void {
  captureClientEvent("upgrade_prompt_shown", {
    ...properties,
    source: properties.source ?? properties.trigger ?? "case_status_page",
    plan_suggested: properties.plan_suggested ?? "pro",
    capture_source: "client",
  });
}

export type CheckoutStartedProperties = {
  trigger: UpgradePromptTrigger;
  source?: string;
};

/**
 * @deprecated Phase 5/6 — do not call. `checkout_started` is emitted only by
 * server `create-checkout` after a Stripe session exists.
 */
export function captureCheckoutStarted(
  _properties: CheckoutStartedProperties
): void {
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      "[posthog] captureCheckoutStarted is deprecated; use server create-checkout"
    );
  }
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
  path?: string;
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
  /** Case-status panel id when caught by CaseStatusPanelErrorBoundary. */
  panel_area?: string;
  error_digest?: string;
  error_message?: string;
};

export function captureErrorBoundaryTriggered(
  properties: ErrorBoundaryTriggeredProperties
): void {
  if (!isBrowserPostHogReady()) return;

  const message = properties.error_message?.trim();
  if (message && isNonFatalBoundaryError(message)) return;

  const sessionId =
    typeof posthog.get_session_id === "function" ? posthog.get_session_id() : undefined;

  captureClientEvent("error_boundary_triggered", {
    ...properties,
    ...(message ? { error_message: message } : {}),
    ...(sessionId ? { $session_id: sessionId } : {}),
  });
}

export function capturePremiumCheckoutCompleted(properties: {
  plan_tier?: string | null;
  session_id?: string | null;
}): void {
  if (!properties.session_id) return;

  const insertId = billingInsertId(
    "premium_checkout_completed",
    properties.session_id
  );

  captureOnceWhenConsented(() => {
    captureClientEvent("premium_checkout_completed", {
      plan_tier: properties.plan_tier ?? null,
      stripe_session_id: properties.session_id ?? null,
      source: "success_page",
      $insert_id: insertId,
    });
  });
}

export function captureExtensionDetected(properties: { version: string | null }): void {
  captureOnceWhenConsented(() => {
    captureClientEvent("extension_detected", {
      version: properties.version,
      source: "dashboard",
    });
  });
}

export function captureActivationCompleted(properties: {
  days_since_signup: number | null;
  within_24h?: boolean;
}): void {
  captureClientEvent("activation_completed", {
    days_since_signup: properties.days_since_signup,
    within_24h: properties.within_24h ?? null,
    source: "dashboard",
  });
}

export function capturePwaInstalled(properties?: {
  source?: string;
}): void {
  captureClientEvent("pwa_installed", {
    source: properties?.source ?? "web",
    capture_source: "client",
  });
}
