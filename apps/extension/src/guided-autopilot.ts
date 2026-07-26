import { scanApplicationFields } from './application-field-scan';

export type GuidedNavigationOutcome =
  | 'advanced'
  | 'stopped_final_step'
  | 'stopped_review_step'
  | 'blocked_required_fields'
  | 'no_safe_control'
  | 'stopped';

export interface GuidedNavigationResult {
  outcome: GuidedNavigationOutcome;
  label?: string;
  unansweredRequiredCount?: number;
}

const SAFE_NEXT_RE =
  /^(?:next|continue|save and continue|save & continue|continue application)$/i;
const SAFE_DONE_RE = /^done$/i;
const REVIEW_RE = /^(?:review|review application|review and submit)$/i;
const FINAL_ACTION_RE =
  /\b(?:submit|apply now|send application|complete application|finish application|confirm application)\b/i;
const FINAL_PAGE_RE =
  /\b(?:review (?:and )?submit|ready to submit|submit (?:your )?application|certify (?:and )?submit|final review)\b/i;

function normalizeLabel(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function controlLabel(element: HTMLElement): string {
  if (element instanceof HTMLInputElement) return normalizeLabel(element.value);
  return normalizeLabel(
    element.getAttribute('aria-label') ||
      element.getAttribute('title') ||
      element.textContent ||
      ''
  );
}

function visiblyAvailable(element: HTMLElement): boolean {
  if (
    element.hidden ||
    element.getAttribute('aria-hidden') === 'true' ||
    element.getAttribute('aria-disabled') === 'true'
  ) {
    return false;
  }
  if ('disabled' in element && (element as HTMLButtonElement).disabled) {
    return false;
  }
  const style = window.getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden') return false;
  const isJsdom =
    /jsdom/i.test(element.ownerDocument.defaultView?.navigator.userAgent || '');
  if (!isJsdom && element.getClientRects().length === 0) return false;
  return true;
}

export function countVisibleUnansweredRequiredFields(
  root: ParentNode = document
): number {
  return scanApplicationFields(root).unansweredRequired;
}

export function runGuidedNavigation(
  root: ParentNode = document,
  alreadyClicked: WeakSet<HTMLElement> = new WeakSet()
): GuidedNavigationResult {
  const required = countVisibleUnansweredRequiredFields(root);
  if (required > 0) {
    return {
      outcome: 'blocked_required_fields',
      unansweredRequiredCount: required,
    };
  }

  const pageText = normalizeLabel(
    root instanceof Document
      ? root.body?.innerText || root.body?.textContent || ''
      : (root as HTMLElement).innerText || root.textContent || ''
  );
  if (FINAL_PAGE_RE.test(pageText)) return { outcome: 'stopped_final_step' };

  const controls = Array.from(
    root.querySelectorAll<HTMLElement>(
      'button,input[type="button"],input[type="submit"],[role="button"]'
    )
  ).filter((control) => visiblyAvailable(control) && !alreadyClicked.has(control));

  for (const control of controls) {
    const label = controlLabel(control);
    if (!label) continue;
    if (FINAL_ACTION_RE.test(label)) {
      return { outcome: 'stopped_final_step', label };
    }
    if (REVIEW_RE.test(label)) {
      return { outcome: 'stopped_review_step', label };
    }
    if (SAFE_DONE_RE.test(label)) {
      const type =
        control instanceof HTMLButtonElement || control instanceof HTMLInputElement
          ? control.type
          : '';
      if (type === 'submit') {
        return { outcome: 'stopped_final_step', label };
      }
      alreadyClicked.add(control);
      control.click();
      return { outcome: 'advanced', label };
    }
    if (SAFE_NEXT_RE.test(label)) {
      const type =
        control instanceof HTMLButtonElement || control instanceof HTMLInputElement
          ? control.type
          : '';
      // A submit-typed "Next" is ambiguous: on some ATSs it is the final
      // application submission. Leave it to the user instead of guessing.
      if (type === 'submit') {
        return { outcome: 'no_safe_control', label };
      }
      alreadyClicked.add(control);
      control.click();
      return { outcome: 'advanced', label };
    }
  }
  return { outcome: 'no_safe_control' };
}
