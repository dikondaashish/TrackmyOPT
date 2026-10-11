import { createHash } from 'node:crypto';

import * as Sentry from '@sentry/nextjs';

import {
  AUTOFILL_CONTRACT_LIMITS,
  ResumeAutofillSnapshotV1Schema,
  type ResumeAutofillSnapshotV1,
  type ResumeDateValue,
} from './autofill-schema';
import { latexToPlainText, splitResumeSections } from './latex-to-plain-text';
import { generateAiContent } from '../ai/google-ai';

export const FINAL_LATEX_MAX_CHARS = 250_000;
const NORMALIZED_RESUME_MAX_CHARS = 50_000;

/**
 * The route answers HTTP 200 when extraction fails (the PDF still works), so
 * report the failure explicitly. Fixed messages only: never resume text, model
 * output, or exception messages, which can echo applicant data.
 */
function reportExtractionFailure(
  stage: 'extract' | 'validate' | 'title_recovery',
  error?: unknown
): void {
  Sentry.captureException(
    new Error(`Resume autofill snapshot ${stage} failed`),
    {
      tags: { feature: 'resume_autofill_snapshot', stage },
      extra: { errorName: error instanceof Error ? error.name : typeof error },
    }
  );
}

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
  const month = String(date.month);
  const paddedMonth = month.padStart(2, '0');
  return Boolean(
    monthNames?.some(
      (name) =>
        source.includes(`${name} ${year}`) ||
        source.includes(`${name}. ${year}`) ||
        (name === 'sep' && source.includes(`sept ${year}`))
    ) ||
      [month, paddedMonth].some(
        (value) =>
          source.includes(`${value}/${year}`) ||
          source.includes(`${value}-${year}`)
      ) ||
      source.includes(`${year}-${paddedMonth}`) ||
      source.includes(`${year}/${paddedMonth}`)
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

function sourceStatesYears(source: string, years: number): boolean {
  if (!Number.isFinite(years) || years < 0) return false;
  const value = String(years).replace(/\.0+$/, '').replace('.', '\\.');
  return new RegExp(`(?:^|[^\\d.])${value}\\s*\\+?\\s*(?:years?|yrs?)\\b`).test(source);
}

/**
 * A date the source resume cannot confirm stays visible as text but loses its
 * machine-readable month/year, so prefill never writes an unconfirmed date.
 */
function reconcileDate(
  source: string,
  date: ResumeDateValue
): ResumeDateValue {
  if (date.precision === 'text' || sourceContainsDate(source, date)) return date;
  return { originalText: date.originalText, precision: 'text' };
}

type ExperienceRecord = ResumeAutofillSnapshotV1['experience'][number];

interface ReconciledSnapshot {
  snapshot: ResumeAutofillSnapshotV1;
  /** Records whose tailored title is absent from the source resume. */
  unconfirmedTitles: Array<{ index: number; record: ExperienceRecord }>;
}

/**
 * Keep each fact only when the applicant's own source resume confirms it.
 * Company (and school) anchor a record: without them the whole record goes.
 * Every other unconfirmed field is dropped individually, so one misread date
 * no longer discards an otherwise verified job. Titles are special: a tailored
 * resume may present an aligned title, but an application must carry the
 * applicant's real one, so unconfirmed titles are resolved separately.
 */
function reconcileSnapshotWithSourceResume(
  snapshot: ResumeAutofillSnapshotV1,
  sourceResumeText: string
): ReconciledSnapshot {
  const normalizedSource = normalizeEvidence(sourceResumeText);
  const hasCurrentMarker = /\b(?:present|current|now)\b/.test(normalizedSource);
  const unconfirmedTitles: ReconciledSnapshot['unconfirmedTitles'] = [];
  const experience: ExperienceRecord[] = [];

  for (const record of snapshot.experience) {
    if (!sourceContains(normalizedSource, record.company)) continue;
    const isCurrent = record.isCurrent && hasCurrentMarker;
    const reconciled: ExperienceRecord = {
      ...record,
      location:
        record.location && sourceContains(normalizedSource, record.location)
          ? record.location
          : undefined,
      startDate: reconcileDate(normalizedSource, record.startDate),
      endDate:
        record.endDate && !isCurrent
          ? reconcileDate(normalizedSource, record.endDate)
          : undefined,
      isCurrent,
    };
    if (!sourceContains(normalizedSource, record.title)) {
      unconfirmedTitles.push({ index: experience.length, record: reconciled });
    }
    experience.push(reconciled);
  }

  return {
    unconfirmedTitles,
    snapshot: {
      ...snapshot,
      // Never a computed or estimated figure: only a total the applicant
      // wrote ("6 years", "6+ yrs") in their own resume.
      totalYearsExperience:
        snapshot.totalYearsExperience !== undefined &&
        sourceStatesYears(normalizedSource, snapshot.totalYearsExperience)
          ? snapshot.totalYearsExperience
          : undefined,
      // A tailored resume may surface job-description keywords; only skills
      // and certifications the applicant listed are application facts.
      skills: snapshot.skills.filter((skill) => sourceContains(normalizedSource, skill)),
      certifications: snapshot.certifications
        .filter((record) => sourceContains(normalizedSource, record.name))
        .map((record) => ({
          ...record,
          issuer:
            record.issuer && sourceContains(normalizedSource, record.issuer)
              ? record.issuer
              : undefined,
          issuedDate: record.issuedDate
            ? reconcileDate(normalizedSource, record.issuedDate)
            : undefined,
        })),
      contact: reconcileContact(
        snapshot.contact,
        sourceResumeText,
        normalizedSource
      ),
      experience,
      education: snapshot.education
        .filter((record) => sourceContains(normalizedSource, record.school))
        .map((record) => ({
          ...record,
          degree:
            record.degree && sourceContains(normalizedSource, record.degree)
              ? record.degree
              : undefined,
          fieldOfStudy:
            record.fieldOfStudy &&
            sourceContains(normalizedSource, record.fieldOfStudy)
              ? record.fieldOfStudy
              : undefined,
          location:
            record.location && sourceContains(normalizedSource, record.location)
              ? record.location
              : undefined,
          startDate: record.startDate
            ? reconcileDate(normalizedSource, record.startDate)
            : undefined,
          endDate: record.endDate
            ? reconcileDate(normalizedSource, record.endDate)
            : undefined,
        })),
    },
  };
}

const TITLE_PROXIMITY_CHARS = 400;

/** The recovered title must sit near that employer in the source resume. */
function titleNearCompany(
  normalizedSource: string,
  company: string,
  title: string
): boolean {
  const normalizedCompany = normalizeEvidence(company);
  const normalizedTitle = normalizeEvidence(title);
  if (!normalizedCompany || !normalizedTitle) return false;
  for (
    let at = normalizedSource.indexOf(normalizedCompany);
    at >= 0;
    at = normalizedSource.indexOf(normalizedCompany, at + 1)
  ) {
    const window = normalizedSource.slice(
      Math.max(0, at - TITLE_PROXIMITY_CHARS),
      at + normalizedCompany.length + TITLE_PROXIMITY_CHARS
    );
    if (window.includes(normalizedTitle)) return true;
  }
  return false;
}

export type SourceTitleRecoverer = (input: {
  sourceResumeText: string;
  roles: Array<{
    index: number;
    company: string;
    tailoredTitle: string;
    startDateText: string;
  }>;
}) => Promise<unknown>;

const SOURCE_TITLE_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    roles: {
      type: 'array',
      maxItems: AUTOFILL_CONTRACT_LIMITS.experience,
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          index: { type: 'integer', minimum: 0 },
          title: {
            type: 'string',
            maxLength: AUTOFILL_CONTRACT_LIMITS.shortText,
          },
        },
        required: ['index', 'title'],
      },
    },
  },
  required: ['roles'],
} as const;

