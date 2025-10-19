'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * Client-side callback page for extension OAuth flow
 * 
 * This page handles implicit OAuth flow where tokens come in the URL hash.
 * Since server-side can't read hash, we extract them here and pass to server route.
 */
export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get params from URL query
    const redirect_uri = searchParams.get('redirect_uri');
    const state = searchParams.get('state');

    if (!redirect_uri || !state) {
      console.error('Missing redirect_uri or state');
      return;
    }

    // Check if we have tokens in the hash (implicit flow)
    const hash = window.location.hash.substring(1);
    const hashParams = new URLSearchParams(hash);
    const access_token = hashParams.get('access_token');
    const refresh_token = hashParams.get('refresh_token');

    if (access_token && refresh_token) {
      // Implicit flow - redirect to server route with tokens in query params
      console.log('Implicit flow detected, passing tokens to server');
      const serverRoute = `/auth/extension/callback/server?` +
        `redirect_uri=${encodeURIComponent(redirect_uri)}&` +
        `state=${encodeURIComponent(state)}&` +
        `access_token=${encodeURIComponent(access_token)}&` +
        `refresh_token=${encodeURIComponent(refresh_token)}`;
      
      router.push(serverRoute);
    } else {
      // PKCE flow - tokens should be handled server-side via route.ts
      console.log('No tokens in hash, likely PKCE flow handled by server');
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Completing sign-in...</h2>
        <p className="text-sm text-gray-600">Please wait while we securely authenticate you.</p>
      </div>
    </div>
  );
}

