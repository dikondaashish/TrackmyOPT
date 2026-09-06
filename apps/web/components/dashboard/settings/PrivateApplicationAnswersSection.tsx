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
import { DefaultJobPortalLoginPanel } from "./DefaultJobPortalLoginPanel";
import {
  PrivateAnswersField,
  PrivateAnswersSelectField,
} from "./PrivateAnswersField";
import {
  EMPTY_PRIVATE_ANSWERS_FORM,
  asPrivateAnswersForm,
  legacyJobPortalLoginsFrom,
  type DefaultJobPortalLoginForm,
  type LegacyJobPortalLogin,
  type PrivateAnswersForm,
} from "./private-application-answers-form";

export function PrivateApplicationAnswersSection() {
  const [form, setForm] = useState<PrivateAnswersForm>(EMPTY_PRIVATE_ANSWERS_FORM);
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
  const decryptedFormRef = useRef<PrivateAnswersForm>(EMPTY_PRIVATE_ANSWERS_FORM);
  const decryptedLegacyLoginsRef = useRef<LegacyJobPortalLogin[]>([]);
  const plaintextAllowedRef = useRef(false);

  useEffect(() => {
    decryptedFormRef.current = form;
  }, [form]);

  useEffect(() => {
    return () => {
      reviewAbortRef.current?.abort();
      reviewAbortRef.current = null;
      decryptedFormRef.current = EMPTY_PRIVATE_ANSWERS_FORM;
      decryptedLegacyLoginsRef.current = [];
      plaintextAllowedRef.current = false;
    };
  }, []);

  const clearDecryptedAnswers = useCallback(() => {
    reviewAbortRef.current?.abort();
    reviewAbortRef.current = null;
    decryptedFormRef.current = EMPTY_PRIVATE_ANSWERS_FORM;
    decryptedLegacyLoginsRef.current = [];
    plaintextAllowedRef.current = false;
    setForm(EMPTY_PRIVATE_ANSWERS_FORM);
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
      const nextForm = body?.data ? asPrivateAnswersForm(body.data) : EMPTY_PRIVATE_ANSWERS_FORM;
      const legacyLogins = body?.data ? legacyJobPortalLoginsFrom(body.data) : [];
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
      const savedForm = asPrivateAnswersForm(body.data);
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
      setForm(EMPTY_PRIVATE_ANSWERS_FORM);
      decryptedFormRef.current = EMPTY_PRIVATE_ANSWERS_FORM;
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

          <DefaultJobPortalLoginPanel
            login={form.defaultJobPortalLogin}
            legacyJobPortalLogins={legacyJobPortalLogins}
            onUpdate={updateDefaultJobPortalLogin}
            onChooseLegacy={chooseLegacyJobPortalLogin}
            onDiscardLegacy={discardLegacyJobPortalLogins}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <PrivateAnswersSelectField
              label="Authorized to work in the U.S.?"
              value={form.workAuthorization}
              onChange={update("workAuthorization")}
              options={[
                ["yes", "Yes"],
                ["no", "No"],
              ]}
            />
            <PrivateAnswersSelectField
              label="Need sponsorship now or later?"
              value={form.requiresSponsorship}
              onChange={update("requiresSponsorship")}
              options={[
                ["yes", "Yes"],
                ["no", "No"],
              ]}
            />
            <PrivateAnswersSelectField
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
              <PrivateAnswersField label="Other visa / work status">
                <Input
                  value={form.visaOther}
                  onChange={update("visaOther")}
                  placeholder="Enter the exact status"
                  autoComplete="off"
                />
              </PrivateAnswersField>
            )}
            <PrivateAnswersField label="Citizenship">
              <Input
                value={form.citizenship}
                onChange={update("citizenship")}
                placeholder="Exact answer to use"
                autoComplete="off"
              />
            </PrivateAnswersField>
            <PrivateAnswersField label="Expected annual salary">
              <Input
                value={form.expectedAnnualSalary}
                onChange={update("expectedAnnualSalary")}
                placeholder="Example: $120,000"
                inputMode="decimal"
                autoComplete="off"
              />
            </PrivateAnswersField>
            <PrivateAnswersField label="Expected hourly rate">
              <Input
                value={form.expectedHourlyRate}
                onChange={update("expectedHourlyRate")}
                placeholder="Example: $58"
                inputMode="decimal"
                autoComplete="off"
              />
            </PrivateAnswersField>
            <PrivateAnswersSelectField
              label="Can work in-person?"
              value={form.canWorkInPerson}
              onChange={update("canWorkInPerson")}
              options={[["yes", "Yes"], ["no", "No"]]}
            />
            <PrivateAnswersSelectField
              label="Willing to relocate?"
              value={form.willingToRelocate}
              onChange={update("willingToRelocate")}
              options={[["yes", "Yes"], ["no", "No"]]}
            />
            <PrivateAnswersSelectField
              label="Can start immediately?"
              value={form.canStartImmediately}
              onChange={update("canStartImmediately")}
              options={[["yes", "Yes"], ["no", "No"]]}
            />
            <PrivateAnswersSelectField
              label="Has reliable transportation?"
              value={form.reliableTransportation}
              onChange={update("reliableTransportation")}
              options={[["yes", "Yes"], ["no", "No"]]}
            />
            <PrivateAnswersSelectField
              label="Needs accommodations?"
              value={form.needsAccommodations}
              onChange={update("needsAccommodations")}
              options={[["yes", "Yes"], ["no", "No"]]}
            />
            <PrivateAnswersField label="Date of birth">
              <Input
                type="date"
                value={form.dateOfBirth}
                onChange={update("dateOfBirth")}
                autoComplete="bday"
              />
            </PrivateAnswersField>
            <PrivateAnswersSelectField
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
            <PrivateAnswersSelectField
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
            <PrivateAnswersSelectField
              label="Hispanic or Latino?"
              value={form.hispanicLatino}
              onChange={update("hispanicLatino")}
              options={[
                ["yes", "Yes"],
                ["no", "No"],
                ["prefer_not_to_answer", "Prefer not to answer"],
              ]}
            />
            <PrivateAnswersSelectField
              label="Veteran (optional)"
              value={form.veteranStatus}
              onChange={update("veteranStatus")}
              options={[
                ["not_protected_veteran", "Not a protected veteran"],
                ["protected_veteran", "Protected veteran"],
                ["prefer_not_to_answer", "Prefer not to answer"],
              ]}
            />
            <PrivateAnswersSelectField
              label="Has disability (optional)"
              value={form.disabilityStatus}
              onChange={update("disabilityStatus")}
              options={[
                ["yes", "Yes"],
                ["no", "No"],
                ["prefer_not_to_answer", "Prefer not to answer"],
              ]}
            />
            <PrivateAnswersSelectField
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
