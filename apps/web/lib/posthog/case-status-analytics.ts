import { captureServerEvent, type PostHogEventProperties } from "@/lib/posthog-server";
import {
  getReceiptPrefix,
  isPendingStatus,
  normalizeStatusCategory,
} from "@/lib/posthog/uscis-status-category";

export type CaseCheckTrigger = "manual" | "cron" | "initial" | "unknown";
export type CaseCheckSource = "api" | "cron";

export function resolveCaseCheckTrigger(req: Request): CaseCheckTrigger {
  const explicit = req.headers.get("X-Check-Trigger");
  if (
    explicit === "initial" ||
    explicit === "manual" ||
    explicit === "cron"
  ) {
    return explicit;
  }
  if (req.headers.get("X-Force-Refresh") === "true") {
    return "manual";
  }
  const authHeader = req.headers.get("authorization");
  if (authHeader === `Bearer ${process.env.CRON_SECRET}`) {
    return "cron";
  }
  return "unknown";
}

export function resolveCaseCheckSource(trigger: CaseCheckTrigger): CaseCheckSource {
  return trigger === "cron" ? "cron" : "api";
}

type BaseCheckProps = {
  userId: string | null | undefined;
  receiptNumber: string;
  trigger: CaseCheckTrigger;
  source: CaseCheckSource;
  durationMs: number;
};

function baseProps({
  receiptNumber,
  trigger,
  source,
  durationMs,
}: Omit<BaseCheckProps, "userId">): PostHogEventProperties {
  return {
    trigger,
    receipt_prefix: getReceiptPrefix(receiptNumber),
    source,
    duration_ms: durationMs,
  };
}

async function safeCapture(
  userId: string | null | undefined,
  event: string,
  properties: PostHogEventProperties
): Promise<void> {
  if (!userId) return;
  await captureServerEvent(userId, event, properties);
}

export async function trackCaseStatusCheckStarted(
  props: Omit<BaseCheckProps, "durationMs"> & { durationMs?: number }
): Promise<void> {
  await safeCapture(props.userId, "case_status_check_started", {
    ...baseProps({ ...props, durationMs: props.durationMs ?? 0 }),
  });
}

export async function trackCaseStatusCheckCompleted(
  props: BaseCheckProps & {
    statusText?: string | null;
    httpStatus?: number;
  }
): Promise<void> {
  const statusCategory = normalizeStatusCategory(props.statusText);
  await safeCapture(props.userId, "case_status_check_completed", {
    ...baseProps(props),
    status_category: statusCategory,
    is_pending: isPendingStatus(props.statusText),
    ...(props.httpStatus !== undefined ? { http_status: props.httpStatus } : {}),
  });
}

export async function trackCaseStatusCheckFailed(
  props: BaseCheckProps & {
    httpStatus?: number;
    errorCode?: string | number | null;
  }
): Promise<void> {
  await safeCapture(props.userId, "case_status_check_failed", {
    ...baseProps(props),
    ...(props.httpStatus !== undefined ? { http_status: props.httpStatus } : {}),
    ...(props.errorCode != null ? { error_code: String(props.errorCode) } : {}),
  });
}

export { getReceiptPrefix, isPendingStatus, normalizeStatusCategory };
