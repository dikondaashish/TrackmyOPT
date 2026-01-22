import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Checkbox({
  checked,
  onCheckedChange,
  id,
  className,
}: { checked?: boolean; onCheckedChange?: (c: boolean) => void; id?: string; className?: string; }) {
  return (
    <input
      id={id}
      type="checkbox"
      className={cn("h-4 w-4 rounded border-border text-primary focus:ring-ring", className)}
      checked={!!checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
    />
  );
}

