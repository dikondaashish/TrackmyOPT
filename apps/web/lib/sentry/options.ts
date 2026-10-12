import type { ErrorEvent, EventHint, init, StackFrame } from '@sentry/nextjs';
import { sanitize } from '@/lib/secure-logger';

/** Remove URL credentials, queries, fragments, and private record identifiers. */
function scrubText(value: string): string {
  // SDK errors can embed entire serialized sessions, including truncated JSON.
  // Redact the payload as a whole; field-pattern filtering cannot remove names,
  // identity metadata, documents, or AI text whose contents we cannot predict.
  const payloadStart = value.search(
    /\{|\[(?=\s*(?:"|\{|\d|true\b|false\b|null\b))/
  );
  const diagnostic =
    payloadStart < 0
      ? value
      : `${value.slice(0, payloadStart)}[REDACTED_PAYLOAD]`;
  const withoutQueries = diagnostic.replace(
    /https?:\/\/[^\s"'<>]+/g,
    (value) => {
      try {
        const url = new URL(value);
        return `${url.origin}${url.pathname}`;
      } catch {
        return '[REDACTED_URL]';
      }
    }
  );
  return String(sanitize(withoutQueries)).replace(
    /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi,
    '[REDACTED_ID]'
  );
}

function scrubFrame(frame: StackFrame): StackFrame {
  // Keep enough for source-map resolution; exclude locals and source context.
  return {
    filename: frame.filename ? scrubText(frame.filename) : undefined,
    abs_path: frame.abs_path ? scrubText(frame.abs_path) : undefined,
    function: frame.function ? scrubText(frame.function) : undefined,
    module: frame.module ? scrubText(frame.module) : undefined,
    lineno: frame.lineno,
    colno: frame.colno,
    in_app: frame.in_app,
  };
}

/** Allow only diagnostic fields, even when a caller adds private scope data. */
export function scrubSentryEvent(
  event: ErrorEvent,
  hint: EventHint
): ErrorEvent {
  hint.attachments = [];
  return {
    type: undefined,
    event_id: event.event_id,
    timestamp: event.timestamp,
    platform: event.platform,
    level: event.level,
    release: event.release,
    environment: event.environment,
    dist: event.dist,
    sdk: event.sdk,
    debug_meta: event.debug_meta,
    message: event.message ? scrubText(event.message) : undefined,
    logentry: event.logentry
      ? {
          message: event.logentry.message
            ? scrubText(event.logentry.message)
            : undefined,
        }
      : undefined,
    exception: event.exception
      ? {
          values: event.exception.values?.map((exception) => ({
            type: exception.type ? scrubText(exception.type) : undefined,
            value: exception.value ? scrubText(exception.value) : undefined,
            stacktrace: exception.stacktrace
              ? {
                  frames: exception.stacktrace.frames?.map(scrubFrame),
                }
              : undefined,
            mechanism: exception.mechanism
              ? {
                  type: exception.mechanism.type,
                  handled: exception.mechanism.handled,
                }
              : undefined,
          })),
        }
      : undefined,
    request: event.request ? { method: event.request.method } : undefined,
    // Trace IDs correlate errors without sending user, device, or custom context.
    contexts: event.contexts?.trace
      ? {
          trace: {
            trace_id: event.contexts.trace.trace_id,
            span_id: event.contexts.trace.span_id,
          },
        }
      : undefined,
  };
}

export function sentryOptions(
  dsn: string | undefined
): Parameters<typeof init>[0] {
  return {
    dsn,
    enabled: Boolean(dsn) && process.env.NODE_ENV !== 'test',
    environment:
      process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV,
    sampleRate: 1,
    traceLifecycle: 'static',
    maxBreadcrumbs: 0,
    tracePropagationTargets: [],
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: false,
      httpBodies: [],
      urlQueryParams: false,
      graphQL: { document: false, variables: false },
      genAI: { inputs: false, outputs: false },
      databaseQueryData: false,
      queues: false,
      stackFrameVariables: false,
      frameContextLines: 0,
    },
    beforeSend: scrubSentryEvent,
    beforeSendTransaction: () => null,
    beforeSendLog: () => null,
    beforeSendMetric: () => null,
  };
}
