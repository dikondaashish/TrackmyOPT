import { markPrefillUndoUnsupported } from './prefill-undo';
import { enclosingControlRoots, linkedControlElement, isInActiveControlTree } from './scoped-control-dom';

export type SmartDropdownMatchKind =
  | 'country'
  | 'state'
  | 'location'
  | 'phoneCountryCode'
  | 'phoneDeviceType'
  | 'generic';

/**
 * Saved address facts disambiguate shared dial codes and city names.
 */
export interface SmartDropdownContext {
  countryName?: string;
  stateName?: string;
  /** Rechecked after async option loading, before any selection. */
  shouldContinue?: () => boolean;
}

export interface SmartDropdownOption {
  value: string;
  text: string;
  disabled?: boolean;
}

export type SmartDropdownSelectionOutcome =
  | 'selected'
  | 'already_filled'
  | 'no_match'
  | 'unsupported';

export interface SmartDropdownSelectionResult {
  outcome: SmartDropdownSelectionOutcome;
  optionText?: string;
}

export const CUSTOM_DROPDOWN_SELECTOR =
  '[role="combobox"],[aria-haspopup="listbox"],input.location-input[data-qa="location-input"]';

/** Lever uses a plain input plus a separate committed location, not ARIA combobox markup. */
function leverLocationSelection(control: Element): HTMLInputElement | null {
  if (!control.matches('input.location-input[data-qa="location-input"][name="location"]')) return null;
  return control.closest('.application-field')?.querySelector<HTMLInputElement>('input[type="hidden"][name="selectedLocation"]') || null;
}

const PLACEHOLDER_RE =
  /^(?:select|choose|please select|select one|choose one|search|type to search)(?:\s+an?\s+option)?[.…:]*$/i;

const US_STATE_NAMES: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas',
  CA: 'California', CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware',
  FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho',
  IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas',
  KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi',
  MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada',
  NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York',
  NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma',
  OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island',
  SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas',
  UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington',
  WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
  DC: 'District of Columbia',
};

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function canonicalCountry(value: string): string {
  const normalized = normalize(value);
  if (
    /^(?:us|usa|u s|u s a|united states|united states of america|america)$/.test(
      normalized
    )
  ) {
    return 'united states';
  }
  if (/^(?:uk|u k|gb|gbr|great britain|united kingdom)$/.test(normalized)) {
    return 'united kingdom';
  }
  return normalized;
}

function canonicalState(value: string): string {
  const normalized = normalize(value);
  const upper = value.trim().toUpperCase();
  if (US_STATE_NAMES[upper]) return normalize(US_STATE_NAMES[upper]);
  for (const name of Object.values(US_STATE_NAMES)) {
    if (normalize(name) === normalized) return normalize(name);
  }
  return normalized;
}

function canonical(
  value: string,
  kind: SmartDropdownMatchKind
): string {
  if (kind === 'country') return canonicalCountry(value);
  if (kind === 'state') return canonicalState(value);
  return normalize(value);
}

/** Separators ATS labels use between an identifier and its human name. */
const SEGMENT_SPLIT_RE = /[—–\-|/,()\[\]]+/;
/**
 * Place lists are the exception: their commas separate a hierarchy, not
 * synonyms. Splitting on them would let the country tail of
 * "New York, NY, United States" match a profile country, so only the ordered
 * leading-run rule may use comma structure for locations.
 */
const SEGMENT_SPLIT_NO_COMMA_RE = /[—–\-|/()\[\]]+/;

/**
 * Deterministic rewrites of one option label into the forms it could equal.
 *
 * This is canonicalization, not fuzzy matching: every variant is a complete
 * piece of the label, so a match is still an exact string equality. Real ATS
 * lists render the same answer as "United States", "United States (US)", or
 * "US-CA — California", and comparing only the whole string missed all of them.
 */
function labelVariants(text: string, kind: SmartDropdownMatchKind): string[] {
  // Greenhouse renders phone-country options as "United States +1".
  if (kind === 'country') text = text
    .replace(/\s*\+\s*\d{1,4}\s*$/, '')
    .replace(/^\s*\+\s*\d{1,4}\s*/, '');
  const variants = new Set<string>();
  const whole = canonical(text, kind);
  if (whole) variants.add(whole);

  // "United States (US)" -> "United States", and the parenthetical "US".
  const withoutParens = text.replace(/[([][^)\]]*[)\]]/g, ' ');
  const parenContents = [...text.matchAll(/[([]([^)\]]*)[)\]]/g)].map((m) => m[1]);
  for (const piece of [withoutParens, ...parenContents]) {
    const value = canonical(piece, kind);
    if (value) variants.add(value);
  }

  // "US-CA — California" -> "US CA" and "California".
  const splitter =
    kind === 'location' ? SEGMENT_SPLIT_NO_COMMA_RE : SEGMENT_SPLIT_RE;
  for (const segment of text.split(splitter)) {
    const value = canonical(segment, kind);
    if (value) variants.add(value);
  }
  return [...variants];
}

