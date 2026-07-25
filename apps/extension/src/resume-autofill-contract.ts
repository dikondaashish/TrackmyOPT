export interface ResumeDateValue {
  originalText: string;
  year?: number;
  month?: number;
  precision: 'month' | 'year' | 'text';
}

export interface ResumeAutofillSnapshotV1 {
  contact: {
    firstName?: string;
    lastName?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    city?: string;
    state?: string;
    country?: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
  };
  summary?: string;
  totalYearsExperience?: number;
  skills: string[];
  experience: Array<{
    company: string;
    title: string;
    location?: string;
    startDate: ResumeDateValue;
    endDate?: ResumeDateValue;
    isCurrent: boolean;
    bullets: string[];
    descriptionText: string;
  }>;
  education: Array<{
    school: string;
    degree?: string;
    fieldOfStudy?: string;
    location?: string;
    startDate?: ResumeDateValue;
    endDate?: ResumeDateValue;
  }>;
  certifications: Array<{
    name: string;
    issuer?: string;
    issuedDate?: ResumeDateValue;
  }>;
}

export interface GeneratedResumeArtifactV1 {
  schemaVersion: 1;
  artifactId: string;
  sourceResumeId: string;
  sourceResumeFilename: string;
  templateId: string;
  job: {
    jobKey: string;
    companyName: string;
    roleTitle: string;
    jobDescription?: string;
    sourceUrl: string;
    requisitionId?: string;
  };
  generatedAt: string;
  expiresAt: string;
  generatedContentHash: string;
  pdf: {
    filename: string;
    base64: string;
    sha256: string;
  };
  snapshot: ResumeAutofillSnapshotV1;
  coverLetter?: {
    filename: string;
    base64: string;
    sha256: string;
    generatedAt: string;
    sourceContentHash: string;
  };
}

export interface GeneratedResumeAttachment {
  pdfBase64: string;
  filename: string;
}

export interface GeneratedCoverLetterAttachment {
  filename: string;
  base64: string;
  sha256: string;
  generatedAt: string;
  sourceContentHash: string;
}
export interface GenerateCoverLetterRequest {
  snapshot: ResumeAutofillSnapshotV1;
  sourceContentHash: string;
  isRegeneration?: boolean;
  job: { companyName: string; roleTitle: string; jobDescription: string };
}

export interface BasicContactProfile {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  yearsExperience: string;
  linkedinUrl: string;
  portfolioUrl: string;
}

export type V1PrefillPayloadRequest = {
  now: string;
  jobContext: {
    jobUrl: string;
    companyName: string;
    roleTitle: string;
  };
};

export type V1PrefillPayloadResponse =
  | {
      ok: true;
      source: 'generated_resume';
      artifactId: string;
      artifactLabel: string;
      generatedContentHash: string;
      jobDescription?: string;
      snapshot: ResumeAutofillSnapshotV1;
      resume: GeneratedResumeAttachment;
      coverLetter?: GeneratedCoverLetterAttachment;
      profileFallback: BasicContactProfile;
    }
  | {
      ok: true;
      source: 'profile_only';
      reason:
        | 'missing'
        | 'expired'
        | 'job_changed'
        | 'invalid'
        | 'feature_disabled';
      profileFallback: BasicContactProfile;
    }
  | { ok: false; error: 'not_signed_in' | 'unavailable' };

export interface JobContextIdentity {
  jobUrl: string;
  companyName: string;
  roleTitle: string;
}

export interface WorkdayJobIdentity {
  requisitionId: string;
  jobSlug: string;
  slugRequisitionId: string;
  queryRequisitionId?: string;
}

const TRACKING_PARAMETER_RE =
  /^(?:utm_.+|gclid|fbclid|msclkid|ref|referrer|source|trk)$/i;

export function normalizeJobUrl(value: string): string {
  try {
    const url = new URL(value);
    url.hash = '';
    for (const key of Array.from(url.searchParams.keys())) {
      if (TRACKING_PARAMETER_RE.test(key)) url.searchParams.delete(key);
    }
    url.pathname =
      url.pathname.length > 1 ? url.pathname.replace(/\/+$/, '') : url.pathname;
    url.searchParams.sort();
    return url.toString();
  } catch {
    return value.trim();
  }
}

