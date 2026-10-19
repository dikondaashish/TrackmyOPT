import {
  GoogleGenAI,
  PersonGeneration,
  ThinkingLevel,
  type ContentListUnion,
  type GenerateContentConfig,
  type GenerateContentResponse,
  type GenerateContentResponseUsageMetadata,
} from '@google/genai';

import { captureServerEvent } from '@/lib/posthog-server';
import {
  getAiRequestId,
  recordAiRequestCost,
} from '@/lib/ai/ai-request-context';

export type AiTask =
  | 'resume_generate'
  | 'resume_regenerate'
  | 'ats_scan'
  | 'ats_gap'
  | 'latex_fix'
  | 'bullet_rewrite'
  | 'screening_answer'
  | 'document_analysis'
  | 'autofill_extract'
  | 'resume_job_profile'
  | 'networking_draft'
  | 'networking_discovery'
  | 'networking_bundle_draft'
  | 'policy_news_article';

type ModelChoice = {
  model: string;
  thinkingLevel: ThinkingLevel;
  maxOutputTokens: number;
  temperature?: number;
  timeoutMs?: number;
};

export type AiModelPolicy = {
  primary: ModelChoice;
  fallback?: ModelChoice;
};

/** Headroom for 5+ roles with 4–6 bullets each in LaTeX (API supports 65k). */
const RESUME_MAX_OUTPUT_TOKENS = 32_768;

const FLASH_38_MEDIUM: ModelChoice = {
  model: 'gemini-3.8-flash',
  thinkingLevel: ThinkingLevel.MEDIUM,
  maxOutputTokens: RESUME_MAX_OUTPUT_TOKENS,
  temperature: 0.3,
};

const FLASH_37_LOW: ModelChoice = {
  model: 'gemini-3.7-flash',
  thinkingLevel: ThinkingLevel.LOW,
  maxOutputTokens: 16_384,
  temperature: 0.3,
};

const FLASH_37_MEDIUM: ModelChoice = {
  model: 'gemini-3.7-flash',
  thinkingLevel: ThinkingLevel.MEDIUM,
  maxOutputTokens: RESUME_MAX_OUTPUT_TOKENS,
  temperature: 0.3,
};

const PRO_31_LOW: ModelChoice = {
  model: 'gemini-3.1-pro-preview',
  thinkingLevel: ThinkingLevel.LOW,
  maxOutputTokens: 16_384,
};

const FLASH_LITE_35: ModelChoice = {
  model: 'gemini-3.5-flash-lite',
  thinkingLevel: ThinkingLevel.MINIMAL,
  maxOutputTokens: 8_192,
};

const FLASH_LITE_31: ModelChoice = {
  model: 'gemini-3.1-flash-lite',
  thinkingLevel: ThinkingLevel.MINIMAL,
  maxOutputTokens: 8_192,
};

/**
 * One auditable model policy for every AI feature. Routes must select a task,
 * never hard-code a model name.
 */
export const AI_MODEL_POLICIES: Readonly<Record<AiTask, AiModelPolicy>> = {
  resume_generate: {
    primary: { ...FLASH_38_MEDIUM, thinkingLevel: ThinkingLevel.LOW, timeoutMs: 40_000 },
    fallback: { ...FLASH_37_MEDIUM, thinkingLevel: ThinkingLevel.LOW, timeoutMs: 40_000 },
  },
  resume_regenerate: {
    primary: { ...FLASH_38_MEDIUM, thinkingLevel: ThinkingLevel.LOW, timeoutMs: 40_000 },
    fallback: { ...FLASH_37_MEDIUM, thinkingLevel: ThinkingLevel.LOW, timeoutMs: 40_000 },
  },
  ats_scan: { primary: FLASH_LITE_35, fallback: FLASH_LITE_31 },
  ats_gap: { primary: FLASH_LITE_35, fallback: FLASH_LITE_31 },
  latex_fix: { primary: FLASH_37_LOW, fallback: PRO_31_LOW },
  bullet_rewrite: { primary: FLASH_37_LOW, fallback: PRO_31_LOW },
  screening_answer: { primary: FLASH_37_LOW, fallback: PRO_31_LOW },
  document_analysis: { primary: FLASH_LITE_35, fallback: FLASH_37_LOW },
  autofill_extract: { primary: FLASH_LITE_35, fallback: FLASH_LITE_31 },
  resume_job_profile: { primary: FLASH_LITE_35, fallback: FLASH_LITE_31 },
  networking_draft: { primary: FLASH_LITE_35, fallback: FLASH_LITE_31 },
  networking_discovery: { primary: FLASH_38_MEDIUM },
  networking_bundle_draft: { primary: FLASH_38_MEDIUM },
  policy_news_article: {
    primary: { ...FLASH_38_MEDIUM, timeoutMs: 120_000 },
    fallback: { ...FLASH_37_MEDIUM, timeoutMs: 100_000 },
  },
};

