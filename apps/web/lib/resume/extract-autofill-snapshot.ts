import { createHash } from 'node:crypto';

import { GoogleGenAI } from '@google/genai';

import {
  AUTOFILL_CONTRACT_LIMITS,
  ResumeAutofillSnapshotV1Schema,
  type ResumeAutofillSnapshotV1,
  type ResumeDateValue,
} from './autofill-schema';
import { latexToPlainText, splitResumeSections } from './latex-to-plain-text';

export const FINAL_LATEX_MAX_CHARS = 250_000;
const NORMALIZED_RESUME_MAX_CHARS = 50_000;

type StructuredSnapshotExtractor = (input: {
  plainText: string;
  sections: ReturnType<typeof splitResumeSections>;
}) => Promise<unknown>;

type ExtractAutofillSnapshotResult =
  | {
      ok: true;
      snapshot: ResumeAutofillSnapshotV1;
      generatedContentHash: string;
    }
  | {
      ok: false;
      reason:
        | 'empty_latex'
        | 'normalized_resume_too_large'
        | 'extraction_failed'
        | 'invalid_snapshot'
        | 'reconciliation_failed';
      generatedContentHash: string;
    };

const DATE_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    originalText: {
      type: 'string',
      maxLength: AUTOFILL_CONTRACT_LIMITS.shortText,
    },
    year: { type: 'integer', minimum: 1900, maximum: 2200 },
    month: { type: 'integer', minimum: 1, maximum: 12 },
    precision: { type: 'string', enum: ['month', 'year', 'text'] },
  },
  required: ['originalText', 'precision'],
} as const;

const RESUME_AUTOFILL_SNAPSHOT_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    contact: {
      type: 'object',
      additionalProperties: false,
      properties: {
        firstName: {
          type: 'string',
          maxLength: AUTOFILL_CONTRACT_LIMITS.shortText,
        },
        lastName: {
          type: 'string',
          maxLength: AUTOFILL_CONTRACT_LIMITS.shortText,
        },
        fullName: {
          type: 'string',
          maxLength: AUTOFILL_CONTRACT_LIMITS.shortText,
        },
        email: {
          type: 'string',
          maxLength: AUTOFILL_CONTRACT_LIMITS.shortText,
        },
        phone: {
          type: 'string',
          maxLength: AUTOFILL_CONTRACT_LIMITS.shortText,
        },
        city: { type: 'string', maxLength: AUTOFILL_CONTRACT_LIMITS.shortText },
        state: {
          type: 'string',
          maxLength: AUTOFILL_CONTRACT_LIMITS.shortText,
        },
        country: {
          type: 'string',
          maxLength: AUTOFILL_CONTRACT_LIMITS.shortText,
        },
        linkedinUrl: {
          type: 'string',
          maxLength: AUTOFILL_CONTRACT_LIMITS.url,
        },
        portfolioUrl: {
          type: 'string',
          maxLength: AUTOFILL_CONTRACT_LIMITS.url,
        },
      },
    },
    summary: { type: 'string', maxLength: AUTOFILL_CONTRACT_LIMITS.summary },
    totalYearsExperience: { type: 'number', minimum: 0, maximum: 100 },
    skills: {
      type: 'array',
      maxItems: AUTOFILL_CONTRACT_LIMITS.skills,
      items: { type: 'string', maxLength: AUTOFILL_CONTRACT_LIMITS.shortText },
    },
    experience: {
      type: 'array',
      maxItems: AUTOFILL_CONTRACT_LIMITS.experience,
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          company: {
            type: 'string',
            maxLength: AUTOFILL_CONTRACT_LIMITS.shortText,
          },
          title: {
            type: 'string',
            maxLength: AUTOFILL_CONTRACT_LIMITS.shortText,
          },
          location: {
            type: 'string',
            maxLength: AUTOFILL_CONTRACT_LIMITS.shortText,
          },
          startDate: DATE_JSON_SCHEMA,
          endDate: DATE_JSON_SCHEMA,
          isCurrent: { type: 'boolean' },
          bullets: {
            type: 'array',
            maxItems: AUTOFILL_CONTRACT_LIMITS.bulletsPerExperience,
            items: {
              type: 'string',
              maxLength: AUTOFILL_CONTRACT_LIMITS.bullet,
            },
          },
          descriptionText: {
            type: 'string',
            maxLength: AUTOFILL_CONTRACT_LIMITS.description,
          },
        },
        required: [
          'company',
          'title',
          'startDate',
          'isCurrent',
          'bullets',
          'descriptionText',
        ],
      },
    },
    education: {
      type: 'array',
      maxItems: AUTOFILL_CONTRACT_LIMITS.education,
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          school: {
            type: 'string',
            maxLength: AUTOFILL_CONTRACT_LIMITS.shortText,
          },
          degree: {
            type: 'string',
            maxLength: AUTOFILL_CONTRACT_LIMITS.shortText,
          },
          fieldOfStudy: {
            type: 'string',
            maxLength: AUTOFILL_CONTRACT_LIMITS.shortText,
          },
          location: {
            type: 'string',
            maxLength: AUTOFILL_CONTRACT_LIMITS.shortText,
          },
          startDate: DATE_JSON_SCHEMA,
          endDate: DATE_JSON_SCHEMA,
        },
        required: ['school'],
      },
    },
    certifications: {
      type: 'array',
      maxItems: AUTOFILL_CONTRACT_LIMITS.certifications,
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          name: {
            type: 'string',
            maxLength: AUTOFILL_CONTRACT_LIMITS.shortText,
          },
          issuer: {
            type: 'string',
            maxLength: AUTOFILL_CONTRACT_LIMITS.shortText,
          },
          issuedDate: DATE_JSON_SCHEMA,
        },
        required: ['name'],
      },
    },
  },
  required: ['contact', 'skills', 'experience', 'education', 'certifications'],
} as const;