/**
 * Location lists render "New York, NY, United States" where the profile holds
 * "New York, NY". A match is allowed only when the desired value is a complete
 * leading run of comma-separated segments — never a mid-string substring, so
 * "York" can never select "New York".
 */
function matchesLeadingSegments(text: string, desired: string): boolean {
  const segments = text.split(',').map((segment) => normalize(segment)).filter(Boolean);
  for (let count = 1; count <= segments.length; count += 1) {
    if (segments.slice(0, count).join(' ') === desired) return true;
  }
  return false;
}

/** Every "+<digits>" or bare digit run a country-code option exposes. */
function dialCodesInLabel(text: string): string[] {
  const codes = new Set<string>();
  for (const match of text.matchAll(/\+\s*(\d{1,4})/g)) codes.add(match[1]);
  const bare = text.trim().match(/^(\d{1,4})$/);
  if (bare) codes.add(bare[1]);
  return [...codes];
}

function phoneCountryCodeScore(
  option: SmartDropdownOption,
  desiredDialCode: string,
  context: SmartDropdownContext
): number {
  const haystack = `${option.value} ${option.text}`;
  if (!dialCodesInLabel(haystack).includes(desiredDialCode)) return 0;

  // The dial code alone is the match. The applicant's country only breaks ties
  // between options that share a code — "+1" is both the US and Canada — and
  // must never veto an option, because the code may have come from the phone
  // number itself: an Indian number stored by someone living in the US should
  // still select "+91".
  const desiredCountry = context.countryName
    ? canonicalCountry(context.countryName)
    : '';
  if (desiredCountry && labelVariants(option.text, 'country').includes(desiredCountry)) {
    return 100;
  }
  return 90;
}

function optionScore(
  option: SmartDropdownOption,
  desiredValue: string,
  kind: SmartDropdownMatchKind,
  context: SmartDropdownContext
): number {
  if (option.disabled) return 0;
  const text = normalize(option.text);
  if (!text || PLACEHOLDER_RE.test(option.text.trim())) return 0;

  if (kind === 'phoneCountryCode') {
    return phoneCountryCodeScore(option, desiredValue.replace(/\D/g, ''), context);
  }

  const desired = canonical(desiredValue, kind);
  if (!desired) return 0;
  if (kind === 'location') {
    const parts = option.text.split(',').map(part => part.trim());
    const wanted = desiredValue.split(',').map(part => part.trim());
    if (normalize(parts[0]) !== normalize(wanted[0])) return 0;
    const state = wanted[1] || context.stateName;
    const country = wanted[2] || context.countryName;
    // Never accept a known conflicting region, even if it is the only result.
    if (state && parts.length > 1 && canonicalState(parts[1]) !== canonicalState(state)) return 0;
    if (country && parts.length > 2 && canonicalCountry(parts[parts.length - 1]) !== canonicalCountry(country)) return 0;
    if (country && !state && parts.length === 2 && canonicalCountry(parts[1]) !== canonicalCountry(country)) return 0;
    if (parts.length > 1 && (state || country)) return 100;
  }
  const value = canonical(option.value, kind);
  const label = canonical(option.text, kind);

  // Whole-string equality stays the strongest signal.
  if (value === desired && label === desired) return 120;
  if (value === desired) return 110;
  if (label === desired) return 100;

  // Then a complete, deterministically derived piece of the label.
  if (
    labelVariants(option.text, kind).includes(desired) ||
    (option.value && labelVariants(option.value, kind).includes(desired))
  ) {
    return 90;
  }

  // Finally, leading segments — place lists only, where the option is the
  // profile's location plus extra administrative detail.
  if (
    (kind === 'location' || kind === 'generic') &&
    matchesLeadingSegments(option.text, desired)
  ) {
    return kind === 'location' ? 80 : 0;
  }
  return 0;
}

/**
 * Return one high-confidence option, or null.
 *
 * Every match is an exact equality against the option label or a complete,
 * deterministically derived piece of it — TrackMyOPT still never guesses. Two
 * options reaching the same score is treated as ambiguous and selects nothing,
 * which is why a "+1" list containing both the US and Canada needs the
 * applicant's country in `context` before either can win.
 */