type AiBackendConfig =
  | {
      backend: 'vertex';
      project: string;
      location: string;
      credentials?: ServiceAccountCredentials;
    }
  | { backend: 'gemini-api'; apiKey: string };

type ServiceAccountCredentials = {
  type?: string;
  project_id?: string;
  private_key_id?: string;
  private_key: string;
  client_email: string;
  client_id?: string;
  universe_domain?: string;
};

function parseServiceAccountCredentials(raw: string): ServiceAccountCredentials {
  let credentials: unknown;
  try {
    credentials = JSON.parse(raw);
  } catch {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON must contain valid JSON.');
  }

  if (
    !credentials ||
    typeof credentials !== 'object' ||
    typeof (credentials as Record<string, unknown>).client_email !== 'string' ||
    typeof (credentials as Record<string, unknown>).private_key !== 'string'
  ) {
    throw new Error(
      'GOOGLE_SERVICE_ACCOUNT_JSON must include client_email and private_key.'
    );
  }

  const source = credentials as Record<string, unknown>;
  const optionalString = (key: string): string | undefined =>
    typeof source[key] === 'string' ? source[key] : undefined;

  // Allow-list service-account fields so GOOGLE_SERVICE_ACCOUNT_JSON cannot
  // select an unexpected external-account credential type.
  return {
    client_email: source.client_email as string,
    private_key: source.private_key as string,
    type: optionalString('type'),
    project_id: optionalString('project_id'),
    private_key_id: optionalString('private_key_id'),
    client_id: optionalString('client_id'),
    universe_domain: optionalString('universe_domain'),
  };
}

export function resolveAiBackendConfig(
  env: Readonly<Record<string, string | undefined>> = process.env
): AiBackendConfig {
  // Vertex is deliberately the default so production cannot silently bypass
  // Google Cloud promotional credits through an AI Studio API key.
  const useVertex = env.GOOGLE_GENAI_USE_VERTEXAI !== 'false';
  if (!useVertex) {
    const apiKey = env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      throw new Error(
        'GEMINI_API_KEY is required when GOOGLE_GENAI_USE_VERTEXAI=false.'
      );
    }
    return { backend: 'gemini-api', apiKey };
  }

  const project = env.GOOGLE_CLOUD_PROJECT?.trim();
  if (!project) {
    throw new Error(
      'GOOGLE_CLOUD_PROJECT is required for Vertex AI. Set GOOGLE_GENAI_USE_VERTEXAI=false only for an intentional Gemini Developer API fallback.'
    );
  }

  const serviceAccountJson = env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim();
  return {
    backend: 'vertex',
    project,
    location: env.GOOGLE_CLOUD_LOCATION?.trim() || 'global',
    ...(serviceAccountJson
      ? { credentials: parseServiceAccountCredentials(serviceAccountJson) }
      : {}),
  };
}

let cachedClient: GoogleGenAI | null = null;
let cachedBackend: AiBackendConfig['backend'] | null = null;

function getAiClient(): {
  client: GoogleGenAI;
  backend: AiBackendConfig['backend'];
} {
  if (cachedClient && cachedBackend) {
    return { client: cachedClient, backend: cachedBackend };
  }

  const config = resolveAiBackendConfig();
  cachedBackend = config.backend;
  if (config.backend === 'gemini-api') {
    cachedClient = new GoogleGenAI({ apiKey: config.apiKey });
  } else {
    cachedClient = new GoogleGenAI({
      vertexai: true,
      project: config.project,
      location: config.location,
      ...(config.credentials
        ? { googleAuthOptions: { credentials: config.credentials } }
        : {}),
    });
  }

  return { client: cachedClient, backend: cachedBackend };
}

type ModelPrice = {
  inputPerMillion: number;
  outputPerMillion: number;
  cachedInputPerMillion: number;
};

function geminiFlashPrice(at: Date): ModelPrice {
  const promotional = at < new Date('2027-01-01T00:00:00Z');
  return promotional
    ? {
        inputPerMillion: 0.75,
        outputPerMillion: 3.75,
        cachedInputPerMillion: 0.075,
      }
    : {
        inputPerMillion: 1.5,
        outputPerMillion: 7.5,
        cachedInputPerMillion: 0.15,
      };
}

