/**
 * Accessible vanilla-TS component primitives for every extension surface.
 *
 * Why this exists: the widget builds its UI from `document.createElement` plus
 * ~178 inline `cssText` strings and 62 hardcoded hex literals. In 5,237 lines it
 * contains one `role=` and zero `tabindex`, so its div-based controls are
 * unreachable by keyboard. These primitives make the accessible thing the
 * default thing — real semantic elements, enforced labels on icon-only
 * controls, wired aria relationships — so call sites cannot regress it.
 *
 * No framework, no bundle growth: every factory returns a plain HTMLElement.
 */

import { SPACE, type Tone, type SpaceToken, type FontSizeToken } from './tokens';

/* -------------------------------------------------------------- primitives */

type Attrs = Record<string, string | number | boolean | null | undefined>;

export interface ElOptions {
    class?: string;
    style?: string;
    text?: string;
    attrs?: Attrs;
    children?: (Node | null | undefined)[];
    on?: Partial<Record<keyof HTMLElementEventMap, EventListener>>;
}

export function el<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    options: ElOptions = {}
): HTMLElementTagNameMap[K] {
    const node = document.createElement(tag);
    if (options.class) node.className = options.class;
    if (options.style) node.style.cssText = options.style;
    if (options.text !== undefined) node.textContent = options.text;
    for (const [key, value] of Object.entries(options.attrs ?? {})) {
        if (value === null || value === undefined || value === false) continue;
        node.setAttribute(key, value === true ? '' : String(value));
    }
    for (const child of options.children ?? []) {
        if (child) node.appendChild(child);
    }
    for (const [event, handler] of Object.entries(options.on ?? {})) {
        if (handler) node.addEventListener(event, handler as EventListener);
    }
    return node;
}

let idCounter = 0;
/** Stable-per-session unique id for aria wiring. */
export function uid(prefix = 'tmo'): string {
    idCounter += 1;
    return `${prefix}-${idCounter}`;
}

const v = (name: string) => `var(--tmo-${name})`;
const space = (token: SpaceToken) => v(`space-${String(token).replace('.', '\\.')}`);

/* ------------------------------------------------------------------ layout */

export interface StackOptions extends ElOptions {
    gap?: SpaceToken;
    align?: 'start' | 'center' | 'end' | 'stretch';
}

export function stack(options: StackOptions = {}): HTMLDivElement {
    const { gap = '3', align = 'stretch', style = '', ...rest } = options;
    return el('div', {
        ...rest,
        style: `display:flex;flex-direction:column;gap:${space(gap)};align-items:${flexAlign(align)};${style}`,
    });
}

export interface RowOptions extends StackOptions {
    justify?: 'start' | 'center' | 'end' | 'between';
    wrap?: boolean;
}

export function row(options: RowOptions = {}): HTMLDivElement {
    const { gap = '2', align = 'center', justify = 'start', wrap, style = '', ...rest } = options;
    const justifyMap = {
        start: 'flex-start', center: 'center', end: 'flex-end', between: 'space-between',
    } as const;
    return el('div', {
        ...rest,
        style: `display:flex;flex-direction:row;gap:${space(gap)};align-items:${flexAlign(align)};justify-content:${justifyMap[justify]};${wrap ? 'flex-wrap:wrap;' : ''}${style}`,
    });
}

function flexAlign(value: 'start' | 'center' | 'end' | 'stretch'): string {
    return value === 'start' ? 'flex-start' : value === 'end' ? 'flex-end' : value;
}

/* --------------------------------------------------------------------- text */

export interface TextOptions extends ElOptions {
    size?: FontSizeToken;
    weight?: 'regular' | 'medium' | 'semibold' | 'bold';
    tone?: 'default' | 'muted' | 'subtle' | Tone;
    as?: 'p' | 'span' | 'div' | 'label';
}

const TONE_INK: Record<string, string> = {
    default: 'color-ink',
    muted: 'color-ink-muted',
    subtle: 'color-ink-subtle',
    info: 'color-info-ink',
    success: 'color-success-ink',
    warning: 'color-warning-ink',
    danger: 'color-danger-ink',
    neutral: 'color-ink',
};

