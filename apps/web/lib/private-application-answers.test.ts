import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  PrivateApplicationAnswersSchema,
  decryptPrivateApplicationAnswers,
  encryptPrivateApplicationAnswers,
} from "./private-application-answers";

const TEST_KEY = Buffer.alloc(32, 7).toString("base64");

const ANSWERS = {
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
} as const;

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
    expect(decryptPrivateApplicationAnswers(encrypted)).toEqual(ANSWERS);
  });

  it("uses a new authenticated nonce for every write", () => {
    expect(encryptPrivateApplicationAnswers(ANSWERS)).not.toBe(
      encryptPrivateApplicationAnswers(ANSWERS)
    );
  });

  it("rejects modified ciphertext", () => {
    const encrypted = encryptPrivateApplicationAnswers(ANSWERS);
    const tampered = `${encrypted.slice(0, -1)}${
      encrypted.endsWith("A") ? "B" : "A"
    }`;

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
});