function modelPrice(model: string, at: Date): ModelPrice | null {
  if (model === 'gemini-3.8-flash' || model === 'gemini-3.7-flash') {
    return geminiFlashPrice(at);
  }
  if (model === 'gemini-3.5-flash-lite') {
    return {
      inputPerMillion: 0.3,
      outputPerMillion: 2.5,
      cachedInputPerMillion: 0.03,
    };
  }
  if (model === 'gemini-3.1-flash-lite') {
    return {
      inputPerMillion: 0.25,
      outputPerMillion: 1.5,
      cachedInputPerMillion: 0.025,
    };
  }
  if (model === 'gemini-3.1-pro-preview') {
    return {
      inputPerMillion: 2,
      outputPerMillion: 12,
      cachedInputPerMillion: 0.2,
    };
  }
  return null;
}

export function estimateAiCostUsd(
  model: string,
  usage: GenerateContentResponseUsageMetadata | undefined,
  at = new Date()
): number | null {
  const price = modelPrice(model, at);
  if (!price || !usage) return null;

  const promptTokens = usage.promptTokenCount ?? 0;
  const cachedTokens = Math.min(usage.cachedContentTokenCount ?? 0, promptTokens);
  const normalInputTokens = promptTokens - cachedTokens;
  const outputTokens =
    (usage.candidatesTokenCount ?? 0) + (usage.thoughtsTokenCount ?? 0);

  return (
    (normalInputTokens * price.inputPerMillion +
      cachedTokens * price.cachedInputPerMillion +
      outputTokens * price.outputPerMillion) /
    1_000_000
  );
}

/**
 * Provider failure fields that cannot echo prompts or output: the error class,
 * numeric HTTP status, and Google's upper-case status enum (e.g.
 * INVALID_ARGUMENT) parsed from the provider body. Never the message text.
 */
// Categories for a provider's 4xx explanation. The provider text itself is
// never logged (it can quote the request), only which family it belongs to.
const REQUEST_REJECTION_CAUSES: ReadonlyArray<[string, RegExp]> = [
  ['schema', /schema|too many states|response_?json|constraint/i],
  ['input_too_large', /token|context (?:length|window)|too (?:long|large)|exceeds the maximum/i],
  ['auth', /api key|permission|unauthori[sz]ed|credential|forbidden/i],
  ['model', /model\b.*(?:not found|not supported|unavailable)|unsupported model/i],
];

function requestRejectionCause(message: string): string {
  return REQUEST_REJECTION_CAUSES.find(([, pattern]) => pattern.test(message))?.[0] ?? 'other';
}

/**
 * Removes length, count and range keywords from a JSON schema sent as
 * responseJsonSchema. Gemini rejects schemas whose constraints expand into too
 * many decoding states (400 INVALID_ARGUMENT); callers must validate the
 * returned JSON against their full schema, which keeps these limits.
 */
export function toGeminiResponseSchema<T>(schema: T): T {
  const constraintKeys = new Set([
    'maxLength', 'minLength', 'maxItems', 'minItems', 'minimum', 'maximum', 'pattern',
  ]);
  const strip = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(strip);
    if (!value || typeof value !== 'object') return value;
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !constraintKeys.has(key))
        .map(([key, nested]) => [key, strip(nested)])
    );
  };
  return strip(schema) as T;
}

export function aiFailureDiagnostic(error: unknown): {
  errorName: string;
  status?: number;
  reason?: string;
  cause?: string;
} {
  const errorName =
    error instanceof Error && /^[A-Za-z]{1,64}$/.test(error.name)
      ? error.name
      : 'UnknownError';
  const rawStatus =
    typeof error === 'object' && error !== null && 'status' in error
      ? Number((error as { status?: unknown }).status)
      : NaN;
  const reason =
    error instanceof Error
      ? /"status"\s*:\s*"([A-Z_]{3,40})"/.exec(error.message)?.[1]
      : undefined;
  // For a rejected request (4xx other than rate limits), which kind of
  // problem the provider named; the message itself stays out of logs.
  const cause =
    error instanceof Error &&
    Number.isInteger(rawStatus) &&
    rawStatus >= 400 &&
    rawStatus < 500 &&
    rawStatus !== 429
      ? requestRejectionCause(
          /"message"\s*:\s*"((?:[^"\\]|\\.)*)"/.exec(error.message)?.[1] ?? error.message
        )
      : undefined;
  return {
    errorName,
    ...(Number.isInteger(rawStatus) ? { status: rawStatus } : {}),
    ...(reason ? { reason } : {}),
    ...(cause ? { cause } : {}),
  };
}

