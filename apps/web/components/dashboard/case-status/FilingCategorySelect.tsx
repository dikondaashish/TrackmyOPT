"use client";

import { FILING_CATEGORY_GROUPS, getFilingCategoryLabel, type FilingCategory } from "@/lib/case-status/filing-category";
import { cn } from "@/lib/utils";

type FilingCategorySelectProps = {
  id: string;
  value: FilingCategory;
  onChange: (value: FilingCategory) => void;
  disabled?: boolean;
  className?: string;
  describedBy?: string;
};

export function FilingCategorySelect({
  id,
  value,
  onChange,
  disabled = false,
  className,
  describedBy,
}: FilingCategorySelectProps) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value as FilingCategory)}
      disabled={disabled}
      aria-describedby={describedBy}
      className={cn(
        "w-full h-[42px] px-[16px] rounded-[11px] border border-black/10 dark:border-white/10",
        "bg-white dark:bg-zinc-950 text-[14px] text-[#1D1D1F] dark:text-white",
        "focus:ring-[3px] focus:ring-[#0A84FF]/20 focus:border-[#0A84FF] transition-all",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        className
      )}
    >
      {FILING_CATEGORY_GROUPS.map((group) => (
        <optgroup key={group.label} label={group.label}>
          {group.categories.map((category) => (
            <option key={category} value={category}>
              {getFilingCategoryLabel(category)}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
