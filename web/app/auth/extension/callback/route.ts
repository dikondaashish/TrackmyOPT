import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { signToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  
  // Step 4: Read redirect_uri and state from search params
  const redirectUri = requestUrl.searchParams.get('redirect_uri');
  const state = requestUrl.searchParams.get('state');

  // Validate required params
  if (!redirectUri || !state) {
    return NextResponse.redirect(
      `${requestUrl.origin}/auth/extension?error=${encodeURIComponent(
        'Missing redirect_uri or state'
      )}`
    );
  }

  try {
    // Step 1: Retrieve the Supabase session
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    // Step 2: If no session, redirect to /auth/extension with error
    if (sessionError || !session || !session.user) {
      console.error('Session error:', sessionError);
      return NextResponse.redirect(
        `${requestUrl.origin}/auth/extension?redirect_uri=${encodeURIComponent(
          redirectUri
        )}&state=${encodeURIComponent(
          state
        )}&error=${encodeURIComponent(
          'Authentication failed. Please try again.'
        )}`
      );
    }

    // Step 3: Mint a short-lived JWT (10 minutes)
    const jwt = await signToken(
      {
        userId: session.user.id,
        email: session.user.email || '',
      },
      '10m'
    );

    // Step 5: Return HTML page that redirects with token in fragment
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Authentication Successful</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .container {
      text-align: center;
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
    h1 {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }
    p {
      opacity: 0.9;
      font-size: 1rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <h1>Authentication Successful!</h1>
    <p>Redirecting back to extension...</p>
  </div>
  <script>
    (function() {
      const redirectUri = ${JSON.stringify(redirectUri)};
      const state = ${JSON.stringify(state)};
      const jwt = ${JSON.stringify(jwt)};
      
      // Set window.location with token in fragment
      window.location = redirectUri + '#id_token=' + encodeURIComponent(jwt) + '&state=' + encodeURIComponent(state);
    })();
  </script>
</body>
</html>
    `;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.redirect(
      `${requestUrl.origin}/auth/extension?redirect_uri=${encodeURIComponent(
        redirectUri
      )}&state=${encodeURIComponent(
        state
      )}&error=${encodeURIComponent(
        'An unexpected error occurred'
      )}`
    );
  }
}

