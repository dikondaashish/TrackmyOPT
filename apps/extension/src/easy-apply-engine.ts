/**
 * TrackMyOPT — job application prefill engine (FILL-ONLY).
 *
 * Shared by BOTH the popup-injected script (easy-apply-fill.ts) and the on-page
 * job widget (content-job-portal.ts), so the fill logic and its safety rules
 * live in exactly one place. Fills the visible identity text fields of a
 * supported, OPEN application form from the user's TrackMyOPT profile, then
 * stops. The engine is ATS-agnostic and uses native semantics plus guarded
 * heuristics across LinkedIn, Greenhouse, Workday, Lever, Ashby, iCIMS, and
 * other standards-based application forms.
 *
 * HARD INVARIANTS — do not change without product + compliance sign-off. These
 * apply to EVERY platform, no exceptions:
 *  1. NEVER clicks any action button. No Submit / Next / Review automation.
 *     Guided navigation is a separate, explicit mode and still stops before
 *     Review/Submit. Exact custom-dropdown option selection is delegated to
 *     smart-dropdown.ts, whose candidates can never include action buttons.
 *  2. NEVER fills work-authorization / visa / sponsorship / EEO / salary / DOB /
 *     SSN fields. Those are the user's to answer (see SENSITIVE_FIELD_RE).
 *  3. NEVER overwrites a value the user already entered.
 *  4. Custom dropdowns are selected only when exactly one high-confidence
 *     saved value matches. Ambiguous or unsupported controls remain for review.
 *  5. No timers/delays for evasion, no loop. One open form, once.
 *  6. A resume PDF is attached only when the caller provides the
 *     job-scoped *generated* PDF for this posting. Never invent or upload a
 *     base/saved resume. If nothing was generated, leave the file input alone.
 *     Also require a confidently labeled Resume/CV input with no file already
 *     selected by the user.
 *
 * The JWT never reaches this code: it asks the background worker for the
 * resolved profile; the token stays in the background.
 */

import { classifyField, type FieldKind } from './easy-apply-matchers';
import {
  emptyPrefillCoverage,
  summarizePrefillOutcomes,
  type PrefillControlOutcome,
  type PrefillCoverageResult,
} from './prefill-coverage';
import { buildContactAutofillProfile } from './prefill-contact-source';
import { buildSkillsPrefillValue } from './skills-prefill';
import type {
  BasicContactProfile,
  GeneratedCoverLetterAttachment,
  ResumeAutofillSnapshotV1,
} from './resume-autofill-contract';
import { selectAtsPrefillAdapter } from './ats-prefill-adapters';
import { fillRepeatableRecords } from './repeatable-record-engine';
import {
  resolveAutofillFeatureFlags,
  type AutofillFeatureFlags,
} from './autofill-feature-flags';
import { autofillErrorCopy } from './autofill-errors';
import {
  createAutofillVisualFeedback,
  type AutofillVisualFeedback,
} from './autofill-visual-feedback';
import { scanApplicationFields } from './application-field-scan';
import {
  CUSTOM_DROPDOWN_SELECTOR,
  customDropdownHasValue,
  isCustomDropdownControl,
  selectSmartDropdown,
  type SmartDropdownMatchKind,
} from './smart-dropdown';

export type { PrefillCoverageResult } from './prefill-coverage';

type AutofillProfile = BasicContactProfile;

export interface GeneratedResumeAttachment {
  pdfBase64: string;
  filename: string;
}

export interface PrefillOptions {
  resume?: GeneratedResumeAttachment;
  coverLetter?: GeneratedCoverLetterAttachment;
  generatedContentHash?: string;
  snapshot?: ResumeAutofillSnapshotV1;
  profileFallback?: BasicContactProfile;
  /** Rule 8 is default-off and only reads snapshot.skills when explicitly on. */
  autofillSkills?: boolean;
  /** Child frames without an application form should stay silent so only the
   * frame that actually fills fields reports a result. */
  quietIfNoForm?: boolean;
  /** Continuous mode reports through the widget instead of spawning toasts. */
  quietResultToast?: boolean;
  /** Tests/future remote config only. Runtime message boundaries do not relay
   * feature overrides from job pages. */
  featureFlags?: Partial<AutofillFeatureFlags>;
}

