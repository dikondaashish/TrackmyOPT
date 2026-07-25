import { z } from 'zod';

export const AUTOFILL_CONTRACT_LIMITS = {
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

const requiredShortText = z
  .string()
  .trim()
  .min(1)
  .max(AUTOFILL_CONTRACT_LIMITS.shortText);
const optionalShortText = requiredShortText.optional();
const identifier = z
  .string()
  .trim()
  .min(1)
  .max(AUTOFILL_CONTRACT_LIMITS.identifier);
const filename = z
  .string()
  .trim()
  .min(1)
  .max(AUTOFILL_CONTRACT_LIMITS.filename);
const url = z.string().trim().url().max(AUTOFILL_CONTRACT_LIMITS.url);
const sha256 = z
  .string()
  .regex(/^[a-f0-9]{64}$/i, 'Expected a SHA-256 hex digest');
const isoDateTime = z.string().datetime({ offset: true });
const base64Payload = z
  .string()
  .min(4)
  .max(AUTOFILL_CONTRACT_LIMITS.pdfBase64)
  .superRefine((value, context) => {
    if (value.length > AUTOFILL_CONTRACT_LIMITS.pdfBase64) return;
    if (value.length % 4 !== 0 || !/^[A-Za-z0-9+/]*={0,2}$/.test(value)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Expected canonical base64',
      });
    }
  });

export const ResumeDateValueSchema = z
  .object({
    originalText: requiredShortText,
    year: z.number().int().min(1900).max(2200).optional(),
    month: z.number().int().min(1).max(12).optional(),
    precision: z.enum(['month', 'year', 'text']),
  })
  .strict()
  .superRefine((value, context) => {
    if (
      value.precision === 'month' &&
      (value.year === undefined || value.month === undefined)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Month precision requires both year and month',
      });
    }
    if (value.precision === 'year' && value.year === undefined) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Year precision requires a year',
      });
    }
  });

const ContactSchema = z
  .object({
    firstName: optionalShortText,
    lastName: optionalShortText,
    fullName: optionalShortText,
    email: z
      .string()
      .trim()
      .email()
      .max(AUTOFILL_CONTRACT_LIMITS.shortText)
      .optional(),
    phone: optionalShortText,
    city: optionalShortText,
    state: optionalShortText,
    country: optionalShortText,
    linkedinUrl: url.optional(),
    portfolioUrl: url.optional(),
  })
  .strict();

const ExperienceSchema = z
  .object({
    company: requiredShortText,
    title: requiredShortText,
    location: optionalShortText,
    startDate: ResumeDateValueSchema,
    endDate: ResumeDateValueSchema.optional(),
    isCurrent: z.boolean(),
    bullets: z
      .array(z.string().trim().min(1).max(AUTOFILL_CONTRACT_LIMITS.bullet))
      .max(AUTOFILL_CONTRACT_LIMITS.bulletsPerExperience),
    descriptionText: z
      .string()
      .trim()
      .max(AUTOFILL_CONTRACT_LIMITS.description),
  })
  .strict();

const EducationSchema = z
  .object({
    school: requiredShortText,
    degree: optionalShortText,
    fieldOfStudy: optionalShortText,
    location: optionalShortText,
    startDate: ResumeDateValueSchema.optional(),
    endDate: ResumeDateValueSchema.optional(),
  })
  .strict();

const CertificationSchema = z
  .object({
    name: requiredShortText,
    issuer: optionalShortText,
    issuedDate: ResumeDateValueSchema.optional(),
  })
  .strict();

export const ResumeAutofillSnapshotV1Schema = z
  .object({
    contact: ContactSchema,
    summary: z.string().trim().max(AUTOFILL_CONTRACT_LIMITS.summary).optional(),
    totalYearsExperience: z.number().finite().min(0).max(100).optional(),
    skills: z.array(requiredShortText).max(AUTOFILL_CONTRACT_LIMITS.skills),
    experience: z
      .array(ExperienceSchema)
      .max(AUTOFILL_CONTRACT_LIMITS.experience),
    education: z.array(EducationSchema).max(AUTOFILL_CONTRACT_LIMITS.education),
    certifications: z
      .array(CertificationSchema)
      .max(AUTOFILL_CONTRACT_LIMITS.certifications),
  })
  .strict();

const CoverLetterSchema = z
  .object({
    filename,
    base64: base64Payload,
    sha256,
    generatedAt: isoDateTime,
    sourceContentHash: sha256,
  })
  .strict();

export const GeneratedResumeArtifactV1Schema = z
  .object({
    schemaVersion: z.literal(1),
    artifactId: identifier,
    sourceResumeId: identifier,
    sourceResumeFilename: filename,
    templateId: identifier,
    job: z
      .object({
        jobKey: identifier,
        companyName: requiredShortText,
        roleTitle: requiredShortText,
        jobDescription: z
          .string()
          .trim()
          .min(1)
          .max(AUTOFILL_CONTRACT_LIMITS.description)
          .optional(),
        sourceUrl: url,
        requisitionId: identifier.optional(),
      })
      .strict(),
    generatedAt: isoDateTime,
    expiresAt: isoDateTime,
    generatedContentHash: sha256,
    pdf: z
      .object({
        filename,
        base64: base64Payload,
        sha256,
      })
      .strict(),
    snapshot: ResumeAutofillSnapshotV1Schema,
    coverLetter: CoverLetterSchema.optional(),
  })
  .strict()
  .superRefine((artifact, context) => {
    const generatedAt = Date.parse(artifact.generatedAt);
    const expiresAt = Date.parse(artifact.expiresAt);
    if (expiresAt <= generatedAt) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['expiresAt'],
        message: 'expiresAt must be later than generatedAt',
      });
    }
    if (
      artifact.coverLetter &&
      artifact.coverLetter.sourceContentHash !== artifact.generatedContentHash
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['coverLetter', 'sourceContentHash'],
        message:
          'Cover letter source hash must match generated resume content hash',
      });
    }
  });

export type ResumeDateValue = z.infer<typeof ResumeDateValueSchema>;
export type ResumeAutofillSnapshotV1 = z.infer<
  typeof ResumeAutofillSnapshotV1Schema
>;
export type GeneratedResumeArtifactV1 = z.infer<
  typeof GeneratedResumeArtifactV1Schema
>;

export const GenerateCoverLetterRequestSchema = z.object({
  snapshot: ResumeAutofillSnapshotV1Schema,
  sourceContentHash: sha256,
  isRegeneration: z.boolean().optional(),
  job: z.object({
    companyName: requiredShortText,
    roleTitle: requiredShortText,
    jobDescription: z.string().trim().min(1).max(AUTOFILL_CONTRACT_LIMITS.description),
  }).strict(),
}).strict();
export type GenerateCoverLetterRequest = z.infer<typeof GenerateCoverLetterRequestSchema>;

export const GeneratedCoverLetterAttachmentSchema = z.object({
  filename,
  base64: base64Payload,
  sha256,
  generatedAt: isoDateTime,
  sourceContentHash: sha256,
}).strict();
export type GeneratedCoverLetterAttachment = z.infer<typeof GeneratedCoverLetterAttachmentSchema>;
