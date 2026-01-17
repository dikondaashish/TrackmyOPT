import { Suspense } from "react";
import "../globals.css";
import { DashboardLayoutClient } from "@/components/layout/DashboardLayoutClient";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#e8edf5] dark:bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    }>
      <DashboardLayoutClient>{children}</DashboardLayoutClient>
    </Suspense>
  );
}
