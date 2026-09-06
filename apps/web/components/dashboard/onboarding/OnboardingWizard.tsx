"use client";

import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/useToast";
import {
  captureOnboardingReceiptPromptShown,
  captureOnboardingReceiptSkipped,
  captureCaseStatusCheckCompletedClient,
  captureOnboardingStepViewed,
  captureOnboardingStepCompleted,
  captureOnboardingSkipped,
  captureOnboardingCompleted,
  type OnboardingWizardStep,
} from "@/lib/posthog-client";
import { useOnboardingReceiptVariant } from "@/hooks/useOnboardingReceiptVariant";
import {
  isReceiptStepSkippable,
  shouldDeferReceiptStep,
} from "@/lib/posthog/onboarding-receipt-variant";
import { saveReceiptAndPoll, type CaseStatusRecord } from "@/lib/case-status/save-receipt-and-poll";
import {
  DEFAULT_FILING_CATEGORY,
  filingCategoryFromJourneyStatus,
  type FilingCategory,
} from "@/lib/case-status/filing-category";
import { validateReceiptNumber } from "@/lib/uscis/receipt-number-validation";
import { getReceiptPrefix } from "@/lib/posthog/uscis-status-category";
import { requestNpsSurvey } from "@/lib/posthog/nps-survey";
import { checkStemEligibility } from "./onboarding-majors";
import type { JourneyStatus, WizardStep } from "./onboarding-types";
import { WelcomeStep } from "./steps/WelcomeStep";
import { CourseStep } from "./steps/CourseStep";
import { StatusStep } from "./steps/StatusStep";
import { DatesStep } from "./steps/DatesStep";
import { ReceiptStep } from "./steps/ReceiptStep";
import { FinishingStep } from "./steps/FinishingStep";

interface OnboardingWizardProps {
  isOpen: boolean;
  /** Called after dates are saved successfully (may reload dashboard). */
  onComplete: () => void;
  /** Called when user skips without saving — must not full-reload or wizard reopens with no opt_status. */
  onSkip?: () => void;
}

