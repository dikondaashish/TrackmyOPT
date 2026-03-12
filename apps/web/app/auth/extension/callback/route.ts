import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { SignJWT } from "jose";

const alg = "HS256";

// Force dynamic rendering since we use request.url
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const redirect_uri = searchParams.get("redirect_uri");
    const state = searchParams.get("state");
    const code = searchParams.get("code"); // OAuth code from Supabase


    if (!redirect_uri || !state) {
      return new NextResponse("Missing redirect_uri or state", { status: 400 });
    }

    // Create Supabase client with proper cookie handling
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
            } catch (error) {
              // Ignore cookie errors in this context
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value: '', ...options });
            } catch (error) {
              // Ignore cookie errors in this context
            }
          },
        },
      }
    );

    // If we have a code, exchange it for a session
    if (code) {
      const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      if (exchangeError) {
        console.error('Code exchange error:', {
          message: exchangeError.message,
          status: exchangeError.status,
          name: exchangeError.name,
        });
        return NextResponse.redirect(
          new URL(
            `/auth/extension?error=code_exchange_failed&error_description=${encodeURIComponent(exchangeError.message)}&redirect_uri=${encodeURIComponent(redirect_uri)}&state=${encodeURIComponent(state)}`, 
            req.url
          )
        );
      }
    }

    // Get the user from the session
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    
    if (!user) {
      console.error('No user found in callback, redirecting back to auth');
      return NextResponse.redirect(
        new URL(
          `/auth/extension?error=not_signed_in&redirect_uri=${encodeURIComponent(redirect_uri)}&state=${encodeURIComponent(state)}`, 
          req.url
        )
      );
    }

    // Create JWT token
    const secret = new TextEncoder().encode(process.env.JWT_SIGNING_SECRET!);
    const jwt = await new SignJWT({ sub: user.id, email: user.email })
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setExpirationTime("10m")
      .sign(secret);


    // Return HTML that redirects to extension with token
    const html = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Returning to Extension…</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-align: center;
    }
    .container {
      padding: 2rem;
    }
    .spinner {
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-top: 4px solid white;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
      margin: 0 auto 2rem;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <h1 style="font-size: 1.5rem; margin-bottom: 0.5rem;">Authentication Successful!</h1>
    <p style="opacity: 0.9;">Redirecting back to extension...</p>
  </div>
  <script>
    (function() {
      const ru = ${JSON.stringify(redirect_uri)};
      const st = ${JSON.stringify(state)};
      const token = ${JSON.stringify(jwt)};
      
      
      // Set window.location with token in fragment
      window.location = ru + "#id_token=" + encodeURIComponent(token) + "&state=" + encodeURIComponent(st);
    })();
  </script>
</body>
</html>`;
    
    return new NextResponse(html, { 
      headers: { 
        "Content-Type": "text/html; charset=utf-8" 
      } 
    });
    
  } catch (error) {
    console.error('Callback error:', error);
    return new NextResponse(
      `Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 
      { status: 500 }
    );
  }
}
