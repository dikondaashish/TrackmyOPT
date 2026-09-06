export interface PrivateAnswersForm {
  workAuthorization: string;
  requiresSponsorship: string;
  visaType: string;
  visaOther: string;
  visaStatus: string;
  citizenship: string;
  salaryExpectation: string;
  expectedAnnualSalary: string;
  expectedHourlyRate: string;
  canWorkInPerson: string;
  willingToRelocate: string;
  canStartImmediately: string;
  reliableTransportation: string;
  needsAccommodations: string;
  dateOfBirth: string;
  sexGender: string;
  hispanicLatino: string;
  raceEthnicity: string;
  veteranStatus: string;
  disabilityStatus: string;
  eeoPreference: string;
  defaultJobPortalLogin: DefaultJobPortalLoginForm;
}

export interface DefaultJobPortalLoginForm {
  email: string;
  password: string;
  passwordConfirmation: string;
}

export interface LegacyJobPortalLogin {
  hostname: string;
  email: string;
  password: string;
}

export const EMPTY_PRIVATE_ANSWERS_FORM: PrivateAnswersForm = {
  workAuthorization: "",
  requiresSponsorship: "",
  visaType: "",
  visaOther: "",
  visaStatus: "",
  citizenship: "",
  salaryExpectation: "",
  expectedAnnualSalary: "",
  expectedHourlyRate: "",
  canWorkInPerson: "",
  willingToRelocate: "",
  canStartImmediately: "",
  reliableTransportation: "",
  needsAccommodations: "",
  dateOfBirth: "",
  sexGender: "",
  hispanicLatino: "",
  raceEthnicity: "",
  veteranStatus: "",
  disabilityStatus: "",
  eeoPreference: "",
  defaultJobPortalLogin: {
    email: "",
    password: "",
    passwordConfirmation: "",
  },
};

export function asPrivateAnswersForm(value: unknown): PrivateAnswersForm {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return EMPTY_PRIVATE_ANSWERS_FORM;
  }
  const data = value as Record<string, unknown>;
  const read = (key: keyof PrivateAnswersForm) =>
    typeof data[key] === "string" ? data[key] : "";
  const savedDefault =
    data.defaultJobPortalLogin &&
    typeof data.defaultJobPortalLogin === "object" &&
    !Array.isArray(data.defaultJobPortalLogin)
      ? (data.defaultJobPortalLogin as Record<string, unknown>)
      : null;
  const defaultJobPortalLogin =
    savedDefault &&
    typeof savedDefault.email === "string" &&
    typeof savedDefault.password === "string"
      ? {
          email: savedDefault.email,
          password: savedDefault.password,
          passwordConfirmation: savedDefault.password,
        }
      : {
          email: "",
          password: "",
          passwordConfirmation: "",
        };
  return {
    workAuthorization: read("workAuthorization"),
    requiresSponsorship: read("requiresSponsorship"),
    visaType: read("visaType"),
    visaOther: read("visaOther"),
    visaStatus: read("visaStatus"),
    citizenship: read("citizenship"),
    salaryExpectation: read("salaryExpectation"),
    expectedAnnualSalary: read("expectedAnnualSalary"),
    expectedHourlyRate: read("expectedHourlyRate"),
    canWorkInPerson: read("canWorkInPerson"),
    willingToRelocate: read("willingToRelocate"),
    canStartImmediately: read("canStartImmediately"),
    reliableTransportation: read("reliableTransportation"),
    needsAccommodations: read("needsAccommodations"),
    dateOfBirth: read("dateOfBirth"),
    sexGender: read("sexGender"),
    hispanicLatino: read("hispanicLatino"),
    raceEthnicity: read("raceEthnicity"),
    veteranStatus: read("veteranStatus"),
    disabilityStatus: read("disabilityStatus"),
    eeoPreference: read("eeoPreference"),
    defaultJobPortalLogin,
  };
}

export function legacyJobPortalLoginsFrom(value: unknown): LegacyJobPortalLogin[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  const entries = (value as Record<string, unknown>).legacyJobPortalLogins;
  if (!Array.isArray(entries)) return [];
  return entries.slice(0, 5).flatMap((entry): LegacyJobPortalLogin[] => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return [];
    const login = entry as Record<string, unknown>;
    if (
      typeof login.hostname !== "string" ||
      typeof login.email !== "string" ||
      typeof login.password !== "string"
    ) {
      return [];
    }
    return [{
      hostname: login.hostname,
      email: login.email,
      password: login.password,
    }];
  });
}
