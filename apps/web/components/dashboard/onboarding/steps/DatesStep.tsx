import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { DateInput } from "../../opt-tools/DateInput";
import { JargonTooltip } from "@/components/ui/jargon-tooltip";
import type { JourneyStatus } from "../onboarding-types";

interface DatesStepProps {
  status: JourneyStatus;
  programEndDate: string;
  optStartDate: string;
  optEndDate: string;
  stemStartDate: string;
  onDateChange: (field: string, value: string) => void;
  isSaving: boolean;
  onBack: () => void;
  onSkipForNow: () => void;
  onNext: () => void;
  skipForNowClassName: string;
}

export function DatesStep({
  status,
  programEndDate,
  optStartDate,
  optEndDate,
  stemStartDate,
  onDateChange,
  isSaving,
  onBack,
  onSkipForNow,
  onNext,
  skipForNowClassName,
}: DatesStepProps) {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 flex-1 flex flex-col">
      <h2 className="text-2xl font-bold tracking-tight mb-2">Set your key dates</h2>
      <p className="text-muted-foreground mb-2">
        We use these dates to calculate your filing windows, OPT expiry, and unemployment day
        limits.
      </p>
      <p className="text-xs text-muted-foreground mb-6">
        You can always edit these later from the OPT Dates section if you don&apos;t have everything
        handy right now.
      </p>

      <div className="space-y-5 flex-1 overflow-y-auto pr-2 pb-4">
        {status === "applying_opt" && (
          <DateInput
            label="Program End Date"
            value={programEndDate}
            onChange={(v) => onDateChange("programEndDate", v)}
            description="The official end date on your I-20"
            required
          />
        )}

        {(status === "on_opt" || status === "stem_opt") && (
          <>
            <DateInput
              label={
                <span className="flex items-center gap-1">
                  <JargonTooltip term="OPT" showIcon={false} /> Start Date (From{" "}
                  <JargonTooltip term="EAD" showIcon={false} />)
                </span>
              }
              value={optStartDate}
              onChange={(v) => onDateChange("optStartDate", v)}
              description="The start date printed on your EAD card"
              required
            />
            <DateInput
              label={
                <span className="flex items-center gap-1">
                  <JargonTooltip term="OPT" showIcon={false} /> End Date
                </span>
              }
              value={optEndDate}
              onChange={(v) => onDateChange("optEndDate", v)}
              description="The expiration date on your EAD card"
            />
          </>
        )}

        {status === "stem_opt" && (
          <DateInput
            label={
              <span className="flex items-center gap-1">
                <JargonTooltip term="STEM OPT" showIcon={true}>
                  STEM Extension
                </JargonTooltip>{" "}
                Start Date
              </span>
            }
            value={stemStartDate}
            onChange={(v) => onDateChange("stemStartDate", v)}
            description="The start date of your 24-month extension"
            required
          />
        )}
      </div>

      <div className="pt-6 flex items-center justify-between mt-auto border-t">
        <div className="flex gap-3">
          <Button variant="ghost" onClick={onBack}>
            Back
          </Button>
          <button
            type="button"
            onClick={onSkipForNow}
            aria-label="Skip onboarding and continue to dashboard"
            className={skipForNowClassName}
          >
            Skip for now
          </button>
        </div>
        <Button onClick={onNext} disabled={isSaving} className="px-8">
          {isSaving ? "Saving..." : "Continue"}
          {!isSaving && <ChevronRight className="ml-2 w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}
