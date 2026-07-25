import type {
  GeneratedCoverLetterAttachment,
  ResumeAutofillSnapshotV1,
  ResumeDateValue,
} from './resume-autofill-contract';

const LIMITS = {
  identifier: 200,
  filename: 255,
  shortText: 500,
  url: 2_048,
  summary: 8_000,
  description: 12_000,
  bullet: 2_000,
  skills: 200,
  experience: 30,
  education: 20,
  certifications: 40,
  bulletsPerExperience: 30,
  pdfBase64: 16 * 1024 * 1024,
} as const;

const SHA256_RE = /^[a-f0-9]{64}$/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(
  value: Record<string, unknown>,
  allowed: readonly string[]
): boolean {
  const allowedKeys = new Set(allowed);
  return Object.keys(value).every((key) => allowedKeys.has(key));
}

function requiredString(value: unknown, max: number): value is string {
  return (
    typeof value === 'string' && value.trim().length > 0 && value.length <= max
  );
}

function optionalString(value: unknown, max: number): boolean {
  return value === undefined || requiredString(value, max);
}

function validUrl(value: unknown): boolean {
  if (!requiredString(value, LIMITS.url)) return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function validDate(value: unknown): value is ResumeDateValue {
  if (!isRecord(value)) return false;
  if (!hasOnlyKeys(value, ['originalText', 'year', 'month', 'precision']))
    return false;
  if (!requiredString(value.originalText, LIMITS.shortText)) return false;
  if (!['month', 'year', 'text'].includes(String(value.precision)))
    return false;
  if (
    value.year !== undefined &&
    (!Number.isInteger(value.year) ||
      Number(value.year) < 1900 ||
      Number(value.year) > 2200)
  )
    return false;
  if (
    value.month !== undefined &&
    (!Number.isInteger(value.month) ||
      Number(value.month) < 1 ||
      Number(value.month) > 12)
  )
    return false;
  if (
    value.precision === 'month' &&
    (value.year === undefined || value.month === undefined)
  ) {
    return false;
  }
  if (value.precision === 'year' && value.year === undefined) return false;
  return true;
}

function validContact(value: unknown): boolean {
  if (!isRecord(value)) return false;
  const keys = [
    'firstName',
    'lastName',
    'fullName',
    'email',
    'phone',
    'city',
    'state',
    'country',
    'linkedinUrl',
    'portfolioUrl',
  ] as const;
  if (!hasOnlyKeys(value, keys)) return false;
  for (const key of keys) {
    if (
      !optionalString(
        value[key],
        key.endsWith('Url') ? LIMITS.url : LIMITS.shortText
      )
    ) {
      return false;
    }
  }
  if (value.email !== undefined && !/^\S+@\S+\.\S+$/.test(String(value.email)))
    return false;
  if (value.linkedinUrl !== undefined && !validUrl(value.linkedinUrl))
    return false;
  if (value.portfolioUrl !== undefined && !validUrl(value.portfolioUrl))
    return false;
  return true;
}

export function validateResumeAutofillSnapshotV1(
  value: unknown
): value is ResumeAutofillSnapshotV1 {
  if (!isRecord(value)) return false;
  if (
    !hasOnlyKeys(value, [
      'contact',
      'summary',
      'totalYearsExperience',
      'skills',
      'experience',
      'education',
      'certifications',
    ])
  )
    return false;
  if (!validContact(value.contact)) return false;
  if (value.summary !== undefined && typeof value.summary !== 'string')
    return false;
  if (
    typeof value.summary === 'string' &&
    value.summary.length > LIMITS.summary
  )
    return false;
  if (
    value.totalYearsExperience !== undefined &&
    (typeof value.totalYearsExperience !== 'number' ||
      !Number.isFinite(value.totalYearsExperience) ||
      value.totalYearsExperience < 0 ||
      value.totalYearsExperience > 100)
  )
    return false;

  if (!Array.isArray(value.skills) || value.skills.length > LIMITS.skills)
    return false;
  if (!value.skills.every((skill) => requiredString(skill, LIMITS.shortText)))
    return false;

  if (
    !Array.isArray(value.experience) ||
    value.experience.length > LIMITS.experience
  ) {
    return false;
  }
  for (const item of value.experience) {
    if (!isRecord(item)) return false;
    if (
      !hasOnlyKeys(item, [
        'company',
        'title',
        'location',
        'startDate',
        'endDate',
        'isCurrent',
        'bullets',
        'descriptionText',
      ])
    )
      return false;
    if (!requiredString(item.company, LIMITS.shortText)) return false;
    if (!requiredString(item.title, LIMITS.shortText)) return false;
    if (!optionalString(item.location, LIMITS.shortText)) return false;
    if (!validDate(item.startDate)) return false;
    if (item.endDate !== undefined && !validDate(item.endDate)) return false;
    if (typeof item.isCurrent !== 'boolean') return false;
    if (
      !Array.isArray(item.bullets) ||
      item.bullets.length > LIMITS.bulletsPerExperience
    ) {
      return false;
    }
    if (!item.bullets.every((bullet) => requiredString(bullet, LIMITS.bullet)))
      return false;
    if (
      typeof item.descriptionText !== 'string' ||
      item.descriptionText.length > LIMITS.description
    ) {
      return false;
    }
  }

  if (
    !Array.isArray(value.education) ||
    value.education.length > LIMITS.education
  ) {
    return false;
  }
  for (const item of value.education) {
    if (!isRecord(item)) return false;
    if (
      !hasOnlyKeys(item, [
        'school',
        'degree',
        'fieldOfStudy',
        'location',
        'startDate',
        'endDate',
      ])
    )
      return false;
    if (!requiredString(item.school, LIMITS.shortText)) return false;
    if (!optionalString(item.degree, LIMITS.shortText)) return false;
    if (!optionalString(item.fieldOfStudy, LIMITS.shortText)) return false;
    if (!optionalString(item.location, LIMITS.shortText)) return false;
    if (item.startDate !== undefined && !validDate(item.startDate))
      return false;
    if (item.endDate !== undefined && !validDate(item.endDate)) return false;
  }

  if (
    !Array.isArray(value.certifications) ||
    value.certifications.length > LIMITS.certifications
  )
    return false;
  for (const item of value.certifications) {
    if (!isRecord(item)) return false;
    if (!hasOnlyKeys(item, ['name', 'issuer', 'issuedDate'])) return false;
    if (!requiredString(item.name, LIMITS.shortText)) return false;
    if (!optionalString(item.issuer, LIMITS.shortText)) return false;
    if (item.issuedDate !== undefined && !validDate(item.issuedDate))
      return false;
  }
  return true;
}

export function validateGeneratedCoverLetterAttachment(
  value: unknown,
  expectedSourceContentHash: string
): value is GeneratedCoverLetterAttachment {
  if (!isRecord(value)) return false;
  if (
    !hasOnlyKeys(value, [
      'filename',
      'base64',
      'sha256',
      'generatedAt',
      'sourceContentHash',
    ])
  )
    return false;
  if (!requiredString(value.filename, LIMITS.filename)) return false;
  if (!validCanonicalBase64(value.base64)) return false;
  if (typeof value.sha256 !== 'string' || !SHA256_RE.test(value.sha256))
    return false;
  if (
    typeof value.generatedAt !== 'string' ||
    !Number.isFinite(Date.parse(value.generatedAt))
  )
    return false;
  return (
    SHA256_RE.test(expectedSourceContentHash) &&
    value.sourceContentHash === expectedSourceContentHash
  );
}

function validCanonicalBase64(value: unknown): value is string {
  if (
    typeof value !== 'string' ||
    value.length < 4 ||
    value.length > LIMITS.pdfBase64
  ) {
    return false;
  }
  if (value.length % 4 !== 0) return false;
  const paddingStart = value.indexOf('=');
  const contentEnd = paddingStart === -1 ? value.length : paddingStart;
  if (value.length - contentEnd > 2) return false;
  for (let index = 0; index < contentEnd; index += 1) {
    const code = value.charCodeAt(index);
    const allowed =
      (code >= 48 && code <= 57) ||
      (code >= 65 && code <= 90) ||
      (code >= 97 && code <= 122) ||
      code === 43 ||
      code === 47;
    if (!allowed) return false;
  }
  for (let index = contentEnd; index < value.length; index += 1) {
    if (value[index] !== '=') return false;
  }
  return true;
}

function decodeBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const copy = new Uint8Array(bytes.length);
  copy.set(bytes);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', copy.buffer);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0')
  ).join('');
}

