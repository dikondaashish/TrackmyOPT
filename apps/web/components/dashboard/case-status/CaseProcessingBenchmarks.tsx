"use client";

import { LiveStatsWidget } from "@/components/dashboard/opt-tools/LiveStatsWidget";
import { COMMUNITY_REPORTS_MESSAGING } from "@/lib/messaging/product-copy";
import { Card } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

/**
 * Community I-765 processing benchmarks on the case status page.
 * Reuses the same live stats feed as OPT Apply tools.
 */
export function CaseProcessingBenchmarks() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden />
        <div>
          <h3 className="text-lg font-semibold">{COMMUNITY_REPORTS_MESSAGING.sectionTitle}</h3>
          <p className="text-sm text-muted-foreground">
            {COMMUNITY_REPORTS_MESSAGING.sectionSubhead}
          </p>
        </div>
      </div>
      <Card className="p-0 overflow-hidden border-border">
        <LiveStatsWidget toolType="opt-apply" />
      </Card>
    </div>
  );
}
