import { Suspense } from "react";
import "../globals.css";
import { DashboardLayoutClient } from "@/components/layout/DashboardLayoutClient";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <DashboardLayoutClient>{children}</DashboardLayoutClient>
    </Suspense>
  );
}
