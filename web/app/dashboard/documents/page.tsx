/**
 * Document Vault - Main Page
 * 
 * Premium feature with passcode protection, AI document analysis,
 * and secure cloud storage
 */

import { Suspense } from 'react';
import { DocumentVaultClient } from '@/components/dashboard/DocumentVaultClient';

export const metadata = {
  title: 'Document Vault | TrackMyOPT',
  description: 'Securely store and manage your immigration documents with AI-powered analysis',
};

export default function DocumentVaultPage() {
  return (
    <div className="container mx-auto px-6 pt-0 pb-6 max-w-7xl">
      <Suspense fallback={<DocumentVaultSkeleton />}>
        <DocumentVaultClient />
      </Suspense>
    </div>
  );
}

function DocumentVaultSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div>
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg border p-4">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Filters Skeleton */}
      <div className="flex gap-4">
        <div className="h-10 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-10 w-48 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Documents Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-lg border p-4">
            <div className="h-48 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

