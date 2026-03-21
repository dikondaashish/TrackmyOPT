import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";

type RequirePremiumOptions = {
  /** After login, user is sent here (e.g. back to checkout). */
  loginRedirect?: string;
};

/**
 * Auth guard for premium overlay routes (checkout, cancelled) that show the
 * real dashboard blurred behind a foreground card/modal.
 */
export async function requirePremiumPageUser(
  options?: RequirePremiumOptions
): Promise<User> {
  const cookieStore = await cookies();
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
          } catch {
            /* Server Component cookie mutation may be no-op */
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            /* Server Component cookie mutation may be no-op */
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const next = options?.loginRedirect;
    if (next) {
      redirect(`/login?redirect=${encodeURIComponent(next)}`);
    }
    redirect("/login");
  }

  return user;
}
