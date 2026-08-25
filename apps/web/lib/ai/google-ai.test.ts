import { describe, expect, it, vi } from 'vitest';

vi.mock('@google/genai', () => ({
  GoogleGenAI: class {},
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
  it('uses Gemini 3.7 Flash for resume generation', () => {
    expect(AI_MODEL_POLICIES.resume_generate.primary.model).toBe(
      'gemini-3.7-flash'
    );
    expect(AI_MODEL_POLICIES.resume_generate.fallback?.model).toBe(
      'gemini-3.1-pro-preview'
    );
  });

  it('uses Flash-Lite for structured, high-volume analysis', () => {
    expect(AI_MODEL_POLICIES.ats_scan.primary.model).toBe(
      'gemini-3.5-flash-lite'
    );
    expect(AI_MODEL_POLICIES.autofill_extract.primary.model).toBe(
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

  it('uses Gemini 3.7 Flash promotional pricing during 2026', () => {
    expect(
      estimateAiCostUsd(
        'gemini-3.7-flash',
        usage,
        new Date('2026-08-24T00:00:00Z')
      )
    ).toBeCloseTo(0.024, 6);
  });

  it('uses the announced standard pricing from 2027', () => {
    expect(
      estimateAiCostUsd(
        'gemini-3.7-flash',
        usage,
        new Date('2027-01-01T00:00:00Z')
      )
    ).toBeCloseTo(0.048, 6);
  });
});
