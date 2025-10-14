'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function CompletingAuthPage() {
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(1);

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
      // EXTENSION FLOW: Complete OAuth in iframe AND navigate to dashboard
      const extensionUrl = `${redirectUri}#id_token=${encodeURIComponent(token)}&state=${encodeURIComponent(state)}`;
      
      console.log('📱 Extension flow detected');
      console.log('🔗 Extension URL:', extensionUrl);
      
      // Create hidden iframe to complete extension handshake
      // This allows the extension to capture the token without navigating away
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = extensionUrl;
      document.body.appendChild(iframe);
      
      console.log('📦 Extension handshake iframe created');
      
      // After extension captures token (1 second), navigate main tab to dashboard
      setTimeout(() => {
        console.log('🌐 Navigating to dashboard:', webRedirect);
        window.location.href = webRedirect;
      }, 1000);
      
      // Update countdown
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 0) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } else if (token) {
      // WEBSITE-ONLY FLOW: Go straight to dashboard
      console.log('🌐 Website-only flow detected');
      console.log('➡️ Redirecting to:', webRedirect);
      window.location.href = webRedirect;
      
    } else {
      console.error('❌ Missing required parameters');
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center p-12 bg-white rounded-2xl shadow-xl max-w-md">
        <div className="text-6xl mb-6">✅</div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Success!</h2>
        <p className="text-gray-600 text-lg mb-6">Authentication complete!</p>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
        </div>
        <p className="text-sm text-gray-500 mt-8">
          Redirecting to dashboard{countdown > 0 ? ` in ${countdown}s` : ''}...
        </p>
      </div>
    </div>
  );
}

