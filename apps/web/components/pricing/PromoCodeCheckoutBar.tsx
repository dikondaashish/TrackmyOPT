"use client";

import { useId } from "react";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { PromoCheckoutMode } from "@/lib/premium/promoCheckoutTypes";

export type { PromoCheckoutMode };

interface PromoCodeCheckoutBarProps {
  mode: PromoCheckoutMode;
  customCode: string;
  error: string | null;
  disabled?: boolean;
  onRemoveDefault: () => void;
  onCustomCodeChange: (value: string) => void;
  onApplyCustom: () => void;
  onClearCustom: () => void;
}

/**
 * Promo UX for Stripe checkout: default EARLYBIRD auto-apply, remove, or custom code.
 * Parent maps mode → POST body: default = omit promoCode, none = null, custom = string.
 */
export function PromoCodeCheckoutBar({
  mode,
  customCode,
  error,
  disabled,
  onRemoveDefault,
  onCustomCodeChange,
  onApplyCustom,
  onClearCustom,
}: PromoCodeCheckoutBarProps) {
  const inputId = useId();

  return (
    <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-left">
      {mode === "default" && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2 text-sm text-foreground">
            <Sparkles className="h-4 w-4 shrink-0 text-primary" aria-hidden />
            <span>
              <span aria-hidden>🎉 </span>
              <span className="font-medium">EARLYBIRD discount applied</span>
              <span className="text-muted-foreground"> — </span>
              <span className="text-muted-foreground">Save $3.00</span>
            </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 shrink-0 gap-1 text-muted-foreground hover:text-foreground"
            onClick={onRemoveDefault}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
            Remove
          </Button>
        </div>
      )}

      {(mode === "none" || mode === "custom") && (
        <div className="space-y-2">
          {mode === "custom" && customCode.trim() ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-foreground">
                <span className="font-medium">Promo </span>
                <span className="font-mono text-xs">{customCode.trim()}</span>
                <span className="text-muted-foreground"> will apply at checkout</span>
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 shrink-0"
                onClick={onClearCustom}
                disabled={disabled}
              >
                Clear
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label htmlFor={inputId} className="sr-only">
                Promo code
              </label>
              <Input
                id={inputId}
                placeholder="Enter promo code"
                value={customCode}
                onChange={(e) => onCustomCodeChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), onApplyCustom())}
                disabled={disabled}
                className="h-9 flex-1 font-mono text-sm"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-9 shrink-0 sm:w-auto"
                onClick={onApplyCustom}
                disabled={disabled || !customCode.trim()}
              >
                Apply
              </Button>
            </div>
          )}
          {error && (
            <p className={cn("text-xs text-destructive")} role="alert">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
