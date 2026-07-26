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
  control?: HTMLElement;
}

export interface ApplicationFieldScan {
  requiredFilled: number;
  requiredTotal: number;
  requiredPercent: number;
  unansweredRequired: number;
  optionalTotal: number;
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
  if (type === 'file') return Boolean(input.files?.length);
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
    required: requiredFields,
    optional: optionalFields,
  };
}

export function scanApplicationFields(
  root: ParentNode
): ApplicationFieldScan {
  const selector =
    `input,textarea,select,${CUSTOM_DROPDOWN_SELECTOR}`;
  const controls = Array.from(root.querySelectorAll<HTMLElement>(selector));
  const fields: ScannedApplicationField[] = [];
  const seen = new Set<string>();
  for (let index = 0; index < controls.length; index += 1) {
    const control = controls[index];
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
    fields.push({
      key,
      label,
      required: required(control),
      filled: controlFilled(control, root),
      control,
    });
  }
  return summarizeApplicationFields(fields);
}
