import { ashbyQuestion, ashbyQuestionRequired, ashbyExistingUpload } from './ashby-control-context';
import { isLinkedInRequiredRadioQuestion } from '../easy-apply/linkedin-easy-apply-dialog';
import {
  CUSTOM_DROPDOWN_SELECTOR,
  customDropdownHasValue,
  isCustomDropdownControl,
} from './smart-dropdown';

export interface ScannedApplicationField {
  key: string;
  label: string;
  required: boolean;
  filled: boolean;
  /** Filled, but the site marks it invalid (aria-invalid or failed validity). */
  invalid?: boolean;
  /** The site's own error message for this control, when it exposes one. */
  errorText?: string;
  control?: HTMLElement;
}

export interface ApplicationFieldScan {
  requiredFilled: number;
  requiredTotal: number;
  requiredPercent: number;
  unansweredRequired: number;
  optionalTotal: number;
  /** Filled fields the site reports as invalid. */
  invalidTotal: number;
  required: ScannedApplicationField[];
  optional: ScannedApplicationField[];
}

const PLACEHOLDER_OPTION_RE = /^(?:select|choose|please|none)\b/i;

function compactLabel(value: string): string {
  return value
    .replace(/\s+/g, ' ')
    .replace(/\s*[*:]\s*$/, '')
    .trim()
    .slice(0, 120);
}

