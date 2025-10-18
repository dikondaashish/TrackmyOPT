import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { DashboardContent } from "@/components/dashboard/DashboardContent";

export default async function DashboardPage() {
  const cookieStore = cookies();
  
  // Create Supabase client with proper cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Cookie setting can fail in middleware
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Cookie removal can fail in middleware
          }
        },
      },
    }
  );

  const { data, error } = await supabase.auth.getUser();
  
  console.log('Dashboard auth check:', {
    hasUser: !!data.user,
    userId: data.user?.id,
    email: data.user?.email,
    error: error?.message
  });
  
  if (!data.user) {
    console.log('No user found, redirecting to auth');
    // unified redirect: unauthenticated users go to web auth, then back here
    redirect(`/auth/extension?redirect=/dashboard`);
  }

  return <DashboardContent />;
}
