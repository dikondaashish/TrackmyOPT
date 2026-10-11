import type { FieldKind } from '../easy-apply/easy-apply-matchers';
import { isControlVisible, matchingSelectValue } from '../easy-apply/easy-apply-dom';
import { dialCodeFromPhoneNumber } from '../shared/phone-country-codes';
import type { SmartDropdownContext } from './smart-dropdown';

/** One initial pass plus at most two follow-ups for revealed/enabled fields. */
export const MAX_PREFILL_PASSES = 3;
const SETTLE_QUIET_MS = 200;
const SETTLE_MAX_MS = 1_500;

/** Lists that commonly load only after a parent choice (country → state → city). */
export function isDependentLocationKind(kind: FieldKind): boolean {
  return kind === 'state' || kind === 'city' || kind === 'countyDistrict' || kind === 'location';
}

/**
 * A visible dependent control that cannot be answered yet: disabled, or a
 * list with no real options. It is retried after its parent is chosen.
 */
export function dependentControlNotReady(element: HTMLElement): boolean {
  if (!isControlVisible(element)) return false;
  const disabled = element.matches(':disabled') || element.getAttribute('aria-disabled') === 'true';
  if (element.tagName === 'SELECT') {
    const select = element as HTMLSelectElement;
    const real = Array.from(select.options).filter(option => option.value && !option.disabled);
    return disabled || real.length === 0;
  }
  return disabled;
}

/**
 * Wait until the page stops changing after a choice, so dependent lists and
 * revealed questions exist before the next pass. Tied to DOM activity, with a
 * hard ceiling; never a fixed delay.
 */
export function waitForDomSettle(root: HTMLElement, current: () => boolean): Promise<void> {
  const view = root.ownerDocument.defaultView;
  const target = root.ownerDocument.body ?? root;
  if (!view || typeof view.MutationObserver !== 'function') return Promise.resolve();
  return new Promise(resolve => {
    let quietTimer = 0;
    const finish = () => {
      observer.disconnect();
      view.clearTimeout(quietTimer);
      view.clearTimeout(ceiling);
      resolve();
    };
    const observer = new view.MutationObserver(() => {
      if (!current()) return finish();
      view.clearTimeout(quietTimer);
      quietTimer = view.setTimeout(finish, SETTLE_QUIET_MS);
    });
    observer.observe(target, { subtree: true, childList: true, attributes: true,
      attributeFilter: ['disabled', 'aria-disabled', 'hidden', 'aria-hidden', 'style', 'class'] });
    quietTimer = view.setTimeout(finish, SETTLE_QUIET_MS);
    const ceiling = view.setTimeout(finish, SETTLE_MAX_MS);
  });
}

/**
 * A country-code select still showing the page's own default ("+1") when the
 * applicant's stored number explicitly carries another code ("+91 …"). That
 * default is not the applicant's answer, so it may be corrected. Anything the
 * page did not mark as its default is treated as a user choice and left.
 */
export function isReplaceablePageDefault(
  element: HTMLElement,
  kind: FieldKind,
  value: string,
  context: SmartDropdownContext,
  storedPhone: string
): boolean {
  if (kind !== 'phoneCountryCode' || element.tagName !== 'SELECT') return false;
  const select = element as HTMLSelectElement;
  if (select.disabled || select.multiple || !isControlVisible(select)) return false;
  if (!dialCodeFromPhoneNumber(storedPhone)) return false;
  const selected = select.selectedOptions[0];
  if (!selected || !selected.defaultSelected || !select.value) return false;
  const wanted = matchingSelectValue(select, kind, value, context);
  return Boolean(wanted && wanted !== select.value);
}
