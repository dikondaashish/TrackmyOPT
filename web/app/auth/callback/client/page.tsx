'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * Client-side OAuth Callback Handler for Implicit Flow
 * 
 * This page handles OAuth callbacks where tokens come in the URL hash fragment.
 * Since server-side code can't read the hash, we extract tokens here and 
 * forward them to the server route via query params.
 * 
 * Flow:
 * 1. Google redirects to /auth/callback with tokens in hash
 * 2. Server sees no code, redirects to this client page
 * 3. Client JS reads hash tokens
 * 4. Redirects back to server with tokens in query params
 * 5. Server sets session and redirects to dashboard
 */
export default function AuthCallbackClient() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const next = searchParams.get('next') || '/dashboard';
      
      console.log('🔍 Client-side hash parser activated');
      console.log('Full URL:', window.location.href);
      console.log('Hash:', window.location.hash);
      
      // Parse tokens from URL hash
      const hash = window.location.hash.substring(1); // Remove leading #
      const hashParams = new URLSearchParams(hash);
      
      const access_token = hashParams.get('access_token');
      const refresh_token = hashParams.get('refresh_token');
      const expires_at = hashParams.get('expires_at');
      const expires_in = hashParams.get('expires_in');
      const token_type = hashParams.get('token_type');
      
      console.log('Extracted from hash:');
      console.log('- Access token:', access_token ? `${access_token.substring(0, 20)}...` : 'none');
      console.log('- Refresh token:', refresh_token ? `${refresh_token.substring(0, 20)}...` : 'none');
      console.log('- Expires at:', expires_at);
      console.log('- Expires in:', expires_in);
      console.log('- Token type:', token_type);

      if (!access_token || !refresh_token) {
        console.error('❌ No tokens found in hash');
        setError('No authentication tokens found. Please try again.');
        
        // Redirect back to login after 3 seconds
        setTimeout(() => {
          window.location.href = '/auth/extension?error=no_tokens&redirect=' + encodeURIComponent(next);
        }, 3000);
        return;
      }

      console.log('✅ Tokens extracted successfully');
      console.log('🔄 Forwarding to server for session establishment...');

      // Forward tokens to server route via query params
      const serverUrl = new URL('/auth/callback', window.location.origin);
      serverUrl.searchParams.set('access_token', access_token);
      serverUrl.searchParams.set('refresh_token', refresh_token);
      serverUrl.searchParams.set('next', next);
      
      if (expires_at) {
        serverUrl.searchParams.set('expires_at', expires_at);
      }

      console.log('↗️ Redirecting to:', serverUrl.pathname);
      
      // Use replace to avoid back button issues
      window.location.replace(serverUrl.toString());
    } catch (err) {
      console.error('❌ Error parsing OAuth callback:', err);
      setError('Authentication failed. Please try again.');
      
      setTimeout(() => {
        window.location.href = '/auth/extension?error=parse_failed&redirect=/dashboard';
      }, 3000);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
        {error ? (
          // Error state
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Authentication Failed
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {error}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Redirecting to login page...
            </p>
          </div>
        ) : (
          // Loading state
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Completing Sign In...
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Processing your Google authentication
            </p>
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              This should only take a moment...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

