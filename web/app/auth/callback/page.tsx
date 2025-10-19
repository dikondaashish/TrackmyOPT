'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

/**
 * Client-side OAuth callback handler for web flows
 * 
 * This page handles both:
 * 1. Hash-based tokens (implicit flow): #access_token=...
 * 2. Query-based code (PKCE flow): ?code=...
 */
export default function OAuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('🔄 Processing OAuth callback...');
        
        // Check if we have hash params (implicit flow)
        const hash = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hash);
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        // Check if we have query params (PKCE flow)
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get('code');
        const next = searchParams.get('next') || '/dashboard';

        console.log('Has access_token in hash:', !!accessToken);
        console.log('Has code in query:', !!code);
        console.log('Next destination:', next);

        // Handle implicit flow (tokens in hash)
        if (accessToken && refreshToken) {
          console.log('🔐 Implicit flow: Setting session from tokens');
          
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            console.error('❌ Session setup failed:', sessionError);
            setError(sessionError.message);
            return;
          }

          if (!data.session) {
            console.error('❌ No session created');
            setError('Failed to create session');
            return;
          }

          console.log('✅ Session established for user:', data.user?.id);
          console.log('➡️ Redirecting to:', next);
          
          // Small delay to ensure cookies are set
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Redirect to dashboard
          window.location.href = next;
          return;
        }

        // Handle PKCE flow (code in query) - fallback to server route
        if (code) {
          console.log('🔐 PKCE flow: Redirecting to server route');
          // Let the server route handle this
          window.location.href = `/auth/callback/server?code=${encodeURIComponent(code)}&next=${encodeURIComponent(next)}`;
          return;
        }

        // No tokens or code found
        console.error('❌ No authentication data found');
        setError('No authentication data received from provider');
        
        // Redirect back to login after 3 seconds
        setTimeout(() => {
          router.push('/auth/extension?error=no_auth_data&redirect=/dashboard');
        }, 3000);

      } catch (err) {
        console.error('❌ Callback processing error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    handleCallback();
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100">
        <div className="text-center p-12 bg-white rounded-2xl shadow-xl max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Authentication Error</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <p className="text-sm text-gray-500 mb-4">Redirecting you back to login...</p>
          <a 
            href="/auth/extension?redirect=/dashboard"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-6 py-3 transition"
          >
            Back to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center p-12 bg-white rounded-2xl shadow-xl max-w-md">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Completing Sign In</h2>
        <p className="text-gray-600 text-lg mb-6">Please wait while we complete your authentication...</p>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
        </div>
        <p className="text-sm text-gray-500 mt-8">
          This should only take a moment...
        </p>
      </div>
    </div>
  );
}
