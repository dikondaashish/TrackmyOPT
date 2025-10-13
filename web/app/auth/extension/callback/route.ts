import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { SignJWT } from "jose";

const alg = "HS256";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const redirect_uri = searchParams.get("redirect_uri");
  const state = searchParams.get("state");

  if (!redirect_uri || !state) {
    return new NextResponse("Missing redirect_uri or state", { status: 400 });
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (n) => cookies().get(n)?.value, set() {}, remove() {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL(`/auth/extension?error=not_signed_in&redirect_uri=${encodeURIComponent(redirect_uri)}&state=${encodeURIComponent(state)}`, req.url));
  }

  const secret = new TextEncoder().encode(process.env.JWT_SIGNING_SECRET!);
  const jwt = await new SignJWT({ sub: user.id, email: user.email })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(secret);

  const html = `
<!doctype html>
<meta charset="utf-8" />
<title>Returning to Extension…</title>
<script>
  const ru = ${JSON.stringify(redirect_uri)};
  const st = ${JSON.stringify(state)};
  const token = ${JSON.stringify(jwt)};
  window.location = ru + "#id_token=" + encodeURIComponent(token) + "&state=" + encodeURIComponent(st);
</script>`;
  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
