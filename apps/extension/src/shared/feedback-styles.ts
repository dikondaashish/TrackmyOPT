/** Scoped inside the feedback shadow root; shared extension tokens only. */
export const FEEDBACK_CSS = `
.tmo-feedback, .tmo-feedback * { box-sizing:border-box; }
.tmo-feedback { width:min(600px,calc(100vw - 24px)); max-height:calc(100dvh - 24px); display:flex; flex-direction:column; margin:0; color:var(--tmo-color-ink); background:var(--tmo-color-surface); border:1px solid var(--tmo-color-border-strong); border-radius:20px; box-shadow:var(--tmo-shadow-3); font:13px/1.5 system-ui,sans-serif; overflow:hidden; }
.tmo-feedback button, .tmo-feedback textarea, .tmo-feedback input { font:inherit; }
.tmo-feedback button { cursor:pointer; }
.fb-header { display:flex; align-items:center; gap:12px; padding:20px 24px; border-bottom:1px solid var(--tmo-color-border); }
.fb-logo { border-radius:10px; object-fit:contain; flex-shrink:0; }
.fb-brand { margin:0 0 2px; font-size:11px; font-weight:600; color:var(--tmo-color-ink-muted); }
.tmo-feedback h1 { font-size:20px; line-height:1.3; letter-spacing:-.3px; margin:0; font-weight:700; }
.fb-close { margin-left:auto; width:40px; height:40px; flex-shrink:0; border:0; border-radius:10px; background:transparent; color:var(--tmo-color-ink-muted); font-size:24px !important; }
.fb-close:hover { background:var(--tmo-color-surface-raised); color:var(--tmo-color-ink); }
.fb-body { padding:24px; overflow-y:auto; overscroll-behavior:contain; min-height:0; }
.fb-section { margin:0 0 24px; padding:0; border:0; min-width:0; }
.fb-body > div.fb-section { margin-bottom:0; }
.fb-section legend, .fb-label { display:block; padding:0; margin:0 0 12px; font-weight:600; font-size:14px; }
.fb-optional { color:var(--tmo-color-ink-muted); font-size:11px; font-weight:400; margin-left:6px; }
.fb-scale { display:grid; grid-template-columns:repeat(11,minmax(0,1fr)); gap:4px; }
.fb-rating, .fb-chip { position:relative; cursor:pointer; }
.fb-rating input, .fb-chip input { position:absolute; inset:0; width:100%; height:100%; opacity:0; margin:0; cursor:pointer; z-index:1; }
.fb-rating > span { display:grid; place-items:center; min-height:44px; border:1px solid var(--tmo-color-border-strong); border-radius:10px; color:var(--tmo-color-ink); background:var(--tmo-color-surface); font-weight:600; font-variant-numeric:tabular-nums; }
.fb-rating input:checked + span { background:var(--tmo-color-action-fill); color:var(--tmo-color-on-action); border-color:var(--tmo-color-action-fill); box-shadow:0 2px 6px color-mix(in srgb,var(--tmo-color-action-fill) 20%,transparent); }
.fb-rating:hover > span, .fb-chip:hover > span { border-color:var(--tmo-color-accent); }
.fb-scale-help { display:flex; justify-content:space-between; gap:12px; margin-top:8px; font-size:11px; color:var(--tmo-color-ink-muted); }
.fb-hint { margin:-6px 0 12px; color:var(--tmo-color-ink-muted); font-size:12px; }
.fb-issues { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; }
.fb-chip > span { display:flex; align-items:center; gap:8px; padding:10px 12px; min-height:44px; border:1px solid var(--tmo-color-border); border-radius:10px; background:var(--tmo-color-surface-raised); }
.fb-chip-mark { display:grid; place-items:center; width:16px; height:16px; border:1px solid var(--tmo-color-border-strong); border-radius:4px; color:transparent; flex-shrink:0; font-size:11px; }
.fb-chip input:checked + span { border-color:var(--tmo-color-accent); background:var(--tmo-color-info-surface); }
.fb-chip input:checked + span .fb-chip-mark { color:var(--tmo-color-on-action); background:var(--tmo-color-action-fill); border-color:var(--tmo-color-action-fill); }
.tmo-feedback textarea { display:block; width:100%; min-height:92px; max-height:200px; padding:12px; border:1px solid var(--tmo-color-border-strong); border-radius:12px; background:var(--tmo-color-surface); color:var(--tmo-color-ink); resize:vertical; line-height:1.5; }
.tmo-feedback textarea::placeholder { color:var(--tmo-color-ink-muted); }
.fb-comment-meta { display:flex; justify-content:space-between; gap:12px; margin-top:8px; font-size:11px; color:var(--tmo-color-ink-muted); }
.fb-count { flex-shrink:0; font-variant-numeric:tabular-nums; }
.fb-status { margin:16px 0 0; font-size:12px; color:var(--tmo-color-ink-muted); scroll-margin-block:16px; }
.fb-status:empty { display:none; }
.fb-status[data-error] { color:var(--tmo-color-danger-ink); }
.fb-actions { display:flex; justify-content:flex-end; gap:10px; padding:16px 24px; border-top:1px solid var(--tmo-color-border); background:var(--tmo-color-surface); }
.fb-header, .fb-actions { flex-shrink:0; }
.fb-actions button { min-height:44px; padding:10px 18px; border-radius:11px; border:1px solid var(--tmo-color-border-strong); font-weight:600; display:inline-flex; align-items:center; justify-content:center; gap:8px; }
.fb-cancel { background:var(--tmo-color-surface); color:var(--tmo-color-ink-muted); }
.fb-cancel:hover { background:var(--tmo-color-surface-raised); color:var(--tmo-color-ink); }
.fb-actions .fb-submit { background:var(--tmo-color-action-fill); color:var(--tmo-color-on-action); border-color:var(--tmo-color-action-fill); }
.fb-actions .fb-submit:hover { background:color-mix(in srgb,var(--tmo-color-action-fill) 85%,var(--tmo-color-ink)); }
.tmo-feedback button:focus-visible, .tmo-feedback textarea:focus-visible, .fb-rating input:focus-visible + span, .fb-chip input:focus-visible + span { outline:2px solid var(--tmo-color-accent); outline-offset:3px; }
.tmo-feedback button:disabled, .tmo-feedback textarea:disabled, .tmo-feedback input:disabled + span { opacity:.6; cursor:wait; }
.fb-success { text-align:center; padding:20px 0 28px; }
.fb-success-icon { display:inline-grid; place-items:center; width:56px; height:56px; border-radius:50%; color:var(--tmo-color-stem-accent); background:color-mix(in srgb,var(--tmo-color-stem-accent) 10%,var(--tmo-color-surface)); }
.fb-success h2 { font-size:20px; margin:16px 0 6px; }
.fb-success p { margin:0; color:var(--tmo-color-ink-muted); }
.fb-rating > span, .fb-chip > span, .tmo-feedback button { transition:background-color 150ms ease-out,border-color 150ms ease-out; }
@media(max-width:540px) { .fb-scale { grid-template-columns:repeat(6,minmax(0,1fr)); gap:6px; } .fb-header,.fb-body { padding:18px; } .fb-actions { padding:14px 18px; } .fb-comment-meta { flex-wrap:wrap; } }
@media(max-width:340px) { .fb-issues { grid-template-columns:1fr; } }
@media(prefers-reduced-motion:reduce) { .tmo-feedback * { transition:none !important; } }
`;
