"use client";

import { LiveStatsWidget } from "@/components/dashboard/opt-tools/LiveStatsWidget";
import { COMMUNITY_REPORTS_MESSAGING } from "@/lib/messaging/product-copy";
import { Card } from "@/components/ui/card";
import { BarChart3, Users } from "lucide-react";

/**
 * Community I-765 processing benchmarks on the case status page.
 * Reuses the same live stats feed as OPT Apply tools.
 */
export function CaseProcessingBenchmarks() {
  return (
    <section className="space-y-3" aria-label="Community processing benchmarks">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
          <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-semibold text-foreground">
              {COMMUNITY_REPORTS_MESSAGING.sectionTitle}
            </h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              <Users className="w-3 h-3" aria-hidden />
              Community data
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {COMMUNITY_REPORTS_MESSAGING.sectionSubhead}
          </p>
        </div>
      </div>
      <Card className="p-0 overflow-hidden border-border">
        <LiveStatsWidget toolType="opt-apply" />
      </Card>
    </section>
  );
}
