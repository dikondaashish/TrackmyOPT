/**
 * TrackMyOPT — job application prefill engine (FILL-ONLY).
 *
 * Shared by BOTH the popup-injected script (easy-apply-fill.ts) and the on-page
 * job widget (content-job-portal.ts), so the fill logic and its safety rules
 * live in exactly one place. Fills the visible identity text fields of a
 * supported, OPEN application form from the user's TrackMyOPT profile, then
 * stops. Supported platforms: LinkedIn Easy Apply, Greenhouse.
 *
 * HARD INVARIANTS — do not change without product + compliance sign-off. These
 * apply to EVERY platform, no exceptions:
 *  1. NEVER clicks any button. No Submit / Next / Review / Done automation.
 *     (There is intentionally not a single button-click or .click() in here.)
 *  2. NEVER fills work-authorization / visa / sponsorship / EEO / salary / DOB /
 *     SSN fields. Those are the user's to answer (see SENSITIVE_FIELD_RE).
 *  3. NEVER overwrites a value the user already entered.
 *  4. NEVER fills combobox / autocomplete / typeahead widgets (see
 *     isComboboxLike) — the user picks those from the dropdown.
 *  5. No timers/delays for evasion, no loop. One open form, once.
 *
 * The JWT never reaches this code: it asks the background worker for the
 * resolved profile; the token stays in the background.
 */

import { classifyField, type FieldKind } from './easy-apply-matchers';

interface AutofillProfile {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  yearsExperience: string;
  linkedinUrl: string;
  portfolioUrl: string;
}

const TOAST_ID = 'tmo-easy-apply-toast';
const FILLABLE_INPUT_TYPES = new Set(['text', 'email', 'tel', 'url', 'number']);

/** Build a lowercased label string for a control from every nearby signal. */
function getLabelText(el: HTMLElement): string {
  const parts: string[] = [];
  const push = (s: string | null | undefined) => {
    if (s) parts.push(s);
  };

  push(el.getAttribute('aria-label'));
  push(el.getAttribute('name'));
  push(el.getAttribute('placeholder'));

  const id = el.getAttribute('id');
  if (id) {
    const forLabel = document.querySelector(`label[for="${CSS.escape(id)}"]`);
    push(forLabel?.textContent);
  }
  push(el.closest('label')?.textContent);
  // LinkedIn's artdeco form label + fieldset legend
  push(el.closest('.artdeco-text-input--container, [data-test-form-element]')
    ?.querySelector('label, .artdeco-text-input--label')?.textContent);
  push(el.closest('fieldset')?.querySelector('legend')?.textContent);

  return parts.join(' ');
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
    el.classList.contains('select__input')
  );
}

/** A control is fillable only if visible, enabled, empty, a text-like input or textarea, and not a combobox. */
function isFillable(el: HTMLElement): el is HTMLInputElement | HTMLTextAreaElement {
  if (isComboboxLike(el)) return false;
  if (el instanceof HTMLTextAreaElement) {
    return isVisibleEditableEmpty(el);
  }
  if (el instanceof HTMLInputElement) {
    if (!FILLABLE_INPUT_TYPES.has((el.type || 'text').toLowerCase())) return false;
    return isVisibleEditableEmpty(el);
  }
  return false;
}

function isVisibleEditableEmpty(el: HTMLInputElement | HTMLTextAreaElement): boolean {
  if (el.disabled || el.readOnly) return false;
  if (el.value && el.value.trim() !== '') return false; // never overwrite
  if (el.offsetParent === null) return false; // not rendered
  const style = getComputedStyle(el);
  if (style.visibility === 'hidden' || style.display === 'none') return false;
  return true;
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
    case 'city':
      return p.city;
    case 'state':
      return p.state;
    case 'location':
      return [p.city, p.state].filter(Boolean).join(', ');
    case 'yearsExperience':
      return p.yearsExperience;
    case 'linkedinUrl':
      return p.linkedinUrl;
    case 'portfolioUrl':
      return p.portfolioUrl;
  }
}

/** Set a value the way frameworks (React/Ember) expect: native setter + input/change. */
function setNativeValue(el: HTMLInputElement | HTMLTextAreaElement, value: string): void {
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
  if (setter) {
    setter.call(el, value);
  } else {
    el.value = value;
  }
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
  el.dispatchEvent(new Event('blur', { bubbles: true }));
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
 * scores; combobox widgets are ignored.
 */
function applicationFieldScore(container: HTMLElement): number {
  const kinds = new Set<string>();
  for (const el of Array.from(container.querySelectorAll<HTMLElement>('input, textarea'))) {
    if (isComboboxLike(el)) continue;
    if (el.offsetParent === null) continue; // visible only
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
 * Returns null when no application-like form is found (e.g. an ATS that renders
 * only custom non-native widgets, or a page with no form) — the caller toasts.
 */
export function findApplicationForm(): HTMLElement | null {
  const linkedin = document.querySelector<HTMLElement>(
    '.jobs-easy-apply-modal, [data-test-modal-id="easy-apply-modal"]'
  );
  if (linkedin) return linkedin;

  const greenhouse = document.querySelector<HTMLElement>(
    'form#application-form, form#application_form, form.application--form'
  );
  if (greenhouse) return greenhouse;

  // Generic: pick the <form> with the most application-like fields (>= 2).
  let best: HTMLElement | null = null;
  let bestScore = 1; // require at least 2 distinct fields to avoid newsletter/search boxes
  for (const form of Array.from(document.querySelectorAll<HTMLElement>('form'))) {
    const score = applicationFieldScore(form);
    if (score > bestScore) {
      bestScore = score;
      best = form;
    }
  }
  return best;
}

/**
 * Run the fill-only prefill against the open application form on the current
 * page. Safe to call from any content-script context (popup-injected or the
 * on-page widget). Shows a toast with the result. Never submits.
 */
export async function runPrefill(): Promise<void> {
  const container = findApplicationForm();
  if (!container) {
    showToast('Open the job application form on this page first, then click Prefill. (Some systems use custom fields we can’t fill — those stay blank.)');
    return;
  }

  const resp = (await chrome.runtime
    .sendMessage({ type: 'GET_AUTOFILL_PROFILE' })
    .catch(() => null)) as { ok?: boolean; error?: string; profile?: AutofillProfile } | null;

  if (!resp?.ok || !resp.profile) {
    showToast(
      resp?.error === 'not_signed_in'
        ? 'Sign in to TrackMyOPT in the extension first.'
        : 'Could not load your TrackMyOPT profile.'
    );
    return;
  }

  const profile = resp.profile;
  const controls = Array.from(container.querySelectorAll<HTMLElement>('input, textarea'));
  let filled = 0;
  const kinds: string[] = [];

  for (const el of controls) {
    if (!isFillable(el)) continue;
    const kind = classifyField(getLabelText(el));
    if (!kind) continue; // no confident match, or a sensitive field -> leave it
    const value = valueForKind(kind, profile);
    if (!value) continue; // we don't have this datum -> leave it blank
    setNativeValue(el, value);
    filled += 1;
    if (!kinds.includes(kind)) kinds.push(kind);
  }

  if (filled === 0) {
    showToast(
      'Nothing to prefill here. TrackMyOPT never fills work-authorization, ' +
        'visa, or EEO questions — please answer those yourself.'
    );
  } else {
    showToast(
      `TrackMyOPT prefilled ${filled} field${filled > 1 ? 's' : ''} (${kinds.join(', ')}). ` +
        'Review every answer and click Submit yourself — we never submit for you.'
    );
  }
}