export function text(options: TextOptions = {}): HTMLElement {
    const { size = 'md', weight = 'regular', tone = 'default', as = 'p', style = '', ...rest } = options;
    return el(as, {
        ...rest,
        style: `margin:0;font-size:${v(`text-${size}`)};line-height:${v(`leading-${size}`)};font-weight:${v(`weight-${weight}`)};color:${v(TONE_INK[tone] ?? 'color-ink')};${style}`,
    });
}

export function heading(
    level: 1 | 2 | 3,
    content: string,
    options: Omit<TextOptions, 'as'> = {}
): HTMLElement {
    const sizes = { 1: '2xl', 2: 'xl', 3: 'lg' } as const;
    const size = options.size ?? sizes[level];
    const node = el(`h${level}` as 'h1' | 'h2' | 'h3', {
        ...options,
        text: content,
        style: `margin:0;font-size:${v(`text-${size}`)};line-height:${v(`leading-${size}`)};font-weight:${v(`weight-${options.weight ?? 'semibold'}`)};letter-spacing:${v('tracking-tight')};color:${v(TONE_INK[options.tone ?? 'default'])};${options.style ?? ''}`,
    });
    return node;
}

/** Visually hidden but announced by screen readers. */
export function srOnly(content: string): HTMLSpanElement {
    return el('span', {
        text: content,
        style: 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0',
    });
}

/* ------------------------------------------------------------------ button */

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md';

export interface ButtonOptions {
    label: string;
    variant?: ButtonVariant;
    size?: ButtonSize;
    type?: 'button' | 'submit';
    disabled?: boolean;
    /** Renders a spinner, sets aria-busy, and blocks activation. */
    loading?: boolean;
    /** Inline SVG or text glyph placed before the label. Marked aria-hidden. */
    icon?: Node;
    fullWidth?: boolean;
    onClick?: (event: MouseEvent) => void;
    attrs?: Attrs;
}

function buttonSkin(variant: ButtonVariant): string {
    switch (variant) {
        case 'primary':
            return `background:${v('color-accent')};border:1px solid ${v('color-accent')};color:${v('color-on-accent')}`;
        case 'danger':
            return `background:${v('color-danger-surface')};border:1px solid ${v('color-danger-border')};color:${v('color-danger-ink')}`;
        case 'ghost':
            return `background:transparent;border:1px solid transparent;color:${v('color-ink')}`;
        default:
            return `background:${v('color-surface')};border:1px solid ${v('color-border')};color:${v('color-ink')}`;
    }
}

export function button(options: ButtonOptions): HTMLButtonElement {
    const {
        label, variant = 'secondary', size = 'md', type = 'button',
        disabled, loading, icon, fullWidth, onClick, attrs,
    } = options;

    const padding = size === 'sm' ? `${space('1')} ${space('2')}` : `${space('2')} ${space('3')}`;
    const fontSize = size === 'sm' ? 'text-sm' : 'text-md';

    const node = el('button', {
        attrs: {
            type,
            disabled: disabled || loading || undefined,
            'aria-busy': loading ? 'true' : undefined,
            ...attrs,
        },
        style: [
            'display:inline-flex;align-items:center;justify-content:center',
            `gap:${space('1.5')}`,
            `min-height:${v('min-target')}`,
            `padding:${padding}`,
            `font-family:${v('font-sans')};font-size:${v(fontSize)};font-weight:${v('weight-medium')};line-height:1`,
            `border-radius:${v('radius-sm')}`,
            buttonSkin(variant),
            `transition:opacity ${v('motion-fast')} ${v('motion-ease')},background ${v('motion-fast')} ${v('motion-ease')}`,
            fullWidth ? 'width:100%' : '',
            disabled || loading ? 'opacity:0.55;cursor:not-allowed' : 'cursor:pointer',
        ].filter(Boolean).join(';'),
    });

    if (loading) node.appendChild(spinner({ size: size === 'sm' ? 12 : 14 }));
    else if (icon) {
        const wrap = el('span', { attrs: { 'aria-hidden': 'true' }, style: 'display:inline-flex' });
        wrap.appendChild(icon);
        node.appendChild(wrap);
    }
    node.appendChild(el('span', { text: label }));

    if (onClick) {
        node.addEventListener('click', (event) => {
            if (node.disabled || loading) return;
            onClick(event as MouseEvent);
        });
    }
    return node;
}

