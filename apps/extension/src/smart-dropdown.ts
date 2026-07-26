export type SmartDropdownMatchKind =
  | 'country'
  | 'state'
  | 'location'
  | 'generic';

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
  '[role="combobox"],[aria-haspopup="listbox"]';

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

function optionScore(
  option: SmartDropdownOption,
  desiredValue: string,
  kind: SmartDropdownMatchKind
): number {
  if (option.disabled) return 0;
  const text = normalize(option.text);
  if (!text || PLACEHOLDER_RE.test(option.text.trim())) return 0;
  const desired = canonical(desiredValue, kind);
  if (!desired) return 0;
  const value = canonical(option.value, kind);
  const label = canonical(option.text, kind);
  if (value === desired && label === desired) return 120;
  if (value === desired) return 110;
  if (label === desired) return 100;
  return 0;
}

/**
 * Return one exact, high-confidence option. Partial/fuzzy matches deliberately
 * return null so TrackMyOPT never guesses a dropdown answer.
 */
export function chooseSmartDropdownOption<T extends SmartDropdownOption>(
  options: T[],
  desiredValue: string,
  kind: SmartDropdownMatchKind = 'generic'
): T | null {
  const ranked = options
    .map((option) => ({ option, score: optionScore(option, desiredValue, kind) }))
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
    element.getAttribute('aria-haspopup') === 'listbox'
  );
}

function visible(element: HTMLElement): boolean {
  if (
    element.hidden ||
    element.getAttribute('aria-hidden') === 'true' ||
    element.getAttribute('aria-disabled') === 'true'
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
  const wrapper = control.closest<HTMLElement>(
    '[class*="select" i],[data-automation-id*="select" i],[data-testid*="select" i]'
  );
  const selected = wrapper?.querySelector<HTMLElement>(
    '[class*="singleValue" i],[class*="selected-value" i],' +
      '[data-automation-id*="selected" i],[data-testid*="selected" i]'
  );
  return selected?.textContent?.replace(/\s+/g, ' ').trim() || '';
}

export function customDropdownHasValue(control: HTMLElement): boolean {
  const ariaValue =
    control.getAttribute('aria-valuetext') ||
    control.getAttribute('data-value') ||
    '';
  if (ariaValue.trim() && !PLACEHOLDER_RE.test(ariaValue.trim())) return true;
  if (
    (control.tagName === 'INPUT' || control.tagName === 'TEXTAREA') &&
    (control as HTMLInputElement | HTMLTextAreaElement).value.trim()
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
  const documentForControl = control.ownerDocument;
  const ids = [
    control.getAttribute('aria-controls'),
    control.getAttribute('aria-owns'),
  ]
    .filter(Boolean)
    .flatMap((value) => String(value).split(/\s+/));
  const roots: ParentNode[] = [];
  for (const id of ids) {
    const linked = documentForControl.getElementById(id);
    if (linked) roots.push(linked);
  }
  roots.push(documentForControl);
  const found = new Set<HTMLElement>();
  for (const root of roots) {
    for (const option of Array.from(
      root.querySelectorAll<HTMLElement>(
        '[role="option"],[data-automation-id="promptOption"],' +
          '[data-testid*="select-option" i]'
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
  timeoutMs: number
): Promise<HTMLElement[]> {
  const immediate = optionElements(control);
  if (immediate.length > 0) return immediate;
  const view = control.ownerDocument.defaultView;
  if (!view) return [];
  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      const options = optionElements(control);
      if (options.length === 0) return;
      settled = true;
      observer.disconnect();
      view.clearTimeout(timer);
      resolve(options);
    };
    const observer = new view.MutationObserver(finish);
    observer.observe(control.ownerDocument.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['aria-expanded', 'aria-hidden', 'class'],
    });
    const timer = view.setTimeout(() => {
      if (settled) return;
      settled = true;
      observer.disconnect();
      resolve(optionElements(control));
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

function closeWithoutSelection(control: HTMLElement): void {
  const view = control.ownerDocument.defaultView;
  const KeyboardEventCtor = view?.KeyboardEvent || KeyboardEvent;
  control.dispatchEvent(
    new KeyboardEventCtor('keydown', {
      key: 'Escape',
      code: 'Escape',
      bubbles: true,
      composed: true,
    })
  );
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
  timeoutMs = 1_000
): Promise<SmartDropdownSelectionResult> {
  if (!isCustomDropdownControl(control) || !visible(control)) {
    return { outcome: 'unsupported' };
  }
  if (customDropdownHasValue(control)) {
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
    })
  );
  let elements = optionElements(control);
  if (
    elements.length === 0 &&
    control.getAttribute('aria-expanded') !== 'true'
  ) {
    control.click();
    elements = optionElements(control);
  }
  if (elements.length === 0) {
    elements = await waitForOptionElements(control, timeoutMs);
  }
  const candidates = elements.map(optionCandidate);
  let selectedIndex = -1;
  if (customMatcher) {
    const matching = candidates
      .map((candidate, index) => ({ candidate, index }))
      .filter(({ candidate }) =>
        !candidate.disabled &&
        customMatcher(`${candidate.value} ${candidate.text}`, desiredValue)
      );
    if (matching.length === 1) selectedIndex = matching[0].index;
  } else {
    const selected = chooseSmartDropdownOption(candidates, desiredValue, kind);
    if (selected) selectedIndex = candidates.indexOf(selected);
  }
  if (selectedIndex < 0) {
    closeWithoutSelection(control);
    return { outcome: 'no_match' };
  }
  elements[selectedIndex].click();
  return {
    outcome: 'selected',
    optionText: candidates[selectedIndex].text,
  };
}
