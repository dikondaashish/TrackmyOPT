import { Suspense } from "react";
import { after } from "next/server";
import { requirePremiumPageUser } from "../_lib/requirePremiumPageUser";
import { PremiumDashboardShell } from "../_components/PremiumDashboardShell";
import { CheckoutModalClient } from "./CheckoutModalClient";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { billingInsertId } from "@/lib/posthog/billing-analytics";
import { captureServerEvent } from "@/lib/posthog-server";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ planId?: string; interval?: string }>;
}) {
  const user = await requirePremiumPageUser({
    loginRedirect: "/premium/checkout",
  });

  const params = await searchParams;
  const planId = params.planId ?? null;
  const interval = params.interval ?? null;
  const viewKey = `${user.id}:${planId ?? "none"}:${interval ?? "none"}`;

  after(() => {
    void captureServerEvent(user.id, "premium_checkout_viewed", {
      plan_id: planId,
      interval,
      source: "checkout_page",
      $insert_id: billingInsertId("premium_checkout_viewed", viewKey),
    });
  });

  return (
        <PremiumDashboardShell user={user}>
            <Suspense fallback={<LoadingScreen />}>
                <CheckoutModalClient user={user} />
            </Suspense>
        </PremiumDashboardShell>
    );
}
