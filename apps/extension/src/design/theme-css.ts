/**
 * Emits the design tokens as CSS custom properties for any surface: the popup
 * (`:root`), the injected widget (a scoped class), and the side panel.
 *
 * Two behaviours matter here:
 *
 * 1. THEME TRIGGERS. The popup previously switched theme only via
 *    `body.dark-mode`, while the widget switched only via
 *    `prefers-color-scheme`. The two surfaces could therefore disagree. Every
 *    scope now honours all three: the OS preference, an explicit
 *    `[data-tmo-theme]` attribute, and the legacy `.dark-mode` class. Explicit
 *    settings win over the OS preference in both directions.
 *
 * 2. LEGACY ALIASES. `popup.css` (879 lines) and ~178 inline `cssText` calls in
 *    the widget reference the old names. `legacyAliases` re-points those at the
 *    canonical tokens so migration is incremental instead of a flag day.
 */

import {
    COLORS, SHADOW, SPACE, RADIUS, FONT_SIZE, LINE_HEIGHT, FONT_WEIGHT,
    FONT_FAMILY, TRACKING, MOTION, LAYER, MIN_TARGET,
    type ColorToken, type ThemeName,
} from './tokens';

/** camelCase token name -> kebab-case CSS variable suffix. */
function kebab(name: string): string {
    return name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
}

function colorVars(theme: ThemeName): string[] {
    return Object.entries(COLORS[theme]).map(
        ([name, value]) => `--tmo-color-${kebab(name)}:${value}`
    );
}

function shadowVars(theme: ThemeName): string[] {
    return Object.entries(SHADOW[theme]).map(
        ([step, value]) => `--tmo-shadow-${step}:${value}`
    );
}

/** Theme-independent scales. Emitted once per scope. */
function staticVars(): string[] {
    return [
        ...Object.entries(SPACE).map(([k, v]) => `--tmo-space-${k.replace('.', '\\.')}:${v}`),
        ...Object.entries(RADIUS).map(([k, v]) => `--tmo-radius-${k}:${v}`),
        ...Object.entries(FONT_SIZE).map(([k, v]) => `--tmo-text-${k}:${v}`),
        ...Object.entries(LINE_HEIGHT).map(([k, v]) => `--tmo-leading-${k}:${v}`),
        ...Object.entries(FONT_WEIGHT).map(([k, v]) => `--tmo-weight-${k}:${v}`),
        ...Object.entries(TRACKING).map(([k, v]) => `--tmo-tracking-${k}:${v}`),
        ...Object.entries(FONT_FAMILY).map(([k, v]) => `--tmo-font-${k}:${v}`),
        ...Object.entries(MOTION).map(([k, v]) => `--tmo-motion-${k}:${v}`),
        ...Object.entries(LAYER).map(([k, v]) => `--tmo-layer-${k}:${v}`),
        `--tmo-min-target:${MIN_TARGET}`,
    ];
}

/**
 * Old variable name -> canonical token it now resolves to.
 *
 * `popup.css` owns the first group; the widget's inline styles own the second.
 * Delete an entry only once every reference to it is gone.
 */
const LEGACY_ALIASES: Record<string, ColorToken | 'shadow2' | 'shadow3'> = {
    // popup.css
    '--bg': 'bg',
    '--surface': 'surface',
    '--surface-2': 'surfaceRaised',
    '--border': 'border',
    '--ink': 'ink',
    '--muted': 'inkMuted',
    '--accent': 'accent',
    '--tool-blue-surface': 'infoSurface',
    '--tool-blue-border': 'infoBorder',
    '--tool-blue-ink': 'infoInk',
    '--tool-green-surface': 'successSurface',
    '--tool-green-border': 'successBorder',
    '--tool-green-ink': 'successInk',
    '--tool-orange-surface': 'warningSurface',
    '--tool-orange-border': 'warningBorder',
    '--tool-orange-ink': 'warningInk',
    '--tool-red-surface': 'dangerSurface',
    '--tool-red-border': 'dangerBorder',
    '--tool-red-ink': 'dangerInk',
    '--tool-neutral-surface': 'surface',
    '--tool-neutral-border': 'border',

    // widget-platform.ts inline styles
    '--tmo-widget-background': 'bg',
    '--tmo-widget-surface': 'surface',
    '--tmo-widget-surface-2': 'surfaceRaised',
    '--tmo-widget-border': 'border',
    '--tmo-widget-ink': 'ink',
    // Referenced by three call sites in content-job-portal.ts but never defined
    // by the old token set — those rules silently fell back to the inherited
    // colour. Aliased to ink, which is what they intended.
    '--tmo-widget-text': 'ink',
    '--tmo-widget-muted': 'inkMuted',
    '--tmo-widget-accent': 'accent',
    '--tmo-widget-accent-strong': 'accentStrong',
    '--tmo-widget-focus': 'focusRing',
    '--tmo-widget-overlay': 'overlay',
    '--tmo-widget-success-surface': 'successSurface',
    '--tmo-widget-success-border': 'successBorder',
    '--tmo-widget-success-ink': 'successInk',
    '--tmo-widget-warning-surface': 'warningSurface',
    '--tmo-widget-warning-border': 'warningBorder',
    '--tmo-widget-warning-ink': 'warningInk',
    '--tmo-widget-danger-surface': 'dangerSurface',
    '--tmo-widget-danger-border': 'dangerBorder',
    '--tmo-widget-danger-ink': 'dangerInk',
    '--tmo-widget-info-surface': 'infoSurface',
    '--tmo-widget-info-border': 'infoBorder',
    '--tmo-widget-info-ink': 'infoInk',
};

