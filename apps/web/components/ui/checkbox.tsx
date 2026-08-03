"use client";
export function Checkbox({
  checked,
  onCheckedChange,
  id,
  className,
  disabled,
}: {
  checked?: boolean;
  onCheckedChange?: (c: boolean) => void;
  id?: string;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <input
      id={id}
      type="checkbox"
      className={`h-4 w-4 rounded border-border text-primary focus:ring-ring ${className || ''}`}
      checked={!!checked}
      disabled={disabled}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
    />
  );
}

