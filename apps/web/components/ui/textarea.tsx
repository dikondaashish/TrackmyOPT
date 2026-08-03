"use client";
import * as React from "react";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
    ({ className = "", ...props }, ref) => (
        <textarea
            ref={ref}
            className={`w-full min-h-[80px] rounded-lg border border-border bg-background text-foreground px-3 py-2 outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground ${className}`}
            {...props}
        />
    )
);
Textarea.displayName = "Textarea";
