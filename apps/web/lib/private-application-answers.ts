import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto";
import { z } from "zod";

const ENCRYPTION_VERSION = "v1";
const ENCRYPTION_AAD = Buffer.from(
  "trackmyopt:private-application-answers:v1",
  "utf8"
);

const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const optionalText = (max: number) =>
  z.preprocess(
    emptyToUndefined,
    z.string().trim().max(max).optional()
  );

function isCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return false;
  const today = new Date().toISOString().slice(0, 10);
  return parsed.toISOString().slice(0, 10) === value &&
    value >= "1900-01-01" &&
    value <= today;
}

export const PrivateApplicationAnswersSchema = z
  .object({
    workAuthorization: z.enum(["yes", "no"]).optional(),
    requiresSponsorship: z.enum(["yes", "no"]).optional(),
    visaType: z
      .enum([
        "us_citizen",
        "permanent_resident",
        "h1b",
        "f1_student",
        "opt",
        "cpt",
        "j1",
        "l1",
        "o1",
        "tn",
        "e3",
        "other",
      ])
      .optional(),
    visaOther: optionalText(120),
    // Legacy free-text fields remain readable so existing encrypted records
    // continue to decrypt after this rollout.
    visaStatus: optionalText(120),
    citizenship: optionalText(120),
    salaryExpectation: optionalText(200),
    expectedAnnualSalary: optionalText(80),
    expectedHourlyRate: optionalText(80),
    canWorkInPerson: z.enum(["yes", "no"]).optional(),
    willingToRelocate: z.enum(["yes", "no"]).optional(),
    canStartImmediately: z.enum(["yes", "no"]).optional(),
    reliableTransportation: z.enum(["yes", "no"]).optional(),
    needsAccommodations: z.enum(["yes", "no"]).optional(),
    dateOfBirth: z.preprocess(
      emptyToUndefined,
      z.string().refine(isCalendarDate, "Enter a valid date of birth").optional()
    ),
    sexGender: z
      .enum(["female", "male", "non_binary", "prefer_not_to_answer"])
      .optional(),
    hispanicLatino: z
      .enum(["yes", "no", "prefer_not_to_answer"])
      .optional(),
    raceEthnicity: z
      .enum([
        "american_indian_or_alaska_native",
        "asian",
        "black_or_african_american",
        "hispanic_or_latino",
        "native_hawaiian_or_pacific_islander",
        "white",
        "two_or_more_races",
        "prefer_not_to_answer",
      ])
      .optional(),
    veteranStatus: z
      .enum([
        "not_protected_veteran",
        "protected_veteran",
        "prefer_not_to_answer",
      ])
      .optional(),
    disabilityStatus: z
      .enum(["yes", "no", "prefer_not_to_answer"])
      .optional(),
    eeoPreference: z.literal("prefer_not_to_answer").optional(),
  })
  .strict();

export type PrivateApplicationAnswers = z.infer<
  typeof PrivateApplicationAnswersSchema
>;

function encryptionKey(): Buffer {
  const encoded = process.env.PRIVATE_APPLICATION_ANSWERS_ENCRYPTION_KEY?.trim();
  if (!encoded) {
    throw new Error("Private application answers are not configured");
  }
  const key = Buffer.from(encoded, "base64");
  if (key.length !== 32) {
    throw new Error(
      "PRIVATE_APPLICATION_ANSWERS_ENCRYPTION_KEY must be 32 bytes in base64"
    );
  }
  return key;
}

export function encryptPrivateApplicationAnswers(
  value: PrivateApplicationAnswers
): string {
  const answers = PrivateApplicationAnswersSchema.parse(value);
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  cipher.setAAD(ENCRYPTION_AAD);
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(answers), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return [
    ENCRYPTION_VERSION,
    iv.toString("base64url"),
    tag.toString("base64url"),
    ciphertext.toString("base64url"),
  ].join(".");
}

export function decryptPrivateApplicationAnswers(
  encrypted: string
): PrivateApplicationAnswers {
  const [version, ivText, tagText, ciphertextText, extra] =
    encrypted.split(".");
  if (
    version !== ENCRYPTION_VERSION ||
    !ivText ||
    !tagText ||
    !ciphertextText ||
    extra
  ) {
    throw new Error("Unsupported private application answer payload");
  }

  const decipher = createDecipheriv(
    "aes-256-gcm",
    encryptionKey(),
    Buffer.from(ivText, "base64url")
  );
  decipher.setAAD(ENCRYPTION_AAD);
  decipher.setAuthTag(Buffer.from(tagText, "base64url"));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(ciphertextText, "base64url")),
    decipher.final(),
  ]).toString("utf8");

  return PrivateApplicationAnswersSchema.parse(JSON.parse(plaintext));
}
