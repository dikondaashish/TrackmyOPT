import { Suspense } from "react";
import { requirePremiumPageUser } from "../_lib/requirePremiumPageUser";
import { PremiumDashboardShell } from "../_components/PremiumDashboardShell";
import { CheckoutModalClient } from "./CheckoutModalClient";
import { LoadingScreen } from "@/components/ui/loading-screen";

export default async function CheckoutPage() {
    const user = await requirePremiumPageUser({
        loginRedirect: "/premium/checkout",
    });

    return (
        <PremiumDashboardShell user={user}>
            <Suspense fallback={<LoadingScreen />}>
                <CheckoutModalClient user={user} />
            </Suspense>
        </PremiumDashboardShell>
    );
}