function normalizeEvidence(value: string): string {
  return value
    .normalize('NFKC')
    .toLocaleLowerCase('en-US')
    .replace(/[‐‑‒–—]/g, '-')
    .replace(/[^\p{L}\p{N}@.+#&/_-]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function sourceContains(source: string, value: string): boolean {
  const normalizedValue = normalizeEvidence(value);
  if (!normalizedValue) return false;
  if (/^[\p{L}\p{N}]{1,3}$/u.test(normalizedValue)) {
    return source.split(' ').includes(normalizedValue);
  }
  return source.includes(normalizedValue);
}

function sourceContainsPhone(sourceText: string, value: string): boolean {
  const digits = value.replace(/\D/g, '');
  return digits.length >= 7 && sourceText.replace(/\D/g, '').includes(digits);
}

function sourceContainsUrl(sourceText: string, value: string): boolean {
  const simplify = (input: string) =>
    input
      .trim()
      .toLocaleLowerCase('en-US')
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/$/, '');
  return simplify(sourceText).includes(simplify(value));
}

function sourceContainsDate(source: string, date: ResumeDateValue): boolean {
  if (sourceContains(source, date.originalText)) return true;
  if (date.year === undefined) return false;

  const year = String(date.year);
  if (date.precision === 'year') return sourceContains(source, year);
  if (date.month === undefined) return false;

  const monthNames = [
    ['jan', 'january'],
    ['feb', 'february'],
    ['mar', 'march'],
    ['apr', 'april'],
    ['may', 'may'],
    ['jun', 'june'],
    ['jul', 'july'],
    ['aug', 'august'],
    ['sep', 'september'],
    ['oct', 'october'],
    ['nov', 'november'],
    ['dec', 'december'],
  ][date.month - 1];
  return Boolean(
    monthNames?.some((month) => source.includes(`${month} ${year}`)) ||
      source.includes(`${date.month}/${year}`) ||
      source.includes(`${date.month}-${year}`)
  );
}

function reconcileContact(
  contact: ResumeAutofillSnapshotV1['contact'],
  sourceResumeText: string,
  normalizedSource: string
): ResumeAutofillSnapshotV1['contact'] {
  const entries = Object.entries(contact).filter(([key, value]) => {
    if (!value) return false;
    if (key === 'phone') return sourceContainsPhone(sourceResumeText, value);
    if (key === 'linkedinUrl' || key === 'portfolioUrl') {
      return sourceContainsUrl(sourceResumeText, value);
    }
    return sourceContains(normalizedSource, value);
  });
  return Object.fromEntries(entries) as ResumeAutofillSnapshotV1['contact'];
}

function reconcileSnapshotWithSourceResume(
  snapshot: ResumeAutofillSnapshotV1,
  sourceResumeText: string
): ResumeAutofillSnapshotV1 {
  const normalizedSource = normalizeEvidence(sourceResumeText);
  const hasCurrentMarker = /\b(?:present|current|now)\b/.test(normalizedSource);

  return {
    ...snapshot,
    contact: reconcileContact(
      snapshot.contact,
      sourceResumeText,
      normalizedSource
    ),
    experience: snapshot.experience.filter((record) => {
      if (!sourceContains(normalizedSource, record.company)) return false;
      if (!sourceContains(normalizedSource, record.title)) return false;
      if (!sourceContainsDate(normalizedSource, record.startDate)) return false;
      if (
        record.endDate &&
        !sourceContainsDate(normalizedSource, record.endDate)
      )
        return false;
      if (record.isCurrent && !hasCurrentMarker) return false;
      return true;
    }),
    education: snapshot.education
      .filter((record) => sourceContains(normalizedSource, record.school))
      .map((record) => ({
        ...record,
        ...(record.degree && !sourceContains(normalizedSource, record.degree)
          ? { degree: undefined }
          : {}),
      })),
  };
}

export function hashFinalLatex(finalLatex: string): string {
  return createHash('sha256').update(finalLatex, 'utf8').digest('hex');
}

async function extractStructuredSnapshotWithGemini(input: {
  plainText: string;
}): Promise<unknown> {
  if (!process.env.GEMINI_API_KEY) throw new Error('AI extractor unavailable');

  const prompt = `Extract a resume autofill snapshot from the resume text below.

Rules:
- Return only facts explicitly present in the text. Never infer or invent.
- Preserve company names, official titles, schools, degrees, and date text exactly.
- For dates, keep originalText. Add year/month only when explicit. Never invent a month.
- For current employment, set isCurrent=true and omit endDate.
- descriptionText must be the joined visible description for that role.
- Exclude visa, work authorization, sponsorship, demographic, disability, veteran, salary, and all other sensitive applicant data.
- Return valid JSON matching the supplied schema.

RESUME TEXT:
${input.plainText}`;

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const request = (model: string) =>
    ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseJsonSchema: RESUME_AUTOFILL_SNAPSHOT_JSON_SCHEMA,
        temperature: 0,
        maxOutputTokens: 8_192,
      },
    });

  let response;
  try {
    response = await request('gemini-3.5-flash');
  } catch {
    response = await request('gemini-3.1-flash-lite');
  }

  const text = response.text?.trim();
  if (!text) throw new Error('AI extractor returned no data');
  return JSON.parse(text);
}