export async function validateGeneratedResumeArtifactV1(
  value: unknown,
  options: { validateCoverLetter?: boolean } = {}
): Promise<boolean> {
  if (!isRecord(value)) return false;
  if (
    !hasOnlyKeys(value, [
      'schemaVersion',
      'artifactId',
      'sourceResumeId',
      'sourceResumeFilename',
      'templateId',
      'job',
      'generatedAt',
      'expiresAt',
      'generatedContentHash',
      'pdf',
      'snapshot',
      'coverLetter',
    ])
  )
    return false;
  if (value.schemaVersion !== 1) return false;
  if (!requiredString(value.artifactId, LIMITS.identifier)) return false;
  if (!requiredString(value.sourceResumeId, LIMITS.identifier)) return false;
  if (!requiredString(value.sourceResumeFilename, LIMITS.filename))
    return false;
  if (!requiredString(value.templateId, LIMITS.identifier)) return false;
  if (!isRecord(value.job)) return false;
  if (
    !hasOnlyKeys(value.job, [
      'jobKey',
      'companyName',
      'roleTitle',
      'sourceUrl',
      'requisitionId',
    ])
  )
    return false;
  if (!requiredString(value.job.jobKey, LIMITS.identifier)) return false;
  if (!requiredString(value.job.companyName, LIMITS.shortText)) return false;
  if (!requiredString(value.job.roleTitle, LIMITS.shortText)) return false;
  if (!validUrl(value.job.sourceUrl)) return false;
  if (!optionalString(value.job.requisitionId, LIMITS.identifier)) return false;
  if (
    typeof value.generatedAt !== 'string' ||
    typeof value.expiresAt !== 'string' ||
    !Number.isFinite(Date.parse(value.generatedAt)) ||
    !Number.isFinite(Date.parse(value.expiresAt))
  )
    return false;
  if (
    typeof value.generatedContentHash !== 'string' ||
    !SHA256_RE.test(value.generatedContentHash)
  ) {
    return false;
  }
  if (!isRecord(value.pdf)) return false;
  if (!hasOnlyKeys(value.pdf, ['filename', 'base64', 'sha256'])) return false;
  if (!requiredString(value.pdf.filename, LIMITS.filename)) return false;
  if (!validCanonicalBase64(value.pdf.base64)) return false;
  if (typeof value.pdf.sha256 !== 'string' || !SHA256_RE.test(value.pdf.sha256))
    return false;
  if (!validateResumeAutofillSnapshotV1(value.snapshot)) return false;

  if (
    options.validateCoverLetter !== false &&
    value.coverLetter !== undefined
  ) {
    if (
      !validateGeneratedCoverLetterAttachment(
        value.coverLetter,
        value.generatedContentHash
      )
    )
      return false;
  }

  try {
    return (
      (await sha256Hex(decodeBase64(value.pdf.base64))) === value.pdf.sha256
    );
  } catch {
    return false;
  }
}
