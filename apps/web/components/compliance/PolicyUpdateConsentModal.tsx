"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { POLICY_CONSENT_LINKS } from "@/lib/compliance/policy-consent";
import { Loader2 } from "lucide-react";

type PendingPolicy = {
  type: string;
  version: string;
  changeSummary?: string | null;
  effectiveDate?: string | null;
};

export function PolicyUpdateConsentModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingPolicies, setPendingPolicies] = useState<PendingPolicy[]>([]);
  const agreeButtonRef = useRef<HTMLButtonElement>(null);

  const checkConsent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/policy/consent", { credentials: "include" });
      if (res.status === 401) {
        setOpen(false);
        return;
      }
      if (!res.ok) {
        setOpen(false);
        return;
      }
      const data = await res.json();
      if (data.requiresConsent && Array.isArray(data.policies) && data.policies.length > 0) {
        setPendingPolicies(data.policies);
        setOpen(true);
      } else {
        setPendingPolicies([]);
        setOpen(false);
      }
    } catch {
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void checkConsent();
  }, [checkConsent]);

  useEffect(() => {
    if (open) {
      const t = window.setTimeout(() => agreeButtonRef.current?.focus(), 100);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  const handleAgree = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/policy/consent", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          acceptAllRequired: true,
          consentMethod: "modal",
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(
          typeof data.error === "string"
            ? data.error
            : "We could not save your consent. Please try again."
        );
        return;
      }

      setOpen(false);
      setPendingPolicies([]);
    } catch {
      setError("We could not save your consent. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !open) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && pendingPolicies.length > 0 ? undefined : setOpen(next)}>
      <DialogContent
        className="max-w-lg max-h-[90vh] overflow-y-auto p-6"
        aria-labelledby="policy-consent-title"
        aria-describedby="policy-consent-description"
        onClose={pendingPolicies.length > 0 ? undefined : () => setOpen(false)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle id="policy-consent-title">We updated our policies</DialogTitle>
          <div className="space-y-3 text-sm text-muted-foreground pt-1" id="policy-consent-description">
              <p>
                We updated our Privacy Policy, Terms, Cookie Policy, Disclaimer, Security notices,
                and related legal notices. These updates clarify USCIS Case Status API wording,
                TrackMyOPT&apos;s independent/non-government status, data handling, breach notice,
                dormant account handling, analytics opt-out, and payment/security language. Your
                plan price, trial period, refund window, and cancellation rights did not change.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                {POLICY_CONSENT_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-primary underline underline-offset-2 font-medium"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              {pendingPolicies.length > 0 && (
                <p className="text-xs">
                  Required acknowledgments:{" "}
                  {pendingPolicies.map((p) => p.type.replace(/_/g, " ")).join(", ")}.
                </p>
              )}
          </div>
        </DialogHeader>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href="/privacy" target="_blank" rel="noopener noreferrer">
              Review policies
            </Link>
          </Button>
          <Button
            ref={agreeButtonRef}
            className="w-full sm:w-auto"
            onClick={() => void handleAgree()}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                Saving…
              </>
            ) : (
              "I agree"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