export function normalizeJobIdentityText(value: string): string {
  return value
    .normalize('NFKC')
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('en-US');
}

const WORKDAY_HOST_RE = /(?:^|\.)(?:myworkdayjobs|myworkday)\.com$/i;

function normalizeRequisitionId(value: string): string {
  return value.normalize('NFKC').trim().toLocaleLowerCase('en-US');
}

/** Extract stable Workday identity without treating an apply-route suffix as a new job. */
export function extractWorkdayJobIdentity(
  value: string,
): WorkdayJobIdentity | undefined {
  try {
    const url = new URL(value);
    if (!WORKDAY_HOST_RE.test(url.hostname)) return undefined;

    const segments = url.pathname
      .split('/')
      .filter(Boolean)
      .map((segment) => {
        try {
          return decodeURIComponent(segment);
        } catch {
          return segment;
        }
      });
    const jobIndex = segments.findIndex(
      (segment) => segment.toLocaleLowerCase('en-US') === 'job',
    );
    if (jobIndex < 0) return undefined;
    const applyIndex = segments.findIndex(
      (segment, index) =>
        index > jobIndex && segment.toLocaleLowerCase('en-US') === 'apply',
    );
    const jobSegments = segments.slice(
      jobIndex + 1,
      applyIndex >= 0 ? applyIndex : undefined,
    );
    const jobSlug = jobSegments[jobSegments.length - 1]?.trim() || '';
    const slugRequisitionId = jobSlug.includes('_')
      ? jobSlug.slice(jobSlug.lastIndexOf('_') + 1).trim()
      : jobSlug;
    if (!jobSlug || !slugRequisitionId) return undefined;

    const queryRequisitionId = url.searchParams.get('jr_id')?.trim();
    return {
      requisitionId: queryRequisitionId || slugRequisitionId,
      jobSlug,
      slugRequisitionId,
      ...(queryRequisitionId ? { queryRequisitionId } : {}),
    };
  } catch {
    return undefined;
  }
}

export function jobUrlsReferToSameJob(
  artifactUrl: string,
  contextUrl: string,
  artifactRequisitionId?: string,
): boolean {
  const artifactIdentity = extractWorkdayJobIdentity(artifactUrl);
  const contextIdentity = extractWorkdayJobIdentity(contextUrl);
  if (artifactIdentity && contextIdentity) {
    try {
      if (new URL(artifactUrl).hostname !== new URL(contextUrl).hostname) {
        return false;
      }
    } catch {
      return false;
    }
    if (
      artifactIdentity.queryRequisitionId &&
      contextIdentity.queryRequisitionId
    ) {
      return normalizeRequisitionId(artifactIdentity.queryRequisitionId) ===
        normalizeRequisitionId(contextIdentity.queryRequisitionId);
    }
    const artifactIds = new Set(
      [
        artifactRequisitionId,
        artifactIdentity.requisitionId,
        artifactIdentity.slugRequisitionId,
      ]
        .filter((value): value is string => Boolean(value?.trim()))
        .map(normalizeRequisitionId),
    );
    const contextIds = [
      contextIdentity.requisitionId,
      contextIdentity.slugRequisitionId,
    ].map(normalizeRequisitionId);
    return contextIds.some((identifier) => artifactIds.has(identifier));
  }
  return normalizeJobUrl(artifactUrl) === normalizeJobUrl(contextUrl);
}

export function artifactMatchesJobContext(
  artifact: GeneratedResumeArtifactV1,
  context: JobContextIdentity
): boolean {
  return (
    jobUrlsReferToSameJob(
      artifact.job.sourceUrl,
      context.jobUrl,
      artifact.job.requisitionId,
    ) &&
    normalizeJobIdentityText(artifact.job.companyName) ===
      normalizeJobIdentityText(context.companyName) &&
    normalizeJobIdentityText(artifact.job.roleTitle) ===
      normalizeJobIdentityText(context.roleTitle)
  );
}
