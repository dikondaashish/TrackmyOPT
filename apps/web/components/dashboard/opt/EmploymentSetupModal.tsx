"use client";

import { Briefcase, Building2, Timer } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatOptDateForDisplay } from "@/lib/immigration/employment-tracking";

interface EmploymentSetupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  optStartDate: string;
  onAddJob: () => void;
  onBetweenJobs: () => void;
  onNotOnOpt: () => void;
}

export function EmploymentSetupModal({
  open,
  onOpenChange,
  optStartDate,
  onAddJob,
  onBetweenJobs,
  onNotOnOpt,
}: EmploymentSetupModalProps) {
  const formattedStart = formatOptDateForDisplay(optStartDate);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
              <Building2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </span>
            One more step: job history
          </DialogTitle>
          <DialogDescription className="text-left pt-2">
            OPT start saved as <strong className="text-foreground">{formattedStart}</strong>. To
            calculate your real unemployment days, tell us about your employment on OPT.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              onAddJob();
            }}
            className="flex w-full items-start gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
          >
            <Briefcase className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="text-sm font-semibold">Yes — I&apos;m employed (or was)</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Add your current or past employer(s). Your unemployment count updates instantly.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              onBetweenJobs();
            }}
            className="flex w-full items-start gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-amber-400/50 hover:bg-amber-50/50 dark:hover:bg-amber-950/20"
          >
            <Timer className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="text-sm font-semibold">I&apos;m between jobs right now</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                We&apos;ll show unemployment days from OPT start until you add a job.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              onNotOnOpt();
            }}
            className="flex w-full items-start gap-3 rounded-xl border border-dashed border-border bg-muted/30 p-4 text-left transition-colors hover:bg-muted/50"
          >
            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-muted-foreground/40 text-xs text-muted-foreground">
              ?
            </div>
            <div>
              <p className="text-sm font-semibold">I haven&apos;t started OPT yet</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Dates are saved. The unemployment clock will activate when your OPT period begins.
              </p>
            </div>
          </button>
        </div>

        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            I&apos;ll do this later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
