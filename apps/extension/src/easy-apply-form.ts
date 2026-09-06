/**
 * Application-form discovery, candidate signatures, and required-field coverage
 * helpers for the fill-only prefill engine.
 */

import { classifyField, type FieldKind } from './easy-apply-matchers';
import {
  type PrefillControlOutcome,
} from './prefill-coverage';
import {
  type AutofillVisualFeedback,
} from './autofill-visual-feedback';
import {
  customDropdownHasValue,
  isCustomDropdownControl,
} from './smart-dropdown';
import {
  APPLICATION_CONTROL_SELECTOR,
  getLabelText,
  isControlVisible,
  isFillable,
  isFillableSelect,
  isInputElement,
  isPlainSkillsControl,
  isSelectElement,
  isTextAreaElement,
  queryAllDeep,
  reachableDocuments,
} from './easy-apply-dom';
import {
  NON_RESUME_FILE_FIELD_RE,
  RESUME_FILE_FIELD_RE,
} from './easy-apply-attachments';

const PREFILL_TARGET_ATTR = 'data-tmo-prefill-target';
let prefillTargetSequence = 0;
let prefillControlIdentitySequence = 0;
const prefillControlIdentities = new WeakMap<Element, number>();

export function fieldGroup(kind: FieldKind): string {
  return kind === 'firstName' || kind === 'lastName' || kind === 'fullName' ? 'name' : kind;
}

/**
 * How many DISTINCT application-field kinds a container visibly holds
 * (name / email / phone / city / linkedinUrl / …). Used to recognize a job
 * application form generically, without per-platform selectors. Counts fields
 * whether or not they're already filled, so a partly-completed form still
 * scores, including accessible custom dropdowns.
 */
export function applicationFieldScore(container: HTMLElement): number {
  const kinds = new Set<string>();
  for (const el of queryAllDeep<HTMLElement>(
    container,
    APPLICATION_CONTROL_SELECTOR
  )) {
    if (!isControlVisible(el)) continue;
    const kind = classifyField(getLabelText(el));
    if (kind) kinds.add(fieldGroup(kind));
  }
  return kinds.size;
}

/**
 * Locate the application form to scope filling to.
 *
 * Tries the tightest known containers first (LinkedIn Easy Apply modal,
 * Greenhouse form), then falls back to a GENERIC heuristic that works across
 * essentially any ATS (Lever, Ashby, Workable, SmartRecruiters, Recruitee,
 * Teamtailor, Jobvite, JazzHR, iCIMS, Workday, …): the <form> on the page that
 * most looks like a job application (>= 2 distinct fillable application fields,
 * e.g. name + email). This is label-based and safety-guarded, so it never
 * mis-fills sensitive/custom fields even on platforms not explicitly verified.
 *
 * Returns null when no application-like form is found — the caller toasts.
 */
export function findApplicationForm(): HTMLElement | null {
  const documents = reachableDocuments();
  for (const doc of documents) {
    const linkedin = queryAllDeep<HTMLElement>(
      doc,
      '.jobs-easy-apply-modal, [data-test-modal-id="easy-apply-modal"]',
    )[0];
    if (linkedin) return linkedin;

    const greenhouse = queryAllDeep<HTMLElement>(
      doc,
      'form#application-form, form#application_form, form.application--form',
    )[0];
    if (greenhouse) return greenhouse;
  }

  // Generic: pick the form with the most application-like fields (>= 2),
  // including forms hosted in open shadow roots and same-origin frames.
  let best: HTMLElement | null = null;
  let bestScore = 1; // require at least 2 distinct fields to avoid newsletter/search boxes
  for (const doc of documents) {
    for (const form of queryAllDeep<HTMLElement>(doc, 'form')) {
      const score = applicationFieldScore(form);
      if (score > bestScore) {
        bestScore = score;
        best = form;
      }
    }
  }
  if (best) return best;

  // Multi-step ATS flows sometimes render only one identity field per screen
  // and omit a real <form>. Accept one confidently classified field only inside
  // a strongly application-labelled dialog/region or application URL.
  let singleStep: HTMLElement | null = null;
  let singleStepScore = 0;
  for (const doc of documents) {
    const pageLooksLikeApplication = /\b(apply|application|candidate)\b/i.test(
      `${doc.location?.pathname || ''} ${doc.title || ''}`,
    );
    const candidates = queryAllDeep<HTMLElement>(
      doc,
      '[role="dialog"], [aria-modal="true"], [data-automation-id*="application" i], [data-testid*="application" i], main',
    );
    for (const candidate of candidates) {
      const labelledAsApplication = /\b(apply|application|candidate)\b/i.test(
        `${candidate.getAttribute('aria-label') || ''} ${candidate.getAttribute('data-automation-id') || ''}`,
      );
      if (!pageLooksLikeApplication && !labelledAsApplication) continue;
      const score = applicationFieldScore(candidate);
      if (score > singleStepScore) {
        singleStepScore = score;
        singleStep = candidate;
      }
    }
  }
  return singleStepScore >= 1 ? singleStep : null;
}

function prefillControlIdentity(control: Element): number {
  const existing = prefillControlIdentities.get(control);
  if (existing) return existing;
  prefillControlIdentitySequence += 1;
  prefillControlIdentities.set(control, prefillControlIdentitySequence);
  return prefillControlIdentitySequence;
}

