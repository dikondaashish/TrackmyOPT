import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowRight } from "lucide-react";

interface WelcomeStepProps {
  onNext: () => void;
  onSkipForNow: () => void;
  skipForNowClassName: string;
}

export function WelcomeStep({ onNext, onSkipForNow, skipForNowClassName }: WelcomeStepProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 flex-1 flex flex-col justify-center text-center space-y-6">
      <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/40 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <GraduationCap className="w-10 h-10" />
      </div>
      <h2 id="onboarding-wizard-title" className="text-3xl font-bold tracking-tight text-foreground">
        Welcome to TrackMyOPT
      </h2>
      <p className="text-lg text-muted-foreground max-w-sm mx-auto">
        Let&apos;s set up your profile so we can track your legal deadlines, countdowns, and
        unemployment days accurately.
      </p>
      <div className="pt-8 flex flex-col items-center gap-3">
        <Button size="lg" className="w-full sm:w-auto px-8 py-6 text-lg rounded-full" onClick={onNext}>
          Get Started <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
        <button
          type="button"
          onClick={onSkipForNow}
          className={skipForNowClassName}
          aria-label="Skip onboarding for now"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