export interface IconButtonOptions extends Omit<ButtonOptions, 'label' | 'icon' | 'fullWidth'> {
    /** Required — an icon-only control is invisible to screen readers without it. */
    label: string;
    icon: Node;
}

export function iconButton(options: IconButtonOptions): HTMLButtonElement {
    const { label, icon, variant = 'ghost', size = 'md', disabled, loading, onClick, attrs } = options;
    const node = el('button', {
        attrs: {
            type: 'button',
            'aria-label': label,
            title: label,
            disabled: disabled || loading || undefined,
            'aria-busy': loading ? 'true' : undefined,
            ...attrs,
        },
        style: [
            'display:inline-flex;align-items:center;justify-content:center',
            `width:${v('min-target')};height:${v('min-target')}`,
            `border-radius:${v('radius-sm')}`,
            buttonSkin(variant),
            disabled || loading ? 'opacity:0.55;cursor:not-allowed' : 'cursor:pointer',
        ].join(';'),
    });
    const wrap = el('span', { attrs: { 'aria-hidden': 'true' }, style: 'display:inline-flex' });
    wrap.appendChild(loading ? spinner({ size: 14 }) : icon);
    node.appendChild(wrap);
    if (onClick) {
        node.addEventListener('click', (event) => {
            if (node.disabled || loading) return;
            onClick(event as MouseEvent);
        });
    }
    return node;
}

/* -------------------------------------------------------------------- card */

export interface CardOptions extends ElOptions {
    tone?: Tone;
    padding?: SpaceToken;
    elevation?: '0' | '1' | '2' | '3';
    /** Renders as <section> with an accessible name. */
    label?: string;
}

const TONE_SURFACE: Record<Tone, { bg: string; border: string }> = {
    info: { bg: 'color-info-surface', border: 'color-info-border' },
    success: { bg: 'color-success-surface', border: 'color-success-border' },
    warning: { bg: 'color-warning-surface', border: 'color-warning-border' },
    danger: { bg: 'color-danger-surface', border: 'color-danger-border' },
    neutral: { bg: 'color-surface', border: 'color-border' },
};

export function card(options: CardOptions = {}): HTMLElement {
    const { tone = 'neutral', padding = '3', elevation = '0', label, style = '', ...rest } = options;
    const skin = TONE_SURFACE[tone];
    return el(label ? 'section' : 'div', {
        ...rest,
        attrs: { ...(label ? { 'aria-label': label } : {}), ...(rest.attrs ?? {}) },
        style: `background:${v(skin.bg)};border:1px solid ${v(skin.border)};border-radius:${v('radius-md')};padding:${space(padding)};box-shadow:${v(`shadow-${elevation}`)};${style}`,
    });
}

/* ------------------------------------------------------------------ banner */

export interface BannerOptions {
    tone?: Tone;
    title?: string;
    message: string;
    /** 'assertive' for errors that interrupt, 'polite' for everything else. */
    live?: 'polite' | 'assertive' | 'off';
    actions?: HTMLElement[];
    icon?: Node;
}

export function banner(options: BannerOptions): HTMLElement {
    const { tone = 'info', title, message, live = 'polite', actions, icon } = options;
    const node = card({
        tone,
        padding: '3',
        attrs: {
            role: tone === 'danger' ? 'alert' : 'status',
            'aria-live': live === 'off' ? undefined : live,
        },
        style: 'display:flex;gap:' + space('2') + ';align-items:flex-start',
    });

    if (icon) {
        const wrap = el('span', { attrs: { 'aria-hidden': 'true' }, style: 'display:inline-flex;flex-shrink:0' });
        wrap.appendChild(icon);
        node.appendChild(wrap);
    }

    const body = stack({ gap: '1', style: 'flex:1;min-width:0' });
    if (title) body.appendChild(text({ text: title, size: 'md', weight: 'semibold', tone }));
    body.appendChild(text({ text: message, size: 'sm', tone: title ? 'muted' : tone }));
    if (actions?.length) body.appendChild(row({ gap: '2', children: actions }));
    node.appendChild(body);
    return node;
}

