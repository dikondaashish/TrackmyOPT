import { WIDGET_ROOT_ID, WIDGET_THEME_SCOPE_CLASS } from './widget-dom-ids';

/** Queries only our widget and legacy document-mounted dialogs, never other roots. */
export function widgetContent(root: HTMLElement | null): HTMLElement | null {
  return root?.shadowRoot?.getElementById(WIDGET_ROOT_ID) ?? root;
}
export function queryWidgetAll<T extends Element = HTMLElement>(selector: string, doc: Document = document): T[] {
  const content = widgetContent(doc.getElementById(WIDGET_ROOT_ID));
  return [...Array.from(doc.querySelectorAll<T>(selector)),
    ...(content && content.getRootNode() !== doc ? Array.from(content.querySelectorAll<T>(selector)) : [])];
}
export function queryWidget<T extends Element = HTMLElement>(selector: string, doc: Document = document): T | null {
  return queryWidgetAll<T>(selector, doc)[0] ?? null;
}

/** Retain the host's positioning and event identity; isolate its complete UI. */
export function isolateWidget(root: HTMLElement): void {
  if (root.shadowRoot) return;
  const doc = root.ownerDocument;
  const shadow = root.attachShadow({ mode: 'open' });
  const surface = doc.createElement('div');
  surface.id = WIDGET_ROOT_ID;
  surface.classList.add(WIDGET_THEME_SCOPE_CLASS);
  if (root.dataset.tmoTheme) surface.dataset.tmoTheme = root.dataset.tmoTheme;
  surface.style.cssText = 'font:13px/1.45 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;text-align:left;letter-spacing:normal;text-transform:none;';
  const reset = doc.createElement('style');
  reset.textContent = ':host{color-scheme:light dark} button,input,select,textarea{font:inherit} button{cursor:pointer} [hidden]{display:none!important}';
  shadow.append(reset);
  for (const id of ['tmo-widget-theme-tokens', 'tmo-spin-style', 'tmo-minimized-motion-style']) {
    const style = doc.getElementById(id);
    if (style) shadow.append(style.cloneNode(true));
  }
  surface.append(...Array.from(root.childNodes));
  shadow.append(surface);
}

/** Resolve focus through our open root for menu focus and dialog restoration. */
export function widgetActiveElement(doc: Document = document): Element | null {
  let active = doc.activeElement;
  while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;
  return active;
}
