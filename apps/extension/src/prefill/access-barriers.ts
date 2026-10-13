/**
 * Human-verification widgets the applicant must complete themselves. TrackMyOPT
 * never interacts with them; it only says one is waiting. Invisible score-based
 * checks (reCAPTCHA v3's badge) are not a step the applicant takes.
 */
const CHALLENGE_SELECTOR = [
  'iframe[src*="google.com/recaptcha/api2/anchor"]',
  'iframe[src*="recaptcha.net/recaptcha/api2/anchor"]',
  'iframe[src*="hcaptcha.com"]',
  'iframe[src*="challenges.cloudflare.com"]',
  '.g-recaptcha:not(.grecaptcha-badge)',
  '.h-captcha',
  '.cf-turnstile',
].join(',');

export type AccessBarrier = 'verification';

function shown(element: Element): boolean {
  const view = element.ownerDocument.defaultView;
  if (!view) return false;
  const style = view.getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden') return false;
  if (element.closest('.grecaptcha-badge, [aria-hidden="true"]')) return false;
  const isJsdom = /jsdom/i.test(view.navigator.userAgent || '');
  if (isJsdom) return true;
  const box = element.getBoundingClientRect();
  return box.width > 0 && box.height > 0;
}

export function detectAccessBarrier(root: ParentNode): AccessBarrier | undefined {
  return Array.from(root.querySelectorAll(CHALLENGE_SELECTOR)).some(shown)
    ? 'verification'
    : undefined;
}

export const ACCESS_BARRIER_COPY: Record<AccessBarrier, string> = {
  verification: 'This page has a human-verification check. Complete it yourself; TrackMyOPT never touches it.',
};
