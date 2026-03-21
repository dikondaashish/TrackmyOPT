import { Suspense } from "react";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { PremiumSuccessClient } from "./PremiumSuccessClient";

export default function PremiumSuccessPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <PremiumSuccessClient />
    </Suspense>
  );
}
