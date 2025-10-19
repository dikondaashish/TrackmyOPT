'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * Client-side OAuth callback page for web flows
 * 
 * This page handles the implicit OAuth flow where tokens come in the URL hash.
 * Since server-side can't read hash, we extract them here and pass to server route.
 */
export default function WebCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    try {
      console.log('🔄 Web OAuth callback - processing tokens from hash');
      
      // Get the next destination from query params
      const next = searchParams.get('next') || '/dashboard';
      
      // Check if we have tokens in the hash (implicit flow)
      const hash = window.location.hash.substring(1);
      const hashParams = new URLSearchParams(hash);
      const access_token = hashParams.get('access_token');
      const refresh_token = hashParams.get('refresh_token');
      const expires_at = hashParams.get('expires_at');
      const token_type = hashParams.get('token_type');

      console.log('Token details:', {
        hasAccessToken: !!access_token,
        hasRefreshToken: !!refresh_token,
        expiresAt: expires_at,
        tokenType: token_type
      });

      if (access_token && refresh_token) {
        console.log('✅ Implicit flow detected - redirecting to server route');
        
        // Redirect to server route with tokens in query params
        const serverRoute = `/auth/callback/server?` +
          `access_token=${encodeURIComponent(access_token)}&` +
          `refresh_token=${encodeURIComponent(refresh_token)}&` +
          `expires_at=${encodeURIComponent(expires_at || '')}&` +
          `token_type=${encodeURIComponent(token_type || 'bearer')}&` +
          `next=${encodeURIComponent(next)}`;
        
        console.log('Redirecting to:', serverRoute);
        router.replace(serverRoute);
      } else {
        console.error('❌ No tokens found in hash');
        router.replace(`/auth/extension?error=no_tokens&redirect=${encodeURIComponent(next)}`);
      }
    } catch (error) {
      console.error('❌ Web OAuth callback error:', error);
      router.replace('/auth/extension?error=callback_error&redirect=/dashboard');
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Completing Sign-In</h2>
        <p className="text-gray-600">Please wait while we process your authentication...</p>
      </div>
    </div>
  );
}
