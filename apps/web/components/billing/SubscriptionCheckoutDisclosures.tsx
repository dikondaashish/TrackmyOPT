"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  buildCheckoutDisclosures,
  type BillingInterval,
  type PaidPlanId,
} from "@/lib/legal/legal-config";

interface SubscriptionCheckoutDisclosuresProps {
  planId: PaidPlanId;
  interval: BillingInterval;
  includeProTrial: boolean;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function SubscriptionCheckoutDisclosures({
  planId,
  interval,
  includeProTrial,
  checked,
  onCheckedChange,
  disabled,
}: SubscriptionCheckoutDisclosuresProps) {
  const d = useMemo(
    () =>
      buildCheckoutDisclosures({
        planId,
        interval,
        includeProTrial,
      }),
    [planId, interval, includeProTrial]
  );

  return (
    <div className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-3 text-sm">
      <p className="font-semibold text-foreground">{d.headline}</p>
      <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
        <li>{d.amountLine}</li>
        <li>{d.renewalLine}</li>
        {d.trialLine && <li>{d.trialLine}</li>}
        {d.dedicatedRefundLine && <li>{d.dedicatedRefundLine}</li>}
        <li>{d.cancelLine}</li>
        <li>{d.noRefundAfterWindow}</li>
      </ul>
      <p className="text-xs text-muted-foreground">
        <Link href="/terms" className="text-primary underline-offset-2 hover:underline" target="_blank">
          Terms of Service
        </Link>
        {" · "}
        <Link href="/refund-policy" className="text-primary underline-offset-2 hover:underline" target="_blank">
          Refund Policy
        </Link>
        {" · "}
        <Link href="/privacy" className="text-primary underline-offset-2 hover:underline" target="_blank">
          Privacy Policy
        </Link>
      </p>
      <div className="flex items-start gap-3 pt-1">
        <Checkbox
          id="recurring-billing-consent"
          checked={checked}
          onCheckedChange={(v) => onCheckedChange(v === true)}
          disabled={disabled}
          className="mt-0.5"
        />
        <Label
          htmlFor="recurring-billing-consent"
          className="text-xs leading-relaxed font-normal text-foreground cursor-pointer"
        >
          {d.consentLabel}
        </Label>
      </div>
    </div>
  );
}
