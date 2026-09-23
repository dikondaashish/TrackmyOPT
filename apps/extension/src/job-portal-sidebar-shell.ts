import { COLORS } from './design/tokens';
import { WIDGET_ROOT_ID } from './widget-dom-ids';

/** Inset rail geometry measured against the reference sidebar, not its features. */
export const SIDEBAR_SHELL_CSS = `
  #${WIDGET_ROOT_ID}, #${WIDGET_ROOT_ID} * { box-sizing:border-box; }
  #${WIDGET_ROOT_ID} .tmo-job-widget-card {
    display:flex;flex-direction:column;width:min(360px,calc(100vw - 32px));
    height:calc(100vh - 32px);height:calc(100dvh - 32px);
    border:1px solid var(--tmo-widget-border);border-radius:14px;
    background:var(--tmo-widget-surface);color:var(--tmo-widget-ink);
    box-shadow:0 4px 16px rgba(15,23,42,.08),0 1px 2px rgba(15,23,42,.05);
    overflow:hidden;isolation:isolate;
    animation:tmo-sidebar-enter 220ms cubic-bezier(.22,1,.36,1) both;
  }
  #${WIDGET_ROOT_ID} .tmo-job-widget-header {
    display:flex;align-items:center;gap:8px;height:44px;flex:0 0 44px;
    padding:0 6px 0 14px;background:${COLORS.light.ink};color:${COLORS.light.onAccent};
  }
  #${WIDGET_ROOT_ID} .tmo-job-widget-header button { color:inherit;width:40px;height:40px; }
  #${WIDGET_ROOT_ID} .tmo-job-widget-header button:focus-visible {
    outline-color:${COLORS.light.onAccent};outline-offset:-2px;
  }
  #${WIDGET_ROOT_ID} .tmo-job-widget-footer {
    flex:0 0 auto;display:flex;justify-content:center;padding:2px 14px;
    border-top:1px solid var(--tmo-widget-border);background:var(--tmo-widget-surface);
  }
  #${WIDGET_ROOT_ID} .tmo-job-widget-scroll-body { font-size:13px;line-height:1.45; }
  #${WIDGET_ROOT_ID} .tmo-sidebar-section-heading > span {
    font-size:11px;line-height:1.4;font-weight:600;letter-spacing:.065em;
    text-transform:uppercase;color:var(--tmo-widget-muted);
  }
  #${WIDGET_ROOT_ID} .tmo-sidebar-section-heading {
    display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;
    gap:0 8px;margin:0 0 6px;min-height:36px;
  }
  #${WIDGET_ROOT_ID} .tmo-sidebar-help-button {
    display:grid;place-items:center;width:36px;height:36px;cursor:pointer;
    border:0;border-radius:9px;background:transparent;color:var(--tmo-widget-muted);font:600 14px system-ui;
  }
  #${WIDGET_ROOT_ID} .tmo-sidebar-help-button:hover { background:var(--tmo-widget-surface-2); }
  #${WIDGET_ROOT_ID} .tmo-sidebar-help-copy {
    flex-basis:100%;margin:0 0 10px;padding:10px 12px;border-radius:8px;
    background:var(--tmo-widget-info-surface);color:var(--tmo-widget-info-ink);
    font-size:12px;line-height:1.5;font-weight:400;
  }
  #${WIDGET_ROOT_ID} .tmo-sidebar-action {
    background:var(--tmo-widget-surface);color:var(--tmo-widget-ink);
  }
  #${WIDGET_ROOT_ID} .tmo-sidebar-action .tmo-action-sublabel { color:var(--tmo-widget-muted); }
  #${WIDGET_ROOT_ID} .tmo-sidebar-action:not(:disabled):hover { background:var(--tmo-widget-surface-2); }
  #${WIDGET_ROOT_ID} .tmo-sidebar-action:focus-visible { outline-offset:-2px; }
  #${WIDGET_ROOT_ID} .tmo-sidebar-action:disabled { opacity:.65;cursor:wait; }
  #${WIDGET_ROOT_ID} .tmo-prefill-button {
    margin:10px 0 8px;background:var(--tmo-color-action-fill);color:var(--tmo-color-on-action);
  }
  #${WIDGET_ROOT_ID} .tmo-prefill-button .tmo-action-sublabel { color:inherit; }
  #${WIDGET_ROOT_ID} .tmo-prefill-button:not(:disabled):hover { background:${COLORS.light.accentStrong}; }
  #${WIDGET_ROOT_ID} .tmo-prefill-button:focus-visible { outline:2px solid var(--tmo-color-on-action);outline-offset:-4px; }
  #${WIDGET_ROOT_ID} .tmo-prefill-undo { margin:0 0 8px;color:var(--tmo-widget-muted);font-size:12px;line-height:1.5; }
  #${WIDGET_ROOT_ID} .tmo-prefill-undo button {
    min-height:36px;padding:6px 10px;border:1px solid var(--tmo-widget-border);border-radius:8px;
    color:var(--tmo-widget-ink);background:var(--tmo-widget-surface);font:inherit;cursor:pointer;
  }
  #${WIDGET_ROOT_ID} .tmo-prefill-undo button:disabled { opacity:.55;cursor:default; }
  #${WIDGET_ROOT_ID} .tmo-prefill-undo button:not(:disabled):hover { background:var(--tmo-widget-surface-2); }
  #${WIDGET_ROOT_ID} .tmo-prefill-undo button:focus-visible { outline:2px solid var(--tmo-widget-accent-strong);outline-offset:2px; }
  #${WIDGET_ROOT_ID} .tmo-prefill-undo [role="status"]:not(:empty) { padding:8px 0; }
  #${WIDGET_ROOT_ID} .tmo-sensitive-answer-panel button[aria-expanded] > svg:last-child {
    margin-left:auto;transition:transform 180ms ease-out;
  }
  #${WIDGET_ROOT_ID} .tmo-sensitive-answer-panel button[aria-expanded="true"] > svg:last-child { transform:rotate(90deg); }
  @keyframes tmo-sidebar-enter {
    from { opacity:0;transform:translateX(12px); }
    to { opacity:1;transform:translateX(0); }
  }
  @media (prefers-reduced-motion:reduce) {
    #${WIDGET_ROOT_ID} .tmo-job-widget-card { animation:none; }
  }
`;
