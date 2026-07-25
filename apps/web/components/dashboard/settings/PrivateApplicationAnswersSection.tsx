"use client";

import { useEffect, useState } from "react";
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
  visaStatus: string;
  citizenship: string;
  salaryExpectation: string;
  dateOfBirth: string;
  sexGender: string;
  hispanicLatino: string;
  raceEthnicity: string;
  veteranStatus: string;
  disabilityStatus: string;
  eeoPreference: string;
}

const EMPTY: PrivateAnswersForm = {
  workAuthorization: "",
  requiresSponsorship: "",
  visaStatus: "",
  citizenship: "",
  salaryExpectation: "",
  dateOfBirth: "",
  sexGender: "",
  hispanicLatino: "",
  raceEthnicity: "",
  veteranStatus: "",
  disabilityStatus: "",
  eeoPreference: "",
};

function asForm(value: unknown): PrivateAnswersForm {
  if (!value || typeof value !== "object" || Array.isArray(value)) return EMPTY;
  const data = value as Record<string, unknown>;
  const read = (key: keyof PrivateAnswersForm) =>
    typeof data[key] === "string" ? data[key] : "";
  return {
    workAuthorization: read("workAuthorization"),
    requiresSponsorship: read("requiresSponsorship"),
    visaStatus: read("visaStatus"),
    citizenship: read("citizenship"),
    salaryExpectation: read("salaryExpectation"),
    dateOfBirth: read("dateOfBirth"),
    sexGender: read("sexGender"),
    hispanicLatino: read("hispanicLatino"),
    raceEthnicity: read("raceEthnicity"),
    veteranStatus: read("veteranStatus"),
    disabilityStatus: read("disabilityStatus"),
    eeoPreference: read("eeoPreference"),
  };
}

export function PrivateApplicationAnswersSection() {
  const [form, setForm] = useState<PrivateAnswersForm>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [consent, setConsent] = useState(false);
  const [hasSavedAnswers, setHasSavedAnswers] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await fetch("/api/private-application-answers", {
          credentials: "include",
          cache: "no-store",
        });
        const body = await response.json().catch(() => ({}));
        if (!active) return;
        if (!response.ok) {
          setError(
            body?.error || "Private answers are temporarily unavailable."
          );
          return;
        }
        if (body?.data) {
          setForm(asForm(body.data));
          setHasSavedAnswers(true);
        }
      } catch {
        if (active) {
          setError("Could not load private answers. Please try again.");
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const update =
    (key: keyof PrivateAnswersForm) =>
    (
      event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
      setForm((previous) => ({ ...previous, [key]: event.target.value }));
      setSuccess(null);
      setError(null);
    };

  const save = async () => {
    if (!consent) {
      setError("Please confirm the privacy notice before saving.");
      return;
    }
    setSaving(true);
    setSuccess(null);
    setError(null);
    try {
      const response = await fetch("/api/private-application-answers", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, consent: true }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(
          body?.error || "Could not save your private application answers."
        );
        return;
      }
      setForm(asForm(body.data));
      setHasSavedAnswers(true);
      setConsent(false);
      setSuccess(
        "Private answers saved. The extension will still ask you to review them for each application."
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
        "Delete every saved private application answer? This cannot be undone."
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
        Optional answers for work authorization, visa, sponsorship, salary,
        date of birth, and EEO questions. They are protected with authenticated
        encryption and are never sent to AI or analytics.
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
          onClick={() => setRevealed(true)}
          className="h-10"
        >
          <Eye className="mr-2 h-4 w-4" />
          {hasSavedAnswers ? "Review private answers" : "Add private answers"}
        </Button>
      ) : (
        <div className="space-y-5">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setRevealed(false)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              <EyeOff className="h-4 w-4" /> Hide answers
            </button>
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
            <Field label="Visa / immigration status">
              <Input
                value={form.visaStatus}
                onChange={update("visaStatus")}
                placeholder="Example: F-1 OPT"
                autoComplete="off"
              />
            </Field>
            <Field label="Citizenship">
              <Input
                value={form.citizenship}
                onChange={update("citizenship")}
                placeholder="Exact answer to use"
                autoComplete="off"
              />
            </Field>
            <Field label="Salary expectation">
              <Input
                value={form.salaryExpectation}
                onChange={update("salaryExpectation")}
                placeholder="Example: $120,000 or Negotiable"
                autoComplete="off"
              />
            </Field>
            <Field label="Date of birth">
              <Input
                type="date"
                value={form.dateOfBirth}
                onChange={update("dateOfBirth")}
                autoComplete="bday"
              />
            </Field>
            <SelectField
              label="Sex / gender"
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
              label="Race / ethnicity"
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
              label="Veteran status"
              value={form.veteranStatus}
              onChange={update("veteranStatus")}
              options={[
                ["not_protected_veteran", "Not a protected veteran"],
                ["protected_veteran", "Protected veteran"],
                ["prefer_not_to_answer", "Prefer not to answer"],
              ]}
            />
            <SelectField
              label="Disability status"
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
              I choose to save these optional sensitive answers so TrackMyOPT
              can show them to me for review before filling job applications. I
              can edit or delete them at any time.
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