export function chooseSmartDropdownOption<T extends SmartDropdownOption>(
  options: T[],
  desiredValue: string,
  kind: SmartDropdownMatchKind = 'generic',
  context: SmartDropdownContext = {}
): T | null {
  const ranked = options
    .map((option) => ({
      option,
      score: optionScore(option, desiredValue, kind, context),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);
  if (ranked.length === 0) return null;
  if (ranked.length > 1 && ranked[0].score === ranked[1].score) return null;
  return ranked[0].option;
}

export function isCustomDropdownControl(
  element: Element
): boolean {
  if (element.tagName === 'SELECT') return false;
  return (
    element.getAttribute('role') === 'combobox' ||
    element.getAttribute('aria-haspopup') === 'listbox' ||
    !!leverLocationSelection(element)
  );
}

function visible(element: HTMLElement): boolean {
  if (!isInActiveControlTree(element) || element.matches(':disabled')) return false;
  if (
    element.hidden ||
    element.getAttribute('aria-hidden') === 'true' ||
    element.getAttribute('aria-disabled') === 'true'
    || ('disabled' in element && Boolean((element as HTMLInputElement).disabled))
    || ('readOnly' in element && Boolean((element as HTMLInputElement).readOnly))
  ) {
    return false;
  }
  const view = element.ownerDocument.defaultView;
  if (!view) return false;
  const style = view.getComputedStyle(element);
  if (
    style.display === 'none' ||
    style.visibility === 'hidden' ||
    style.opacity === '0'
  ) {
    return false;
  }
  const isJsdom = /jsdom/i.test(view.navigator.userAgent || '');
  return isJsdom || element.getClientRects().length > 0;
}

function selectedTextNear(control: HTMLElement): string {
  // React Select nests the input inside an input-container; the selected value
  // is its sibling, not its descendant. Stay inside this control's container.
  const wrapper = control.closest<HTMLElement>(
    '[class*="value-container" i],[class*="ValueContainer"], [class*="select__control"]'
  ) || control.closest<HTMLElement>(
    '[class*="select" i],[data-automation-id*="select" i],[data-testid*="select" i]'
  );
  const selected = wrapper?.querySelector<HTMLElement>(
    '[class*="singleValue" i],[class*="single-value" i],[class*="selected-value" i],' +
      '[data-automation-id*="selected" i],[data-testid*="selected" i]'
  );
  return selected?.textContent?.replace(/\s+/g, ' ').trim() || '';
}

export function customDropdownHasValue(control: HTMLElement, ownSearch?: string): boolean {
  const leverSelection = leverLocationSelection(control);
  if (leverSelection) return Boolean(leverSelection.value.trim());
  const ariaValue =
    control.getAttribute('aria-valuetext') ||
    control.getAttribute('data-value') ||
    '';
  if (ariaValue.trim() && !PLACEHOLDER_RE.test(ariaValue.trim())) return true;
  if (
    (control.tagName === 'INPUT' || control.tagName === 'TEXTAREA') &&
    (control as HTMLInputElement | HTMLTextAreaElement).value.trim() &&
    (control as HTMLInputElement | HTMLTextAreaElement).value !== ownSearch
  ) {
    return true;
  }
  const selectedNear = selectedTextNear(control);
  if (selectedNear && !PLACEHOLDER_RE.test(selectedNear)) return true;
  if (control.tagName === 'BUTTON') {
    const text = control.textContent?.replace(/\s+/g, ' ').trim() || '';
    return Boolean(text && !PLACEHOLDER_RE.test(text));
  }
  return false;
}

function optionElements(control: HTMLElement): HTMLElement[] {
  if (leverLocationSelection(control)) {
    // Never scan unrelated lists or click the surrounding application actions.
    return Array.from(control.closest('.application-field')!.querySelectorAll<HTMLElement>('.dropdown-results > *'))
      .filter(option => visible(option) && !option.matches('button,a,input') && !option.querySelector('button,a,input'));
  }
  const ids = [
    control.getAttribute('aria-controls'),
    control.getAttribute('aria-owns'),
  ]
    .filter(Boolean)
    .flatMap((value) => String(value).split(/\s+/));
  const roots: ParentNode[] = [];
  for (const id of ids) {
    const linked = linkedControlElement(control, id);
    if (linked) roots.push(linked);
  }
  // A linked list can be portaled anywhere, but other open dropdowns are never
  // its options. While the linked list is loading, wait for that list only.
  if (ids.length === 0) {
    const field = control.closest<HTMLElement>('.form-field,.form-group,.application-field,.field,[data-automation-id*="formField" i],[class*="select__control"]');
    // Without an explicit list relationship, require a single dropdown inside
    // a bounded field. A page-wide option search can select another question.
    if (field && field.querySelectorAll(CUSTOM_DROPDOWN_SELECTOR).length === 1) roots.push(field);
  }
  const found = new Set<HTMLElement>();
  for (const root of roots) {
    for (const option of Array.from(
      root.querySelectorAll<HTMLElement>(
        '[role="option"],[data-automation-id="promptOption"],' +
          '[data-testid*="select-option" i],spl-select-option'
      )
    )) {
      if (!visible(option)) continue;
      if (
        option.getAttribute('aria-disabled') === 'true' ||
        'disabled' in option && Boolean((option as HTMLButtonElement).disabled)
      ) {
        continue;
      }
      found.add(option);
    }
  }
  return Array.from(found);
}

async function waitForOptionElements(
  control: HTMLElement,
  timeoutMs: number,
  stale: Map<HTMLElement, string> = new Map()
): Promise<HTMLElement[]> {
  const current = () => optionElements(control).filter(option => stale.get(option) !== JSON.stringify(optionCandidate(option)));
  const immediate = current();
  if (immediate.length > 0) return immediate;
  const view = control.ownerDocument.defaultView;
  if (!view) return [];
  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      const options = current();
      if (options.length === 0) return;
      settled = true;
      observer.disconnect();
      view.clearTimeout(timer);
      resolve(options);
    };
    const observer = new view.MutationObserver(finish);
    for (const root of enclosingControlRoots(control)) observer.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['aria-expanded', 'aria-hidden', 'class'],
    });
    const timer = view.setTimeout(() => {
      if (settled) return;
      settled = true;
      observer.disconnect();
      resolve(current());
    }, timeoutMs);
  });
}

