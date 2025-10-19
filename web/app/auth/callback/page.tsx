'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * Client-side OAuth callback page
 * 
 * This page handles OAuth callbacks where tokens come in the URL hash.
 * Since server-side can't read hash parameters, we extract them here
 * and redirect to the server route with tokens in query parameters.
 */
export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    try {
      // Get the next destination from query params
      const next = searchParams.get('next') || '/dashboard';
      
      // Extract tokens from URL hash
      const hash = window.location.hash.substring(1);
      const hashParams = new URLSearchParams(hash);
      const access_token = hashParams.get('access_token');
      const refresh_token = hashParams.get('refresh_token');
      const expires_at = hashParams.get('expires_at');
      const token_type = hashParams.get('token_type');

      console.log('🔄 Client OAuth callback');
      console.log('Hash present:', !!hash);
      console.log('Access token present:', !!access_token);
      console.log('Refresh token present:', !!refresh_token);
      console.log('Next destination:', next);

      if (access_token && refresh_token) {
        // Redirect to server route with tokens in query parameters
        const serverUrl = new URL('/auth/callback', window.location.origin);
        serverUrl.searchParams.set('access_token', access_token);
        serverUrl.searchParams.set('refresh_token', refresh_token);
        serverUrl.searchParams.set('next', next);
        
        if (expires_at) {
          serverUrl.searchParams.set('expires_at', expires_at);
        }
        if (token_type) {
          serverUrl.searchParams.set('token_type', token_type);
        }

        console.log('↗️ Redirecting to server route with tokens');
        window.location.replace(serverUrl.toString());
      } else {
        console.error('❌ No tokens found in hash');
        // Redirect back to login with error
        const loginUrl = new URL('/auth/extension', window.location.origin);
        loginUrl.searchParams.set('error', 'no_tokens');
        loginUrl.searchParams.set('redirect', next);
        window.location.replace(loginUrl.toString());
      }
    } catch (error) {
      console.error('❌ OAuth callback error:', error);
      // Redirect back to login with error
      const loginUrl = new URL('/auth/extension', window.location.origin);
      loginUrl.searchParams.set('error', 'callback_error');
      loginUrl.searchParams.set('redirect', '/dashboard');
      window.location.replace(loginUrl.toString());
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Completing sign-in...</h2>
        <p className="text-gray-600">Please wait while we process your authentication.</p>
      </div>
    </div>
  );
}
