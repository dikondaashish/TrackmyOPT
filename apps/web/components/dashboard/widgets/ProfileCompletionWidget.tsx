"use client";

import { CheckCircle2, ChevronRight, GraduationCap, Briefcase, Calendar } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface ProfileCompletionWidgetProps {
  optStatus: any;
  employmentSpans: any[];
  profile: any;
}

export function ProfileCompletionWidget({ optStatus, employmentSpans, profile }: ProfileCompletionWidgetProps) {
  const [percentage, setPercentage] = useState(0);
  const [nextAction, setNextAction] = useState<{ title: string; href: string; icon: React.ReactNode; description: string } | null>(null);

  useEffect(() => {
    let score = 10; // Base score for creating an account
    let action = null;

    const hasOptStatus = !!optStatus?.opt_start_date;
    const hasEmployment = employmentSpans && employmentSpans.length > 0;
    const hasEducation = !!(profile?.degree_level && profile?.major_name);

    if (hasOptStatus) score += 30;
    if (hasEmployment) score += 30;
    if (hasEducation) score += 30;

    // Determine the next best action priority
    if (!hasOptStatus) {
      action = {
        title: "Configure OPT Timeline",
        description: "Set up your OPT start and end dates.",
        href: "/dashboard/opt-dates", // Or trigger wizard, but standard link is safer here
        icon: <Calendar className="w-5 h-5" />
      };
    } else if (!hasEducation) {
      action = {
        title: "Add Education Profile",
        description: "Tell us your degree and major for STEM tracking.",
        href: "/dashboard/settings",
        icon: <GraduationCap className="w-5 h-5" />
      };
    } else if (!hasEmployment) {
      action = {
        title: "Add First Job",
        description: "Stop your unemployment clock by adding an employer.",
        href: "/dashboard/opt-dates",
        icon: <Briefcase className="w-5 h-5" />
      };
    }

    // Animate percentage
    const timer = setTimeout(() => {
      setPercentage(score);
      setNextAction(action);
    }, 300);

    return () => clearTimeout(timer);
  }, [optStatus, employmentSpans, profile]);

  if (percentage === 100) return null; // Hide if fully complete to save space

  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="border border-blue-100 dark:border-blue-900/50 bg-gradient-to-br from-blue-50 to-blue-100/30 dark:from-blue-950/20 dark:to-blue-900/10 rounded-xl p-6 relative overflow-hidden">
      <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
        <div className="relative flex items-center justify-center shrink-0">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle
              className="text-blue-200 dark:text-blue-900/50"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="48"
              cy="48"
            />
            <circle
              className="text-blue-600 dark:text-blue-400 transition-all duration-1000 ease-out"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="48"
              cy="48"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-blue-900 dark:text-blue-100">{percentage}%</span>
          </div>
        </div>

        <div className="flex-1 text-center md:text-left">
          <h3 className="text-lg font-bold text-blue-950 dark:text-blue-100 mb-1">
            Complete your profile
          </h3>
          <p className="text-sm text-blue-800/80 dark:text-blue-200/80 mb-4 max-w-md">
            You're almost there! Providing complete information ensures we can accurately track your OPT status and STEM eligibility without errors.
          </p>

          {nextAction && (
            <Link 
              href={nextAction.href}
              className="inline-flex items-center gap-3 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-foreground px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm border border-gray-200 dark:border-gray-700 group"
            >
              <div className="text-blue-600 dark:text-blue-400">
                {nextAction.icon}
              </div>
              <div className="flex flex-col text-left">
                <span>{nextAction.title}</span>
                <span className="text-xs text-muted-foreground font-normal">{nextAction.description}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors ml-2" />
            </Link>
          )}
        </div>
      </div>
      
      {/* Decorative background circle */}
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}
