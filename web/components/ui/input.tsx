"use client";
import * as React from "react";
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className = "", ...props }, ref) => (
    <input ref={ref} className={`w-full rounded-lg border border-border bg-background text-foreground px-3 py-2 outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground ${className}`} {...props} />
  )
);
Input.displayName = "Input";