/* ------------------------------------------------------------------- badge */

export function badge(label: string, tone: Tone = 'neutral'): HTMLSpanElement {
    const skin = TONE_SURFACE[tone];
    return el('span', {
        text: label,
        style: `display:inline-flex;align-items:center;padding:${space('0.5')} ${space('1.5')};background:${v(skin.bg)};border:1px solid ${v(skin.border)};border-radius:${v('radius-full')};font-size:${v('text-xs')};font-weight:${v('weight-medium')};color:${v(TONE_INK[tone])};white-space:nowrap`,
    });
}

/* ----------------------------------------------------------------- spinner */

export function spinner(options: { size?: number; label?: string } = {}): HTMLElement {
    const { size = 14, label } = options;
    const node = el('span', {
        attrs: { 'aria-hidden': label ? undefined : 'true', role: label ? 'status' : undefined, 'aria-label': label },
        style: `display:inline-block;width:${size}px;height:${size}px;border:2px solid ${v('color-border')};border-top-color:${v('color-accent')};border-radius:50%;animation:tmo-spin 720ms linear infinite;flex-shrink:0`,
    });
    ensureKeyframes(node.ownerDocument);
    return node;
}

function ensureKeyframes(doc: Document): void {
    if (doc.getElementById('tmo-keyframes')) return;
    const style = doc.createElement('style');
    style.id = 'tmo-keyframes';
    style.textContent = '@keyframes tmo-spin{to{transform:rotate(360deg)}}';
    (doc.head ?? doc.documentElement).appendChild(style);
}

/* ------------------------------------------------------------- live region */

/**
 * A single polite announcer per surface. Agent runs use this to narrate state
 * changes that are otherwise conveyed only by colour or motion.
 */
export function liveRegion(politeness: 'polite' | 'assertive' = 'polite'): {
    node: HTMLElement;
    announce: (message: string) => void;
} {
    const node = el('div', {
        attrs: { 'aria-live': politeness, 'aria-atomic': 'true', role: 'status' },
        style: 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap',
    });
    let last = '';
    return {
        node,
        announce(message: string) {
            // Re-announce identical text by toggling content.
            node.textContent = message === last ? `${message} ` : message;
            last = message;
        },
    };
}

/* ------------------------------------------------------------------- field */

export interface FieldOptions {
    label: string;
    control: HTMLElement;
    description?: string;
    error?: string;
    required?: boolean;
}

/** Wires label/description/error to the control via ids and aria attributes. */
export function field(options: FieldOptions): HTMLElement {
    const { label, control, description, error, required } = options;
    const controlId = control.id || uid('field');
    control.id = controlId;

    const describedBy: string[] = [];
    const wrapper = stack({ gap: '1' });

    const labelNode = el('label', {
        text: label,
        attrs: { for: controlId },
        style: `font-size:${v('text-sm')};font-weight:${v('weight-medium')};color:${v('color-ink')}`,
    });
    if (required) {
        labelNode.appendChild(el('span', { text: ' *', attrs: { 'aria-hidden': 'true' }, style: `color:${v('color-danger-ink')}` }));
        control.setAttribute('required', '');
        control.setAttribute('aria-required', 'true');
    }
    wrapper.appendChild(labelNode);
    wrapper.appendChild(control);

    if (description) {
        const id = uid('desc');
        describedBy.push(id);
        wrapper.appendChild(text({ text: description, size: 'xs', tone: 'muted', attrs: { id } }));
    }
    if (error) {
        const id = uid('err');
        describedBy.push(id);
        control.setAttribute('aria-invalid', 'true');
        wrapper.appendChild(text({ text: error, size: 'xs', tone: 'danger', attrs: { id, role: 'alert' } }));
    } else {
        control.removeAttribute('aria-invalid');
    }
    if (describedBy.length) control.setAttribute('aria-describedby', describedBy.join(' '));

    return wrapper;
}

