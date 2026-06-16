"use client";

import { useState } from "react";
import { ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatUscisStatusDate } from "@/lib/case-status/case-status-display";
import {
  normalizeStatusCompareText,
  sanitizeUscisDescription,
} from "@/lib/case-status/uscis-status-text";

type UscisOfficialStatusBlockProps = {
  title: string;
  description?: string | null;
  date?: string | null;
  compact?: boolean;
  defaultExpanded?: boolean;
  showTitle?: boolean;
  className?: string;
};

export function UscisOfficialStatusBlock({
  title,
  description,
  date,
  compact = false,
  defaultExpanded = true,
  showTitle = true,
  className,
}: UscisOfficialStatusBlockProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const body = description ? sanitizeUscisDescription(description) : null;
  const showBody = Boolean(
    body && normalizeStatusCompareText(body) !== normalizeStatusCompareText(title)
  );
  const formattedDate = formatUscisStatusDate(date);
  const isCollapsible = Boolean(showBody && body && body.length > 160);

  return (
    <div className={cn("space-y-2", className)}>
      {showTitle && (
        <p
          className={cn(
            "font-semibold text-foreground leading-snug",
            compact ? "text-xs sm:text-sm" : "text-base sm:text-lg"
          )}
        >
          {title}
        </p>
      )}

      {showBody && (
        <div
          className={cn(
            "text-muted-foreground leading-relaxed",
            compact ? "text-[12px] leading-[1.55]" : "text-[13px] sm:text-sm leading-[1.6]"
          )}
        >
          <p className={cn("whitespace-pre-line m-0", isCollapsible && !expanded && "line-clamp-4")}>
            {body}
          </p>
          {isCollapsible && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setExpanded((value) => !value);
              }}
              className="mt-1 inline-flex items-center gap-0.5 text-[12px] text-[#0A84FF] hover:underline font-medium"
            >
              {expanded ? "less" : "more"}
              <ChevronUp
                className={cn("w-3 h-3 transition-transform", !expanded && "rotate-180")}
                aria-hidden
              />
            </button>
          )}
        </div>
      )}

      {formattedDate && (
        <p className={cn("text-muted-foreground m-0", compact ? "text-[11px]" : "text-xs")}>
          {formattedDate}
        </p>
      )}
    </div>
  );
}
