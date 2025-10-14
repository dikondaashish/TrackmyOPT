'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function CompletingAuthPage() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get token and state from URL params
    const token = searchParams.get('token');
    const state = searchParams.get('state');
    const redirectUri = searchParams.get('redirect_uri');

    console.log('Completing authentication...');
    console.log('Token:', token ? 'present' : 'missing');
    console.log('State:', state ? 'present' : 'missing');
    console.log('Redirect URI:', redirectUri);

    if (token && state && redirectUri) {
      // Redirect to extension with hash params after a brief moment
      const extensionUrl = `${redirectUri}#id_token=${encodeURIComponent(token)}&state=${encodeURIComponent(state)}`;
      
      console.log('Redirecting to extension:', extensionUrl);
      
      // Use setTimeout to ensure this page is fully rendered first
      setTimeout(() => {
        window.location.replace(extensionUrl);
      }, 100);
    } else {
      console.error('Missing required parameters');
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center p-12 bg-white rounded-2xl shadow-xl max-w-md">
        <div className="text-6xl mb-6">✅</div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Success!</h2>
        <p className="text-gray-600 text-lg mb-6">Completing sign-in...</p>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
        </div>
        <p className="text-sm text-gray-500 mt-8">This window will close automatically</p>
      </div>
    </div>
  );
}

