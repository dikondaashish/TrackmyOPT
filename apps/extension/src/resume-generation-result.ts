import type { ResumeAutofillSnapshotV1 } from './resume-autofill-contract';

export interface GeneratedResumeSuccessBase {
  pdfBase64: string;
  editorUrl?: string;
  baselineScore?: number;
  generatedScore?: number;
  scoreError?: 'limit_reached' | 'scan_failed';
}

export interface SnapshotExtractionHandoff {
  structuredFieldsAvailable: boolean;
  generatedContentHash?: string;
  snapshot?: ResumeAutofillSnapshotV1;
  reason?: string;
}

export interface GeneratedResumeSuccess extends GeneratedResumeSuccessBase {
  ok: true;
  structuredFieldsAvailable: boolean;
  generatedContentHash?: string;
  snapshot?: ResumeAutofillSnapshotV1;
}

export function buildGeneratedResumeResult(
  base: GeneratedResumeSuccessBase,
  extraction?: SnapshotExtractionHandoff
): GeneratedResumeSuccess {
  const structuredFieldsAvailable = Boolean(
    extraction?.structuredFieldsAvailable &&
      extraction.snapshot &&
      extraction.generatedContentHash
  );

  return {
    ok: true,
    ...base,
    structuredFieldsAvailable,
    ...(extraction?.generatedContentHash
      ? { generatedContentHash: extraction.generatedContentHash }
      : {}),
    ...(structuredFieldsAvailable ? { snapshot: extraction!.snapshot } : {}),
  };
}
