import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { mmddyyyyToISO } from "@/lib/date";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { firstName, lastName, email, password, programEnd, dsoReco, optEadEnd, optStart, stemStart, isStem } = body || {};

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
    email, password, email_confirm: true, user_metadata: { firstName, lastName }
  });
  if (signUpError || !signUpData.user) return NextResponse.json({ ok:false, error: signUpError?.message ?? "signup_failed" }, { status: 400 });

  const uid = signUpData.user.id;

  await supabase.from("profiles").upsert({ user_id: uid, timezone: "America/New_York", is_stem_eligible: !!isStem });

  const toISO = (x: string) => mmddyyyyToISO(x);
  const payload = {
    user_id: uid,
    program_end_date: toISO(programEnd),
    dso_recommendation_date: toISO(dsoReco),
    opt_ead_end_date: toISO(optEadEnd),
    opt_start_date: toISO(optStart),
    stem_start_date: toISO(stemStart) || null
  };

  if (!payload.program_end_date || !payload.opt_ead_end_date || !payload.opt_start_date) {
    return NextResponse.json({ ok:false, error:"invalid_dates" }, { status: 400 });
  }

  await supabase.from("opt_status").upsert(payload);
  return NextResponse.json({ ok:true });
}
