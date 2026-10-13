'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ADSENSE_BLOG_SLOT,
  ADSENSE_PUBLISHER_ID,
  ADSENSE_READY_EVENT,
  loadAdSense,
} from '@/lib/adsense';
import {
  COOKIE_CONSENT_CHANGED_EVENT,
  getStoredCookieConsent,
  type CookieConsentStatus,
} from '@/lib/cookie-consent';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/** Google fluid in-article units require at least this width (TagError otherwise). */
const MIN_FLUID_AD_WIDTH_PX = 250;

/**
 * A single responsive in-article unit for public, long-form content.
 * It renders only after optional advertising consent is present.
 */
export function AdSenseInArticle() {
  const [consent, setConsent] = useState<CookieConsentStatus>(null);
  const queuedAdRef = useRef<HTMLModElement | null>(null);
  const containerRef = useRef<HTMLElement>(null);
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    const syncConsent = () => setConsent(getStoredCookieConsent());
    syncConsent();
    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, syncConsent);

    return () => {
      window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, syncConsent);
    };
  }, []);

  useEffect(() => {
    if (consent !== 'accepted') return;

    const container = containerRef.current;
    if (!container) return;

    const renderAd = () => {
      const ad = adRef.current;
      // The SDK sets its status asynchronously; reserve the element before push.
      // Measure the slot again on readiness/resize instead of trusting old layout.
      if (
        !ad ||
        queuedAdRef.current === ad ||
        ad.dataset.adsbygoogleStatus ||
        container.offsetWidth < MIN_FLUID_AD_WIDTH_PX ||
        ad.offsetWidth < MIN_FLUID_AD_WIDTH_PX
      )
        return;

      try {
        queuedAdRef.current = ad;
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {
        console.error('[AdSenseInArticle] ad initialization failed');
      }
    };

    const observer = new ResizeObserver(renderAd);
    observer.observe(container);
    if (adRef.current) observer.observe(adRef.current);
    window.addEventListener(ADSENSE_READY_EVENT, renderAd);
    renderAd();
    loadAdSense();

    return () => {
      observer.disconnect();
      window.removeEventListener(ADSENSE_READY_EVENT, renderAd);
    };
  }, [consent]);

  if (consent !== 'accepted') return null;

  return (
    <aside
      ref={containerRef}
      className="not-prose my-10 min-h-[120px] w-full min-w-[250px] overflow-hidden"
      aria-label="Advertisement"
    >
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', textAlign: 'center' }}
        data-ad-layout="in-article"
        data-ad-format="fluid"
        data-ad-client={ADSENSE_PUBLISHER_ID}
        data-ad-slot={ADSENSE_BLOG_SLOT}
      />
    </aside>
  );
}
