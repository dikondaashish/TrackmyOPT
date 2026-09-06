"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GraduationCap, ChevronRight, CheckCircle2 } from "lucide-react";
import { filterMajors } from "../onboarding-majors";

interface CourseStepProps {
  degreeLevel: string;
  onDegreeLevelChange: (level: string) => void;
  majorName: string;
  onMajorChange: (val: string) => void;
  isStemEligible: boolean;
  onBack: () => void;
  onSkipForNow: () => void;
  onNext: () => void;
  skipForNowClassName: string;
}

export function CourseStep({
  degreeLevel,
  onDegreeLevelChange,
  majorName,
  onMajorChange,
  isStemEligible,
  onBack,
  onSkipForNow,
  onNext,
  skipForNowClassName,
}: CourseStepProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const filteredMajors = filterMajors(majorName);

  return (
    <div className="animate-in fade-in slide-in-from-right-4 flex-1 flex flex-col">
      <h2 className="text-2xl font-bold tracking-tight mb-2">What did you study?</h2>
      <p className="text-muted-foreground mb-4">
        This helps us determine if you are eligible for the 24-month STEM OPT extension.
      </p>

      <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-lg p-3 flex gap-3 text-sm text-blue-800 dark:text-blue-300 mb-6">
        <div className="mt-0.5">
          <GraduationCap className="h-4 w-4" />
        </div>
        <div>
          <span className="font-semibold">Tip:</span> Your official STEM eligibility is based on
          the <strong>CIP Code</strong> printed on your Form I-20 under &quot;Program of Study&quot;.
        </div>
      </div>

      <div className="space-y-6 flex-1">
        <div className="space-y-3">
          <label className="text-sm font-medium">Degree Level</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {["Associate", "Bachelor's", "Master's", "Doctorate"].map((level) => (
              <button
                key={level}
                onClick={() => onDegreeLevelChange(level)}
                className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                  degreeLevel === level
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-card hover:bg-muted border-border"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 relative">
          <label className="text-sm font-medium">Major / Course Name</label>
          <input
            type="text"
            value={majorName}
            onChange={(e) => {
              onMajorChange(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            placeholder="e.g. Computer Science, Mechanical Engineering..."
            className="w-full p-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-blue-600 outline-none"
          />

          {showDropdown && filteredMajors.length > 0 && (
            <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {filteredMajors.map((major) => (
                <li
                  key={major}
                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm text-foreground transition-colors"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onMajorChange(major);
                    setShowDropdown(false);
                  }}
                >
                  {major}
                </li>
              ))}
            </ul>
          )}

          {majorName.length > 2 && (
            <div
              className={`p-4 rounded-lg flex items-start gap-3 transition-opacity duration-300 ${
                isStemEligible
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-100 dark:border-emerald-800"
                  : "bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-100 dark:border-amber-800"
              }`}
            >
              {isStemEligible ? (
                <>
                  <div className="p-1.5 bg-emerald-100 rounded-full text-emerald-600 dark:bg-emerald-800 dark:text-emerald-300 mt-0.5">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">STEM Eligible!</p>
                    <p className="text-xs opacity-90 mt-0.5">
                      This major qualifies for the 24-month OPT extension.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-1.5 bg-amber-100 rounded-full text-amber-600 dark:bg-amber-800 dark:text-amber-300 mt-0.5">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Non-STEM / Undetermined</p>
                    <p className="text-xs opacity-90 mt-0.5">
                      We didn&apos;t detect STEM keywords. If your CIP code is on the DHS list, you
                      can force-change this in settings later.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
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
        <Button onClick={onNext} disabled={!majorName.trim()} className="px-8">
          Continue <ChevronRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
