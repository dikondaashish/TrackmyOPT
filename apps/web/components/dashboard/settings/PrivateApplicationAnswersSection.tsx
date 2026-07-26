"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Check,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PrivateAnswersForm {
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

interface DefaultJobPortalLoginForm {
  email: string;
  password: string;
  passwordConfirmation: string;
}

interface LegacyJobPortalLogin {
  hostname: string;
  email: string;
  password: string;
}

const EMPTY: PrivateAnswersForm = {
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

function asForm(value: unknown): PrivateAnswersForm {
  if (!value || typeof value !== "object" || Array.isArray(value)) return EMPTY;
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

function legacyLoginsFrom(value: unknown): LegacyJobPortalLogin[] {
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

export function PrivateApplicationAnswersSection() {
  const [form, setForm] = useState<PrivateAnswersForm>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [consent, setConsent] = useState(false);
  const [hasSavedAnswers, setHasSavedAnswers] = useState(false);
  const [legacyJobPortalLogins, setLegacyJobPortalLogins] = useState<
    LegacyJobPortalLogin[]
  >([]);
  const [legacyLoginDecisionMade, setLegacyLoginDecisionMade] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const reviewAbortRef = useRef<AbortController | null>(null);
  const decryptedFormRef = useRef<PrivateAnswersForm>(EMPTY);
  const decryptedLegacyLoginsRef = useRef<LegacyJobPortalLogin[]>([]);
  const plaintextAllowedRef = useRef(false);

  useEffect(() => {
    decryptedFormRef.current = form;
  }, [form]);

  useEffect(() => {
    return () => {
      reviewAbortRef.current?.abort();
      reviewAbortRef.current = null;
      decryptedFormRef.current = EMPTY;
      decryptedLegacyLoginsRef.current = [];
      plaintextAllowedRef.current = false;
    };
  }, []);

  const clearDecryptedAnswers = useCallback(() => {
    reviewAbortRef.current?.abort();
    reviewAbortRef.current = null;
    decryptedFormRef.current = EMPTY;
    decryptedLegacyLoginsRef.current = [];
    plaintextAllowedRef.current = false;
    setForm(EMPTY);
    setLegacyJobPortalLogins([]);
    setLegacyLoginDecisionMade(true);
    setConsent(false);
    setRevealed(false);
    setLoading(false);
  }, []);

  const reviewPrivateAnswers = useCallback(async () => {
    reviewAbortRef.current?.abort();
    const controller = new AbortController();
    reviewAbortRef.current = controller;
    plaintextAllowedRef.current = true;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch("/api/private-application-answers", {
        credentials: "include",
        cache: "no-store",
        signal: controller.signal,
      });
      const body = await response.json().catch(() => ({}));
      if (controller.signal.aborted) return;
      if (!response.ok) {
        plaintextAllowedRef.current = false;
        setError(
          body?.error || "Private answers are temporarily unavailable."
        );
        return;
      }
      const nextForm = body?.data ? asForm(body.data) : EMPTY;
      const legacyLogins = body?.data ? legacyLoginsFrom(body.data) : [];
      decryptedFormRef.current = nextForm;
      decryptedLegacyLoginsRef.current = legacyLogins;
      setForm(nextForm);
      setLegacyJobPortalLogins(legacyLogins);
      setLegacyLoginDecisionMade(legacyLogins.length === 0);
      setHasSavedAnswers(Boolean(body?.data));
      setRevealed(true);
    } catch (caught) {
      if (
        controller.signal.aborted ||
        (caught instanceof DOMException && caught.name === "AbortError")
      ) {
        return;
      }
      plaintextAllowedRef.current = false;
      setError("Could not load private answers. Please try again.");
    } finally {
      if (reviewAbortRef.current === controller) {
        reviewAbortRef.current = null;
        setLoading(false);
      }
    }
  }, []);

  const update =
    (
      key: Exclude<keyof PrivateAnswersForm, "defaultJobPortalLogin">
    ) =>
    (
      event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
      setForm((previous) => ({ ...previous, [key]: event.target.value }));
      setSuccess(null);
      setError(null);
    };

  const updateDefaultJobPortalLogin =
    (key: keyof DefaultJobPortalLoginForm) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      if (legacyJobPortalLogins.length > 0) {
        decryptedLegacyLoginsRef.current = [];
        setLegacyJobPortalLogins([]);
        setLegacyLoginDecisionMade(true);
      }
      setForm((previous) => ({
        ...previous,
        defaultJobPortalLogin: {
          ...previous.defaultJobPortalLogin,
          [key]: value,
        },
      }));
      setSuccess(null);
      setError(null);
    };

  const chooseLegacyJobPortalLogin = (login: LegacyJobPortalLogin) => {
    setForm((previous) => ({
      ...previous,
      defaultJobPortalLogin: {
        email: login.email,
        password: login.password,
        passwordConfirmation: login.password,
      },
    }));
    decryptedLegacyLoginsRef.current = [];
    setLegacyJobPortalLogins([]);
    setLegacyLoginDecisionMade(true);
    setSuccess(null);
    setError(null);
  };

  const discardLegacyJobPortalLogins = () => {
    decryptedLegacyLoginsRef.current = [];
    setLegacyJobPortalLogins([]);
    setLegacyLoginDecisionMade(true);
    setSuccess(null);
    setError(null);
  };

  const save = async () => {
    if (!consent) {
      setError("Please confirm the privacy notice before saving.");
      return;
    }
    if (!legacyLoginDecisionMade) {
      setError(
        "Choose one older login as the default, enter a new default, or choose not to use the older logins."
      );
      return;
    }
    const defaultLogin = form.defaultJobPortalLogin;
    const hasAnyLoginValue = Boolean(
      defaultLogin.email.trim() ||
      defaultLogin.password ||
      defaultLogin.passwordConfirmation
    );
    if (
      hasAnyLoginValue &&
      (!defaultLogin.email.trim() ||
        !defaultLogin.password ||
        !defaultLogin.passwordConfirmation)
    ) {
      setError("Enter the email, password, and re-entered password.");
      return;
    }
    if (defaultLogin.password !== defaultLogin.passwordConfirmation) {
      setError("The default job-portal passwords must match.");
      return;
    }
    const {
      defaultJobPortalLogin: _defaultJobPortalLogin,
      ...answers
    } = form;
    const savePayload = {
      ...answers,
      ...(hasAnyLoginValue
        ? {
            defaultJobPortalLogin: {
              email: defaultLogin.email.trim(),
              password: defaultLogin.password,
            },
          }
        : {}),
      consent: true,
    };
    setSaving(true);
    setSuccess(null);
    setError(null);
    try {
      const response = await fetch("/api/private-application-answers", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(savePayload),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(
          body?.error || "Could not save your private application answers."
        );
        return;
      }
      const savedForm = asForm(body.data);
      if (plaintextAllowedRef.current) {
        setForm(savedForm);
        decryptedFormRef.current = savedForm;
      }
      decryptedLegacyLoginsRef.current = [];
      setLegacyJobPortalLogins([]);
      setLegacyLoginDecisionMade(true);
      setHasSavedAnswers(true);
      setConsent(false);
      setSuccess(
        "Private application data saved. The extension will still ask you to review it for each application."
      );
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const deleteAnswers = async () => {
    if (
      !window.confirm(
        "Delete every saved private application answer and job-portal login? This cannot be undone."
      )
    ) {
      return;
    }
    setDeleting(true);
    setSuccess(null);
    setError(null);
    try {
      const response = await fetch("/api/private-application-answers", {
        method: "DELETE",
        credentials: "include",
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(body?.error || "Could not delete private answers.");
        return;
      }
      setForm(EMPTY);
      decryptedFormRef.current = EMPTY;
      decryptedLegacyLoginsRef.current = [];
      plaintextAllowedRef.current = false;
      setLegacyJobPortalLogins([]);
      setLegacyLoginDecisionMade(true);
      setConsent(false);
      setHasSavedAnswers(false);
      setRevealed(false);
      setSuccess("All saved private application answers were deleted.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className="mt-6 rounded-xl border border-amber-200 bg-amber-50/50 p-5 dark:border-amber-900 dark:bg-amber-950/15 sm:p-6">
      <div className="mb-2 flex items-center gap-3">
        <LockKeyhole className="h-5 w-5 text-amber-700 dark:text-amber-400" />
        <h3 className="text-base font-semibold">Private application answers</h3>
      </div>
      <p className="mb-3 text-sm text-gray-600 dark:text-gray-300">
        An optional shared job-portal login and answers for work
        authorization, visa, compensation, work preferences, date of birth,
        and DEI questions. They are protected with authenticated encryption and
        are never sent to AI or analytics.
      </p>
      <p className="mb-5 text-xs leading-5 text-gray-500 dark:text-gray-400">
        The TrackMyOPT extension loads these into a private review panel. You
        must approve them for each application before they can fill empty
        fields. TrackMyOPT never submits an application.
      </p>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading private answers…
        </div>
      ) : !revealed ? (
        <Button
          type="button"
          variant="outline"
          onClick={() => void reviewPrivateAnswers()}
          className="h-10"
        >
          <Eye className="mr-2 h-4 w-4" />
          Review private answers
        </Button>
      ) : (
        <div className="space-y-5">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={clearDecryptedAnswers}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              <EyeOff className="h-4 w-4" /> Hide answers
            </button>
          </div>

          <div className="rounded-xl border border-red-200 bg-white/80 p-4 dark:border-red-950 dark:bg-zinc-950/50">
            <h4 className="text-sm font-semibold">
              Default job-portal login
            </h4>
            <p className="mt-1 max-w-2xl text-xs leading-5 text-gray-600 dark:text-gray-400">
              TrackMyOPT will offer this same login across all third-party job
              portals where you choose Review, then Approve. It is never filled
              silently, and credential prefill never clicks Login, Continue,
              Next, Create Account, or Submit.
            </p>
            <p className="mt-3 rounded-lg bg-red-50 p-3 text-xs leading-5 text-red-800 dark:bg-red-950/30 dark:text-red-300">
              Using the same password across unrelated employers and hiring
              systems creates a security risk if any one portal is compromised.
              Only save this login if you understand that tradeoff. Do not
              enter your TrackMyOPT password. TrackMyOPT does not generate,
              reset, or verify employer passwords.
            </p>

            {legacyJobPortalLogins.length > 0 && (
              <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
                <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                  Action required for your older saved logins
                </p>
                <p className="mt-1 text-xs leading-5 text-amber-800 dark:text-amber-300">
                  For safety, none of your older site-specific logins will be
                  used across all portals automatically. Choose one below as
                  the new default, enter a new default, or discard the older
                  login entries.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {legacyJobPortalLogins.map((login) => (
                    <Button
                      key={`${login.hostname}:${login.email}`}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => chooseLegacyJobPortalLogin(login)}
                    >
                      Use {login.email} as default
                    </Button>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={discardLegacyJobPortalLogins}
                  >
                    Do not use older logins
                  </Button>
                </div>
              </div>
            )}

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Default login email">
                <Input
                  type="email"
                  value={form.defaultJobPortalLogin.email}
                  onChange={updateDefaultJobPortalLogin("email")}
                  placeholder="you@example.com"
                  autoComplete="username"
                  spellCheck={false}
                />
              </Field>
              <div className="hidden sm:block" aria-hidden="true" />
              <Field label="Default password">
                <Input
                  type="password"
                  value={form.defaultJobPortalLogin.password}
                  onChange={updateDefaultJobPortalLogin("password")}
                  minLength={8}
                  maxLength={256}
                  autoComplete="new-password"
                  data-sensitive="true"
                />
              </Field>
              <Field label="Default password (re-enter)">
                <Input
                  type="password"
                  value={form.defaultJobPortalLogin.passwordConfirmation}
                  onChange={updateDefaultJobPortalLogin(
                    "passwordConfirmation"
                  )}
                  minLength={8}
                  maxLength={256}
                  autoComplete="new-password"
                  data-sensitive="true"
                />
              </Field>
            </div>
            <p className="mt-3 text-xs leading-5 text-gray-500 dark:text-gray-400">
              Employer portals may require at least 8 characters, uppercase,
              lowercase, a number, and a special character. TrackMyOPT stores
              the password you provide; each employer portal decides its
              actual password rules.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SelectField
              label="Authorized to work in the U.S.?"
              value={form.workAuthorization}
              onChange={update("workAuthorization")}
              options={[
                ["yes", "Yes"],
                ["no", "No"],
              ]}
            />
            <SelectField
              label="Need sponsorship now or later?"
              value={form.requiresSponsorship}
              onChange={update("requiresSponsorship")}
              options={[
                ["yes", "Yes"],
                ["no", "No"],
              ]}
            />
            <SelectField
              label="Visa / work status"
              value={form.visaType}
              onChange={update("visaType")}
              options={[
                ["us_citizen", "U.S. citizen"],
                ["permanent_resident", "Permanent resident"],
                ["h1b", "H-1B"],
                ["f1_student", "F-1 student"],
                ["opt", "OPT"],
                ["cpt", "CPT"],
                ["j1", "J-1"],
                ["l1", "L-1"],
                ["o1", "O-1"],
                ["tn", "TN"],
                ["e3", "E-3"],
                ["other", "Other"],
              ]}
            />
            {form.visaType === "other" && (
              <Field label="Other visa / work status">
                <Input
                  value={form.visaOther}
                  onChange={update("visaOther")}
                  placeholder="Enter the exact status"
                  autoComplete="off"
                />
              </Field>
            )}
            <Field label="Citizenship">
              <Input
                value={form.citizenship}
                onChange={update("citizenship")}
                placeholder="Exact answer to use"
                autoComplete="off"
              />
            </Field>
            <Field label="Expected annual salary">
              <Input
                value={form.expectedAnnualSalary}
                onChange={update("expectedAnnualSalary")}
                placeholder="Example: $120,000"
                inputMode="decimal"
                autoComplete="off"
              />
            </Field>
            <Field label="Expected hourly rate">
              <Input
                value={form.expectedHourlyRate}
                onChange={update("expectedHourlyRate")}
                placeholder="Example: $58"
                inputMode="decimal"
                autoComplete="off"
              />
            </Field>
            <SelectField
              label="Can work in-person?"
              value={form.canWorkInPerson}
              onChange={update("canWorkInPerson")}
              options={[["yes", "Yes"], ["no", "No"]]}
            />
            <SelectField
              label="Willing to relocate?"
              value={form.willingToRelocate}
              onChange={update("willingToRelocate")}
              options={[["yes", "Yes"], ["no", "No"]]}
            />
            <SelectField
              label="Can start immediately?"
              value={form.canStartImmediately}
              onChange={update("canStartImmediately")}
              options={[["yes", "Yes"], ["no", "No"]]}
            />
            <SelectField
              label="Has reliable transportation?"
              value={form.reliableTransportation}
              onChange={update("reliableTransportation")}
              options={[["yes", "Yes"], ["no", "No"]]}
            />
            <SelectField
              label="Needs accommodations?"
              value={form.needsAccommodations}
              onChange={update("needsAccommodations")}
              options={[["yes", "Yes"], ["no", "No"]]}
            />
            <Field label="Date of birth">
              <Input
                type="date"
                value={form.dateOfBirth}
                onChange={update("dateOfBirth")}
                autoComplete="bday"
              />
            </Field>
            <SelectField
              label="Gender (optional)"
              value={form.sexGender}
              onChange={update("sexGender")}
              options={[
                ["female", "Female"],
                ["male", "Male"],
                ["non_binary", "Non-binary"],
                ["prefer_not_to_answer", "Prefer not to answer"],
              ]}
            />
            <SelectField
              label="Ethnicity / race (optional)"
              value={form.raceEthnicity}
              onChange={update("raceEthnicity")}
              options={[
                [
                  "american_indian_or_alaska_native",
                  "American Indian or Alaska Native",
                ],
                ["asian", "Asian"],
                [
                  "black_or_african_american",
                  "Black or African American",
                ],
                ["hispanic_or_latino", "Hispanic or Latino"],
                [
                  "native_hawaiian_or_pacific_islander",
                  "Native Hawaiian or Pacific Islander",
                ],
                ["white", "White"],
                ["two_or_more_races", "Two or more races"],
                ["prefer_not_to_answer", "Prefer not to answer"],
              ]}
            />
            <SelectField
              label="Hispanic or Latino?"
              value={form.hispanicLatino}
              onChange={update("hispanicLatino")}
              options={[
                ["yes", "Yes"],
                ["no", "No"],
                ["prefer_not_to_answer", "Prefer not to answer"],
              ]}
            />
            <SelectField
              label="Veteran (optional)"
              value={form.veteranStatus}
              onChange={update("veteranStatus")}
              options={[
                ["not_protected_veteran", "Not a protected veteran"],
                ["protected_veteran", "Protected veteran"],
                ["prefer_not_to_answer", "Prefer not to answer"],
              ]}
            />
            <SelectField
              label="Has disability (optional)"
              value={form.disabilityStatus}
              onChange={update("disabilityStatus")}
              options={[
                ["yes", "Yes"],
                ["no", "No"],
                ["prefer_not_to_answer", "Prefer not to answer"],
              ]}
            />
            <SelectField
              label="Other EEO questions"
              value={form.eeoPreference}
              onChange={update("eeoPreference")}
              options={[
                ["prefer_not_to_answer", "Prefer not to answer"],
              ]}
            />
          </div>

          <label className="flex items-start gap-3 rounded-lg border border-amber-200 bg-white/70 p-3 text-sm dark:border-amber-900 dark:bg-zinc-950/40">
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
              className="mt-1 h-4 w-4"
            />
            <span>
              I understand that TrackMyOPT will make this same saved login
              available for my review on job portals across different
              employers and hiring systems. I choose to save it and these
              optional sensitive answers, and I can edit or delete them at any
              time.
            </span>
          </label>

          {success && (
            <p className="flex items-start gap-2 text-sm text-green-700 dark:text-green-400">
              <Check className="mt-0.5 h-4 w-4 shrink-0" /> {success}
            </p>
          )}
          {error && (
            <p className="flex items-start gap-2 text-sm text-red-700 dark:text-red-400">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              onClick={save}
              disabled={saving || !consent}
              className="h-10"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
                </>
              ) : (
                "Save private answers"
              )}
            </Button>
            {hasSavedAnswers && (
              <Button
                type="button"
                variant="outline"
                onClick={deleteAnswers}
                disabled={deleting}
                className="h-10 border-red-300 text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30"
              >
                {deleting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Delete saved answers
              </Button>
            )}
          </div>
        </div>
      )}

      {!revealed && (success || error) && (
        <p
          className={`mt-4 flex items-start gap-2 text-sm ${
            error
              ? "text-red-700 dark:text-red-400"
              : "text-green-700 dark:text-green-400"
          }`}
        >
          {error ? (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <Check className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          {error || success}
        </p>
      )}
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
  options: Array<[string, string]>;
}) {
  return (
    <Field label={label}>
      <select
        value={value}
        onChange={onChange}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <option value="">Leave unanswered</option>
        {options.map(([optionValue, optionLabel]) => (
          <option value={optionValue} key={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </Field>
  );
}