type ResumeAttachmentResult =
  | 'not_requested'
  | 'attached'
  | 'already_present'
  | 'not_found'
  | 'unsupported'
  | 'source_mismatch';

const TOAST_ID = 'tmo-easy-apply-toast';
const FILLABLE_INPUT_TYPES = new Set(['text', 'email', 'tel', 'url', 'number']);
const RESUME_FILE_FIELD_RE = /\b(resume|résumé|curriculum\s+vitae|cv)\b/i;
const NON_RESUME_FILE_FIELD_RE = /\b(cover\s+letter|portfolio|photo|headshot|transcript|certificate)\b/i;
const PREFILL_TARGET_ATTR = 'data-tmo-prefill-target';
let prefillTargetSequence = 0;
let prefillControlIdentitySequence = 0;
const prefillControlIdentities = new WeakMap<Element, number>();

type SearchRoot = Document | ShadowRoot | HTMLElement;
type FillableControl = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
const APPLICATION_CONTROL_SELECTOR =
  `input,textarea,select,${CUSTOM_DROPDOWN_SELECTOR}`;

const isInputElement = (el: Element): el is HTMLInputElement => el.tagName === 'INPUT';
const isTextAreaElement = (el: Element): el is HTMLTextAreaElement => el.tagName === 'TEXTAREA';
const isSelectElement = (el: Element): el is HTMLSelectElement => el.tagName === 'SELECT';

function queryAllDeep<T extends Element>(root: SearchRoot, selector: string): T[] {
  const matches = Array.from(root.querySelectorAll<T>(selector));
  for (const host of Array.from(root.querySelectorAll<HTMLElement>('*'))) {
    if (host.shadowRoot) matches.push(...queryAllDeep<T>(host.shadowRoot, selector));
  }
  return matches;
}

/** Documents reachable under browser same-origin rules. Cross-origin frames
 * are deliberately skipped; browser security does not permit safe DOM access. */
function reachableDocuments(): Document[] {
  const documents: Document[] = [document];
  const seen = new Set<Document>(documents);
  for (let index = 0; index < documents.length; index += 1) {
    for (const frame of queryAllDeep<HTMLIFrameElement>(documents[index], 'iframe')) {
      try {
        const child = frame.contentDocument;
        if (child?.body && !seen.has(child)) {
          seen.add(child);
          documents.push(child);
        }
      } catch {
        // Cross-origin frame: inaccessible by design.
      }
    }
  }
  return documents;
}

