import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { mintToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
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
    // Create Supabase client with cookies
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

    // Get the current session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

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

    // Mint JWT token (10 minutes expiry)
    const jwt = await mintToken(
      {
        userId: session.user.id,
        email: session.user.email || '',
      },
      600 // 10 minutes
    );

    // Return HTML page that redirects with token in fragment
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
      const idToken = ${JSON.stringify(jwt)};
      
      // Build the redirect URL with token in fragment
      const url = redirectUri + '#id_token=' + encodeURIComponent(idToken) + '&state=' + encodeURIComponent(state);
      
      // Log for debugging (remove in production)
      console.log('Redirecting to:', url);
      
      // Redirect immediately
      window.location.href = url;
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

