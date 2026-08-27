/** Shared AdSense browser integration for consent-aware ad units. */

export const ADSENSE_PUBLISHER_ID = 'ca-pub-4262248775973692';
export const ADSENSE_BLOG_SLOT = '5965065084';
export const ADSENSE_READY_EVENT = 'trackmyopt:adsense-ready';

export function loadAdSense(): void {
  if (typeof document === 'undefined') return;

  const existing = document.getElementById('adsense-script');
  if (existing) {
    if (typeof window !== 'undefined' && 'adsbygoogle' in window) {
      window.dispatchEvent(new Event(ADSENSE_READY_EVENT));
    }
    return;
  }

  try {
    const script = document.createElement('script');
    script.id = 'adsense-script';
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUBLISHER_ID}`;
    script.crossOrigin = 'anonymous';
    script.onload = () => {
      window.dispatchEvent(new Event(ADSENSE_READY_EVENT));
    };
    document.head.appendChild(script);
  } catch (error) {
    console.warn('Third-party init failed: AdSense', error);
  }
}
