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
        "w-full h-11 px-4 rounded-lg border border-gray-300 dark:border-zinc-800",
        "bg-white dark:bg-zinc-950 text-sm text-gray-900 dark:text-white",
        "focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 focus:border-blue-600 transition-colors",
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
