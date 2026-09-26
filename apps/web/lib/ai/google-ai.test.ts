import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const generateContent = vi.hoisted(() => vi.fn());
vi.mock('@google/genai', () => ({
  GoogleGenAI: class { models = { generateContent }; },
  ThinkingLevel: {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    MINIMAL: 'MINIMAL',
  },
}));

vi.mock('@/lib/posthog-server', () => ({ captureServerEvent: vi.fn() }));

import {
  AI_MODEL_POLICIES,
  generateAiContent,
  estimateAiCostUsd,
  resolveAiBackendConfig,
} from './google-ai';

describe('Vertex AI backend configuration', () => {
  it('defaults to Vertex AI and the global location', () => {
    expect(
      resolveAiBackendConfig({ GOOGLE_CLOUD_PROJECT: 'trackmyopt-prod' })
    ).toEqual({
      backend: 'vertex',
      project: 'trackmyopt-prod',
      location: 'global',
    });
  });

  it('requires an explicit opt-out before using a Gemini API key', () => {
    expect(
      resolveAiBackendConfig({
        GOOGLE_GENAI_USE_VERTEXAI: 'false',
        GEMINI_API_KEY: 'test-api-key',
      })
    ).toEqual({ backend: 'gemini-api', apiKey: 'test-api-key' });
  });

  it('fails instead of silently bypassing Vertex credits', () => {
    expect(() =>
      resolveAiBackendConfig({ GEMINI_API_KEY: 'test-api-key' })
    ).toThrow('GOOGLE_CLOUD_PROJECT is required for Vertex AI');
  });

  it('accepts service-account credentials for non-Google hosting', () => {
    const config = resolveAiBackendConfig({
      GOOGLE_CLOUD_PROJECT: 'trackmyopt-prod',
      GOOGLE_SERVICE_ACCOUNT_JSON: JSON.stringify({
        client_email: 'vertex@trackmyopt-prod.iam.gserviceaccount.com',
        private_key: 'private-key',
      }),
    });

    expect(config).toMatchObject({
      backend: 'vertex',
      project: 'trackmyopt-prod',
      credentials: {
        client_email: 'vertex@trackmyopt-prod.iam.gserviceaccount.com',
      },
    });
  });
});

describe('AI model policies', () => {
  it('uses Gemini 3.8 Flash for resume generation with 3.7 Flash fallback', () => {
    expect(AI_MODEL_POLICIES.resume_generate.primary.model).toBe(
      'gemini-3.8-flash'
    );
    expect(AI_MODEL_POLICIES.resume_generate.primary.maxOutputTokens).toBe(
      32_768
    );
    expect(AI_MODEL_POLICIES.resume_generate.primary.temperature).toBe(0.3);
    expect(AI_MODEL_POLICIES.resume_generate.fallback?.model).toBe(
      'gemini-3.7-flash'
    );
    expect(AI_MODEL_POLICIES.resume_regenerate.primary.model).toBe(
      'gemini-3.8-flash'
    );
  });

  it('uses Flash-Lite for structured, high-volume analysis', () => {
    expect(AI_MODEL_POLICIES.ats_scan.primary.model).toBe(
      'gemini-3.5-flash-lite'
    );
    expect(AI_MODEL_POLICIES.autofill_extract.primary.model).toBe(
      'gemini-3.5-flash-lite'
    );
    expect(AI_MODEL_POLICIES.resume_job_profile.primary.model).toBe(
      'gemini-3.5-flash-lite'
    );
  });
});

describe('AI cost estimation', () => {
  const usage = {
    promptTokenCount: 12_000,
    candidatesTokenCount: 3_000,
    thoughtsTokenCount: 1_000,
    totalTokenCount: 16_000,
  };

  it('uses Gemini Flash promotional pricing during 2026', () => {
    for (const model of ['gemini-3.8-flash', 'gemini-3.7-flash'] as const) {
      expect(
        estimateAiCostUsd(model, usage, new Date('2026-08-24T00:00:00Z'))
      ).toBeCloseTo(0.024, 6);
    }
  });

  it('uses the announced standard Flash pricing from 2027', () => {
    for (const model of ['gemini-3.8-flash', 'gemini-3.7-flash'] as const) {
      expect(
        estimateAiCostUsd(model, usage, new Date('2027-01-01T00:00:00Z'))
      ).toBeCloseTo(0.048, 6);
    }
  });
});


describe('resume model deadlines', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubEnv('GOOGLE_CLOUD_PROJECT', 'test-project');
    generateContent.mockReset();
  });
  afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs(); });

  it('aborts a stalled primary and returns the fallback within the route deadline', async () => {
    generateContent.mockImplementationOnce(() => new Promise(() => {}))
      .mockResolvedValueOnce({ text: 'generated resume' });
    const pending = generateAiContent({ task: 'resume_generate', contents: 'synthetic' });
    await vi.advanceTimersByTimeAsync(40_000);
    await expect(pending).resolves.toMatchObject({ text: 'generated resume' });
    expect(generateContent).toHaveBeenCalledTimes(2);
    const primary = generateContent.mock.calls[0][0];
    const fallback = generateContent.mock.calls[1][0];
    expect(primary.config.abortSignal.aborted).toBe(true);
    expect(primary.config.thinkingConfig.thinkingLevel).toBe('LOW');
    expect(primary.config.httpOptions.retryOptions.attempts).toBe(1);
    expect(fallback.model).toBe('gemini-3.7-flash');
    expect(fallback.config.abortSignal.aborted).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('does not start fallback after the overall request was cancelled', async () => {
    generateContent.mockImplementation(() => new Promise(() => {}));
    const controller = new AbortController();
    const pending = generateAiContent({ task: 'resume_generate', contents: 'synthetic', config: { abortSignal: controller.signal } });
    const assertion = expect(pending).rejects.toThrow('cancelled');
    controller.abort(new Error('cancelled'));
    await assertion;
    expect(generateContent).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('does not retry invalid credentials', async () => {
    generateContent.mockRejectedValueOnce(Object.assign(new Error('Unauthorized'), { status: 401 }));
    await expect(generateAiContent({ task: 'resume_generate', contents: 'synthetic' })).rejects.toThrow('Unauthorized');
    expect(generateContent).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });
});
