"use client";

import { useMemo } from "react";
import { CheckCircle2, Circle, Briefcase, Calendar, UserPlus, FileText } from "lucide-react";
import { format, isPast, isToday } from "date-fns";
import { User } from "@supabase/supabase-js";

interface RecentActivityLogProps {
  user: User;
  optStatus: any;
  employmentSpans: any[];
}

export function RecentActivityLog({ user, optStatus, employmentSpans }: RecentActivityLogProps) {
  const events = useMemo(() => {
    const items = [];

    // 1. Account Created
    if (user?.created_at) {
      items.push({
        id: "account_created",
        title: "Joined TrackMyOPT",
        date: new Date(user.created_at),
        icon: <UserPlus className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
        isPast: true,
      });
    }

    // 2. OPT Timeline
    if (optStatus?.opt_start_date) {
      const startDate = new Date(optStatus.opt_start_date);
      items.push({
        id: "opt_start",
        title: "OPT Started",
        date: startDate,
        icon: <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
        isPast: isPast(startDate) || isToday(startDate),
      });
      
      if (optStatus.opt_ead_end_date) {
        const endDate = new Date(optStatus.opt_ead_end_date);
        items.push({
          id: "opt_end",
          title: "OPT EAD Expires",
          date: endDate,
          icon: <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
          isPast: isPast(endDate) && !isToday(endDate),
        });
      }
    }

    // 3. Employment Spans
    if (employmentSpans && employmentSpans.length > 0) {
      employmentSpans.forEach(span => {
        if (span.start_date) {
          const startDate = new Date(span.start_date);
          items.push({
            id: `job_start_${span.id}`,
            title: `Started at ${span.employer_name}`,
            date: startDate,
            icon: <Briefcase className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
            isPast: isPast(startDate) || isToday(startDate),
          });
        }
        
        if (span.end_date) {
          const endDate = new Date(span.end_date);
          items.push({
            id: `job_end_${span.id}`,
            title: `Ended at ${span.employer_name}`,
            date: endDate,
            icon: <CheckCircle2 className="w-4 h-4 text-gray-500" />,
            isPast: isPast(endDate) && !isToday(endDate),
          });
        }
      });
    }

    // Sort by date descending (newest first)
    return items.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [user, optStatus, employmentSpans]);

  if (events.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold tracking-tight text-foreground">Timeline</h3>
      </div>

      <div className="relative border-l border-gray-200 dark:border-gray-800 ml-3 space-y-6">
        {events.slice(0, 6).map((event, index) => (
          <div key={event.id} className="relative pl-6">
            {/* Timeline Dot */}
            <span className={`absolute -left-[13px] top-1 flex h-6 w-6 items-center justify-center rounded-full bg-background ring-4 ring-background ${event.isPast ? 'bg-gray-100 dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900 opacity-50'}`}>
              {event.icon}
            </span>

            <div className={`flex flex-col ${!event.isPast ? 'opacity-60' : ''}`}>
              <h4 className="text-sm font-medium text-foreground">{event.title}</h4>
              <time className="text-xs text-muted-foreground mt-1">
                {format(event.date, "MMM d, yyyy")} {event.isPast ? "" : "(Upcoming)"}
              </time>
            </div>
          </div>
        ))}
      </div>
      
      {events.length > 6 && (
        <p className="text-xs text-center text-muted-foreground mt-4 pt-4 border-t border-border">
          Showing 6 most recent events
        </p>
      )}
    </div>
  );
}
