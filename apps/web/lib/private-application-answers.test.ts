import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  PrivateApplicationAnswersSchema,
  decryptPrivateApplicationAnswers,
  encryptPrivateApplicationAnswers,
  encryptLegacyPrivateApplicationAnswersForMigration,
  type PrivateApplicationAnswers,
} from "./private-application-answers";

const TEST_KEY = Buffer.alloc(32, 7).toString("base64");

const ANSWERS: PrivateApplicationAnswers = {
  workAuthorization: "yes",
  requiresSponsorship: "no",
  visaStatus: "F-1 OPT",
  visaType: "opt",
  citizenship: "India",
  salaryExpectation: "$120,000",
  expectedAnnualSalary: "$120,000",
  expectedHourlyRate: "$58",
  canWorkInPerson: "yes",
  willingToRelocate: "no",
  canStartImmediately: "yes",
  reliableTransportation: "yes",
  needsAccommodations: "no",
  dateOfBirth: "1998-04-12",
  sexGender: "female",
  hispanicLatino: "no",
  raceEthnicity: "asian",
  veteranStatus: "not_protected_veteran",
  disabilityStatus: "prefer_not_to_answer",
  eeoPreference: "prefer_not_to_answer",
  defaultJobPortalLogin: {
    email: "candidate@example.com",
    password: "Application-only!9A",
  },
};

describe("private application answer protection", () => {
  beforeEach(() => {
    process.env.PRIVATE_APPLICATION_ANSWERS_ENCRYPTION_KEY = TEST_KEY;
  });

  afterEach(() => {
    delete process.env.PRIVATE_APPLICATION_ANSWERS_ENCRYPTION_KEY;
  });

  it("round-trips validated answers without exposing plaintext", () => {
    const encrypted = encryptPrivateApplicationAnswers(ANSWERS);

    expect(encrypted).not.toContain("F-1 OPT");
    expect(encrypted).not.toContain("1998-04-12");
    expect(encrypted).not.toContain("Application-only!9A");
    expect(encrypted).not.toContain("candidate@example.com");
    expect(decryptPrivateApplicationAnswers(encrypted)).toEqual(ANSWERS);
  });

  it("uses a new authenticated nonce for every write", () => {
    expect(encryptPrivateApplicationAnswers(ANSWERS)).not.toBe(
      encryptPrivateApplicationAnswers(ANSWERS)
    );
  });

  it("rejects modified ciphertext", () => {
    const encrypted = encryptPrivateApplicationAnswers(ANSWERS);
    const [version, iv, tag, ciphertext] = encrypted.split(".");
    const ciphertextBytes = Buffer.from(ciphertext, "base64url");
    ciphertextBytes[0] ^= 1;
    const tampered = [
      version,
      iv,
      tag,
      ciphertextBytes.toString("base64url"),
    ].join(".");

    expect(() => decryptPrivateApplicationAnswers(tampered)).toThrow();
  });

  it("rejects fields that must never be stored, including SSNs", () => {
    expect(() =>
      PrivateApplicationAnswersSchema.parse({
        ...ANSWERS,
        socialSecurityNumber: "123-45-6789",
      })
    ).toThrow();
  });

  it("accepts one shared default login and rejects hostname-bound writes", () => {
    const parsed = PrivateApplicationAnswersSchema.parse({
      defaultJobPortalLogin: {
        email: "candidate@example.com",
        password: "Application-only!9A",
      },
    });
    expect(parsed.defaultJobPortalLogin).toEqual({
      email: "candidate@example.com",
      password: "Application-only!9A",
    });
    expect(() =>
      PrivateApplicationAnswersSchema.parse({
        jobPortalLogins: [
          {
            hostname: "www.trackmyopt.com",
            email: "candidate@example.com",
            password: "Application-only!9A",
          },
        ],
      })
    ).toThrow();
    expect(() =>
      PrivateApplicationAnswersSchema.parse({
        defaultJobPortalLogin: {
          email: "candidate@example.com",
          password: "short",
        },
      })
    ).toThrow();
  });

  it("decrypts legacy per-host logins for explicit migration without activating a default", () => {
    const encrypted = encryptLegacyPrivateApplicationAnswersForMigration({
      workAuthorization: "yes",
      jobPortalLogins: [
        {
          hostname: "jobs.example.com",
          email: "candidate@example.com",
          password: "Legacy-only!9A",
        },
      ],
    });

    expect(decryptPrivateApplicationAnswers(encrypted)).toEqual({
      workAuthorization: "yes",
      legacyJobPortalLogins: [
        {
          hostname: "jobs.example.com",
          email: "candidate@example.com",
          password: "Legacy-only!9A",
        },
      ],
    });
    expect(
      decryptPrivateApplicationAnswers(encrypted).defaultJobPortalLogin
    ).toBeUndefined();
  });
});
