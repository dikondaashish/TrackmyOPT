import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { signToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session || !data.user) return NextResponse.json({ ok:false, error: error?.message ?? "login_failed" }, { status: 400 });
  
  // Generate JWT token for extension authentication
  const jwt = await signToken(
    { userId: data.user.id, email: data.user.email || email },
    '10m'
  );
  
  return NextResponse.json({ ok: true, token: jwt });
}
