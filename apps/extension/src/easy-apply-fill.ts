/**
 * TrackMyOPT — job application prefill (FILL-ONLY).
 *
 * Injected on demand via activeTab when the user clicks "Prefill this
 * application" in the popup. It fills the visible identity text fields of a
 * supported, OPEN application form from the user's TrackMyOPT profile, then
 * stops and gets out of the way. Supported platforms: LinkedIn Easy Apply,
 * Greenhouse. All platform logic shares ONE set of matchers + safety rules.
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
 * The JWT never reaches this script: it asks the background worker for the
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

/**
 * Locate the application form to scope filling to. Supported platforms:
 *  - LinkedIn Easy Apply modal
 *  - Greenhouse application form (job-boards.greenhouse.io / boards.greenhouse.io)
 * Returns null when no supported form is present on the page.
 */
function findApplicationForm(): HTMLElement | null {
  const linkedin = document.querySelector<HTMLElement>(
    '.jobs-easy-apply-modal, [data-test-modal-id="easy-apply-modal"]'
  );
  if (linkedin) return linkedin;

  const greenhouse = document.querySelector<HTMLElement>(
    'form#application-form, form#application_form, form.application--form'
  );
  if (greenhouse) return greenhouse;

  return null;
}

(async function run(): Promise<void> {
  const container = findApplicationForm();
  if (!container) {
    showToast('Open a supported application form (LinkedIn Easy Apply or Greenhouse) first, then click Prefill.');
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
})();
