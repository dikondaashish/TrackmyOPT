"use client";

import { LiveStatsWidget } from "@/components/dashboard/opt-tools/LiveStatsWidget";
import { COMMUNITY_REPORTS_MESSAGING } from "@/lib/messaging/product-copy";
import {
  communityStatsToolType,
  type FilingCategory,
  normalizeFilingCategory,
} from "@/lib/case-status/filing-category";
import { Card } from "@/components/ui/card";

interface CaseProcessingBenchmarksProps {
  filingCategory?: FilingCategory | string | null;
}

/**
 * Community I-765 processing benchmarks on the case status page.
 * Reuses the same live stats feed as OPT Apply tools.
 */
export function CaseProcessingBenchmarks({
  filingCategory = null,
}: CaseProcessingBenchmarksProps) {
  const toolType = communityStatsToolType(normalizeFilingCategory(filingCategory));
  return (
    <section className="space-y-3" aria-label="Community processing benchmarks">
      <div>
        <div className="min-w-0">
          <div className="flex items-baseline gap-x-2 flex-wrap">
            <h3 className="text-lg font-semibold text-foreground">
              {COMMUNITY_REPORTS_MESSAGING.sectionTitle}
            </h3>
            <span className="text-xs text-muted-foreground">
              Community data
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {COMMUNITY_REPORTS_MESSAGING.sectionSubhead}
          </p>
        </div>
      </div>
      <Card className="p-0 overflow-hidden border-border">
        <LiveStatsWidget toolType={toolType} />
      </Card>
    </section>
  );
}