async function recoverSourceTitlesWithGemini(
  input: Parameters<SourceTitleRecoverer>[0]
): Promise<unknown> {
  const prompt = `For each role below, return the job title exactly as written for that same employer and period in the SOURCE RESUME.

Rules:
- Copy the title verbatim from the source resume. Never paraphrase, translate, or invent.
- If the source resume shows no title for that role, omit the role.
- Return valid JSON matching the supplied schema.

ROLES:
${JSON.stringify(input.roles)}

SOURCE RESUME:
${input.sourceResumeText}`;

  const response = await generateAiContent({
    task: 'autofill_extract',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseJsonSchema: SOURCE_TITLE_JSON_SCHEMA,
      maxOutputTokens: 2_048,
    },
  });
  const text = response.text?.trim();
  if (!text) throw new Error('AI title recovery returned no data');
  return JSON.parse(text);
}

/**
 * Replace tailored titles the source cannot confirm with the applicant's real
 * title for that role. A role whose real title cannot be verified is removed;
 * applications must never receive a title the applicant did not hold.
 */
async function resolveUnconfirmedTitles(
  reconciled: ReconciledSnapshot,
  sourceResumeText: string,
  recover: SourceTitleRecoverer
): Promise<ResumeAutofillSnapshotV1> {
  if (reconciled.unconfirmedTitles.length === 0) return reconciled.snapshot;
  const normalizedSource = normalizeEvidence(sourceResumeText);
  const recovered = new Map<number, string>();
  try {
    const raw = (await recover({
      sourceResumeText: sourceResumeText.slice(0, NORMALIZED_RESUME_MAX_CHARS),
      roles: reconciled.unconfirmedTitles.map(({ index, record }) => ({
        index,
        company: record.company,
        tailoredTitle: record.title,
        startDateText: record.startDate.originalText,
      })),
    })) as { roles?: Array<{ index?: unknown; title?: unknown }> } | null;
    const pending = new Map(
      reconciled.unconfirmedTitles.map(({ index, record }) => [index, record])
    );
    for (const role of Array.isArray(raw?.roles) ? raw.roles : []) {
      if (typeof role.index !== 'number' || typeof role.title !== 'string') continue;
      const record = pending.get(role.index);
      const title = role.title.trim();
      if (
        !record ||
        !title ||
        title.length > AUTOFILL_CONTRACT_LIMITS.shortText ||
        !sourceContains(normalizedSource, title) ||
        !titleNearCompany(normalizedSource, record.company, title)
      )
        continue;
      recovered.set(role.index, title);
    }
  } catch (error) {
    // Recovery is best-effort; unverified roles are removed below.
    reportExtractionFailure('title_recovery', error);
  }

  const unconfirmed = new Set(reconciled.unconfirmedTitles.map(({ index }) => index));
  return {
    ...reconciled.snapshot,
    experience: reconciled.snapshot.experience.flatMap((record, index) => {
      if (!unconfirmed.has(index)) return [record];
      const title = recovered.get(index);
      return title ? [{ ...record, title }] : [];
    }),
  };
}