function optionCandidate(element: HTMLElement): SmartDropdownOption {
  return {
    value:
      element.getAttribute('data-value') ||
      element.getAttribute('value') ||
      element.id ||
      '',
    text:
      element.getAttribute('aria-label') ||
      element.textContent?.replace(/\s+/g, ' ').trim() ||
      '',
    disabled:
      element.getAttribute('aria-disabled') === 'true' ||
      ('disabled' in element && Boolean((element as HTMLButtonElement).disabled)),
  };
}

function pressDropdownKey(control: HTMLElement, key: 'Escape' | 'ArrowDown'): void {
  const view = control.ownerDocument.defaultView;
  const KeyboardEventCtor = view?.KeyboardEvent || KeyboardEvent;
  // Some ATS wrappers (Greenhouse) control menu visibility on keyup. A lone
  // keydown reaches react-select but never opens the externally controlled menu.
  for (const type of ['keydown', 'keyup']) control.dispatchEvent(
    new KeyboardEventCtor(type, {
      key,
      code: key,
      bubbles: true,
      composed: true,
      cancelable: true,
    })
  );
}

function closeWithoutSelection(control: HTMLElement): void {
  pressDropdownKey(control, 'Escape');
}

async function waitForSelection(control: HTMLElement, ownSearch: string | undefined, timeoutMs: number): Promise<boolean> {
  const accepted = () => customDropdownHasValue(control, ownSearch);
  if (accepted()) return true;
  const view = control.ownerDocument.defaultView;
  if (!view) return false;
  return new Promise(resolve => {
    const observer = new view.MutationObserver(() => {
      if (!accepted()) return;
      observer.disconnect(); view.clearTimeout(timer); resolve(true);
    });
    for (const root of enclosingControlRoots(control)) observer.observe(root, { childList: true, subtree: true, attributes: true, characterData: true });
    const timer = view.setTimeout(() => { observer.disconnect(); resolve(accepted()); }, timeoutMs);
  });
}

function setSearchValue(control: HTMLInputElement, value: string): void {
  const view = control.ownerDocument.defaultView;
  if (!view) return;
  // Native setter bypasses React's value tracker so onChange receives input.
  Object.getOwnPropertyDescriptor(view.HTMLInputElement.prototype, 'value')?.set?.call(control, value);
  control.dispatchEvent(new view.Event('input', { bubbles: true, composed: true }));
}

/**
 * Open an accessible ATS dropdown and click one exact matching option.
 * This is the only host-page click path used for deterministic dropdown
 * selection; action buttons such as Next/Review/Submit are never candidates.
 */