const CONTROL_STYLE = [
    `width:100%`,
    `min-height:${v('min-target')}`,
    `padding:${space('1.5')} ${space('2')}`,
    `font-family:${v('font-sans')};font-size:${v('text-md')};color:${v('color-ink')}`,
    `background:${v('color-surface')}`,
    `border:1px solid ${v('color-border')};border-radius:${v('radius-sm')}`,
].join(';');

export function input(options: { type?: string; placeholder?: string; value?: string; attrs?: Attrs } = {}): HTMLInputElement {
    return el('input', {
        attrs: { type: options.type ?? 'text', placeholder: options.placeholder, value: options.value, ...options.attrs },
        style: CONTROL_STYLE,
    });
}

export function textarea(options: { rows?: number; placeholder?: string; value?: string; attrs?: Attrs } = {}): HTMLTextAreaElement {
    const node = el('textarea', {
        attrs: { rows: options.rows ?? 4, placeholder: options.placeholder, ...options.attrs },
        style: `${CONTROL_STYLE};resize:vertical;line-height:${v('leading-md')}`,
    });
    if (options.value) node.value = options.value;
    return node;
}

export function select(options: {
    options: { value: string; label: string }[];
    value?: string;
    attrs?: Attrs;
}): HTMLSelectElement {
    const node = el('select', { attrs: options.attrs, style: CONTROL_STYLE });
    for (const option of options.options) {
        node.appendChild(el('option', { text: option.label, attrs: { value: option.value } }));
    }
    if (options.value) node.value = options.value;
    return node;
}

/* ------------------------------------------------------------------ dialog */

export interface DialogHandle {
    node: HTMLElement;
    close: () => void;
}

/**
 * Modal with a focus trap, Escape handling, and focus restoration. The widget
 * previously reimplemented parts of this per modal, inconsistently.
 */
export function dialog(options: {
    title: string;
    content: HTMLElement;
    footer?: HTMLElement;
    onClose?: () => void;
    doc?: Document;
}): DialogHandle {
    const doc = options.doc ?? document;
    const previouslyFocused = doc.activeElement as HTMLElement | null;
    const titleId = uid('dialog-title');

    const panel = el('div', {
        attrs: { role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': titleId },
        style: `background:${v('color-surface')};border:1px solid ${v('color-border')};border-radius:${v('radius-lg')};box-shadow:${v('shadow-3')};max-width:min(560px,92vw);max-height:86vh;overflow:auto;padding:${space('4')};display:flex;flex-direction:column;gap:${space('3')}`,
    });
    panel.appendChild(heading(2, options.title, { attrs: { id: titleId } }));
    panel.appendChild(options.content);
    if (options.footer) panel.appendChild(options.footer);

    const overlay = el('div', {
        style: `position:fixed;inset:0;background:${v('color-overlay')};display:flex;align-items:center;justify-content:center;padding:${space('4')};z-index:${v('layer-modal')}`,
        children: [panel],
    });

    const close = () => {
        doc.removeEventListener('keydown', onKeydown, true);
        overlay.remove();
        previouslyFocused?.focus?.();
        options.onClose?.();
    };

    function focusable(): HTMLElement[] {
        return Array.from(
            panel.querySelectorAll<HTMLElement>(
                'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
            )
        ).filter((node) => node.offsetParent !== null || node === doc.activeElement);
    }

    function onKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            event.stopPropagation();
            close();
            return;
        }
        if (event.key !== 'Tab') return;
        const items = focusable();
        if (items.length === 0) {
            event.preventDefault();
            return;
        }
        const first = items[0];
        const last = items[items.length - 1];
        const active = doc.activeElement as HTMLElement | null;
        if (event.shiftKey && (active === first || !panel.contains(active))) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && active === last) {
            event.preventDefault();
            first.focus();
        }
    }

    overlay.addEventListener('mousedown', (event) => {
        if (event.target === overlay) close();
    });
    doc.addEventListener('keydown', onKeydown, true);

    // Defer so the node is in the document before focusing.
    queueMicrotask(() => (focusable()[0] ?? panel).focus());

    return { node: overlay, close };
}

/* --------------------------------------------------------------- utilities */

export const tokens = { space: SPACE, v, spaceVar: space };