export function hashFinalLatex(finalLatex: string): string {
  return createHash('sha256').update(finalLatex, 'utf8').digest('hex');
}

async function extractStructuredSnapshotWithGemini(input: {
  plainText: string;
}): Promise<unknown> {
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

  const response = await generateAiContent({
    task: 'autofill_extract',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseJsonSchema: RESUME_AUTOFILL_SNAPSHOT_JSON_SCHEMA,
      maxOutputTokens: 8_192,
    },
  });

  const text = response.text?.trim();
  if (!text) throw new Error('AI extractor returned no data');
  return JSON.parse(text);
}

export async function extractAutofillSnapshot(input: {
  finalLatex: string;
  sourceResumeText: string;
  extractStructuredSnapshot?: StructuredSnapshotExtractor;
  recoverSourceTitles?: SourceTitleRecoverer;
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
  } catch (error) {
    reportExtractionFailure('extract', error);
    return { ok: false, reason: 'extraction_failed', generatedContentHash };
  }

  const validated = ResumeAutofillSnapshotV1Schema.safeParse(rawSnapshot);
  if (!validated.success) {
    reportExtractionFailure('validate');
    return { ok: false, reason: 'invalid_snapshot', generatedContentHash };
  }

  const reconciled = await resolveUnconfirmedTitles(
    reconcileSnapshotWithSourceResume(validated.data, input.sourceResumeText),
    input.sourceResumeText,
    input.recoverSourceTitles ?? recoverSourceTitlesWithGemini
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
