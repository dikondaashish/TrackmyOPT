import {
  artifactMatchesJobContext,
  extractWorkdayJobIdentity,
  normalizeJobUrl,
  type GeneratedResumeArtifactV1,
  type JobContextIdentity,
  type ResumeAutofillSnapshotV1,
} from './resume-autofill-contract';

export const RESUME_ARTIFACT_TTL_MS = 30 * 60 * 1_000;
export const RESUME_ARTIFACT_JOB_DESCRIPTION_MAX_CHARS = 12_000;
const ARTIFACT_IDENTIFIER_MAX_LENGTH = 200;

export type ArtifactInvalidReason =
  | 'missing'
  | 'expired'
  | 'job_changed'
  | 'invalid';

export type ArtifactValidation =
  | { valid: true }
  | { valid: false; reason: Exclude<ArtifactInvalidReason, 'missing'> };

export type ArtifactLifecycleResolution =
  | {
      status: 'valid';
      artifact: GeneratedResumeArtifactV1;
      showStaleWarning: false;
      clearExistingFields: false;
      refillExistingFields: false;
    }
  | {
      status: 'invalid';
      reason: ArtifactInvalidReason;
      showStaleWarning: boolean;
      clearExistingFields: false;
      refillExistingFields: false;
    };

const emptySnapshot = (): ResumeAutofillSnapshotV1 => ({
  contact: {},
  skills: [],
  experience: [],
  education: [],
  certifications: [],
});

function normalizeDisplayText(value: string): string {
  return value.normalize('NFKC').trim().replace(/\s+/g, ' ');
}

function normalizeJobDescription(value: string | undefined): string | undefined {
  const normalized = value
    ?.normalize('NFKC')
    .replace(/\r\n?/g, '\n')
    .trim()
    .slice(0, RESUME_ARTIFACT_JOB_DESCRIPTION_MAX_CHARS);
  return normalized || undefined;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(
    ''
  );
}

async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', copy.buffer);
  return bytesToHex(new Uint8Array(digest));
}

function decodeBase64(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

export async function buildGeneratedResumeArtifactV1(input: {
  artifactId?: string;
  generatedAt?: string;
  sourceResumeId: string;
  sourceResumeFilename: string;
  templateId: string;
  jobKey: string;
  jobContext: JobContextIdentity;
  jobDescription?: string;
  finalLatex: string;
  extractedContentHash?: string;
  extractedSnapshot?: ResumeAutofillSnapshotV1;
  pdfBase64: string;
  pdfFilename: string;
}): Promise<{
  artifact: GeneratedResumeArtifactV1;
  structuredFieldsAvailable: boolean;
}> {
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const generatedAtMs = Date.parse(generatedAt);
  if (!Number.isFinite(generatedAtMs))
    throw new Error('Invalid artifact generation time');

  const generatedContentHash = await sha256Hex(
    new TextEncoder().encode(input.finalLatex)
  );
  const pdfHash = await sha256Hex(decodeBase64(input.pdfBase64));
  const normalizedJobKey = normalizeDisplayText(input.jobKey);
  const artifactJobKey =
    normalizedJobKey.length <= ARTIFACT_IDENTIFIER_MAX_LENGTH
      ? normalizedJobKey
      : `sha256:${await sha256Hex(new TextEncoder().encode(normalizedJobKey))}`;
  const structuredFieldsAvailable = Boolean(
    input.extractedSnapshot &&
      input.extractedContentHash === generatedContentHash
  );
  const jobDescription = normalizeJobDescription(input.jobDescription);

  return {
    structuredFieldsAvailable,
    artifact: {
      schemaVersion: 1,
      artifactId: input.artifactId ?? globalThis.crypto.randomUUID(),
      sourceResumeId: input.sourceResumeId,
      sourceResumeFilename: input.sourceResumeFilename,
      templateId: input.templateId,
      job: {
        jobKey: artifactJobKey,
        companyName: normalizeDisplayText(input.jobContext.companyName),
        roleTitle: normalizeDisplayText(input.jobContext.roleTitle),
        ...(jobDescription ? { jobDescription } : {}),
        sourceUrl: normalizeJobUrl(input.jobContext.jobUrl),
        requisitionId: extractWorkdayJobIdentity(input.jobContext.jobUrl)
          ?.requisitionId,
      },
      generatedAt: new Date(generatedAtMs).toISOString(),
      expiresAt: new Date(generatedAtMs + RESUME_ARTIFACT_TTL_MS).toISOString(),
      generatedContentHash,
      pdf: {
        filename: input.pdfFilename,
        base64: input.pdfBase64,
        sha256: pdfHash,
      },
      snapshot: structuredFieldsAvailable
        ? input.extractedSnapshot!
        : emptySnapshot(),
    },
  };
}

export function validateArtifactForPrefill(
  artifact: GeneratedResumeArtifactV1,
  jobContext: JobContextIdentity,
  now: number = Date.now()
): ArtifactValidation {
  const generatedAt = Date.parse(artifact.generatedAt);
  const expiresAt = Date.parse(artifact.expiresAt);
  if (!Number.isFinite(generatedAt) || !Number.isFinite(expiresAt)) {
    return { valid: false, reason: 'invalid' };
  }
  if (expiresAt - generatedAt !== RESUME_ARTIFACT_TTL_MS || now < generatedAt) {
    return { valid: false, reason: 'invalid' };
  }
  if (!artifactMatchesJobContext(artifact, jobContext)) {
    return { valid: false, reason: 'job_changed' };
  }
  if (now >= expiresAt || now - generatedAt >= RESUME_ARTIFACT_TTL_MS) {
    return { valid: false, reason: 'expired' };
  }
  return { valid: true };
}

export function resolveArtifactLifecycle(input: {
  artifact: GeneratedResumeArtifactV1 | null;
  jobContext: JobContextIdentity;
  now?: number;
  previouslyFilledFromArtifact: boolean;
}): ArtifactLifecycleResolution {
  if (!input.artifact) {
    return {
      status: 'invalid',
      reason: 'missing',
      showStaleWarning: false,
      clearExistingFields: false,
      refillExistingFields: false,
    };
  }

  const validation = validateArtifactForPrefill(
    input.artifact,
    input.jobContext,
    input.now
  );
  if (validation.valid) {
    return {
      status: 'valid',
      artifact: input.artifact,
      showStaleWarning: false,
      clearExistingFields: false,
      refillExistingFields: false,
    };
  }

  return {
    status: 'invalid',
    reason: validation.reason,
    showStaleWarning: input.previouslyFilledFromArtifact,
    clearExistingFields: false,
    refillExistingFields: false,
  };
}
