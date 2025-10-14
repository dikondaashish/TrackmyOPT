"use client";
import * as React from "react";
export function Checkbox({
  checked,
  onCheckedChange,
  id,
}: { checked?: boolean; onCheckedChange?: (c: boolean) => void; id?: string; }) {
  return (
    <input
      id={id}
      type="checkbox"
      className="h-4 w-4 rounded border-border text-primary focus:ring-ring"
      checked={!!checked}
      onChange={(e)=>onCheckedChange?.(e.target.checked)}
    />
  );
}

