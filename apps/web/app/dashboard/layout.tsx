import type { Metadata } from "next";
import { Suspense } from "react";
import "../globals.css";
import { DashboardLayoutClient } from "@/components/layout/DashboardLayoutClient";
import { LoadingScreen } from "@/components/ui/loading-screen";

// Dashboard pages are auth-gated and must never appear in search results.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <DashboardLayoutClient>{children}</DashboardLayoutClient>
    </Suspense>
  );
}
