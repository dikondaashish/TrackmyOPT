"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-lg border border-border bg-background text-foreground px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground max-md:min-h-11",
        className,
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
