import type { Metadata } from "next";
import { PremiumCancelledClient } from "./PremiumCancelledClient";

export const metadata: Metadata = {
  title: "Checkout cancelled | TrackMyOPT",
  robots: { index: false, follow: false },
};

export default function PremiumCancelledPage() {
  return <PremiumCancelledClient />;
}