function legacyVars(): string[] {
    const entries = Object.entries(LEGACY_ALIASES).map(([alias, target]) => {
        if (target === 'shadow2') return `${alias}:var(--tmo-shadow-2)`;
        if (target === 'shadow3') return `${alias}:var(--tmo-shadow-3)`;
        return `${alias}:var(--tmo-color-${kebab(target)})`;
    });
    // Shadow and radius aliases are named rather than colour-mapped.
    entries.push('--shadow-card:var(--tmo-shadow-2)');
    entries.push('--tmo-widget-shadow:var(--tmo-shadow-3)');
    entries.push('--radius-sm:var(--tmo-radius-sm)');
    entries.push('--radius-md:var(--tmo-radius-md)');
    entries.push('--radius-lg:var(--tmo-radius-lg)');
    return entries;
}

export interface ThemeCssOptions {
    /** Selector the tokens are attached to. Defaults to `:root`. */
    scope?: string;
    /** Emit the old variable names as aliases. Default true during migration. */
    legacyAliases?: boolean;
    /** Include the reduced-motion and base reset rules. Default true. */
    baseRules?: boolean;
}

export function buildThemeCss(options: ThemeCssOptions = {}): string {
    const scope = (options.scope ?? ':root').trim() || ':root';
    const withLegacy = options.legacyAliases !== false;
    const withBase = options.baseRules !== false;

    const light = [...colorVars('light'), ...shadowVars('light')];
    const dark = [...colorVars('dark'), ...shadowVars('dark')];
    const shared = [...staticVars(), ...(withLegacy ? legacyVars() : [])];

    // Dark selectors, in precedence order. The explicit attribute/class must be
    // able to force light back on when the OS prefers dark, so a light override
    // is emitted too.
    const darkSelectors = [
        `${scope}[data-tmo-theme="dark"]`,
        `${scope} [data-tmo-theme="dark"]`,
        `${scope}.dark-mode`,
        `${scope} .dark-mode`,
        `body.dark-mode ${scope}`,
    ].join(',');
    const lightSelectors = [
        `${scope}[data-tmo-theme="light"]`,
        `${scope} [data-tmo-theme="light"]`,
    ].join(',');

    const out = [
        `${scope}{color-scheme:light;${light.join(';')};${shared.join(';')}}`,
        `@media (prefers-color-scheme:dark){${scope}:not([data-tmo-theme="light"]){color-scheme:dark;${dark.join(';')}}}`,
        `${darkSelectors}{color-scheme:dark;${dark.join(';')}}`,
        `${lightSelectors}{color-scheme:light;${light.join(';')}}`,
    ];

    if (withBase) {
        out.push(
            `${scope}{font-family:var(--tmo-font-sans);color:var(--tmo-color-ink)}`,
            // Visible focus everywhere. The previous surfaces relied on the UA
            // default, which disappears against dark backgrounds.
            `${scope} :focus-visible{outline:2px solid var(--tmo-color-accent);outline-offset:2px;border-radius:var(--tmo-radius-xs)}`,
            `@media (prefers-reduced-motion:reduce){${scope},${scope} *{animation-duration:0.01ms!important;animation-iteration-count:1!important;transition-duration:0.01ms!important;scroll-behavior:auto!important}}`,
            // Forced-colors (Windows high contrast): let the OS palette win.
            `@media (forced-colors:active){${scope} *{forced-color-adjust:auto}}`
        );
    }

    return out.join('\n');
}

/** Injects the theme into a document once, idempotently. */
export function ensureThemeStyle(
    doc: Document,
    options: ThemeCssOptions & { id?: string } = {}
): HTMLStyleElement {
    const id = options.id ?? 'tmo-design-tokens';
    const existing = doc.getElementById(id);
    if (existing instanceof HTMLStyleElement) return existing;

    const style = doc.createElement('style');
    style.id = id;
    style.textContent = buildThemeCss(options);
    // Prepend so page/author stylesheets can still override component rules.
    (doc.head ?? doc.documentElement).prepend(style);
    return style;
}
