"use client";

import { useState } from "react";
import { ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const body = description?.trim() || null;
  const showBody = Boolean(body && body !== title);
  const isCollapsible = Boolean(showBody && body && body.length > 140);

  return (
    <div className={cn("space-y-2", className)}>
      {showTitle && (
        <p
          className={cn(
            "font-semibold text-foreground leading-snug",
            compact ? "text-xs" : "text-sm sm:text-base"
          )}
        >
          {title}
        </p>
      )}

      {showBody && (
        <>
          <p
            className={cn(
              "text-muted-foreground leading-relaxed",
              compact ? "text-[11px] leading-[1.5]" : "text-[13px] sm:text-sm leading-[1.55]",
              isCollapsible && !expanded && "line-clamp-3"
            )}
          >
            {body}
          </p>
          {isCollapsible && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setExpanded((value) => !value);
              }}
              className="inline-flex items-center gap-0.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              {expanded ? "less" : "more"}
              <ChevronUp
                className={cn("w-3 h-3 transition-transform", !expanded && "rotate-180")}
                aria-hidden
              />
            </button>
          )}
        </>
      )}

      {date && (
        <p className={cn("text-muted-foreground", compact ? "text-[11px]" : "text-xs")}>
          {date}
        </p>
      )}
    </div>
  );
}
