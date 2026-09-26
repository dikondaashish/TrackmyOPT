'use client';

import Image from 'next/image';
import { useState } from 'react';
import assets from '@/lib/documents/template-preview-assets.json';

export function TemplateThumbnail({
  templateId,
  name,
  eager,
}: {
  templateId: string;
  name: string;
  eager: boolean;
}) {
  const asset = assets[templateId as keyof typeof assets];
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  return (
    <div
      className="relative w-full bg-white"
      style={{ aspectRatio: `${asset.width}/${asset.height}` }}
    >
      {failed ? (
        <div
          role="status"
          className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-gray-50 text-sm text-gray-600"
        >
          <p>Preview unavailable</p>
          <button
            type="button"
            className="underline"
            onClick={(event) => {
              event.stopPropagation();
              setAttempt((value) => value + 1);
              setFailed(false);
            }}
          >
            Retry preview
          </button>
        </div>
      ) : (
        <Image
          key={attempt}
          src={`${asset.image}${attempt ? `?retry=${attempt}` : ''}`}
          alt={`${name} resume template preview`}
          width={asset.width}
          height={asset.height}
          unoptimized
          loading={eager ? 'eager' : 'lazy'}
          className="block h-auto w-full"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
