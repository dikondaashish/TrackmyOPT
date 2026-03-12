import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Suspense } from "react";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { DashboardLayoutClient } from "@/components/layout/DashboardLayoutClient";
import { DashboardContent } from "@/components/dashboard/widgets/DashboardContent";
import { CheckoutModalClient } from "./CheckoutModalClient";
import { LoadingScreen } from "@/components/ui/loading-screen";

export default async function CheckoutPage() {
    const cookieStore = await cookies();

    // Create Supabase client with proper cookie handling
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    const value = cookieStore.get(name)?.value;
                    return value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value, ...options });
                    } catch (error) {
                    }
                },
                remove(name: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value: '', ...options });
                    } catch (error) {
                    }
                },
            },
        }
    );

    const { data: { user }, error } = await supabase.auth.getUser();

    if (!user) {
        redirect(`/login`);
    }

    return (
        <Suspense fallback={<LoadingScreen />}>
            <DashboardLayoutClient>
                <div className="relative h-full">
                    {/* Background Dashboard Content - Blurred and non-interactive */}
                    <div className="absolute inset-0 overflow-hidden filter blur-[2px] opacity-60 pointer-events-none select-none" aria-hidden="true">
                        <DashboardContent user={user} />
                    </div>

                    {/* Checkout Modal Overlay */}
                    <div className="relative z-50 flex items-center justify-center h-full">
                        <Suspense fallback={null}>
                            <CheckoutModalClient user={user} />
                        </Suspense>
                    </div>
                </div>
            </DashboardLayoutClient>
        </Suspense>
    );
}