export async function selectSmartDropdown(
  control: HTMLElement,
  desiredValue: string,
  kind: SmartDropdownMatchKind = 'generic',
  customMatcher?: (candidate: string, desired: string) => boolean,
  timeoutMs = 5_000,
  context: SmartDropdownContext = {}
): Promise<SmartDropdownSelectionResult> {
  if (context.shouldContinue?.() === false) return { outcome: 'unsupported' };
  if (!isCustomDropdownControl(control) || !visible(control)) {
    return { outcome: 'unsupported' };
  }
  if (customDropdownHasValue(control)) {
    return { outcome: 'already_filled' };
  }
  // Uncommitted text may be a user's in-progress edit. Do not overwrite it.
  if (leverLocationSelection(control) && (control as HTMLInputElement).value !== '') {
    return { outcome: 'already_filled' };
  }
  control.focus();
  const view = control.ownerDocument.defaultView;
  const MouseEventCtor = view?.MouseEvent || MouseEvent;
  control.dispatchEvent(
    new MouseEventCtor('mousedown', {
      bubbles: true,
      composed: true,
      button: 0,
      cancelable: true,
    })
  );
  // React may commit the opening state after the event finishes. Immediately
  // clicking again can toggle the menu shut before any options are rendered.
  await new Promise<void>(resolve => view!.setTimeout(resolve, 0));
  if (context.shouldContinue?.() === false || !control.isConnected) return { outcome: 'unsupported' };
  let elements = optionElements(control);
  if (
    elements.length === 0 &&
    control.getAttribute('aria-expanded') !== 'true'
  ) {
    if (control.tagName === 'INPUT') pressDropdownKey(control, 'ArrowDown');
    else control.click();
    elements = optionElements(control);
  }
  let ownSearch: string | undefined;
  const searchInput = kind === 'location' && control.tagName === 'INPUT' &&
    (control.getAttribute('aria-autocomplete') === 'list' || leverLocationSelection(control)) ? control as HTMLInputElement : null;
  const cleanSearch = () => {
    // Do not remove a choice or text entered by the user while loading.
    if (searchInput && ownSearch !== undefined && searchInput.value === ownSearch && !customDropdownHasValue(control, ownSearch)) {
      setSearchValue(searchInput, '');
    }
  };
  if (searchInput && !customDropdownHasValue(control)) {
    ownSearch = desiredValue.split(',')[0].trim();
    const stale = new Map(elements.map(element => [element, JSON.stringify(optionCandidate(element))]));
    setSearchValue(searchInput, ownSearch);
    // Greenhouse can load suggestions while its menu remains closed. Search
    // text alone is not a value; open the list before matching an actual option.
    if (control.getAttribute('aria-expanded') !== 'true') pressDropdownKey(control, 'ArrowDown');
    elements = await waitForOptionElements(control, timeoutMs, stale);
  } else if (elements.length === 0) {
    elements = await waitForOptionElements(control, timeoutMs);
  }
  if (context.shouldContinue?.() === false || !control.isConnected || !visible(control)) {
    cleanSearch();
    closeWithoutSelection(control);
    return { outcome: 'unsupported' };
  }
  if (customDropdownHasValue(control, ownSearch) ||
      (searchInput && ownSearch !== undefined && searchInput.value !== ownSearch)) {
    return { outcome: 'already_filled' };
  }
  const candidates = elements.map(optionCandidate);
  let selectedIndex = -1;
  if (customMatcher) {
    const matching = candidates
      .map((candidate, index) => ({ candidate, index }))
      .filter(({ candidate }) =>
        !candidate.disabled &&
        // IDs and backend values may contain 0/1 unrelated to Yes/No. The
        // displayed answer is authoritative for reviewed private questions.
        customMatcher(candidate.text || candidate.value, desiredValue)
      );
    if (matching.length === 1) selectedIndex = matching[0].index;
  } else {
    const selected = chooseSmartDropdownOption(
      candidates,
      desiredValue,
      kind,
      context
    );
    if (selected) selectedIndex = candidates.indexOf(selected);
  }
  if (selectedIndex < 0) {
    cleanSearch();
    closeWithoutSelection(control);
    return { outcome: 'no_match' };
  }
  elements[selectedIndex].click();
  markPrefillUndoUnsupported(control);
  // A dispatched click is not proof the ATS accepted the answer.
  if (!await waitForSelection(control, ownSearch, timeoutMs)) {
    cleanSearch();
    closeWithoutSelection(control);
    return { outcome: 'no_match' };
  }
  return {
    outcome: 'selected',
    optionText: candidates[selectedIndex].text,
  };
}
