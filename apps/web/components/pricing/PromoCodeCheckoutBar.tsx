"use client";

import { useId } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { PromoCheckoutMode } from "@/lib/premium/promo-checkout-types";

export type { PromoCheckoutMode };

interface PromoCodeCheckoutBarProps {
  mode: PromoCheckoutMode;
  customCode: string;
  error: string | null;
  disabled?: boolean;
  /** Slim inline style for pricing modal; default bar for settings pages */
  compact?: boolean;
  onRemoveDefault: () => void;
  onCustomCodeChange: (value: string) => void;
  onApplyCustom: () => void;
  onClearCustom: () => void;
}

/**
 * Promo UX for Stripe checkout: request configured EARLYBIRD, remove, or use a custom code.
 * Parent maps mode → POST body: default = omit promoCode, none = null, custom = string.
 */
export function PromoCodeCheckoutBar({
  mode,
  customCode,
  error,
  disabled,
  compact = false,
  onRemoveDefault,
  onCustomCodeChange,
  onApplyCustom,
  onClearCustom,
}: PromoCodeCheckoutBarProps) {
  const inputId = useId();

  if (compact && mode === "default") {
    return (
      <div
        className="flex items-center justify-between gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/[0.07] px-2.5 py-1"
        role="status"
      >
        <p className="min-w-0 truncate text-[11px] sm:text-xs text-foreground">
          <span className="font-semibold text-emerald-700 dark:text-emerald-400">
            EARLYBIRD
          </span>
          <span className="text-muted-foreground"> · Final discount shown by Stripe</span>
        </p>
        <button
          type="button"
          className="shrink-0 text-[10px] font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline disabled:opacity-50"
          onClick={onRemoveDefault}
          disabled={disabled}
        >
          Remove
        </button>
      </div>
    );
  }

  const shellClass = compact
    ? "rounded-md border border-border/60 bg-muted/20 px-2.5 py-1.5 text-left"
    : "rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-left";

  return (
    <div className={shellClass}>
      {mode === "default" && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="min-w-0 text-sm text-foreground">
            <span className="font-medium">EARLYBIRD offer requested</span>
            <span className="text-muted-foreground"> — Stripe confirms any discount before payment</span>
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 shrink-0 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={onRemoveDefault}
            disabled={disabled}
          >
            <X className="h-3.5 w-3.5" />
            Remove
          </Button>
        </div>
      )}

      {(mode === "none" || mode === "custom") && (
        <div className={compact ? "space-y-1.5" : "space-y-2"}>
          {mode === "custom" && customCode.trim() ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className={cn("text-foreground", compact ? "text-xs" : "text-sm")}>
                <span className="font-medium">Promo </span>
                <span className="font-mono text-[11px]">{customCode.trim()}</span>
                <span className="text-muted-foreground"> at checkout</span>
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn("shrink-0", compact ? "h-7 px-2 text-xs" : "h-8")}
                onClick={onClearCustom}
                disabled={disabled}
              >
                Clear
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
              <label htmlFor={inputId} className="sr-only">
                Promo code
              </label>
              <Input
                id={inputId}
                placeholder="Promo code"
                value={customCode}
                onChange={(e) => onCustomCodeChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), onApplyCustom())}
                disabled={disabled}
                className={cn(
                  "flex-1 font-mono",
                  compact ? "h-8 text-xs" : "h-9 text-sm"
                )}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className={cn("shrink-0 sm:w-auto", compact ? "h-8 text-xs" : "h-9")}
                onClick={onApplyCustom}
                disabled={disabled || !customCode.trim()}
              >
                Apply
              </Button>
            </div>
          )}
          {error && (
            <p className="text-xs text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