function labelFor(control: HTMLElement): string {
  const humanParts: Array<string | null | undefined> = [
    ashbyQuestion(control)?.textContent,
    control.getAttribute('aria-label'),
  ];
  const labelledBy = control.getAttribute('aria-labelledby');
  if (labelledBy) {
    for (const id of labelledBy.split(/\s+/)) {
      humanParts.push(control.ownerDocument.getElementById(id)?.textContent);
    }
  }
  if (control.id) {
    const escaped =
      typeof CSS !== 'undefined' && CSS.escape
        ? CSS.escape(control.id)
        : control.id.replace(/["\\]/g, '\\$&');
    humanParts.push(
      control.ownerDocument.querySelector(`label[for="${escaped}"]`)
        ?.textContent
    );
  }
  humanParts.push(control.closest('label')?.textContent);
  humanParts.push(
    control.closest('fieldset')?.querySelector('legend')?.textContent
  );
  const wrapper = control.closest<HTMLElement>(
    '[data-automation-id*="formField" i],[data-testid*="field" i],.form-field,.field'
  );
  humanParts.push(
    wrapper?.querySelector<HTMLElement>(
      'label,legend,[data-automation-id*="label" i],[class*="label" i]'
    )?.textContent
  );
  const humanLabel = humanParts.find((part) => compactLabel(part || ''));
  if (humanLabel) return compactLabel(humanLabel);
  return compactLabel(
    control.getAttribute('placeholder') ||
      control.getAttribute('name') ||
      ''
  );
}

function visible(control: HTMLElement): boolean {
  if (
    control.hidden ||
    control.getAttribute('aria-hidden') === 'true' ||
    control.getAttribute('aria-disabled') === 'true'
  ) {
    return false;
  }
  if ('disabled' in control && (control as HTMLInputElement).disabled) {
    return false;
  }
  const view = control.ownerDocument.defaultView;
  if (!view) return false;
  const style = view.getComputedStyle(control);
  if (style.display === 'none' || style.visibility === 'hidden') return false;
  const isJsdom = /jsdom/i.test(view.navigator.userAgent || '');
  return isJsdom || control.getClientRects().length > 0;
}

function required(control: HTMLElement): boolean {
  if (ashbyQuestionRequired(control) || isLinkedInRequiredRadioQuestion(control)) return true;
  if (
    control.hasAttribute('required') ||
    control.getAttribute('aria-required') === 'true'
  ) {
    return true;
  }
  const wrapper = control.closest<HTMLElement>(
    '[data-automation-id*="formField" i],[data-testid*="field" i],.form-field,.field,label'
  );
  const rawRequiredCopy = [
    control.getAttribute('aria-label'),
    control.getAttribute('aria-labelledby')
      ?.split(/\s+/)
      .map((id) => control.ownerDocument.getElementById(id)?.textContent || '')
      .join(' '),
    control.id
      ? Array.from(control.ownerDocument.querySelectorAll('label[for]'))
          .find((label) => label.getAttribute('for') === control.id)
          ?.textContent
      : '',
    control.closest('label')?.textContent,
    wrapper?.querySelector<HTMLElement>(
      'label,legend,[data-automation-id*="label" i],[class*="label" i]'
    )?.textContent,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    wrapper?.getAttribute('aria-required') === 'true' ||
    /\brequired\b|\*/i.test(rawRequiredCopy)
  );
}

function selectFilled(select: HTMLSelectElement): boolean {
  const selected = select.selectedOptions[0];
  return Boolean(
    select.value &&
      selected &&
      !selected.disabled &&
      !PLACEHOLDER_OPTION_RE.test(selected.textContent || '')
  );
}

function controlFilled(
  control: HTMLElement,
  root: ParentNode
): boolean {
  if (control.matches('.ashby-application-form-input-yesno')) {
    return !!control.querySelector('button[aria-pressed="true"]');
  }
  if (isCustomDropdownControl(control)) {
    return customDropdownHasValue(control);
  }
  if (control.tagName === 'SELECT') {
    return selectFilled(control as HTMLSelectElement);
  }
  if (control.tagName === 'TEXTAREA') {
    return Boolean((control as HTMLTextAreaElement).value.trim());
  }
  if (control.tagName !== 'INPUT') return false;
  const input = control as HTMLInputElement;
  const type = (input.type || 'text').toLowerCase();
  if (type === 'radio') {
    if (!input.name) return input.checked;
    const escaped =
      typeof CSS !== 'undefined' && CSS.escape
        ? CSS.escape(input.name)
        : input.name.replace(/["\\]/g, '\\$&');
    return Boolean(
      root.querySelector<HTMLInputElement>(
        `input[type="radio"][name="${escaped}"]:checked`
      )
    );
  }
  if (type === 'checkbox') return input.checked;
  if (type === 'file') return Boolean(input.files?.length) || ashbyExistingUpload(input);
  return Boolean(input.value.trim());
}

function fieldKey(control: HTMLElement, index: number): string {
  if (control.tagName === 'INPUT') {
    const input = control as HTMLInputElement;
    if (input.type === 'radio') {
      return `radio:${input.name || labelFor(control) || index}`;
    }
  }
  return (
    control.id ||
    control.getAttribute('name') ||
    control.getAttribute('data-automation-id') ||
    `field:${index}`
  );
}

function deepQueryAll<T extends Element>(root: ParentNode, selector: string): T[] {
  const found = Array.from(root.querySelectorAll<T>(selector));
  for (const host of Array.from(root.querySelectorAll<HTMLElement>('*'))) {
    if (host.shadowRoot) found.push(...deepQueryAll<T>(host.shadowRoot, selector));
  }
  return found;
}

/**
 * A filled control the site rejects: aria-invalid, or native validity failing
 * for a reason other than being empty. The message comes only from the
 * site's own error element (aria-errormessage / an alert or error element in
 * aria-describedby), never from the value itself.
 */
function validationProblem(control: HTMLElement): { message?: string } | undefined {
  const ariaInvalid = control.getAttribute('aria-invalid') === 'true';
  const validity = (control as HTMLInputElement).validity;
  const nativeInvalid = Boolean(validity && !validity.valid && !validity.valueMissing);
  if (!ariaInvalid && !nativeInvalid) return undefined;
  const root = control.getRootNode() as Document | ShadowRoot;
  const ids = [
    ...(control.getAttribute('aria-errormessage') || '').split(/\s+/),
    ...(control.getAttribute('aria-describedby') || '').split(/\s+/),
  ].filter(Boolean);
  for (const id of ids) {
    const element = root.getElementById?.(id);
    if (!element) continue;
    const isErrorElement = control.getAttribute('aria-errormessage')?.split(/\s+/).includes(id) ||
      element.getAttribute('role') === 'alert' || /error|invalid/i.test(element.className || '');
    const text = element.textContent?.replace(/\s+/g, ' ').trim();
    if (isErrorElement && text) return { message: text.slice(0, 160) };
  }
  return {};
}

export function summarizeApplicationFields(
  fields: ScannedApplicationField[]
): ApplicationFieldScan {
  const requiredFields = fields.filter((field) => field.required);
  const optionalFields = fields.filter((field) => !field.required);
  const requiredFilled = requiredFields.filter((field) => field.filled).length;
  const requiredTotal = requiredFields.length;
  return {
    requiredFilled,
    requiredTotal,
    requiredPercent:
      requiredTotal === 0 ? 100 : Math.round((requiredFilled / requiredTotal) * 100),
    unansweredRequired: requiredTotal - requiredFilled,
    optionalTotal: optionalFields.length,
    invalidTotal: fields.filter((field) => field.filled && field.invalid).length,
    required: requiredFields,
    optional: optionalFields,
  };
}

export function scanApplicationFields(
  root: ParentNode
): ApplicationFieldScan {
  const selector =
    `input,textarea,select,.ashby-application-form-input-yesno,${CUSTOM_DROPDOWN_SELECTOR}`;
  // Open shadow roots hold real application controls (SmartRecruiters).
  const controls = deepQueryAll<HTMLElement>(root, selector);
  const fields: ScannedApplicationField[] = [];
  const seen = new Set<string>();
  for (let index = 0; index < controls.length; index += 1) {
    const control = controls[index];
    if (control.closest('.ashby-application-form-autofill-input-root')) continue;
    if (control.parentElement?.closest('.ashby-application-form-input-yesno')) continue;
    if (!visible(control)) continue;
    const customDropdownAncestor =
      control.parentElement?.closest<HTMLElement>(CUSTOM_DROPDOWN_SELECTOR);
    if (customDropdownAncestor && customDropdownAncestor !== control) continue;
    if (control.tagName === 'INPUT') {
      const type = ((control as HTMLInputElement).type || 'text').toLowerCase();
      if (['hidden', 'submit', 'button', 'reset', 'image'].includes(type)) {
        continue;
      }
    }
    const key = fieldKey(control, index);
    if (seen.has(key)) continue;
    seen.add(key);
    const label = labelFor(control) || `Application field ${fields.length + 1}`;
    const filled = controlFilled(control, root);
    const validation = filled ? validationProblem(control) : undefined;
    fields.push({
      key,
      label,
      required: required(control),
      filled,
      ...(validation ? { invalid: true, ...(validation.message ? { errorText: validation.message } : {}) } : {}),
      control,
    });
  }
  return summarizeApplicationFields(fields);
}
