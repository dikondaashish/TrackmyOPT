import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { signToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { firstName, lastName, email, password } = body || {};

  // Validate required fields
  if (!firstName || !lastName || !email || !password) {
    return NextResponse.json({ ok: false, error: "All fields are required" }, { status: 400 });
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  // Create user account
  const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
    email, 
    password, 
    email_confirm: true, 
    user_metadata: { firstName, lastName }
  });
  
  if (signUpError || !signUpData.user) {
    return NextResponse.json({ 
      ok: false, 
      error: signUpError?.message ?? "Signup failed" 
    }, { status: 400 });
  }

  const uid = signUpData.user.id;

  // Create user profile (OPT data will be added later)
  await supabase.from("profiles").upsert({ 
    user_id: uid, 
    timezone: "America/New_York", 
    is_stem_eligible: false // Default, can be updated later
  });
  
  // Generate JWT token for extension authentication
  const jwt = await signToken(
    { userId: uid, email: email },
    '10m'
  );
  
  return NextResponse.json({ ok: true, token: jwt });
}