function isRetryableProviderError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const candidate = error as { status?: unknown; code?: unknown; name?: unknown };
  const status = Number(candidate.status ?? candidate.code);
  if ([408, 429, 500, 502, 503, 504].includes(status)) return true;

  const name = String(candidate.name ?? '');
  return /Connection|Timeout|FetchError/i.test(name);
}

function requestConfig(
  choice: ModelChoice,
  override?: GenerateContentConfig
): GenerateContentConfig {
  return {
    ...override,
    maxOutputTokens: override?.maxOutputTokens ?? choice.maxOutputTokens,
    ...(choice.temperature !== undefined && override?.temperature === undefined
      ? { temperature: choice.temperature }
      : {}),
    thinkingConfig: {
      thinkingLevel: choice.thinkingLevel,
      includeThoughts: false,
      ...override?.thinkingConfig,
    },
  };
}

function emitUsageTelemetry(input: {
  task: AiTask;
  model: string;
  backend: AiBackendConfig['backend'];
  latencyMs: number;
  fallbackUsed: boolean;
  usage: GenerateContentResponseUsageMetadata | undefined;
  userId?: string;
}) {
  const estimatedCostUsd = estimateAiCostUsd(input.model, input.usage);
  const aiRequestId = getAiRequestId();
  const properties = {
    ai_task: input.task,
    ai_model: input.model,
    ai_backend: input.backend,
    ai_latency_ms: input.latencyMs,
    ai_fallback_used: input.fallbackUsed,
    ai_prompt_tokens: input.usage?.promptTokenCount ?? 0,
    ai_candidate_tokens: input.usage?.candidatesTokenCount ?? 0,
    ai_thought_tokens: input.usage?.thoughtsTokenCount ?? 0,
    ai_total_tokens: input.usage?.totalTokenCount ?? 0,
    ai_estimated_cost_usd: estimatedCostUsd,
    ...(aiRequestId ? { ai_request_id: aiRequestId } : {}),
  };

  console.info('[ai-usage]', JSON.stringify(properties));
  recordAiRequestCost({
    task: input.task,
    model: input.model,
    costUsd: estimatedCostUsd,
    fallbackUsed: input.fallbackUsed,
  });
  if (input.userId) {
    void captureServerEvent(input.userId, 'ai_generation_completed', properties);
  }
}

async function callModel(input: {
  /** A fallback model will retry a retryable failure of this call. */
  fallbackAvailable?: boolean;
  client: GoogleGenAI;
  backend: AiBackendConfig['backend'];
  task: AiTask;
  choice: ModelChoice;
  contents: ContentListUnion;
  config?: GenerateContentConfig;
  fallbackUsed: boolean;
  userId?: string;
}): Promise<GenerateContentResponse> {
  const startedAt = Date.now();
  const context = {
    requestId: getAiRequestId(), task: input.task, model: input.choice.model,
    backend: input.backend, fallbackUsed: input.fallbackUsed,
  };
  console.info('[ai-start]', JSON.stringify(context));
  const controller = new AbortController();
  const parentSignal = input.config?.abortSignal;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let onAbort: (() => void) | undefined;
  let response: GenerateContentResponse;
  try {
    const deadline = new Promise<never>((_, reject) => {
      onAbort = () => {
        const reason = parentSignal?.reason ?? new Error('AI request cancelled');
        reject(reason);
        controller.abort(reason);
      };
      if (parentSignal?.aborted) onAbort();
      else parentSignal?.addEventListener('abort', onAbort, { once: true });
      if (input.choice.timeoutMs) {
        timer = setTimeout(() => {
          const error = new Error('AI model attempt timed out');
          error.name = 'ModelAttemptTimeout';
          reject(error);
          controller.abort(error);
        }, input.choice.timeoutMs);
      }
    });
    const config = requestConfig(input.choice, input.config);
    response = await Promise.race([
      input.client.models.generateContent({
        model: input.choice.model,
        contents: input.contents,
        config: {
          ...config,
          abortSignal: controller.signal,
          ...(input.choice.timeoutMs ? {
            // Avoid SDK retries consuming the entire route budget before fallback.
            httpOptions: { ...config.httpOptions, timeout: input.choice.timeoutMs, retryOptions: { attempts: 1 } },
          } : {}),
        },
      }),
      deadline,
    ]);
  } catch (error) {
    const failure = aiFailureDiagnostic(error);
    // Full context for log search (warn is not sent to Sentry)...
    console.warn('[ai-failed-detail]', JSON.stringify({
      ...context, latencyMs: Date.now() - startedAt, ...failure,
    }));
    // ...and a stable, payload-free line for Sentry. A JSON argument would be
    // redacted wholesale by the privacy filter, hiding task, model and status.
    const line =
      `[ai-failed] task=${input.task} model=${input.choice.model} ` +
      `fallback=${input.fallbackUsed} error=${failure.errorName} ` +
      `status=${failure.status ?? 'none'} reason=${failure.reason ?? 'none'}` +
      (failure.cause ? ` cause=${failure.cause}` : '');
    // A failure the fallback model retries is not yet a user-facing failure
    // (warn stays out of Sentry); the fallback's own failure reports.
    const recoverable =
      input.fallbackAvailable === true &&
      isRetryableProviderError(error) &&
      !input.config?.abortSignal?.aborted;
    if (recoverable) console.warn(line);
    else console.error(line);
    throw error;
  } finally {
    clearTimeout(timer);
    if (onAbort) parentSignal?.removeEventListener('abort', onAbort);
  }

  emitUsageTelemetry({
    task: input.task,
    model: input.choice.model,
    backend: input.backend,
    latencyMs: Date.now() - startedAt,
    fallbackUsed: input.fallbackUsed,
    usage: response.usageMetadata,
    userId: input.userId,
  });
  return response;
}

