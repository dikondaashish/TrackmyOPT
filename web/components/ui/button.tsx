"use client";
import * as React from "react";
export function Button({ className="", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`inline-flex items-center justify-center rounded-lg px-4 py-2 border border-border bg-primary text-primary-foreground hover:brightness-95 transition ${className}`} {...props} />;
}

