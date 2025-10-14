import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { DashboardContent } from "@/components/dashboard/DashboardContent";

export default async function DashboardPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (key) => cookieStore.get(key)?.value } }
  );

  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    // unified redirect: unauthenticated users go to web auth, then back here
    redirect(`/auth/extension?redirect=/dashboard`);
  }

  return <DashboardContent />;
}
