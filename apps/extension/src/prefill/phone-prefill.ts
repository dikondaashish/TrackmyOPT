import { normalizePhone } from '../shared/phone-country-codes';

/**
 * Phone value for one input, shaped by how the form asks for it:
 *  - a separate country-code control nearby → national number only, so the
 *    code is never entered twice;
 *  - an input that asks for the international form ("+1…", "include country
 *    code") → E.164;
 *  - otherwise the number exactly as the applicant stored it.
 * Returns '' when the number cannot fit the field without losing digits.
 */
export function phoneValueForControl(
  element: HTMLInputElement | HTMLTextAreaElement,
  rawPhone: string,
  country: string | undefined,
  hasSeparateCodeControl: boolean
): string {
  const phone = normalizePhone(rawPhone, country);
  const hint = phoneFormatHint(element);
  const asksInternational =
    /(?:^|\s)\+\d/.test(hint) || /\b(?:include|with) (?:the )?country code\b|\binternational format\b|\be\.?164\b/.test(hint);
  const numericOnly = element instanceof HTMLInputElement && element.type === 'number';

  let candidates: string[];
  if (hasSeparateCodeControl) {
    // After a chosen "+44", the domestic trunk "0" no longer belongs in the
    // number ("+44 07911…" is wrong). NANP numbers have no trunk prefix.
    const dropTrunk = Boolean(phone.dial && phone.dial !== '1' && phone.nationalDigits.startsWith('0'));
    candidates = dropTrunk
      ? [phone.national.replace(/^\s*0\s*/, ''), phone.nationalDigits.slice(1)]
      : [phone.national, phone.nationalDigits];
  } else if (asksInternational && phone.e164) {
    candidates = [phone.e164];
  } else if (numericOnly) {
    candidates = [phone.dial && rawPhone.trim().startsWith('+') ? `${phone.dial}${phone.nationalDigits}` : phone.nationalDigits];
  } else {
    candidates = [rawPhone.trim()];
  }
  const maxLength = element.maxLength > 0 ? element.maxLength : Infinity;
  // A too-short field gets the national digits if those fit; never a cut number.
  if (!hasSeparateCodeControl && candidates[0].length > maxLength) {
    candidates.push(phone.national, phone.nationalDigits);
  }
  return candidates.find(value => value && value.length <= maxLength) ?? '';
}

function phoneFormatHint(element: HTMLElement): string {
  const root = element.getRootNode?.() as Document | ShadowRoot | undefined;
  const described = (element.getAttribute('aria-describedby') || '')
    .split(/\s+/).filter(Boolean)
    .map(id => root?.getElementById?.(id)?.textContent || '');
  return [
    element.getAttribute('placeholder'),
    element.getAttribute('aria-label'),
    element.getAttribute('title'),
    element.getAttribute('pattern')?.startsWith('\\+') || element.getAttribute('pattern')?.startsWith('[+]') ? '+1' : '',
    ...described,
    element.closest('label')?.textContent,
  ].filter(Boolean).join(' ').toLocaleLowerCase('en-US');
}

/**
 * Whether a phone input already has its country code chosen elsewhere: a
 * classified country-code control in the same small group, or an
 * intl-tel-input widget showing a separate dial code.
 */
export function hasSeparateCountryCode(
  element: HTMLElement,
  codeControls: readonly HTMLElement[]
): boolean {
  if (element.closest('.iti--separate-dial-code, .iti--show-selected-dial-code')) return true;
  let group: HTMLElement | null = element.parentElement;
  for (let depth = 0; group && depth < 4; depth += 1) {
    // The whole form is too broad: a code select elsewhere may belong to a
    // different number (an emergency contact, a reference).
    if (group.matches('form, [role="form"], [role="dialog"], body')) break;
    if (codeControls.some(control => control !== element && group!.contains(control))) return true;
    group = group.parentElement;
  }
  return false;
}

/**
 * A phone mask may reformat what was written ("5551234567" → "(555) 123-4567"
 * or "+1 555-123-4567"). The write is accepted when the digits survive, with
 * at most a dial code the mask added in front.
 */
export function phoneValueAccepted(actual: string, written: string): boolean {
  if (actual === written) return true;
  const want = written.replace(/\D/g, '');
  const got = actual.replace(/\D/g, '');
  if (!want || !got) return false;
  return got === want || (got.endsWith(want) && got.length - want.length <= 4);
}