/**
 * Memory-only fingerprint of currently empty deterministic controls. It never
 * contains labels, field values, resume data, or PDF bytes.
 */
export function getPrefillCandidateSignature(): string {
  const container = findApplicationForm();
  if (!container) return '';
  const tokens: string[] = [];
  for (const control of queryAllDeep<HTMLElement>(
    container,
    APPLICATION_CONTROL_SELECTOR
  )) {
    if (!isControlVisible(control)) continue;
    if (isInputElement(control) && control.type.toLowerCase() === 'file') {
      if (
        (!control.files || control.files.length === 0) &&
        RESUME_FILE_FIELD_RE.test(getLabelText(control)) &&
        !NON_RESUME_FILE_FIELD_RE.test(getLabelText(control))
      ) tokens.push(`${prefillControlIdentity(control)}:resume`);
      continue;
    }
    const kind = classifyField(getLabelText(control));
    if (!kind) continue;
    const eligible = kind === 'skills'
      ? isPlainSkillsControl(control) && isFillable(control)
      : isFillable(control) ||
        isFillableSelect(control) ||
        (isCustomDropdownControl(control) && !customDropdownHasValue(control));
    if (eligible) tokens.push(`${prefillControlIdentity(control)}:${kind}`);
  }
  return tokens.length > 0 ? `${window.location.href}|${tokens.join('|')}` : '';
}

function isRequiredControl(el: HTMLElement): boolean {
  return el.hasAttribute('required') || el.getAttribute('aria-required') === 'true';
}

function requiredControlNeedsUser(el: HTMLElement, container: HTMLElement): boolean {
  if (!isRequiredControl(el) || !isControlVisible(el)) return false;
  if (isCustomDropdownControl(el)) return !customDropdownHasValue(el);
  if (isInputElement(el)) {
    if (el.disabled || el.readOnly) return false;
    const type = (el.type || 'text').toLowerCase();
    if (['hidden', 'submit', 'button', 'reset', 'image'].includes(type)) return false;
    if (type === 'radio') {
      const name = el.name;
      const radios = queryAllDeep<HTMLInputElement>(container, 'input[type="radio"]');
      return !radios.some((radio) => (!name || radio.name === name) && radio.checked);
    }
    if (type === 'checkbox') return !el.checked;
    if (type === 'file') return !el.files || el.files.length === 0;
    return !el.value.trim();
  }
  if (isTextAreaElement(el)) return !el.disabled && !el.readOnly && !el.value.trim();
  if (isSelectElement(el)) {
    if (el.disabled) return false;
    const selected = el.selectedOptions[0];
    return !el.value || !selected || selected.disabled || /select|choose|please/i.test(selected.textContent || '');
  }
  return false;
}

function coverageGroupKey(el: HTMLElement, index: number): string {
  if (isInputElement(el) && el.type.toLowerCase() === 'radio') {
    return `radio:${el.name || getLabelText(el) || index}`;
  }
  return `field:${index}`;
}

export function remainingRequiredOutcomes(
  container: HTMLElement,
  visual?: AutofillVisualFeedback
): PrefillControlOutcome[] {
  for (const oldTarget of queryAllDeep<HTMLElement>(container, `[${PREFILL_TARGET_ATTR}]`)) {
    oldTarget.removeAttribute(PREFILL_TARGET_ATTR);
  }
  const outcomes: PrefillControlOutcome[] = [];
  const controls = queryAllDeep<HTMLElement>(
    container,
    APPLICATION_CONTROL_SELECTOR
  );
  for (let index = 0; index < controls.length; index += 1) {
    const control = controls[index];
    if (!requiredControlNeedsUser(control, container)) continue;
    const marker = `tmo-${Date.now().toString(36)}-${++prefillTargetSequence}`;
    control.setAttribute(PREFILL_TARGET_ATTR, marker);
    visual?.markNeedsUser(control);
    outcomes.push({
      needsUser: true,
      groupKey: coverageGroupKey(control, index),
      fieldGroup: (() => {
        const kind = classifyField(getLabelText(control));
        if (kind === 'skills') return 'skills';
        if (kind) return 'contact';
        if (
          isInputElement(control) &&
          control.type.toLowerCase() === 'file' &&
          RESUME_FILE_FIELD_RE.test(getLabelText(control)) &&
          !NON_RESUME_FILE_FIELD_RE.test(getLabelText(control))
        ) return 'resume';
        return undefined;
      })(),
      selector: `[${PREFILL_TARGET_ATTR}="${marker}"]`,
    });
  }
  return outcomes;
}

/** Scroll and focus the first required field left for the user. */
export function jumpToPrefillField(selector: string): boolean {
  if (!selector || !selector.startsWith(`[${PREFILL_TARGET_ATTR}=`)) return false;
  for (const doc of reachableDocuments()) {
    const target = queryAllDeep<HTMLElement>(doc, selector)[0];
    if (!target) continue;
    target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    try { target.focus({ preventScroll: true }); } catch { target.focus(); }
    const previousOutline = target.style.outline;
    const previousOffset = target.style.outlineOffset;
    target.style.outline = '3px solid #f59e0b';
    target.style.outlineOffset = '3px';
    window.setTimeout(() => {
      if (!target.isConnected) return;
      target.style.outline = previousOutline;
      target.style.outlineOffset = previousOffset;
    }, 1800);
    return true;
  }
  return false;
}
