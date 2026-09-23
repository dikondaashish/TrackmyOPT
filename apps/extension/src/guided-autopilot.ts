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
  if (element.tagName === 'INPUT') return normalizeLabel((element as HTMLInputElement).value);
  return normalizeLabel(
    element.getAttribute('aria-label') ||
      element.getAttribute('title') ||
      element.textContent ||
      ''
  );
}

function visiblyAvailable(element: HTMLElement): boolean {
  if (!element.isConnected || element.closest('[hidden],[inert],[aria-hidden="true"],[aria-disabled="true"]') || element.matches(':disabled')) return false;
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
  for (let node: HTMLElement | null = element; node; node = node.parentElement) {
    const style = element.ownerDocument.defaultView!.getComputedStyle(node);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
  }
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
  // A populated login or registration form is never a safe navigation step.
  if (Array.from(root.querySelectorAll<HTMLElement>('input[type="password"]')).some(visiblyAvailable)) {
    return { outcome: 'no_safe_control' };
  }
  if (root.querySelector('.tmo-smart-answer-note[data-review-state="pending"],.tmo-smart-answer-note[data-review-state="needs-review"]')) {
    return {outcome:'stopped_review_step'};
  }
  // This scanner cannot prove completeness through embedded documents or
  // custom shadow-hosted forms. Leave their navigation to the applicant.
  if (Array.from(root.querySelectorAll<HTMLElement>('*')).some(element =>
    (element.tagName === 'IFRAME' || element.shadowRoot) && visiblyAvailable(element))) {
    return { outcome: 'no_safe_control' };
  }
  const required = countVisibleUnansweredRequiredFields(root);
  const invalid = Array.from(root.querySelectorAll<HTMLElement>('input,select,textarea,[aria-invalid]'))
    .filter(control => visiblyAvailable(control) && (control.getAttribute('aria-invalid') === 'true' ||
      ('validity' in control && !(control as HTMLInputElement).validity.valid))).length;
  if (required > 0 || invalid > 0) {
    return {
      outcome: 'blocked_required_fields',
      unansweredRequiredCount: Math.max(required, invalid),
    };
  }

  const pageText = normalizeLabel(
    root instanceof Document
      ? root.body?.innerText || root.body?.textContent || ''
      : (root as HTMLElement).innerText || root.textContent || ''
  );
  if (FINAL_PAGE_RE.test(pageText)) return { outcome: 'stopped_final_step' };
  if (Array.from(root.querySelectorAll<HTMLElement>('h1,h2,h3,[role="heading"],[aria-current="step"]'))
    .some(heading => visiblyAvailable(heading) && REVIEW_RE.test(normalizeLabel(heading.textContent || '')))) {
    return { outcome: 'stopped_review_step' };
  }

  const controls = Array.from(
    root.querySelectorAll<HTMLElement>(
      'button,input[type="button"],input[type="submit"],[role="button"]'
    )
  ).filter(visiblyAvailable);

  // Check every visible control before allowing any click, regardless of DOM
  // order. Accessible and visible labels must not hide a final-action signal.
  for (const control of controls) {
    const labels = [controlLabel(control), normalizeLabel(control.textContent || ''),
      normalizeLabel(control.getAttribute('title') || '')];
    const label = controlLabel(control);
    if (labels.some(text => FINAL_ACTION_RE.test(text))) {
      return { outcome: 'stopped_final_step', label };
    }
    if (labels.some(text => REVIEW_RE.test(text))) {
      return { outcome: 'stopped_review_step', label };
    }
  }
  const safe = controls.filter(control => {
    if (alreadyClicked.has(control)) return false;
    const label = controlLabel(control);
    const text = normalizeLabel(control.textContent || '');
    if (text && text !== label && !SAFE_NEXT_RE.test(text) && !SAFE_DONE_RE.test(text)) return false;
    if (SAFE_DONE_RE.test(label)) {
      const type =
        control.tagName === 'BUTTON' || control.tagName === 'INPUT'
          ? (control as HTMLButtonElement | HTMLInputElement).type
          : '';
      if (type === 'submit') {
        return false;
      }
      // Generic Done may finalize an application. Only permit a clearly named
      // education/experience editor, never an unscoped page-level Done.
      const editor = control.closest<HTMLElement>('[role="dialog"],[aria-modal="true"]');
      const editorLabel = editor?.getAttribute('aria-label') || editor?.querySelector('h1,h2,h3')?.textContent || '';
      return Boolean(editor && /\b(?:education|experience|employment)\b/i.test(editorLabel));
    }
    if (SAFE_NEXT_RE.test(label)) {
      const type =
        control.tagName === 'BUTTON' || control.tagName === 'INPUT'
          ? (control as HTMLButtonElement | HTMLInputElement).type
          : '';
      // A submit-typed "Next" is ambiguous: on some ATSs it is the final
      // application submission. Leave it to the user instead of guessing.
      if (type === 'submit') {
        return false;
      }
      return true;
    }
    return false;
  });
  if (safe.length === 1) {
    alreadyClicked.add(safe[0]);
    safe[0].click();
    return { outcome: 'advanced', label: controlLabel(safe[0]) };
  }
  return { outcome: 'no_safe_control' };
}
