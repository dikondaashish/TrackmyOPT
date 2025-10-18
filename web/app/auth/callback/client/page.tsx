'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function ClientCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const redirect = searchParams.get('redirect') || '/dashboard';

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Client callback - handling OAuth tokens from hash');
        
        // Get the hash fragment from the URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        console.log('Client callback - Tokens:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          redirect: redirect
        });

        if (accessToken && refreshToken) {
          // Set the session using the tokens from the hash
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            console.error('Session error:', sessionError);
            setError(sessionError.message);
            setTimeout(() => {
              router.push(`/auth/extension?error=session_failed&redirect=${encodeURIComponent(redirect)}`);
            }, 2000);
            return;
          }

          console.log('Session set successfully, user:', sessionData?.user?.id);
          
          // Redirect to the intended destination
          console.log('Redirecting to:', redirect);
          router.push(redirect);
        } else {
          console.error('No tokens found in hash');
          setError('No authentication tokens found');
          setTimeout(() => {
            router.push(`/auth/extension?error=no_tokens&redirect=${encodeURIComponent(redirect)}`);
          }, 2000);
        }
      } catch (err: any) {
        console.error('Client callback error:', err);
        setError(err.message || 'Authentication failed');
        setTimeout(() => {
          router.push(`/auth/extension?error=callback_error&redirect=${encodeURIComponent(redirect)}`);
        }, 2000);
      }
    };

    handleCallback();
  }, [redirect, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center p-12 bg-white rounded-2xl shadow-xl max-w-md">
        {error ? (
          <>
            <div className="text-red-500 text-5xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Authentication Error</h2>
            <p className="text-gray-600 text-lg mb-6">{error}</p>
            <p className="text-sm text-gray-500">Redirecting back to login...</p>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Completing Authentication</h2>
            <p className="text-gray-600 text-lg mb-6">Please wait while we sign you in...</p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

