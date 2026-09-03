"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getFilingCategoryLabel, type FilingCategory } from "@/lib/case-status/filing-category";
import { Sparkles, X } from "lucide-react";

type FilingCategoryConfirmBannerProps = {
  onConfirm: (category: FilingCategory) => void;
  onDismiss: () => void;
  saving?: boolean;
};

export function FilingCategoryConfirmBanner({
  onConfirm,
  onDismiss,
  saving = false,
}: FilingCategoryConfirmBannerProps) {
  return (
    <Card className="p-4 border-violet-200 dark:border-violet-800 bg-violet-50/80 dark:bg-violet-950/30">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-violet-950 dark:text-violet-100">
            Confirm your filing type
          </p>
          <p className="text-sm text-violet-800/90 dark:text-violet-200/90 mt-1">
            We use this for approval-time estimates. Is this an initial OPT application or a STEM OPT extension?
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            <Button
              type="button"
              size="sm"
              disabled={saving}
              onClick={() => onConfirm("initial_opt")}
              className="bg-violet-600 hover:bg-violet-700 text-white"
            >
              {getFilingCategoryLabel("initial_opt")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={saving}
              onClick={() => onConfirm("stem_extension")}
              className="border-violet-300 dark:border-violet-700"
            >
              {getFilingCategoryLabel("stem_extension")}
            </Button>
          </div>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          disabled={saving}
          className="text-violet-400 hover:text-violet-600 dark:hover:text-violet-300 shrink-0"
          aria-label="Dismiss filing type prompt"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </Card>
  );
}
