import { useState, type ReactNode } from "react";
import { Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PLAN_COMPARISON_FEATURES } from "@/lib/pricing/plan-features";
import { PLAN_PRICES, PRO_PAID_INTRO } from "@/lib/pricing/plan-config";

interface PlanComparisonModalProps {
  onUpgrade?: () => void;
}

function renderValue(value: boolean | string): ReactNode {
  if (typeof value === "string") return value;
  return value ? (
    <Check className="mx-auto h-4 w-4 text-green-500" aria-label="Included" />
  ) : (
    <X className="mx-auto h-4 w-4 text-gray-300" aria-label="Not included" />
  );
}

export function PlanComparisonModal({ onUpgrade }: PlanComparisonModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleUpgrade = () => {
    setIsOpen(false);
    if (onUpgrade) onUpgrade();
    else window.location.href = "/premium/checkout?planId=pro";
  };

  return (
    <>
      <Button
        variant="link"
        className="h-auto p-0 font-medium text-blue-600 dark:text-blue-400"
        onClick={() => setIsOpen(true)}
      >
        Compare Plans
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          className="max-h-[90vh] max-w-4xl overflow-y-auto border border-gray-200 bg-white max-md:max-w-[calc(100vw-1.5rem)] dark:border-gray-800 dark:bg-gray-900"
          onClose={() => setIsOpen(false)}
        >
          <DialogHeader>
            <DialogTitle className="mb-2 text-center text-2xl font-bold">
              Plan Comparison
            </DialogTitle>
            <p className="mb-6 text-center text-gray-500 dark:text-gray-400">
              Compare the actual limits and benefits included with every plan.
            </p>
          </DialogHeader>

          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="sticky top-0 bg-surface-strong font-semibold text-foreground">
                <tr>
                  <th className="px-4 py-3">Feature</th>
                  <th className="px-4 py-3 text-center">Free<br /><span className="font-normal text-gray-500">$0</span></th>
                  <th className="bg-blue-50 px-4 py-3 text-center text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                    Pro<br /><span className="font-normal">${PLAN_PRICES.pro.month.toFixed(2)}/mo</span>
                  </th>
                  <th className="bg-violet-50 px-4 py-3 text-center text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                    Dedicated<br /><span className="font-normal">${PLAN_PRICES.dedicated.month.toFixed(2)}/mo</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {PLAN_COMPARISON_FEATURES.flatMap((category) => [
                  <tr key={`${category.category}-header`} className="bg-gray-50 dark:bg-gray-800">
                    <th colSpan={4} className="px-4 py-2 text-xs text-gray-600 dark:text-gray-300">
                      {category.category}
                    </th>
                  </tr>,
                  ...category.features.map((feature) => (
                    <tr key={`${category.category}-${feature.name}`}>
                      <td className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">{feature.name}</td>
                      <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">{renderValue(feature.free)}</td>
                      <td className="bg-blue-50 px-4 py-3 text-center font-medium text-gray-900 dark:bg-blue-950 dark:text-gray-100">{renderValue(feature.pro)}</td>
                      <td className="bg-violet-50 px-4 py-3 text-center font-medium text-gray-900 dark:bg-violet-950 dark:text-gray-100">{renderValue(feature.dedicated)}</td>
                    </tr>
                  )),
                ])}
              </tbody>
            </table>
          </div>

          <div className="mt-6 text-center">
            <Button
              className="bg-blue-600 px-8 py-2 font-semibold text-white hover:bg-blue-700"
              onClick={handleUpgrade}
            >
              Get Pro
            </Button>
            <p className="mt-2 text-xs text-gray-500">
              Eligible accounts pay ${PRO_PAID_INTRO.price.toFixed(2)} for {PRO_PAID_INTRO.durationDays} days, then regular billing.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
