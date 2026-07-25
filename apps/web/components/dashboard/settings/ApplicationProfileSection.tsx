"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Check, AlertCircle, ClipboardList } from "lucide-react";

/**
 * General application profile data used by the Chrome extension to prefill job
 * applications (LinkedIn Easy Apply + ATS). Sensitive optional answers are
 * intentionally isolated in PrivateApplicationAnswersSection.
 */

interface FormState {
  phone: string;
  city: string;
  state: string;
  yearsExperience: string;
  linkedinUrl: string;
  portfolioUrl: string;
}

const EMPTY: FormState = {
  phone: "",
  city: "",
  state: "",
  yearsExperience: "",
  linkedinUrl: "",
  portfolioUrl: "",
};

export function ApplicationProfileSection() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/application-profile", { credentials: "include" });
        if (!res.ok) return;
        const json = await res.json();
        const d = json?.data;
        if (active && d) {
          setForm({
            phone: d.phone ?? "",
            city: d.city ?? "",
            state: d.state ?? "",
            yearsExperience: d.years_experience != null ? String(d.years_experience) : "",
            linkedinUrl: d.linkedin_url ?? "",
            portfolioUrl: d.portfolio_url ?? "",
          });
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const update = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    setSuccess(null);
    setError(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(null);
    setError(null);
    try {
      const res = await fetch("/api/application-profile", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: form.phone,
          city: form.city,
          state: form.state,
          years_experience: form.yearsExperience,
          linkedin_url: form.linkedinUrl,
          portfolio_url: form.portfolioUrl,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.ok === false) {
        setError(json?.error || "Could not save. Check your entries and try again.");
        return;
      }
      setSuccess("Application profile saved.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-8 rounded-xl border border-gray-200 dark:border-gray-800 p-5 sm:p-6">
      <div className="flex items-center gap-3 mb-1">
        <ClipboardList className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-base font-semibold">Application profile</h3>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
        General contact details used to prefill your job applications in the
        TrackMyOPT extension. Optional sensitive answers are managed separately
        below.
      </p>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading…
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Phone">
              <Input value={form.phone} onChange={update("phone")} placeholder="+1 555 123 4567" inputMode="tel" />
            </Field>
            <Field label="Years of experience">
              <Input
                value={form.yearsExperience}
                onChange={update("yearsExperience")}
                placeholder="3"
                inputMode="numeric"
              />
            </Field>
            <Field label="City">
              <Input value={form.city} onChange={update("city")} placeholder="San Francisco" />
            </Field>
            <Field label="State">
              <Input value={form.state} onChange={update("state")} placeholder="CA" />
            </Field>
            <Field label="LinkedIn URL">
              <Input value={form.linkedinUrl} onChange={update("linkedinUrl")} placeholder="https://linkedin.com/in/…" />
            </Field>
            <Field label="Portfolio / website URL">
              <Input value={form.portfolioUrl} onChange={update("portfolioUrl")} placeholder="https://…" />
            </Field>
          </div>

          {success && (
            <p className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <Check className="w-4 h-4" /> {success}
            </p>
          )}
          {error && (
            <p className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4" /> {error}
            </p>
          )}

          <Button onClick={handleSave} disabled={saving} className="h-10">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…
              </>
            ) : (
              "Save application profile"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1.5">{label}</span>
      {children}
    </label>
  );
}