export async function generateAiContent(input: {
  task: AiTask;
  contents: ContentListUnion;
  config?: GenerateContentConfig;
  userId?: string;
}): Promise<GenerateContentResponse> {
  const { client, backend } = getAiClient();
  const policy = AI_MODEL_POLICIES[input.task];

  try {
    return await callModel({
      fallbackAvailable: Boolean(policy.fallback),
      client,
      backend,
      task: input.task,
      choice: policy.primary,
      contents: input.contents,
      config: input.config,
      fallbackUsed: false,
      userId: input.userId,
    });
  } catch (error) {
    if (input.config?.abortSignal?.aborted) throw error;
    if (!policy.fallback || !isRetryableProviderError(error)) throw error;

    console.warn(
      `[ai] ${input.task} failed on ${policy.primary.model}; retrying with ${policy.fallback.model}`,
      error instanceof Error ? error.name : 'unknown provider error'
    );
    return callModel({
      client,
      backend,
      task: input.task,
      choice: policy.fallback,
      contents: input.contents,
      config: input.config,
      fallbackUsed: true,
      userId: input.userId,
    });
  }
}

/** Blog cover illustrations. `POLICY_NEWS_IMAGE_MODEL` overrides the model. */
const IMAGE_MODEL_DEFAULT = 'imagen-4.0-generate-001';
const IMAGE_TIMEOUT_MS = 90_000;

/** One 16:9 image for a text prompt; returns the encoded bytes. */
export async function generateAiImage(input: {
  task: 'policy_news_cover';
  prompt: string;
}): Promise<{ bytes: Buffer; mimeType: string }> {
  const { client, backend } = getAiClient();
  const model = process.env.POLICY_NEWS_IMAGE_MODEL?.trim() || IMAGE_MODEL_DEFAULT;
  const startedAt = Date.now();
  try {
    const response = await client.models.generateImages({
      model,
      prompt: input.prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: '16:9',
        outputMimeType: 'image/png',
        personGeneration: PersonGeneration.ALLOW_ADULT,
        httpOptions: { timeout: IMAGE_TIMEOUT_MS, retryOptions: { attempts: 1 } },
      },
    });
    const image = response.generatedImages?.[0]?.image;
    if (!image?.imageBytes) {
      const error = new Error('Image model returned no image');
      error.name = 'EmptyImageResponse';
      throw error;
    }
    console.info('[ai-usage]', JSON.stringify({
      ai_task: input.task, ai_model: model, ai_backend: backend,
      ai_latency_ms: Date.now() - startedAt, ai_images: 1,
    }));
    return { bytes: Buffer.from(image.imageBytes, 'base64'), mimeType: image.mimeType ?? 'image/png' };
  } catch (error) {
    const failure = aiFailureDiagnostic(error);
    console.error(
      `[ai-failed] task=${input.task} model=${model} fallback=false ` +
        `error=${failure.errorName} status=${failure.status ?? 'none'} reason=${failure.reason ?? 'none'}`
    );
    throw error;
  }
}
