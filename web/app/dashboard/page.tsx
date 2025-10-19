import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { DashboardContent } from "@/components/dashboard/DashboardContent";

export default async function DashboardPage() {
  const cookieStore = cookies();
  
  console.log('🔍 Dashboard: Checking authentication...');
  
  // Create Supabase client with proper cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const value = cookieStore.get(name)?.value;
          console.log(`🍪 Cookie get: ${name} = ${value ? 'exists' : 'missing'}`);
          return value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
            console.log(`🍪 Cookie set: ${name}`);
          } catch (error) {
            console.log(`⚠️ Cookie set failed: ${name}`);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
            console.log(`🍪 Cookie remove: ${name}`);
          } catch (error) {
            console.log(`⚠️ Cookie remove failed: ${name}`);
          }
        },
      },
    }
  );

  const { data, error } = await supabase.auth.getUser();
  
  console.log('👤 Dashboard: User check result:', {
    hasUser: !!data.user,
    userId: data.user?.id,
    email: data.user?.email,
    error: error?.message
  });
  
  if (!data.user) {
    console.log('❌ Dashboard: No user found, redirecting to login');
    redirect(`/login`);
  }

  console.log('✅ Dashboard: User authenticated, rendering dashboard');
  return <DashboardContent />;
}
