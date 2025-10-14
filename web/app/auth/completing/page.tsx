'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function CompletingAuthPage() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get parameters from URL
    const token = searchParams.get('token');
    const state = searchParams.get('state');
    const redirectUri = searchParams.get('redirect_uri');
    const webRedirect = searchParams.get('redirect') || '/dashboard';

    console.log('🔄 Completing authentication...');
    console.log('Token:', token ? 'present' : 'missing');
    console.log('State:', state ? 'present' : 'missing');
    console.log('Redirect URI:', redirectUri);
    console.log('Web Redirect:', webRedirect);

    if (token && state && redirectUri) {
      // EXTENSION FLOW: Navigate to extension URL
      // The extension will capture the token and then navigate this tab to /dashboard
      const extensionUrl = `${redirectUri}#id_token=${encodeURIComponent(token)}&state=${encodeURIComponent(state)}`;
      
      console.log('📱 Extension flow detected');
      console.log('🔗 Extension URL:', extensionUrl);
      console.log('ℹ️ Extension will handle dashboard navigation');
      
      // Navigate to extension URL - extension will capture token and navigate to dashboard
      window.location.replace(extensionUrl);
      
    } else if (token) {
      // WEBSITE-ONLY FLOW: Go straight to dashboard
      console.log('🌐 Website-only flow detected');
      console.log('➡️ Redirecting to:', webRedirect);
      window.location.replace(webRedirect);
      
    } else {
      console.error('❌ Missing required parameters');
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
        <p className="text-sm text-gray-500 mt-8">Taking you to your dashboard...</p>
      </div>
    </div>
  );
}

