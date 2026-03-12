"use client";

import { useState, useEffect } from "react";
import { Building2, Clock, CheckCircle2, AlertCircle, FileText, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";

interface EmploymentSpan {
  id: string;
  employer_name: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  job_title?: string;
}

interface ActiveEmploymentTrackerProps {
  employmentSpans: EmploymentSpan[];
  isStemEligible?: boolean;
  stemStartDate?: string | null;
}

interface Milestone {
  month: number;
  label: string;
  description: string;
  date: Date;
  isPast: boolean;
  isNext: boolean;
  daysUntil: number;
}

export function ActiveEmploymentTracker({ employmentSpans, isStemEligible, stemStartDate }: ActiveEmploymentTrackerProps) {
  const currentJob = employmentSpans.find(span => span.is_current);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [progressPercent, setProgressPercent] = useState(0);
  const [nextMilestone, setNextMilestone] = useState<Milestone | null>(null);

  useEffect(() => {
    if (!stemStartDate) return;

    const start = new Date(stemStartDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate total days in STEM OPT (24 months ~ 730 days)
    const totalStemDays = 730; 
    const daysPassed = Math.max(0, Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    
    setProgressPercent(Math.min(100, Math.max(0, (daysPassed / totalStemDays) * 100)));

    const generatedMilestones: Milestone[] = [
      { month: 6, label: "6-Month Validation", description: "Report to DSO" },
      { month: 12, label: "12-Month Evaluation", description: "Annual I-983 self-evaluation" },
      { month: 18, label: "18-Month Validation", description: "Report to DSO" },
      { month: 24, label: "24-Month Evaluation", description: "Final I-983 self-evaluation" }
    ].map(m => {
      const mDate = new Date(start);
      mDate.setMonth(start.getMonth() + m.month);
      const isPast = mDate < today;
      const daysUntil = Math.ceil((mDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        ...m,
        date: mDate,
        isPast,
        isNext: false,
        daysUntil
      };
    });

    const nextOneIndex = generatedMilestones.findIndex(m => !m.isPast);
    if (nextOneIndex !== -1) {
      generatedMilestones[nextOneIndex].isNext = true;
      setNextMilestone(generatedMilestones[nextOneIndex]);
    }

    setMilestones(generatedMilestones);
  }, [stemStartDate]);

  if (!currentJob) return null;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden transition-colors hover:border-primary/50 relative group">
      <div className="p-5 sm:p-6 pb-0">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">Active Employment</h2>
              <p className="text-sm text-muted-foreground font-medium flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                {currentJob.employer_name} {currentJob.job_title ? `• ${currentJob.job_title}` : ''}
              </p>
            </div>
          </div>
          <Link 
            href="/dashboard/opt-dates"
            className="text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-full transition-colors"
          >
            Update
          </Link>
        </div>

        {stemStartDate ? (
          <div className="mt-6 mb-8">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-primary" /> STEM OPT Reporting Timeline
              </h3>
              {nextMilestone && (
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  nextMilestone.daysUntil <= 30 ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                  nextMilestone.daysUntil <= 60 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                  "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                }`}>
                  Next: {nextMilestone.label} in {nextMilestone.daysUntil} days
                </span>
              )}
            </div>

            <div className="relative pt-8 pb-4">
              <Progress value={progressPercent} className="h-2" />
              
              <div className="absolute top-6 left-0 right-0 flex justify-between px-1">
                {milestones.map((milestone) => (
                  <div key={milestone.month} className="relative flex flex-col items-center">
                    <div className={`w-4 h-4 rounded-full border-2 bg-background z-10 transition-colors ${
                      milestone.isPast ? "border-emerald-500 bg-emerald-500 text-white" :
                      milestone.isNext ? "border-primary bg-background animate-pulse ring-4 ring-primary/20" :
                      "border-muted-foreground/30"
                    }`}>
                      {milestone.isPast && <CheckCircle2 className="w-3 h-3 m-auto" />}
                    </div>
                    
                    <div className="absolute top-6 text-center w-24 -ml-10">
                      <p className={`text-xs font-bold leading-tight ${milestone.isNext ? "text-primary" : milestone.isPast ? "text-muted-foreground" : "text-muted-foreground/50"}`}>
                        {milestone.month} Mo
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 mb-6 p-4 rounded-lg bg-muted/40 border border-muted flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Basic OPT Period Active</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                You are currently employed. Remember that any change in employment must be reported to your DSO within 10 days using the portal or via email.
              </p>
            </div>
          </div>
        )}
      </div>
      
      {stemStartDate && nextMilestone && nextMilestone.daysUntil <= 60 && (
         <div className="bg-amber-50 dark:bg-amber-900/10 border-t border-amber-100 dark:border-amber-900/30 p-4 flex items-center justify-between">
           <div className="flex items-center gap-2 text-amber-800 dark:text-amber-500">
             <Clock className="w-4 h-4" />
             <span className="text-xs font-semibold">Your {nextMilestone.label} is coming up! Contact your DSO soon.</span>
           </div>
         </div>
      )}
    </div>
  );
}
