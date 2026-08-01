/**
 * Accessibility hardening for the injected widget.
 *
 * content-job-portal.ts is 5,237 lines of imperative DOM with 42 click
 * handlers, only 25 of which are on real <button> elements. Across the whole
 * file there is one `role=` and zero `tabindex`, so the remaining controls —
 * styled divs and spans with `cursor:pointer` — cannot be reached or activated
 * by keyboard at all.
 *
 * Rewriting every call site in that file at once is high risk. Instead this
 * module provides two things:
 *
 *   1. `makeInteractive` — the correct way to build a control, for new code.
 *   2. `hardenInteractiveElements` — a sweep that retrofits existing controls,
 *      so the widget becomes operable now rather than after a full rewrite.
 *
 * The decision logic is pure so it can be tested without a DOM; only the thin
 * appliers touch elements.
 */

/* ------------------------------------------------------------------- pure */

/** Elements the browser already makes focusable and activatable. */
const NATIVELY_INTERACTIVE = new Set([
    'a', 'button', 'input', 'select', 'textarea', 'summary', 'details', 'option',
]);

export interface ElementFacts {
    tag: string;
    hasRole: boolean;
    hasTabIndex: boolean;
    /** Inline or computed `cursor: pointer` — the widget's clickability signal. */
    cursorPointer: boolean;
    disabled: boolean;
    /** True when the element has an href (a real link). */
    hasHref?: boolean;
}

/**
 * True when an element looks clickable but the browser will not focus or
 * activate it from the keyboard.
 */
export function needsInteractiveTreatment(facts: ElementFacts): boolean {
    if (facts.disabled) return false;
    const tag = facts.tag.toLowerCase();
    if (NATIVELY_INTERACTIVE.has(tag)) {
        // An anchor without href is not focusable despite being a link tag.
        return tag === 'a' && facts.hasHref === false && facts.cursorPointer && !facts.hasTabIndex;
    }
    if (!facts.cursorPointer) return false;
    // Already handled by a previous sweep or by hand.
    if (facts.hasRole && facts.hasTabIndex) return false;
    return true;
}

/** Keys that must activate a role="button" element, per WAI-ARIA. */
export function isActivationKey(key: string): boolean {
    return key === 'Enter' || key === ' ' || key === 'Spacebar';
}

/**
 * Space scrolls the page by default; Enter does not. Only Space needs its
 * default suppressed when it activates a control.
 */
export function shouldPreventDefaultForKey(key: string): boolean {
    return key === ' ' || key === 'Spacebar';
}

/** Attributes that turn a generic element into a keyboard-operable button. */
export function interactiveAttributes(label?: string): Record<string, string> {
    const attrs: Record<string, string> = { role: 'button', tabindex: '0' };
    if (label?.trim()) attrs['aria-label'] = label.trim();
    return attrs;
}

/**
 * Derives an accessible name from an element's own text. Returns undefined when
 * the text is empty or is only an icon glyph, so callers know a label is
 * required rather than silently shipping an unnamed control.
 */
export function deriveAccessibleName(textContent: string): string | undefined {
    const text = textContent.replace(/\s+/g, ' ').trim();
    if (!text) return undefined;
    // Strip emoji/symbol-only labels — they read as gibberish to screen readers.
    const withoutSymbols = text.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}←-⇿☀-➿×✓✕○●–—]/gu, '').trim();
    if (!withoutSymbols) return undefined;
    return withoutSymbols.slice(0, 120);
}

/* -------------------------------------------------------------- appliers */

/**
 * Makes an element keyboard-operable: focusable, activatable by Enter/Space,
 * and exposed as a button. Use this for any new clickable non-button element.
 */
export function makeInteractive(
    element: HTMLElement,
    options: { label?: string; onActivate?: (event: Event) => void } = {}
): HTMLElement {
    const label = options.label ?? deriveAccessibleName(element.textContent ?? '');
    for (const [name, value] of Object.entries(interactiveAttributes(label))) {
        if (!element.hasAttribute(name)) element.setAttribute(name, value);
    }

    if (!element.dataset.tmoKeyboard) {
        element.dataset.tmoKeyboard = '1';
        element.addEventListener('keydown', (event) => {
            const keyEvent = event as KeyboardEvent;
            if (!isActivationKey(keyEvent.key)) return;
            if (shouldPreventDefaultForKey(keyEvent.key)) event.preventDefault();
            if (options.onActivate) options.onActivate(event);
            else (element as HTMLElement).click();
        });
    }
    return element;
}

function readFacts(element: HTMLElement): ElementFacts {
    const inline = element.style?.cursor;
    const cursor =
        inline ||
        (element.ownerDocument?.defaultView?.getComputedStyle(element).cursor ?? '');
    return {
        tag: element.tagName,
        hasRole: element.hasAttribute('role'),
        hasTabIndex: element.hasAttribute('tabindex'),
        cursorPointer: cursor === 'pointer',
        disabled: element.getAttribute('aria-disabled') === 'true' ||
            (element as HTMLButtonElement).disabled === true,
        hasHref: element.tagName.toLowerCase() === 'a' ? element.hasAttribute('href') : undefined,
    };
}

/**
 * Retrofits every clickable-looking element under `root`.
 *
 * Idempotent: elements already treated are skipped, so it is safe to call after
 * every re-render. Returns the number of elements fixed, which the widget logs
 * during development.
 */
export function hardenInteractiveElements(root: ParentNode): number {
    let fixed = 0;
    const candidates = root.querySelectorAll<HTMLElement>('div,span,li,td,img,svg,p');
    for (const element of Array.from(candidates)) {
        if (element.dataset?.tmoKeyboard) continue;
        if (!needsInteractiveTreatment(readFacts(element))) continue;
        makeInteractive(element);
        fixed += 1;
    }
    return fixed;
}

/**
 * Announces widget status changes. The widget conveys state through colour and
 * spinners only, which screen readers do not report.
 */
export function ensureWidgetAnnouncer(root: HTMLElement): (message: string) => void {
    let region = root.querySelector<HTMLElement>('[data-tmo-announcer]');
    if (!region) {
        region = root.ownerDocument.createElement('div');
        region.setAttribute('data-tmo-announcer', '1');
        region.setAttribute('aria-live', 'polite');
        region.setAttribute('aria-atomic', 'true');
        region.setAttribute('role', 'status');
        region.style.cssText =
            'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap';
        root.appendChild(region);
    }
    let last = '';
    return (message: string) => {
        if (!region) return;
        region.textContent = message === last ? `${message} ` : message;
        last = message;
    };
}