/** Build a lowercased label string for a control from every nearby signal. */
export function getLabelText(el: HTMLElement): string {
  const parts: string[] = [];
  const push = (s: string | null | undefined) => {
    if (s) parts.push(s);
  };

  push(el.getAttribute('aria-label'));
  push(el.getAttribute('name'));
  push(el.getAttribute('placeholder'));
  push(el.getAttribute('title'));
  push(el.getAttribute('autocomplete'));
  push(el.getAttribute('data-testid'));
  push(el.getAttribute('data-test-id'));
  push(el.getAttribute('data-automation-id'));
  push(el.getAttribute('data-field'));
  push(el.getAttribute('data-qa'));

  if (isInputElement(el) && (el.type === 'email' || el.type === 'tel')) {
    push(el.type);
  }

  const ownerDocument = el.ownerDocument;
  const rootNode = el.getRootNode();
  const labelRoot = rootNode && 'querySelector' in rootNode
    ? rootNode as Document | ShadowRoot
    : ownerDocument;

  const id = el.getAttribute('id');
  if (id) {
    const forLabel = Array.from(labelRoot.querySelectorAll('label[for]'))
      .find((label) => label.getAttribute('for') === id);
    push(forLabel?.textContent);
  }
  for (const relation of ['aria-labelledby', 'aria-describedby']) {
    const ids = el.getAttribute(relation)?.split(/\s+/).filter(Boolean) || [];
    for (const relatedId of ids) push(ownerDocument.getElementById(relatedId)?.textContent);
  }
  push(el.closest('label')?.textContent);
  // LinkedIn's artdeco form label + fieldset legend
  push(el.closest('.artdeco-text-input--container, [data-test-form-element]')
    ?.querySelector('label, .artdeco-text-input--label')?.textContent);
  push(el.closest('fieldset')?.querySelector('legend')?.textContent);

  const fieldWrapper = el.closest<HTMLElement>(
    '[data-automation-id*="formField" i], [data-testid*="field" i], .application-field, .form-field, .field',
  );
  push(
    fieldWrapper?.querySelector(
      'label, legend, [data-automation-id*="label" i], [class*="label" i]',
    )?.textContent,
  );

  // Last resort: many generic company forms place a plain <span>/<div>/<p>/
  // <label> caption immediately before the input with no for/aria association.
  // Read a short, non-interactive preceding sibling as a label signal.
  if (parts.length === 0) {
    const prev = el.previousElementSibling;
    if (
      prev &&
      /^(label|span|div|p|strong|b)$/i.test(prev.tagName) &&
      !prev.querySelector('input, select, textarea, button')
    ) {
      const text = prev.textContent?.replace(/\s+/g, ' ').trim() || '';
      if (text && text.length <= 60) push(text);
    }
  }

  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

/**
 * True for react-select / autocomplete / typeahead widgets. Their visible
 * <input> is a combobox: setting .value shows text but does NOT register a
 * real selection, so filling one is misleading. Never fill these — the user
 * picks from the dropdown themselves. (Greenhouse Country/EEO dropdowns, a
 * LinkedIn location typeahead, etc.)
 */
function isComboboxLike(el: HTMLElement): boolean {
  return (
    el.getAttribute('role') === 'combobox' ||
    el.hasAttribute('aria-autocomplete') ||
    el.classList.contains('select__input') ||
    Boolean(el.parentElement?.closest(CUSTOM_DROPDOWN_SELECTOR))
  );
}

function dropdownMatchKind(kind: FieldKind): SmartDropdownMatchKind {
  if (kind === 'country' || kind === 'state' || kind === 'location') {
    return kind;
  }
  return 'generic';
}

/** A control is fillable only if visible, enabled, empty, a text-like input or textarea, and not a combobox. */
function isFillable(el: HTMLElement): el is HTMLInputElement | HTMLTextAreaElement {
  if (isComboboxLike(el)) return false;
  if (isTextAreaElement(el)) {
    return isVisibleEditableEmpty(el);
  }
  if (isInputElement(el)) {
    if (!FILLABLE_INPUT_TYPES.has((el.type || 'text').toLowerCase())) return false;
    return isVisibleEditableEmpty(el);
  }
  return false;
}

/** V1 does not operate tag editors. Only ordinary text inputs/textareas qualify. */
function isPlainSkillsControl(el: HTMLElement): el is HTMLInputElement | HTMLTextAreaElement {
  if (!isInputElement(el) && !isTextAreaElement(el)) return false;
  if (isComboboxLike(el)) return false;
  return !el.closest(
    '[role="combobox"], [role="listbox"], [aria-multiselectable="true"], ' +
      '[data-automation-id*="multiSelect" i], [data-testid*="tag" i], [class*="tag-input" i]',
  );
}

function isVisibleEditableEmpty(el: HTMLInputElement | HTMLTextAreaElement): boolean {
  if (el.disabled || el.readOnly) return false;
  if (el.value && el.value.trim() !== '') return false; // never overwrite
  if (!isControlVisible(el)) return false;
  return true;
}

function isControlVisible(el: HTMLElement): boolean {
  if (!el.isConnected || el.hidden || el.getAttribute('aria-hidden') === 'true') return false;
  const view = el.ownerDocument.defaultView;
  if (!view) return false;
  const style = view.getComputedStyle(el);
  if (style.visibility === 'hidden' || style.display === 'none' || style.opacity === '0') return false;
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

function valueForKind(kind: FieldKind, p: AutofillProfile): string {
  switch (kind) {
    case 'email':
      return p.email;
    case 'firstName':
      return p.firstName;
    case 'lastName':
      return p.lastName;
    case 'fullName':
      return p.fullName || [p.firstName, p.lastName].filter(Boolean).join(' ');
    case 'phone':
      return p.phone;
    case 'country':
      return p.country;
    case 'streetAddress':
      return p.streetAddress;
    case 'city':
      return p.city;
    case 'state':
      return p.state;
    case 'postalCode':
      return p.postalCode;
    case 'countyDistrict':
      return p.countyDistrict;
    case 'location':
      return [p.city, p.state].filter(Boolean).join(', ');
    case 'yearsExperience':
      return p.yearsExperience;
    case 'linkedinUrl':
      return p.linkedinUrl;
    case 'githubUrl':
      return p.githubUrl;
    case 'portfolioUrl':
      return p.portfolioUrl;
    case 'skills':
      return '';
  }
}

const US_STATE_NAMES: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado',
  CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho',
  IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana',
  ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota',
  MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada',
  NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina',
  ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania',
  RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas',
  UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'West Virginia',
  WI: 'Wisconsin', WY: 'Wyoming', DC: 'District of Columbia',
};

function normalizeOptionValue(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function matchingSelectValue(
  select: HTMLSelectElement,
  kind: FieldKind,
  profileValue: string,
): string | null {
  const candidates = new Set([normalizeOptionValue(profileValue)]);
  if (kind === 'state') {
    const stateCode = profileValue.trim().toUpperCase();
    const stateName = US_STATE_NAMES[stateCode];
    if (stateName) candidates.add(normalizeOptionValue(stateName));
    for (const [code, name] of Object.entries(US_STATE_NAMES)) {
      if (normalizeOptionValue(name) === normalizeOptionValue(profileValue)) {
        candidates.add(normalizeOptionValue(code));
      }
    }
  }

  for (const option of Array.from(select.options)) {
    if (option.disabled || !option.value) continue;
    if (
      candidates.has(normalizeOptionValue(option.value)) ||
      candidates.has(normalizeOptionValue(option.textContent || ''))
    ) return option.value;
  }
  return null;
}

function isFillableSelect(el: HTMLElement): el is HTMLSelectElement {
  if (!isSelectElement(el) || el.disabled || el.multiple || !isControlVisible(el)) return false;
  const selected = el.selectedOptions[0];
  return !el.value || !selected || selected.disabled || /select|choose|please/i.test(selected.textContent || '');
}

function setNativeSelectValue(el: HTMLSelectElement, value: string): void {
  const view = el.ownerDocument.defaultView;
  const proto = view?.HTMLSelectElement.prototype;
  const setter = proto ? Object.getOwnPropertyDescriptor(proto, 'value')?.set : undefined;
  if (setter) setter.call(el, value);
  else el.value = value;
  const EventCtor = view?.Event || Event;
  el.dispatchEvent(new EventCtor('input', { bubbles: true, composed: true }));
  el.dispatchEvent(new EventCtor('change', { bubbles: true, composed: true }));
}

/** Set a value the way frameworks (React/Ember) expect: native setter + input/change. */
function setNativeValue(el: HTMLInputElement | HTMLTextAreaElement, value: string): void {
  const view = el.ownerDocument.defaultView;
  const proto = isTextAreaElement(el)
    ? view?.HTMLTextAreaElement.prototype
    : view?.HTMLInputElement.prototype;
  const setter = proto ? Object.getOwnPropertyDescriptor(proto, 'value')?.set : undefined;
  if (setter) {
    setter.call(el, value);
  } else {
    el.value = value;
  }
  const EventCtor = view?.Event || Event;
  const InputEventCtor = view?.InputEvent;
  if (InputEventCtor) {
    el.dispatchEvent(new InputEventCtor('input', {
      bubbles: true,
      composed: true,
      data: value,
      inputType: 'insertText',
    }));
  } else {
    el.dispatchEvent(new EventCtor('input', { bubbles: true, composed: true }));
  }
  el.dispatchEvent(new EventCtor('change', { bubbles: true, composed: true }));
  el.dispatchEvent(new EventCtor('blur', { bubbles: true, composed: true }));
}

function getFileInputLabel(input: HTMLInputElement): string {
  const parts = [getLabelText(input)];
  const describedBy = input.getAttribute('aria-describedby');
  if (describedBy) {
    for (const id of describedBy.split(/\s+/)) {
      parts.push(document.getElementById(id)?.textContent || '');
    }
  }
  const field = input.closest<HTMLElement>(
    '[data-test-form-element], .jobs-document-upload, .application-field, .field, .form-field'
  );
  if (field?.textContent) parts.push(field.textContent.slice(0, 300));
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

function acceptsPdf(input: HTMLInputElement): boolean {
  const accept = (input.accept || '').trim().toLowerCase();
  if (!accept || accept === '*/*') return true;
  return accept.split(',').some((value) => {
    const token = value.trim();
    return token === '.pdf' || token === 'application/pdf' || token === 'application/*';
  });
}

function pdfBase64ToFile(pdfBase64: string, filename: string): File | null {
  try {
    const bytes = Uint8Array.from(atob(pdfBase64), (char) => char.charCodeAt(0));
    if (bytes.length < 5) return null;
    const safeFilename = filename.toLowerCase().endsWith('.pdf') ? filename : `${filename}.pdf`;
    return new File([bytes], safeFilename, { type: 'application/pdf', lastModified: Date.now() });
  } catch {
    return null;
  }
}

/** Attach only to a confidently identified, currently empty Resume/CV input. */
export function attachGeneratedResume(
  container: HTMLElement,
  attachment?: GeneratedResumeAttachment,
  onAttached?: (input: HTMLInputElement) => void
): ResumeAttachmentResult {
  if (!attachment) return 'not_requested';
  const file = pdfBase64ToFile(attachment.pdfBase64, attachment.filename);
  if (!file || typeof DataTransfer === 'undefined') return 'unsupported';

  const inputs = queryAllDeep<HTMLInputElement>(container, 'input[type="file"]');
  let sawResumeInput = false;
  for (const input of inputs) {
    const label = getFileInputLabel(input);
    if (!RESUME_FILE_FIELD_RE.test(label) || NON_RESUME_FILE_FIELD_RE.test(label)) continue;
    sawResumeInput = true;
    if (input.disabled) continue;
    if (input.files && input.files.length > 0) return 'already_present';
    if (!acceptsPdf(input)) continue;

    try {
      const transfer = new DataTransfer();
      transfer.items.add(file);
      input.files = transfer.files;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      onAttached?.(input);
      return 'attached';
    } catch {
      return 'unsupported';
    }
  }

  return sawResumeInput ? 'unsupported' : 'not_found';
}

export function attachGeneratedCoverLetter(
  container: HTMLElement,
  attachment: GeneratedCoverLetterAttachment | undefined,
  generatedContentHash: string | undefined,
  onAttached?: (input: HTMLInputElement) => void
): ResumeAttachmentResult {
  if (!attachment) return 'not_requested';
  if (
    !generatedContentHash ||
    attachment.sourceContentHash !== generatedContentHash
  )
    return 'source_mismatch';
  const file = pdfBase64ToFile(attachment.base64, attachment.filename);
  if (!file || typeof DataTransfer === 'undefined') return 'unsupported';
  let saw = false;
  for (const input of queryAllDeep<HTMLInputElement>(
    container,
    'input[type="file"]'
  )) {
    const label = getFileInputLabel(input);
    if (
      !/\b(cover\s*letter|letter\s*of\s*interest)\b/i.test(label) ||
      /\b(resume|cv|portfolio|transcript|photo|certificate)\b/i.test(label)
    )
      continue;
    saw = true;
    if (input.disabled) continue;
    if (input.files?.length) return 'already_present';
    if (!acceptsPdf(input)) continue;
    try {
      const transfer = new DataTransfer();
      transfer.items.add(file);
      input.files = transfer.files;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      onAttached?.(input);
      return 'attached';
    } catch {
      return 'unsupported';
    }
  }
  return saw ? 'unsupported' : 'not_found';
}

function showToast(message: string): void {
  document.getElementById(TOAST_ID)?.remove();
  const el = document.createElement('div');
  el.id = TOAST_ID;
  el.setAttribute('role', 'status');
  el.textContent = message; // textContent only — never innerHTML
  el.style.cssText = [
    'position:fixed', 'top:16px', 'left:50%', 'transform:translateX(-50%)',
    'z-index:2147483647', 'max-width:420px', 'padding:12px 16px',
    'background:#111827', 'color:#fff', 'font-size:13px', 'line-height:1.4',
    'font-weight:600', 'border-radius:10px', 'box-shadow:0 6px 24px rgba(0,0,0,0.25)',
    "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",
  ].join(';');
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 8000);
}

/** Group name variants so first/last/full count as one "name" signal. */
function fieldGroup(kind: FieldKind): string {
  return kind === 'firstName' || kind === 'lastName' || kind === 'fullName' ? 'name' : kind;
}

/**
 * How many DISTINCT application-field kinds a container visibly holds
 * (name / email / phone / city / linkedinUrl / …). Used to recognize a job
 * application form generically, without per-platform selectors. Counts fields
 * whether or not they're already filled, so a partly-completed form still
 * scores, including accessible custom dropdowns.
 */
function applicationFieldScore(container: HTMLElement): number {
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

function remainingRequiredOutcomes(
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

/**
 * Run the fill-only prefill against the open application form on the current
 * page. Safe to call from any content-script context (popup-injected or the
 * on-page widget). Shows a toast with the result. Never submits.
 */
export async function runPrefill(options: PrefillOptions = {}): Promise<PrefillCoverageResult> {
  const featureFlags = resolveAutofillFeatureFlags(options.featureFlags);
  const emptyCoverage = emptyPrefillCoverage();
  let visual: AutofillVisualFeedback | undefined;
  let latestNotice = '';
  const notify = (message: string) => {
    if (visual) {
      latestNotice = message;
    } else if (!options.quietResultToast) {
      showToast(message);
    }
  };
  const container = findApplicationForm();
  if (!container) {
    if (options.quietIfNoForm) return emptyCoverage;
    notify(
      document.querySelector('iframe')
        ? 'Checking the embedded application form. TrackMyOPT will fill supported fields inside accessible application frames.'
        : 'Open the job application form on this page first, then click Prefill. Custom or protected fields stay blank.'
    );
    return emptyCoverage;
  }
  const adapter = selectAtsPrefillAdapter(
    document,
    featureFlags.atsAdapters
  );
  visual = createAutofillVisualFeedback(container.ownerDocument);

  const resumeResult = attachGeneratedResume(
    container,
    featureFlags.artifactPrefill ? options.resume : undefined,
    (input) => visual.markFieldFilled(input, 'resume')
  );
  const coverLetterResult =
    featureFlags.artifactPrefill && featureFlags.coverLetter
      ? attachGeneratedCoverLetter(
          container,
          options.coverLetter,
          options.generatedContentHash,
          (input) => visual.markFieldFilled(input, 'cover_letter')
        )
      : 'not_requested';
  const filledOutcomes: PrefillControlOutcome[] = resumeResult === 'attached'
    ? [{ filled: true, fieldGroup: 'resume' }]
    : [];
  if (coverLetterResult === 'attached') {
    filledOutcomes.push({ filled: true, fieldGroup: 'cover_letter' });
  }

  const historyRemaining = { experience: 0, education: 0 };
  const snapshot = featureFlags.artifactPrefill ? options.snapshot : undefined;
  if (snapshot && featureFlags.historyFields) {
    const historyControls = adapter.classifyRepeatableSections(container);
    for (const section of ['experience', 'education'] as const) {
      const outcome = fillRepeatableRecords(
        section,
        historyControls,
        snapshot,
        (element) => visual.markFieldFilled(element, section)
      );
      historyRemaining[section] = outcome.remainingRecords;
      filledOutcomes.push(
        ...Array.from({ length: outcome.filledFields }, () => ({
          filled: true as const,
          fieldGroup: section,
        })),
        ...Array.from({ length: outcome.skippedFields }, (_, index) => ({
          needsUser: true as const,
          fieldGroup: section,
          groupKey: `${section}:skipped:${index}`,
        })),
      );
    }
  }
  const coverageFor = (
    outcomes: PrefillControlOutcome[]
  ): PrefillCoverageResult => {
    const result = {
      ...summarizePrefillOutcomes(outcomes),
      adapterId: adapter.id,
      remainingRecords: historyRemaining,
      applicationScan: scanApplicationFields(container),
    };
    visual.finish(result, latestNotice);
    return result;
  };

  const resp = options.profileFallback
    ? { ok: true, profile: options.profileFallback }
    : ((await chrome.runtime
        .sendMessage({ type: 'GET_AUTOFILL_PROFILE' })
        .catch(() => null)) as {
        ok?: boolean;
        error?: string;
        profile?: AutofillProfile;
      } | null);

  if (!resp?.ok || !resp.profile) {
    if (
      resumeResult === 'attached' ||
      coverLetterResult === 'attached'
    ) {
      const attached = [
        resumeResult === 'attached' ? 'resume' : '',
        coverLetterResult === 'attached' ? 'cover letter' : '',
      ]
        .filter(Boolean)
        .join(' and ');
      notify(
        `Your generated ${attached} ${attached.includes(' and ') ? 'were' : 'was'} attached. Profile fields could not be loaded, so please complete them manually.`
      );
      return coverageFor([
        ...filledOutcomes,
        ...remainingRequiredOutcomes(container, visual),
      ]);
    }
    notify(
      resp?.error === 'not_signed_in'
        ? 'Sign in to TrackMyOPT in the extension first.'
        : 'Could not load your TrackMyOPT profile.'
    );
    return coverageFor([
      ...filledOutcomes,
      ...remainingRequiredOutcomes(container, visual),
    ]);
  }

  const profile = buildContactAutofillProfile(snapshot, resp.profile);
  const controls = queryAllDeep<HTMLElement>(
    container,
    APPLICATION_CONTROL_SELECTOR
  );
  let filled = filledOutcomes.filter((outcome) => outcome.filled && (outcome.fieldGroup === 'experience' || outcome.fieldGroup === 'education')).length;
  const kinds: string[] = [
    ...(filledOutcomes.some((outcome) => outcome.filled && outcome.fieldGroup === 'experience') ? ['experience'] : []),
    ...(filledOutcomes.some((outcome) => outcome.filled && outcome.fieldGroup === 'education') ? ['education'] : []),
  ];

  for (const el of controls) {
    const kind = classifyField(getLabelText(el));
    if (!kind) continue; // no confident match, or a sensitive field -> leave it
    const value = kind === 'skills'
      ? buildSkillsPrefillValue(
          snapshot?.skills ?? [],
          featureFlags.skills && options.autofillSkills === true
        )
      : valueForKind(kind, profile);
    if (!value) continue; // we don't have this datum -> leave it blank

    let changed = false;
    if (kind === 'skills' && (!isPlainSkillsControl(el) || !isFillable(el))) {
      continue; // tag editors/custom widgets require a tested ATS adapter
    } else if (isFillable(el)) {
      setNativeValue(el, value);
      changed = true;
    } else if (isFillableSelect(el)) {
      const selectValue = matchingSelectValue(el, kind, value);
      if (!selectValue) continue; // never guess a dropdown option
      setNativeSelectValue(el, selectValue);
      changed = true;
    } else if (isCustomDropdownControl(el)) {
      const selection = await selectSmartDropdown(
        el,
        value,
        dropdownMatchKind(kind)
      );
      changed = selection.outcome === 'selected';
    } else {
      continue;
    }
    if (!changed) continue;
    filled += 1;
    filledOutcomes.push({
      filled: true,
      fieldGroup: kind === 'skills' ? 'skills' : 'contact',
    });
    visual.markFieldFilled(
      el,
      kind === 'skills' ? 'skills' : 'contact'
    );
    if (!kinds.includes(kind)) kinds.push(kind);
  }

  if (filled === 0) {
    if (
      resumeResult === 'attached' ||
      coverLetterResult === 'attached'
    ) {
      const attachments = [
        resumeResult === 'attached' ? 'resume' : '',
        coverLetterResult === 'attached' ? 'cover letter' : '',
      ]
        .filter(Boolean)
        .join(' and ');
      notify(
        `Your generated ${attachments} ${attachments.includes(' and ') ? 'were' : 'was'} attached. No empty profile fields were available to fill. Review the application and submit it yourself.`
      );
      return coverageFor([
        ...filledOutcomes,
        ...remainingRequiredOutcomes(container, visual),
      ]);
    }
    if (coverLetterResult === 'source_mismatch') {
      notify(
        'The cover letter no longer matches this generated resume, so it was not attached.'
      );
      return coverageFor([
        ...filledOutcomes,
        ...remainingRequiredOutcomes(container, visual),
      ]);
    }
    if (resumeResult === 'already_present') {
      notify('Your existing resume upload was left unchanged. No other empty profile fields were available to fill.');
      return coverageFor([
        ...filledOutcomes,
        ...remainingRequiredOutcomes(container, visual),
      ]);
    }
    if (options.resume && resumeResult === 'not_found') {
      notify('No Resume/CV upload field is visible yet. Open that part of the application and click Prefill again.');
      return coverageFor([
        ...filledOutcomes,
        ...remainingRequiredOutcomes(container, visual),
      ]);
    }
    if (options.resume && resumeResult === 'unsupported') {
      const copy = autofillErrorCopy('attachment_failed');
      notify(`${copy.message} ${copy.recovery}`);
      return coverageFor([
        ...filledOutcomes,
        ...remainingRequiredOutcomes(container, visual),
      ]);
    }
    notify(
      'Nothing to prefill here. Private work-authorization, visa, compensation, ' +
        'and DEI fields require review and approval in the TrackMyOPT panel. ' +
        autofillErrorCopy('unsupported_control').message
    );
  } else {
    const resumeSummary = resumeResult === 'attached'
      ? 'Your generated resume was attached.'
      : resumeResult === 'already_present'
        ? 'Your existing resume upload was left unchanged.'
        : options.resume && resumeResult === 'not_found'
          ? 'No Resume/CV upload field is visible yet; click Prefill again when that field appears.'
          : options.resume && resumeResult === 'unsupported'
            ? autofillErrorCopy('attachment_failed').message
            : '';
    const coverLetterSummary =
      coverLetterResult === 'attached'
        ? 'Your generated cover letter was attached.'
        : coverLetterResult === 'already_present'
          ? 'Your existing cover-letter upload was left unchanged.'
          : coverLetterResult === 'source_mismatch'
            ? 'The cover letter did not match this resume and was not attached.'
            : '';
    notify(
      `TrackMyOPT prefilled ${filled} field${filled > 1 ? 's' : ''} (${kinds.join(', ')}). ` +
        `${resumeSummary ? `${resumeSummary} ` : ''}${coverLetterSummary ? `${coverLetterSummary} ` : ''}Review every answer and click Submit yourself — we never submit for you.`
    );
  }
  return coverageFor([
    ...filledOutcomes,
    ...remainingRequiredOutcomes(container, visual),
  ]);
}