export async function extractAutofillSnapshot(input: {
  finalLatex: string;
  sourceResumeText: string;
  extractStructuredSnapshot?: StructuredSnapshotExtractor;
}): Promise<ExtractAutofillSnapshotResult> {
  const generatedContentHash = hashFinalLatex(input.finalLatex);
  const plainText = latexToPlainText(input.finalLatex);
  if (!plainText) {
    return { ok: false, reason: 'empty_latex', generatedContentHash };
  }
  if (plainText.length > NORMALIZED_RESUME_MAX_CHARS) {
    return {
      ok: false,
      reason: 'normalized_resume_too_large',
      generatedContentHash,
    };
  }

  const extractor =
    input.extractStructuredSnapshot ?? extractStructuredSnapshotWithGemini;
  let rawSnapshot: unknown;
  try {
    rawSnapshot = await extractor({
      plainText,
      sections: splitResumeSections(plainText),
    });
  } catch {
    return { ok: false, reason: 'extraction_failed', generatedContentHash };
  }

  const validated = ResumeAutofillSnapshotV1Schema.safeParse(rawSnapshot);
  if (!validated.success) {
    return { ok: false, reason: 'invalid_snapshot', generatedContentHash };
  }

  const reconciled = reconcileSnapshotWithSourceResume(
    validated.data,
    input.sourceResumeText
  );
  const finalValidation = ResumeAutofillSnapshotV1Schema.safeParse(reconciled);
  if (!finalValidation.success) {
    return { ok: false, reason: 'reconciliation_failed', generatedContentHash };
  }

  return {
    ok: true,
    snapshot: finalValidation.data,
    generatedContentHash,
  };
}
