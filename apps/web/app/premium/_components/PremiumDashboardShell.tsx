import { DashboardLayoutClient } from "@/components/layout/DashboardLayoutClient";
import { DashboardContent } from "@/components/dashboard/widgets/DashboardContent";
import type { User } from "@supabase/supabase-js";

/**
 * Full dashboard chrome with real dashboard content blurred behind a centered overlay.
 * Used by /premium/checkout and /premium/cancelled for a consistent “in-app” upgrade flow.
 */
export function PremiumDashboardShell({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  return (
    <DashboardLayoutClient>
      <div className="relative h-full">
        {/* Background: same dashboard as home, non-interactive + soft blur */}
        <div
          className="absolute inset-0 overflow-hidden filter blur-[2px] opacity-60 pointer-events-none select-none"
          aria-hidden="true"
        >
          <DashboardContent user={user} />
        </div>
        {/* Foreground: pricing modal or cancelled card */}
        <div className="relative z-50 flex min-h-[min(560px,calc(100vh-8rem))] items-center justify-center px-2 py-4 sm:px-3 sm:py-6">
          {children}
        </div>
      </div>
    </DashboardLayoutClient>
  );
}
