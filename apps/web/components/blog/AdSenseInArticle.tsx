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
  const [slotWideEnough, setSlotWideEnough] = useState(false);
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

    const syncWidth = () => {
      setSlotWideEnough(container.offsetWidth >= MIN_FLUID_AD_WIDTH_PX);
    };

    syncWidth();
    const observer = new ResizeObserver(syncWidth);
    observer.observe(container);
    return () => observer.disconnect();
  }, [consent]);

  useEffect(() => {
    if (consent !== 'accepted' || !slotWideEnough) return;

    const renderAd = () => {
      const ad = adRef.current;
      if (!ad || ad.dataset.adsbygoogleStatus) return;

      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (error) {
        // Ad blockers and delayed consent scripts are expected client conditions.
        console.warn('AdSense in-article unit failed to initialize', error);
      }
    };

    window.addEventListener(ADSENSE_READY_EVENT, renderAd);
    renderAd();
    loadAdSense();

    return () => window.removeEventListener(ADSENSE_READY_EVENT, renderAd);
  }, [consent, slotWideEnough]);

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