export function OnboardingWizard({ isOpen, onComplete, onSkip }: OnboardingWizardProps) {
  const { toast } = useToast();
  const { variant: receiptVariant } = useOnboardingReceiptVariant(isOpen);

  const [step, setStep] = useState<WizardStep>("welcome");
  const [status, setStatus] = useState<JourneyStatus>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Education state
  const [degreeLevel, setDegreeLevel] = useState<string>("Master's");
  const [majorName, setMajorName] = useState<string>("");
  const [isStemEligible, setIsStemEligible] = useState<boolean>(false);

  // Date states
  const [programEndDate, setProgramEndDate] = useState("");
  const [optStartDate, setOptStartDate] = useState("");
  const [optEndDate, setOptEndDate] = useState("");
  const [stemStartDate, setStemStartDate] = useState("");

  // Receipt step
  const [receiptNumber, setReceiptNumber] = useState("");
  const [filingCategory, setFilingCategory] = useState<FilingCategory>(DEFAULT_FILING_CATEGORY);
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const [isReceiptSaving, setIsReceiptSaving] = useState(false);
  const [savedCaseStatus, setSavedCaseStatus] = useState<CaseStatusRecord | null>(null);
  const [receiptStatusPending, setReceiptStatusPending] = useState(false);

  const onboardingTrackedRef = useRef(false);
  const receiptPromptTrackedRef = useRef(false);
  const receiptSkipTrackedRef = useRef(false);

  const handleMajorChange = (val: string) => {
    setMajorName(val);
    setIsStemEligible(checkStemEligibility(val));
  };

  const handleNext = () => {
    if (step === "welcome") {
      captureOnboardingStepCompleted({ step: "welcome" });
      setStep("course");
    } else if (step === "course") {
      if (!majorName.trim()) {
        toast({ title: "Please enter your major", variant: "destructive" });
        return;
      }
      captureOnboardingStepCompleted({ step: "course" });
      setStep("status");
    } else if (step === "status") {
      if (!status) {
        toast({ title: "Please select an option", variant: "destructive" });
        return;
      }
      captureOnboardingStepCompleted({ step: "status" });
      setStep("dates");
    } else if (step === "dates") {
      handleSaveDates();
    }
  };

  useEffect(() => {
    if (!isOpen || step === "finishing") return;
    captureOnboardingStepViewed({ step: step as OnboardingWizardStep });
  }, [isOpen, step]);

  useEffect(() => {
    if (step !== "receipt" || receiptPromptTrackedRef.current) return;
    receiptPromptTrackedRef.current = true;
    captureOnboardingReceiptPromptShown();
  }, [step]);

  const skipForNowClassName =
    "text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2";

  const handleSkipForNow = async () => {
    captureOnboardingSkipped({ step: step as OnboardingWizardStep });
    if (!markOnboardingTrackedOnce()) {
      (onSkip ?? onComplete)();
      return;
    }
    try {
      const saved = await persistOnboardingFlags(true);
      if (!saved) {
        onboardingTrackedRef.current = false;
        toast({
          title: "Could not save onboarding",
          description: "Please try again or refresh the page.",
          variant: "destructive",
        });
        return;
      }
    } catch {
      onboardingTrackedRef.current = false;
      toast({
        title: "Could not save onboarding",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
      return;
    }
    (onSkip ?? onComplete)();
  };

  const calculateAutoDates = (field: string, value: string) => {
    // If OPT start is filled, we can auto-suggest OPT End
    if (field === "optStartDate" && value) {
      setOptStartDate(value);
      const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
      if (dateRegex.test(value)) {
        const parts = value.split("/");
        const date = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
        date.setDate(date.getDate() + 364);

        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        const yy = date.getFullYear();
        setOptEndDate(`${mm}/${dd}/${yy}`);
      }
    } else {
      if (field === "programEndDate") setProgramEndDate(value);
      if (field === "optEndDate") setOptEndDate(value);
      if (field === "stemStartDate") setStemStartDate(value);
    }
  };

  const buildOnboardingFlagsBody = (skipped: boolean) => ({
    onboarding_completed: true,
    skipped,
    onboarding_status: status,
    is_stem_eligible: isStemEligible,
    degree_level: degreeLevel,
  });

  const markOnboardingTrackedOnce = (): boolean => {
    if (onboardingTrackedRef.current) return false;
    onboardingTrackedRef.current = true;
    return true;
  };

  const persistOnboardingFlags = async (skipped: boolean): Promise<boolean> => {
    const response = await fetch("/api/profile/flags", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildOnboardingFlagsBody(skipped)),
    });

    if (response.ok) {
      // Terminal funnel event. Reported here rather than in the three exit
      // paths that call this so it fires from all of them, exactly once (each
      // caller is already behind markOnboardingTrackedOnce), and only once the
      // flags have actually persisted — a failed save is not a completion.
      // `skipped` separates "finished the wizard" from "dismissed it", mirroring
      // the flags we just wrote.
      captureOnboardingCompleted({
        skipped,
        status,
        is_stem_eligible: isStemEligible,
        degree_level: degreeLevel,
      });
    }

    return response.ok;
  };

  const finishOnboarding = async (skipped: boolean) => {
    if (!markOnboardingTrackedOnce()) {
      onComplete();
      return;
    }
    try {
      const saved = await persistOnboardingFlags(skipped);
      if (!saved) {
        onboardingTrackedRef.current = false;
        toast({
          title: "Could not save onboarding",
          description: "Please try again or refresh the page.",
          variant: "destructive",
        });
        return;
      }
    } catch {
      onboardingTrackedRef.current = false;
      toast({
        title: "Could not save onboarding",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
      return;
    }
    if (!skipped) {
      toast({
        title: "Profile Configured!",
        description: "Your dashboard is now customized for your journey.",
        className: "bg-green-50 border-green-200",
      });
    }
    onComplete();
  };

  const handleSaveDates = async () => {
    // Requires at least one date or basic validation based on status
    if (status === "applying_opt" && !programEndDate) {
      toast({ title: "Program End Date is required", variant: "destructive" });
      return;
    }
    if ((status === "on_opt" || status === "stem_opt") && !optStartDate) {
      toast({ title: "OPT Start Date is required", variant: "destructive" });
      return;
    }
    // ISS-005: STEM users must provide STEM start date
    if (status === "stem_opt" && !stemStartDate) {
      toast({
        title: "STEM Start Date is required",
        description:
          "Your STEM clock and reminders won't work without it. Add the date from your STEM OPT EAD.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);

      const payload = {
        degree_level: degreeLevel,
        major_name: majorName.trim(),
        is_stem_eligible: isStemEligible,
        program_end_date: programEndDate || null,
        opt_start_date: optStartDate || null,
        opt_ead_end_date: optEndDate || null,
        stem_start_date: stemStartDate || null,
      };

      const response = await fetch("/api/opt/calculator", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.ok) {
        captureOnboardingStepCompleted({ step: "dates" });
        if (shouldDeferReceiptStep(receiptVariant)) {
          setStep("finishing");
          await finishOnboarding(false);
          return;
        }
        setFilingCategory(filingCategoryFromJourneyStatus(status));
        setStep("receipt");
      } else {
        throw new Error(result.error || "Failed to save dates");
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      setStep("dates");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReceiptSave = async () => {
    setReceiptError(null);

    const validation = validateReceiptNumber(receiptNumber, { strictPrefix: true });
    if (!validation.valid) {
      setReceiptError(validation.error);
      return;
    }

    try {
      setIsReceiptSaving(true);
      setReceiptStatusPending(true);
      const saveResult = await saveReceiptAndPoll(validation.normalized, {
        filingCategory,
      });

      if (!saveResult.ok) {
        if (saveResult.code === "case_limit_reached") {
          setReceiptError(
            "Your free plan includes 1 case. Upgrade to Pro to track up to 8 USCIS receipts from the dashboard."
          );
        } else {
          setReceiptError(saveResult.error);
        }
        return;
      }

      setSavedCaseStatus(saveResult.data);
      captureOnboardingStepCompleted({ step: "receipt" });
      if (saveResult.statusResolved) {
        captureCaseStatusCheckCompletedClient({
          trigger: "initial",
          receipt_prefix: getReceiptPrefix(validation.normalized),
        });
        requestNpsSurvey({
          trigger: "case_status_first_success",
          planTier: "free",
        });
      }
      if (!saveResult.statusResolved) {
        setReceiptError(
          "Status check is taking longer than expected. Your receipt is saved — we'll update it shortly."
        );
      }
    } catch {
      setReceiptError("An error occurred while saving your receipt. Please try again.");
    } finally {
      setIsReceiptSaving(false);
      setReceiptStatusPending(false);
    }
  };

  const handleReceiptSkip = async () => {
    trackReceiptSkipped("explicit_skip");
    setStep("finishing");
    await finishOnboarding(false);
  };

  const handleReceiptFinish = async () => {
    setStep("finishing");
    await finishOnboarding(false);
  };

  const trackReceiptSkipped = (
    skipReason: "explicit_skip" | "wizard_dismissed" = "explicit_skip"
  ) => {
    if (receiptSkipTrackedRef.current) return;
    receiptSkipTrackedRef.current = true;
    const trimmed = receiptNumber.trim().toUpperCase();
    captureOnboardingReceiptSkipped({
      receipt_prefix: trimmed.length >= 3 ? getReceiptPrefix(trimmed) : null,
      skip_reason: skipReason,
    });
  };

  // ISS-006: explicit "skip with checklist" — mark onboarding dismissed server-side so the
  // wizard doesn't reappear, but DO NOT mark as completed. Dashboard will show a checklist
  // nudge instead.
  const handleSkip = async () => {
    if (step === "receipt" && !isReceiptStepSkippable(receiptVariant)) {
      toast({
        title: "Receipt required to continue",
        description:
          "Add your USCIS receipt number to finish setup. You can find it on your I-797 notice.",
        variant: "destructive",
      });
      return;
    }

    // Avoid duplicate skip events when finishOnboarding closes the dialog after explicit skip.
    if (
      step === "receipt" &&
      !onboardingTrackedRef.current &&
      !receiptSkipTrackedRef.current
    ) {
      trackReceiptSkipped("wizard_dismissed");
    }
    if (!markOnboardingTrackedOnce()) return;
    try {
      const saved = await persistOnboardingFlags(true);
      if (!saved) {
        onboardingTrackedRef.current = false;
        return;
      }
    } catch {
      onboardingTrackedRef.current = false;
      return;
    }
    (onSkip ?? onComplete)();
  };

  const progressWidth =
    step === "welcome"
      ? "w-1/6"
      : step === "course"
        ? "w-2/6"
        : step === "status"
          ? "w-3/6"
          : step === "dates"
            ? "w-4/6"
            : step === "receipt"
              ? "w-5/6"
              : "w-full";

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        // ISS-007: keyboard-accessible dismiss path. Closing the dialog
        // (Escape, outside click) routes through handleSkip so users are never
        // trapped — wizard returns to checklist nudge instead.
        if (!open) {
          handleSkip();
        }
      }}
    >
      <DialogContent
        className="sm:max-w-[600px] p-0 overflow-hidden bg-background border-none shadow-2xl [&>button]:hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-wizard-title"
      >
        {/* Header Progress */}
        <div className="h-1.5 w-full bg-muted flex">
          <div className={`h-full bg-blue-600 transition-all duration-500 ${progressWidth}`} />
        </div>

        <div className="p-8 sm:p-10 min-h-[460px] flex flex-col">
          {step === "welcome" && (
            <WelcomeStep
              onNext={handleNext}
              onSkipForNow={handleSkipForNow}
              skipForNowClassName={skipForNowClassName}
            />
          )}

          {step === "course" && (
            <CourseStep
              degreeLevel={degreeLevel}
              onDegreeLevelChange={setDegreeLevel}
              majorName={majorName}
              onMajorChange={handleMajorChange}
              isStemEligible={isStemEligible}
              onBack={() => setStep("welcome")}
              onSkipForNow={handleSkipForNow}
              onNext={handleNext}
              skipForNowClassName={skipForNowClassName}
            />
          )}

          {step === "status" && (
            <StatusStep
              status={status}
              onStatusChange={setStatus}
              onBack={() => setStep("course")}
              onSkipForNow={handleSkipForNow}
              onNext={handleNext}
              skipForNowClassName={skipForNowClassName}
            />
          )}

          {step === "dates" && (
            <DatesStep
              status={status}
              programEndDate={programEndDate}
              optStartDate={optStartDate}
              optEndDate={optEndDate}
              stemStartDate={stemStartDate}
              onDateChange={calculateAutoDates}
              isSaving={isSaving}
              onBack={() => setStep("status")}
              onSkipForNow={handleSkipForNow}
              onNext={handleNext}
              skipForNowClassName={skipForNowClassName}
            />
          )}

          {step === "receipt" && (
            <ReceiptStep
              filingCategory={filingCategory}
              onFilingCategoryChange={setFilingCategory}
              receiptNumber={receiptNumber}
              onReceiptNumberChange={setReceiptNumber}
              receiptError={receiptError}
              clearReceiptError={() => setReceiptError(null)}
              isReceiptSaving={isReceiptSaving}
              receiptStatusPending={receiptStatusPending}
              savedCaseStatus={savedCaseStatus}
              receiptVariant={receiptVariant}
              onBack={() => setStep("dates")}
              onReceiptSkip={handleReceiptSkip}
              onSkipForNow={handleSkipForNow}
              onReceiptFinish={handleReceiptFinish}
              onReceiptSave={handleReceiptSave}
              skipForNowClassName={skipForNowClassName}
            />
          )}

          {step === "finishing" && <FinishingStep />}
        </div>
      </DialogContent>
    </Dialog>
  );
}
