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
  jobPortalLogins: JobPortalLoginForm[];
}

interface JobPortalLoginForm {
  hostname: string;
  email: string;
  password: string;
  passwordConfirmation: string;
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
  jobPortalLogins: [],
};

function asForm(value: unknown): PrivateAnswersForm {
  if (!value || typeof value !== "object" || Array.isArray(value)) return EMPTY;
  const data = value as Record<string, unknown>;
  const read = (key: keyof PrivateAnswersForm) =>
    typeof data[key] === "string" ? data[key] : "";
  const jobPortalLogins = Array.isArray(data.jobPortalLogins)
    ? data.jobPortalLogins
        .slice(0, 5)
        .flatMap((entry): JobPortalLoginForm[] => {
          if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
            return [];
          }
          const login = entry as Record<string, unknown>;
          if (
            typeof login.hostname !== "string" ||
            typeof login.email !== "string" ||
            typeof login.password !== "string"
          ) {
            return [];
          }
          return [
            {
              hostname: login.hostname,
              email: login.email,
              password: login.password,
              passwordConfirmation: login.password,
            },
          ];
        })
    : [];
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
    jobPortalLogins,
  };
}

export function PrivateApplicationAnswersSection() {
  const [form, setForm] = useState<PrivateAnswersForm>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [consent, setConsent] = useState(false);
  const [hasSavedAnswers, setHasSavedAnswers] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const reviewAbortRef = useRef<AbortController | null>(null);
  const decryptedFormRef = useRef<PrivateAnswersForm>(EMPTY);
  const plaintextAllowedRef = useRef(false);

  useEffect(() => {
    decryptedFormRef.current = form;
  }, [form]);

  useEffect(() => {
    return () => {
      reviewAbortRef.current?.abort();
      reviewAbortRef.current = null;
      decryptedFormRef.current = EMPTY;
      plaintextAllowedRef.current = false;
    };
  }, []);

  const clearDecryptedAnswers = useCallback(() => {
    reviewAbortRef.current?.abort();
    reviewAbortRef.current = null;
    decryptedFormRef.current = EMPTY;
    plaintextAllowedRef.current = false;
    setForm(EMPTY);
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
      decryptedFormRef.current = nextForm;
      setForm(nextForm);
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
      key: Exclude<keyof PrivateAnswersForm, "jobPortalLogins">
    ) =>
    (
      event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
      setForm((previous) => ({ ...previous, [key]: event.target.value }));
      setSuccess(null);
      setError(null);
    };

  const updateJobPortalLogin =
    (
      index: number,
      key: keyof JobPortalLoginForm
    ) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setForm((previous) => ({
        ...previous,
        jobPortalLogins: previous.jobPortalLogins.map((login, loginIndex) =>
          loginIndex === index ? { ...login, [key]: value } : login
        ),
      }));
      setSuccess(null);
      setError(null);
    };

  const addJobPortalLogin = () => {
    setForm((previous) => {
      if (previous.jobPortalLogins.length >= 5) return previous;
      return {
        ...previous,
        jobPortalLogins: [
          ...previous.jobPortalLogins,
          {
            hostname: "",
            email: "",
            password: "",
            passwordConfirmation: "",
          },
        ],
      };
    });
    setSuccess(null);
    setError(null);
  };

  const removeJobPortalLogin = (index: number) => {
    setForm((previous) => ({
      ...previous,
      jobPortalLogins: previous.jobPortalLogins.filter(
        (_, loginIndex) => loginIndex !== index
      ),
    }));
    setSuccess(null);
    setError(null);
  };

  const save = async () => {
    if (!consent) {
      setError("Please confirm the privacy notice before saving.");
      return;
    }
    if (
      form.jobPortalLogins.some(
        (login) => login.password !== login.passwordConfirmation
      )
    ) {
      setError("Each job-portal password must match its re-entered password.");
      return;
    }
    const {
      jobPortalLogins,
      ...answers
    } = form;
    const savePayload = {
      ...answers,
      jobPortalLogins: jobPortalLogins
        .filter(
          (login) =>
            login.hostname.trim() ||
            login.email.trim() ||
            login.password ||
            login.passwordConfirmation
        )
        .map(
          ({ passwordConfirmation: _passwordConfirmation, ...login }) => login
        ),
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
      plaintextAllowedRef.current = false;
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
        Optional site-specific job-portal logins and answers for work
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
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h4 className="text-sm font-semibold">
                  Job-portal login credentials
                </h4>
                <p className="mt-1 max-w-2xl text-xs leading-5 text-gray-600 dark:text-gray-400">
                  Save a separate login for each exact employer portal. The
                  extension will use it only on that hostname, after you review
                  and approve it for the open application.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addJobPortalLogin}
                disabled={form.jobPortalLogins.length >= 5}
              >
                Add portal login
              </Button>
            </div>
            <p className="mt-3 rounded-lg bg-red-50 p-3 text-xs leading-5 text-red-800 dark:bg-red-950/30 dark:text-red-300">
              Use the exact password accepted by that employer portal,
              preferably a unique password. Do not enter your TrackMyOPT
              password. TrackMyOPT does not generate, reset, or verify employer
              passwords.
            </p>
            {form.jobPortalLogins.length === 0 ? (
              <p className="mt-4 text-sm text-gray-500">
                No job-portal login is saved.
              </p>
            ) : (
              <div className="mt-4 space-y-4">
                {form.jobPortalLogins.map((login, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-gray-200 p-4 dark:border-zinc-800"
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <strong className="text-sm">
                        Portal login {index + 1}
                      </strong>
                      <button
                        type="button"
                        onClick={() => removeJobPortalLogin(index)}
                        className="text-xs font-medium text-red-700 hover:underline dark:text-red-400"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field label="Job portal website or hostname">
                        <Input
                          value={login.hostname}
                          onChange={updateJobPortalLogin(index, "hostname")}
                          placeholder="company.wd5.myworkdayjobs.com"
                          autoComplete="url"
                          spellCheck={false}
                        />
                      </Field>
                      <Field label="Login email">
                        <Input
                          type="email"
                          value={login.email}
                          onChange={updateJobPortalLogin(index, "email")}
                          placeholder="you@example.com"
                          autoComplete="username"
                          spellCheck={false}
                        />
                      </Field>
                      <Field label="Password">
                        <Input
                          type="password"
                          value={login.password}
                          onChange={updateJobPortalLogin(index, "password")}
                          minLength={8}
                          maxLength={256}
                          autoComplete="new-password"
                          data-sensitive="true"
                        />
                      </Field>
                      <Field label="Password (re-enter)">
                        <Input
                          type="password"
                          value={login.passwordConfirmation}
                          onChange={updateJobPortalLogin(
                            index,
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
                      Employer portals may require at least 8 characters,
                      uppercase, lowercase, a number, and a special character.
                      TrackMyOPT stores the password you provide; the employer
                      portal decides its actual password rules.
                    </p>
                  </div>
                ))}
              </div>
            )}
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
              I choose to save these optional credentials and sensitive answers
              so TrackMyOPT can show them to me for review before filling job
              applications. I can edit or delete them at any time.
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
