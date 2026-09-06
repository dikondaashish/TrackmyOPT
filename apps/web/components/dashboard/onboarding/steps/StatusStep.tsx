import { Button } from "@/components/ui/button";
import { GraduationCap, Briefcase, Calendar, ChevronRight } from "lucide-react";
import type { JourneyStatus } from "../onboarding-types";

const STATUS_OPTIONS = [
  {
    id: "applying_opt" as const,
    icon: Calendar,
    title: "I am applying for OPT soon",
    desc: "Just graduated or graduating soon. I need help tracking application deadlines.",
  },
  {
    id: "on_opt" as const,
    icon: Briefcase,
    title: "I am currently on OPT",
    desc: "My OPT has started and I need to track unemployment days.",
  },
  {
    id: "stem_opt" as const,
    icon: GraduationCap,
    title: "I am on STEM OPT",
    desc: "I'm on a 24-month extension and need to track I-983 reviews.",
  },
];

interface StatusStepProps {
  status: JourneyStatus;
  onStatusChange: (status: JourneyStatus) => void;
  onBack: () => void;
  onSkipForNow: () => void;
  onNext: () => void;
  skipForNowClassName: string;
}

export function StatusStep({
  status,
  onStatusChange,
  onBack,
  onSkipForNow,
  onNext,
  skipForNowClassName,
}: StatusStepProps) {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 flex-1 flex flex-col">
      <h2 className="text-2xl font-bold tracking-tight mb-2">Where are you in your journey?</h2>
      <p className="text-muted-foreground mb-8">This helps us customize your dashboard widgets.</p>

      <div className="space-y-3 flex-1">
        {STATUS_OPTIONS.map((option) => (
          <button
            key={option.id}
            onClick={() => onStatusChange(option.id)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-start gap-4 ${
              status === option.id
                ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                : "border-muted hover:border-gray-300 dark:hover:border-gray-700 bg-card"
            }`}
          >
            <div
              className={`p-2 rounded-lg ${
                status === option.id
                  ? "bg-blue-600 text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <option.icon className="w-5 h-5" />
            </div>
            <div>
              <h4
                className={`font-semibold ${
                  status === option.id
                    ? "text-blue-900 dark:text-blue-100"
                    : "text-foreground"
                }`}
              >
                {option.title}
              </h4>
              <p className="text-sm text-muted-foreground mt-0.5">{option.desc}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="pt-6 flex justify-between mt-auto">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <Button variant="ghost" onClick={onBack}>
            Back
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
        <Button onClick={onNext} disabled={!status} className="px-8">
          Continue <ChevronRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
