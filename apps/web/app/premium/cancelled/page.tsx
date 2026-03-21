import type { Metadata } from "next";
import { requirePremiumPageUser } from "../_lib/requirePremiumPageUser";
import { PremiumDashboardShell } from "../_components/PremiumDashboardShell";
import { PremiumCancelledClient } from "./PremiumCancelledClient";

export const metadata: Metadata = {
  title: "Checkout cancelled | TrackMyOPT",
  robots: { index: false, follow: false },
};

export default async function PremiumCancelledPage() {
  const user = await requirePremiumPageUser({
    loginRedirect: "/premium/cancelled",
  });

  return (
    <PremiumDashboardShell user={user}>
      <PremiumCancelledClient />
    </PremiumDashboardShell>
  );
}
