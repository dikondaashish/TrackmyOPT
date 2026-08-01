/**
 * TrackMyOPT extension design tokens — the single source of truth.
 *
 * Before this module there were two parallel token sets with identical values
 * but different names: `public/popup.css` (`--bg`, `--surface`, `--tool-blue-*`)
 * and `widget-platform.ts` (`--tmo-widget-background`, `--tmo-widget-info-*`).
 * Both are now generated from here, so a colour can only be changed in one
 * place. See `theme-css.ts` for emission and the legacy alias layer.
 *
 * Values are preserved from the previous two systems wherever they agreed, so
 * adopting this module is visually neutral. Where they disagreed, the choice is
 * noted inline.
 */

export type ThemeName = 'light' | 'dark';

/* ------------------------------------------------------------------ colour */

export type ColorToken =
    | 'bg'
    | 'surface'
    | 'surfaceRaised'
    | 'surfaceSunken'
    | 'border'
    | 'borderStrong'
    | 'ink'
    | 'inkMuted'
    | 'inkSubtle'
    | 'accent'
    | 'accentStrong'
    | 'onAccent'
    | 'focusRing'
    | 'overlay'
    | 'infoSurface' | 'infoBorder' | 'infoInk'
    | 'successSurface' | 'successBorder' | 'successInk'
    | 'warningSurface' | 'warningBorder' | 'warningInk'
    | 'dangerSurface' | 'dangerBorder' | 'dangerInk';

export const COLORS: Record<ThemeName, Record<ColorToken, string>> = {
    light: {
        bg: '#f6f8fb',
        surface: '#ffffff',
        surfaceRaised: '#f1f4f9',
        surfaceSunken: '#eef1f6',
        border: '#e7eaf0',
        borderStrong: '#cbd5e1',
        ink: '#0f172a',
        inkMuted: '#64748b',
        inkSubtle: '#94a3b8',
        accent: '#2563eb',
        accentStrong: '#1e40af',
        onAccent: '#ffffff',
        focusRing: 'rgba(37,99,235,0.35)',
        overlay: 'rgba(15,23,42,0.48)',
        // Info border: popup used #bfdbfe, widget #dbeafe. Kept the stronger
        // popup value — #dbeafe fails 3:1 against white for a boundary.
        infoSurface: '#eff6ff', infoBorder: '#bfdbfe', infoInk: '#1e40af',
        successSurface: '#f0fdf4', successBorder: '#bbf7d0', successInk: '#166534',
        // Warning: popup used orange (#fff7ed), widget amber (#fffbeb). Orange
        // reads as distinct from the success/info pair at small sizes.
        warningSurface: '#fff7ed', warningBorder: '#fed7aa', warningInk: '#9a3412',
        dangerSurface: '#fef2f2', dangerBorder: '#fecaca', dangerInk: '#991b1b',
    },
    dark: {
        bg: '#0d1016',
        surface: '#161b22',
        surfaceRaised: '#1c222c',
        surfaceSunken: '#11161d',
        border: '#262d3a',
        borderStrong: '#3a4353',
        ink: '#e6eaf2',
        inkMuted: '#8b95a7',
        inkSubtle: '#6b7688',
        accent: '#5eead4',
        accentStrong: '#93c5fd',
        onAccent: '#0d1016',
        focusRing: 'rgba(94,234,212,0.38)',
        overlay: 'rgba(2,6,23,0.72)',
        infoSurface: '#152641', infoBorder: '#294b75', infoInk: '#93c5fd',
        successSurface: '#102a22', successBorder: '#215c45', successInk: '#86efac',
        warningSurface: '#30250f', warningBorder: '#6b4f16', warningInk: '#fdba74',
        dangerSurface: '#341719', dangerBorder: '#713437', dangerInk: '#fca5a5',
    },
};

/** Status tones shared by banners, badges, and surface cards. */
export const TONES = ['info', 'success', 'warning', 'danger', 'neutral'] as const;
export type Tone = (typeof TONES)[number];

/* -------------------------------------------------------------- typography */

/**
 * Replaces the 15 ad-hoc sizes previously in popup.css (7.5px through 20px,
 * including half-pixel values that render inconsistently across DPI).
 */
export const FONT_SIZE = {
    '2xs': '10px',
    xs: '11px',
    sm: '12px',
    md: '13px',
    lg: '14px',
    xl: '16px',
    '2xl': '20px',
    '3xl': '24px',
} as const;

export const LINE_HEIGHT = {
    '2xs': '1.4',
    xs: '1.45',
    sm: '1.45',
    md: '1.5',
    lg: '1.5',
    xl: '1.4',
    '2xl': '1.3',
    '3xl': '1.25',
} as const;

export type FontSizeToken = keyof typeof FONT_SIZE;

export const FONT_WEIGHT = {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
} as const;

export const TRACKING = {
    tight: '-0.01em',
    normal: '0',
    wide: '0.02em',
    caps: '0.06em',
} as const;

export const FONT_FAMILY = {
    sans: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    mono: "ui-monospace, SFMono-Regular, Menlo, monospace",
} as const;

/* ----------------------------------------------------------------- spacing */

/** 4px base grid. Keys are the step, values the computed length. */
export const SPACE = {
    '0': '0',
    px: '1px',
    '0.5': '2px',
    '1': '4px',
    '1.5': '6px',
    '2': '8px',
    '2.5': '10px',
    '3': '12px',
    '4': '16px',
    '5': '20px',
    '6': '24px',
    '8': '32px',
    '10': '40px',
} as const;

export type SpaceToken = keyof typeof SPACE;

/* ------------------------------------------------------ radius / elevation */

/** sm/md/lg preserve the previous popup values so cards keep their shape. */
export const RADIUS = {
    xs: '6px',
    sm: '10px',
    md: '13px',
    lg: '16px',
    xl: '20px',
    full: '999px',
} as const;

export const SHADOW: Record<ThemeName, Record<'0' | '1' | '2' | '3', string>> = {
    light: {
        '0': 'none',
        '1': '0 1px 2px rgba(15,23,42,0.06)',
        '2': '0 10px 24px rgba(15,23,42,0.10)',
        '3': '0 10px 28px rgba(15,23,42,0.18)',
    },
    dark: {
        '0': 'none',
        '1': '0 1px 2px rgba(0,0,0,0.40)',
        '2': '0 10px 26px rgba(0,0,0,0.45)',
        '3': '0 12px 34px rgba(0,0,0,0.48)',
    },
};

/* ------------------------------------------------------------------ motion */

export const MOTION = {
    fast: '120ms',
    base: '180ms',
    slow: '260ms',
    ease: 'cubic-bezier(0.2, 0, 0, 1)',
} as const;

/* ------------------------------------------------------------------ layers */

/**
 * Content-script surfaces sit above host-page chrome. Values stay just below
 * the 32-bit ceiling so a host page using 2147483647 cannot bury the widget
 * without also breaking itself.
 */
export const LAYER = {
    base: '0',
    sticky: '10',
    widget: '2147483000',
    modal: '2147483100',
    toast: '2147483200',
} as const;

/* ------------------------------------------------------------- a11y sizing */

/** Minimum hit target. Chrome popups are dense, but 28px is the floor. */
export const MIN_TARGET = '28px';
