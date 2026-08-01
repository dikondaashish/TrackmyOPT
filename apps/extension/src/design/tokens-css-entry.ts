/**
 * Build-time entry: emits the popup/side-panel stylesheet.
 *
 * esbuild.config.js bundles this for node and writes the result to
 * dist/tokens.css, so the CSS served to the popup is generated from
 * tokens.ts rather than hand-maintained alongside it.
 */
import { buildThemeCss } from './theme-css';

export const css = [
    '/* GENERATED from src/design/tokens.ts — do not edit. */',
    buildThemeCss({ scope: ':root', legacyAliases: true, baseRules: true }),
].join('\n');
