import { Suspense } from "react";
import "../globals.css";
import { DashboardLayoutClient } from "@/components/dashboard/DashboardLayoutClient";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    }>
      <DashboardLayoutClient>{children}</DashboardLayoutClient>
    </Suspense>
  );
}

