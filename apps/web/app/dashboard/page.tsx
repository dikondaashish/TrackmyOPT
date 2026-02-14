import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Suspense } from "react";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { DashboardContent } from "@/components/dashboard/widgets/DashboardContent";

export default async function DashboardPage() {
  const cookieStore = cookies();
  
  
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

  const { data, error } = await supabase.auth.getUser();
  
  if (!data.user) {
    redirect(`/login`);
  }

  return <DashboardContent user={data.user} />;
}
