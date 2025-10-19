'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function CompletingAuthPage() {
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(1);

  useEffect(() => {
    console.log('🚀 COMPLETING PAGE LOADED');
    console.log('Full URL:', window.location.href);
    
    // Get parameters from URL
    const token = searchParams.get('token');
    const state = searchParams.get('state');
    const redirectUri = searchParams.get('redirect_uri');
    const webRedirect = searchParams.get('redirect') || '/dashboard';

    console.log('📋 URL Parameters:');
    console.log('  - Token:', token ? `${token.substring(0, 20)}...` : 'MISSING');
    console.log('  - State:', state || 'MISSING');
    console.log('  - Redirect URI:', redirectUri || 'MISSING');
    console.log('  - Web Redirect:', webRedirect);

    if (token && state && redirectUri) {
      console.log('✅ All extension parameters present');
      
      // EXTENSION FLOW: Navigate to extension URL
      // Extension background script will capture token and navigate to dashboard
      const extensionUrl = `${redirectUri}#id_token=${encodeURIComponent(token)}&state=${encodeURIComponent(state)}`;
      
      console.log('📱 Extension flow detected');
      console.log('🔗 Extension URL:', extensionUrl);
      console.log('🌐 Extension will navigate to dashboard after capturing token');
      console.log('⏳ Redirecting in 100ms...');
      
      // Small delay to ensure logs are visible
      setTimeout(() => {
        console.log('🎯 NOW REDIRECTING TO EXTENSION URL');
        window.location.href = extensionUrl;
      }, 100);
      
    } else if (token) {
      console.log('✅ Token present but no extension params');
      
      // WEBSITE-ONLY FLOW: Go straight to dashboard
      console.log('🌐 Website-only flow detected');
      console.log('➡️ Redirecting to:', webRedirect);
      console.log('⏳ Redirecting in 100ms...');
      
      setTimeout(() => {
        console.log('🎯 NOW REDIRECTING TO:', webRedirect);
        window.location.href = webRedirect;
      }, 100);
      
    } else {
      console.error('❌ CRITICAL ERROR: Missing required parameters');
      console.error('Token present:', !!token);
      console.error('State present:', !!state);
      console.error('Redirect URI present:', !!redirectUri);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center p-12 bg-white rounded-2xl shadow-xl max-w-md">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Authentication Complete</h2>
        <p className="text-gray-600 text-lg mb-6">Please wait while we redirect you...</p>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
        </div>
        <p className="text-sm text-gray-500 mt-8">
          Redirecting{countdown > 0 ? ` in ${countdown}s` : ''}...
        </p>
      </div>
    </div>
  );
}

