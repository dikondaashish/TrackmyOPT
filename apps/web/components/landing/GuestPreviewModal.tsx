"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, Calendar, Clock, Briefcase, FileText, ArrowRight } from "lucide-react";
import Link from "next/link";

export function GuestPreviewModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [optStart, setOptStart] = useState<string>("");
  const [calculatedEnd, setCalculatedEnd] = useState<string>("");
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

  const handleCalculate = (e: React.ChangeEvent<HTMLInputElement>) => {
    // ... logic remains same ...
    const val = e.target.value;
    setOptStart(val);
    if (val) {
      const date = new Date(val);
      if (!isNaN(date.getTime())) {
        const end = new Date(date);
        end.setDate(end.getDate() + 364);
        setCalculatedEnd(end.toISOString().split("T")[0]);

        const today = new Date();
        const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        setDaysRemaining(diff > 0 ? diff : 0);
      }
    } else {
      setCalculatedEnd("");
      setDaysRemaining(null);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="lg"
        onClick={() => setIsOpen(true)}
        className="h-14 px-8 rounded-full text-base font-medium border-border/50 bg-background/50 backdrop-blur-sm hover:bg-background/80 hover:border-primary/50 group"
      >
        <Play className="w-5 h-5 mr-2 text-primary group-hover:scale-110 transition-transform" />
        Interactive Demo
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent onClose={() => setIsOpen(false)} className="sm:max-w-[800px] p-0 overflow-hidden bg-slate-50 dark:bg-zinc-950 border-border/50 shadow-2xl">
          <div className="flex flex-col h-[600px] max-h-[80vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-white dark:bg-zinc-900">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Dashboard Preview (Guest)</h3>
                  <p className="text-[10px] text-muted-foreground">Test the OPT Calculator</p>
                </div>
              </div>
              <Link href="/login">
                <Button size="sm" className="rounded-full h-8 px-4 text-xs font-semibold">
                  Sign up to save
                </Button>
              </Link>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              {/* Calculator Widget */}
              <div className="bg-white dark:bg-zinc-900 rounded-xl border border-border/50 p-5 shadow-sm">
                <h4 className="font-semibold flex items-center gap-2 mb-4">
                  <Calendar className="w-4 h-4 text-blue-500" /> Quick OPT Calculator
                </h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Enter OPT Start Date</label>
                    <input
                      type="date"
                      value={optStart}
                      onChange={handleCalculate}
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Calculated EAD End Date</label>
                    <div className="w-full rounded-md border border-border/50 bg-muted/30 px-3 py-2 text-sm text-muted-foreground font-mono">
                      {calculatedEnd ? new Date(calculatedEnd).toLocaleDateString() : 'YYYY-MM-DD'}
                    </div>
                  </div>
                </div>

                {daysRemaining !== null && (
                  <div className="mt-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 flex justify-between items-center animate-in fade-in slide-in-from-bottom-2">
                    <div>
                      <p className="font-semibold text-blue-700 dark:text-blue-300">Validity Period Generated</p>
                      <p className="text-xs text-blue-600/80 dark:text-blue-400/80">You would have {daysRemaining} days remaining on this OPT period.</p>
                    </div>
                    <div className="text-2xl font-black text-blue-700 dark:text-blue-300">{daysRemaining}</div>
                  </div>
                )}
              </div>

              {/* Dummy Widgets */}
              <div className="grid sm:grid-cols-2 gap-6 opacity-60 pointer-events-none select-none">

                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-border/50 p-5 shadow-sm">
                  <h4 className="font-semibold flex items-center gap-2 mb-4">
                    <Briefcase className="w-4 h-4 text-emerald-500" /> Employment History
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium">Software Engineer</p>
                        <p className="text-xs text-muted-foreground">Tech Corp Incc.</p>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Active</span>
                    </div>
                    <div className="h-2 bg-emerald-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-3/4"></div>
                    </div>
                    <p className="text-[10px] text-muted-foreground">12/90 Unemployment Days Used</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-border/50 p-5 shadow-sm">
                  <h4 className="font-semibold flex items-center gap-2 mb-4">
                    <FileText className="w-4 h-4 text-purple-500" /> I-983 Deadlines (STEM)
                  </h4>
                  <div className="relative pl-4 border-l-2 border-muted space-y-4">
                    <div className="relative">
                      <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-purple-500 border-2 border-white"></div>
                      <p className="text-xs font-semibold">6-Month Validation Report</p>
                      <p className="text-[10px] text-muted-foreground">Due in 45 days</p>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-muted border-2 border-white"></div>
                      <p className="text-xs font-medium text-muted-foreground">12-Month Evaluation</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Footer CTA */}
            <div className="p-4 border-t bg-muted/30 text-center">
              <h4 className="font-bold text-base mb-2">Like what you see?</h4>
              <p className="text-xs text-muted-foreground mb-4">Unlock the full dashboard, export tools, safe document vault, and email reminders.</p>
              <Link href="/login" onClick={() => setIsOpen(false)}>
                <Button className="rounded-full w-full sm:w-auto px-8 gap-2">
                  Create Free Account <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
