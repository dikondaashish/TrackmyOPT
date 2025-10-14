'use client';

import { useEffect } from 'react';

export default function CompletingAuthPage() {
  useEffect(() => {
    // This page is shown briefly during the redirect
    // The extension will close this tab automatically
    console.log('Completing authentication...');
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center p-8">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Success!</h2>
        <p className="text-gray-600 mb-4">Completing sign-in...</p>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-sm text-gray-500 mt-6">This window will close automatically</p>
      </div>
    </div>
  );
}

