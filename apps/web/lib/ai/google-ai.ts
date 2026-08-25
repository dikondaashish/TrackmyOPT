import {
  GoogleGenAI,
  ThinkingLevel,
  type ContentListUnion,
  type GenerateContentConfig,
  type GenerateContentResponse,
  type GenerateContentResponseUsageMetadata,
} from '@google/genai';

import { captureServerEvent } from '@/lib/posthog-server';

export type AiTask =
  | 'resume_generate'
  | 'resume_regenerate'
  | 'ats_scan'
  | 'ats_gap'
  | 'latex_fix'
  | 'bullet_rewrite'
  | 'screening_answer'
  | 'document_analysis'
  | 'autofill_extract';

type ModelChoice = {
  model: string;
  thinkingLevel: ThinkingLevel;
  maxOutputTokens: number;
};

export type AiModelPolicy = {
  primary: ModelChoice;
  fallback?: ModelChoice;
};

const FLASH_37_LOW: ModelChoice = {
  model: 'gemini-3.7-flash',
  thinkingLevel: ThinkingLevel.LOW,
  maxOutputTokens: 16_384,
};

const FLASH_37_MEDIUM: ModelChoice = {
  model: 'gemini-3.7-flash',
  thinkingLevel: ThinkingLevel.MEDIUM,
  maxOutputTokens: 16_384,
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
  resume_generate: { primary: FLASH_37_LOW, fallback: PRO_31_LOW },
  resume_regenerate: { primary: FLASH_37_MEDIUM, fallback: PRO_31_LOW },
  ats_scan: { primary: FLASH_LITE_35, fallback: FLASH_LITE_31 },
  ats_gap: { primary: FLASH_LITE_35, fallback: FLASH_LITE_31 },
  latex_fix: { primary: FLASH_37_LOW, fallback: PRO_31_LOW },
  bullet_rewrite: { primary: FLASH_37_LOW, fallback: PRO_31_LOW },
  screening_answer: { primary: FLASH_37_LOW, fallback: PRO_31_LOW },
  document_analysis: { primary: FLASH_LITE_35, fallback: FLASH_37_LOW },
  autofill_extract: { primary: FLASH_LITE_35, fallback: FLASH_LITE_31 },
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

function modelPrice(model: string, at: Date): ModelPrice | null {
  if (model === 'gemini-3.7-flash') {
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
  };

  console.info('[ai-usage]', JSON.stringify(properties));
  if (input.userId) {
    void captureServerEvent(input.userId, 'ai_generation_completed', properties);
  }
}

async function callModel(input: {
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
  const response = await input.client.models.generateContent({
    model: input.choice.model,
    contents: input.contents,
    config: requestConfig(input.choice, input.config),
  });

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
    if (!policy.fallback || !isRetryableProviderError(error)) throw error;

    console.warn(
      `[ai] ${input.task} failed on ${policy.primary.model}; retrying with ${policy.fallback.model}`,
      error instanceof Error ? error.message : 'unknown provider error'
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
