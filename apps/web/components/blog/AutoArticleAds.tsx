'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import { AdSenseInArticle } from '@/components/blog/AdSenseInArticle';
import { useConsent } from '@/components/privacy/use-privacy';
import {
  NO_EXTRA_ADS_SLUGS,
  blogPostSlug,
  findAdAnchors,
} from '@/lib/ad-placement';

/**
 * In-article ads for hand-written blog posts, which have no ad slots in
 * their JSX. After the page has rendered and marketing consent is given, it
 * inserts up to two slots between sections of the article (see
 * lib/ad-placement.ts) and renders an AdSense unit into each. Posts that
 * place their own units (`data-explicit-ads`) and the sign-up pages in
 * NO_EXTRA_ADS_SLUGS are left alone.
 */
export function AutoArticleAds() {
  const pathname = usePathname();
  const marketingAllowed = useConsent('marketing');
  const [slots, setSlots] = useState<HTMLElement[]>([]);

  useEffect(() => {
    const slug = blogPostSlug(pathname ?? '');
    if (!marketingAllowed || !slug || NO_EXTRA_ADS_SLUGS.has(slug)) return;

    const article = document.querySelector('main article');
    if (
      !article ||
      article.closest('[data-explicit-ads]') ||
      article.querySelector('[data-explicit-ads]')
    )
      return;

    let created: HTMLElement[] = [];
    try {
      created = findAdAnchors(article).map((anchor) => {
        const slot = document.createElement('div');
        slot.dataset.autoAdSlot = '';
        anchor.parentElement!.insertBefore(slot, anchor);
        return slot;
      });
    } catch (error) {
      console.error('[AutoArticleAds] ad placement failed', error);
      created.forEach((slot) => slot.remove());
      return;
    }
    // The slots are DOM nodes inserted into server-rendered article HTML; the
    // portals that fill them can only be created after that insertion.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSlots(created);

    return () => {
      created.forEach((slot) => slot.remove());
      setSlots([]);
    };
  }, [pathname, marketingAllowed]);

  return (
    <>
      {slots.map((slot, index) =>
        createPortal(<AdSenseInArticle />, slot, `auto-ad-${index}`)
      )}
    </>
  );
}
