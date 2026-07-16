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
      snapshot: ResumeAutofillSnapshotV1;
      resume: GeneratedResumeAttachment;
      coverLetter?: GeneratedCoverLetterAttachment;
      profileFallback: BasicContactProfile;
    }
  | {
      ok: true;
      source: 'profile_only';
      reason: 'missing' | 'expired' | 'job_changed' | 'invalid';
      profileFallback: BasicContactProfile;
    }
  | { ok: false; error: 'not_signed_in' | 'unavailable' };

export interface JobContextIdentity {
  jobUrl: string;
  companyName: string;
  roleTitle: string;
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

export function artifactMatchesJobContext(
  artifact: GeneratedResumeArtifactV1,
  context: JobContextIdentity
): boolean {
  return (
    normalizeJobUrl(artifact.job.sourceUrl) ===
      normalizeJobUrl(context.jobUrl) &&
    normalizeJobIdentityText(artifact.job.companyName) ===
      normalizeJobIdentityText(context.companyName) &&
    normalizeJobIdentityText(artifact.job.roleTitle) ===
      normalizeJobIdentityText(context.roleTitle)
  );
}
