/**
 * Widget theme CSS injection and scope application for the job-portal content script.
 */

import { buildWidgetThemeCss, isDarkCssColor } from './widget-platform';
import { WIDGET_THEME_SCOPE_CLASS, WIDGET_THEME_STYLE_ID } from './widget-dom-ids';

export function ensureWidgetThemeStyles(): void {
  if (document.getElementById(WIDGET_THEME_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = WIDGET_THEME_STYLE_ID;
  style.textContent = buildWidgetThemeCss(`.${WIDGET_THEME_SCOPE_CLASS}`);
  (document.head || document.documentElement).appendChild(style);
}

export function applyWidgetThemeScope(element: HTMLElement): void {
  ensureWidgetThemeStyles();
  element.classList.add(WIDGET_THEME_SCOPE_CLASS);
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  const bodyColor = document.body ? getComputedStyle(document.body).backgroundColor : '';
  const documentColor = getComputedStyle(document.documentElement).backgroundColor;
  if (prefersDark || isDarkCssColor(bodyColor) || isDarkCssColor(documentColor)) {
    element.dataset.tmoTheme = 'dark';
  }
}
