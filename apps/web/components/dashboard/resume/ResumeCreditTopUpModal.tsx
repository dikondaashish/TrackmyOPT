"use client";

import { useState } from "react";
import { Check, Coins, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { RESUME_CREDIT_PACK } from "@/lib/pricing/plan-config";
import { creditsForPackQuantity } from "@/lib/resume-credits/config";

export function ResumeCreditTopUpModal({
  open,
  onClose,
  currentBalance,
}: {
  open: boolean;
  onClose: () => void;
  currentBalance: number;
}) {
  const [loadingQuantity, setLoadingQuantity] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = async (quantity: number) => {
    setLoadingQuantity(quantity);
    setError(null);
    try {
      const response = await fetch("/api/resume-credits/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ quantity }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || typeof payload.url !== "string") {
        throw new Error(
          typeof payload.error === "string"
            ? payload.error
            : "Unable to start checkout. Please try again."
        );
      }
      window.location.assign(payload.url);
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Unable to start checkout. Please try again."
      );
      setLoadingQuantity(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="max-w-lg overflow-hidden p-0">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-6 py-6 text-white">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
            <Coins className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2 className="mt-4 text-2xl font-bold">Keep generating resumes</h2>
          <p className="mt-1 text-sm text-blue-100">
            Your monthly allowance is used. Add credits without changing your subscription.
          </p>
        </div>

        <div className="space-y-5 p-6">
          <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 text-sm dark:bg-gray-900">
            <span className="text-gray-600 dark:text-gray-300">Current credit balance</span>
            <span className="font-bold text-gray-950 dark:text-white">{currentBalance}</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {RESUME_CREDIT_PACK.allowedPackQuantities.map((quantity) => {
              const credits = creditsForPackQuantity(quantity);
              const isLoading = loadingQuantity === quantity;
              return (
                <button
                  key={quantity}
                  type="button"
                  onClick={() => startCheckout(quantity)}
                  disabled={loadingQuantity !== null}
                  className="rounded-xl border border-gray-200 p-4 text-left transition-colors hover:border-blue-500 hover:bg-blue-50 disabled:cursor-wait disabled:opacity-60 dark:border-gray-700 dark:hover:border-blue-500 dark:hover:bg-blue-950/30"
                >
                  <span className="text-xl font-bold text-gray-950 dark:text-white">
                    {credits} credits
                  </span>
                  <span className="mt-1 block text-sm font-semibold text-blue-600 dark:text-blue-400">
                    ${quantity}.00 once
                  </span>
                  {isLoading && <Loader2 className="mt-3 h-4 w-4 animate-spin" aria-hidden="true" />}
                </button>
              );
            })}
          </div>

          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 text-emerald-600" />10 credits for every $1</li>
            <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 text-emerald-600" />1 new resume uses 1 credit</li>
            <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 text-emerald-600" />A regeneration uses 0.5 credit</li>
          </ul>

          {error && <p role="alert" className="text-sm font-medium text-red-600">{error}</p>}

          <p className="text-xs leading-5 text-gray-500 dark:text-gray-400">
            One-time payment. No automatic renewal. Purchased credits require an active Pro or Dedicated subscription.
          </p>

          <Button variant="outline" className="w-full" onClick={onClose}>
            Not now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
