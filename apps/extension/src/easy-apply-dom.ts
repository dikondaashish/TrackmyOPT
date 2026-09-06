/**
 * DOM helpers for the fill-only prefill engine: deep query, labels, fillability,
 * and native value setters. Shared by form discovery, attachments, and runPrefill.
 */

import type { FieldKind } from './easy-apply-matchers';
import type { BasicContactProfile } from './resume-autofill-contract';
import {
  CUSTOM_DROPDOWN_SELECTOR,
  chooseSmartDropdownOption,
  type SmartDropdownContext,
  type SmartDropdownMatchKind,
} from './smart-dropdown';
import { resolveDialCode } from './phone-country-codes';

type AutofillProfile = BasicContactProfile;

export type SearchRoot = Document | ShadowRoot | HTMLElement;
export const FILLABLE_INPUT_TYPES = new Set(['text', 'email', 'tel', 'url', 'number']);
export const APPLICATION_CONTROL_SELECTOR =
  `input,textarea,select,${CUSTOM_DROPDOWN_SELECTOR}`;

export const isInputElement = (el: Element): el is HTMLInputElement => el.tagName === 'INPUT';
export const isTextAreaElement = (el: Element): el is HTMLTextAreaElement => el.tagName === 'TEXTAREA';
export const isSelectElement = (el: Element): el is HTMLSelectElement => el.tagName === 'SELECT';

export function queryAllDeep<T extends Element>(root: SearchRoot, selector: string): T[] {
  const matches = Array.from(root.querySelectorAll<T>(selector));
  for (const host of Array.from(root.querySelectorAll<HTMLElement>('*'))) {
    if (host.shadowRoot) matches.push(...queryAllDeep<T>(host.shadowRoot, selector));
  }
  return matches;
}

/** Documents reachable under browser same-origin rules. Cross-origin frames
 * are deliberately skipped; browser security does not permit safe DOM access. */
export function reachableDocuments(): Document[] {
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
export function isComboboxLike(el: HTMLElement): boolean {
  return (
    el.getAttribute('role') === 'combobox' ||
    el.hasAttribute('aria-autocomplete') ||
    el.classList.contains('select__input') ||
    Boolean(el.parentElement?.closest(CUSTOM_DROPDOWN_SELECTOR))
  );
}

export function dropdownMatchKind(kind: FieldKind): SmartDropdownMatchKind {
  if (
    kind === 'country' ||
    kind === 'state' ||
    kind === 'location' ||
    kind === 'phoneCountryCode' ||
    kind === 'phoneDeviceType'
  ) {
    return kind;
  }
  // City lists commonly render "Austin, TX, United States"; the location rules
  // let a profile city match that leading segment.
  if (kind === 'city') return 'location';
  return 'generic';
}

/** A control is fillable only if visible, enabled, empty, a text-like input or textarea, and not a combobox. */
export function isFillable(el: HTMLElement): el is HTMLInputElement | HTMLTextAreaElement {
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
export function isPlainSkillsControl(el: HTMLElement): el is HTMLInputElement | HTMLTextAreaElement {
  if (!isInputElement(el) && !isTextAreaElement(el)) return false;
  if (isComboboxLike(el)) return false;
  return !el.closest(
    '[role="combobox"], [role="listbox"], [aria-multiselectable="true"], ' +
      '[data-automation-id*="multiSelect" i], [data-testid*="tag" i], [class*="tag-input" i]',
  );
}

export function isVisibleEditableEmpty(el: HTMLInputElement | HTMLTextAreaElement): boolean {
  if (el.disabled || el.readOnly) return false;
  if (el.value && el.value.trim() !== '') return false; // never overwrite
  if (!isControlVisible(el)) return false;
  return true;
}

export function isControlVisible(el: HTMLElement): boolean {
  if (!el.isConnected || el.hidden || el.getAttribute('aria-hidden') === 'true') return false;
  const view = el.ownerDocument.defaultView;
  if (!view) return false;
  const style = view.getComputedStyle(el);
  if (style.visibility === 'hidden' || style.display === 'none' || style.opacity === '0') return false;
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

export function valueForKind(kind: FieldKind, p: AutofillProfile): string {
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
    case 'phoneCountryCode':
      return resolveDialCode({ phone: p.phone, country: p.country }) ?? '';
    case 'phoneDeviceType':
      // The profile stores exactly one personal number the applicant gave for
      // recruiting, so "Mobile" is the only option in a Home/Mobile/Work/Fax
      // list it can describe. Non-sensitive and visibly highlighted, so a user
      // who keeps a landline there can correct it in one click.
      return 'Mobile';
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

/**
 * Native <select> and custom combobox now share one matcher.
 *
 * They previously had separate rules, and the <select> path was the weaker of
 * the two: it knew only exact equality plus US state code/name, so an ordinary
 * country list offering "United States of America" never matched a profile
 * holding "United States". Any option-shape rule added for comboboxes silently
 * skipped native selects until this delegated.
 */
export function matchingSelectValue(
  select: HTMLSelectElement,
  kind: FieldKind,
  profileValue: string,
  context: SmartDropdownContext = {},
): string | null {
  const candidates = Array.from(select.options)
    .filter((option) => !option.disabled && option.value)
    .map((option) => ({
      value: option.value,
      text: option.textContent || '',
      option,
    }));
  const chosen = chooseSmartDropdownOption(
    candidates,
    profileValue,
    dropdownMatchKind(kind),
    context,
  );
  return chosen ? chosen.option.value : null;
}

export function isFillableSelect(el: HTMLElement): el is HTMLSelectElement {
  if (!isSelectElement(el) || el.disabled || el.multiple || !isControlVisible(el)) return false;
  const selected = el.selectedOptions[0];
  return !el.value || !selected || selected.disabled || /select|choose|please/i.test(selected.textContent || '');
}

export function setNativeSelectValue(el: HTMLSelectElement, value: string): void {
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
export function setNativeValue(el: HTMLInputElement | HTMLTextAreaElement, value: string): void {
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
