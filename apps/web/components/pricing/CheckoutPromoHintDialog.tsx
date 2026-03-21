"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";

export type CheckoutPromoHint = {
  code: string;
  /** Which checkout path this session is for (same promo code applies to all plan×interval combinations when using STRIPE_CHECKOUT_PROMO_HINT). */
  planId?: 'pro' | 'dedicated';
  interval?: 'month' | 'year';
};

interface CheckoutPromoHintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hint: CheckoutPromoHint | null;
  onContinue: () => void;
}

/**
 * Shown before redirect to Stripe when the server returns checkoutPromoHint.
 * Stripe Checkout cannot pre-apply a removable promo and enable the promo field in one API call
 * (discounts vs allow_promotion_codes are mutually exclusive), so we surface the code here.
 */
export function CheckoutPromoHintDialog({
  open,
  onOpenChange,
  hint,
  onContinue,
}: CheckoutPromoHintDialogProps) {
  const [copied, setCopied] = useState(false);

  if (!hint) {
    return null;
  }

  const selectionLabel =
    hint.planId && hint.interval
      ? `${hint.planId === 'pro' ? 'Pro' : 'Dedicated'} · ${hint.interval === 'year' ? 'Annual' : 'Monthly'}`
      : null;

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(hint.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may be denied; user can still select the code in the dialog.
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Promotion code</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-left text-sm text-muted-foreground">
              {selectionLabel && (
                <p className="text-foreground font-medium">
                  Your checkout: {selectionLabel}
                </p>
              )}
              <p>
                On the Stripe page, use <strong className="text-foreground">Add promotion code</strong> and paste the
                code below. You can remove it or enter a different code anytime.
              </p>
              <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2 font-mono text-sm text-foreground">
                <span className="min-w-0 flex-1 break-all">{hint.code}</span>
                <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={copyCode}>
                  <Copy className="h-4 w-4" aria-hidden />
                  <span className="sr-only">Copy code</span>
                </Button>
              </div>
              {copied && <p className="text-xs font-medium text-green-600 dark:text-green-400">Copied to clipboard</p>}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onContinue}>Continue to Stripe</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
