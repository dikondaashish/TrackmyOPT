import {
  getPrefillUndoState,
  subscribePrefillUndo,
  type PrefillUndoResult,
} from './prefill-undo';
import { COLORS } from './design/tokens';

/** One current sidebar control; remounts release the previous subscription. */
export function createPrefillUndoControl(
  undo: () => Promise<PrefillUndoResult>
): HTMLElement {
  const shared = window as unknown as { __tmoUndoControlCleanup?: () => void };
  shared.__tmoUndoControlCleanup?.();
  document.getElementById('tmo-prefill-undo-fallback')?.remove();
  const host = document.createElement('div');
  host.className = 'tmo-prefill-undo';
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = 'Undo last Prefill';
  button.title =
    'Revert the latest prefill on this page. Your later edits are kept. Uploads and custom dropdowns may need manual review.';
  const status = document.createElement('div');
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  let pending = false;
  let previousRun: string | null = null;
  const paint = () => {
    const state = getPrefillUndoState();
    button.disabled = pending || state.busy || !state.available;
    if (state.runId && state.runId !== previousRun) status.textContent = '';
    previousRun = state.runId;
  };
  shared.__tmoUndoControlCleanup = subscribePrefillUndo(paint);
  paint();
  button.addEventListener('click', async () => {
    if (button.disabled) return;
    pending = true;
    paint();
    button.textContent = 'Undoing…';
    try {
      const r = await undo();
      status.textContent =
        `${r.restored} ${r.restored === 1 ? 'field' : 'fields'} undone.` +
        (r.skipped
          ? ` ${r.skipped} kept to protect edits or changed fields.`
          : '') +
        (r.unsupported
          ? ` ${r.unsupported} uploads or custom controls need manual review.`
          : '') +
        ' Automatic prefill paused.';
    } catch {
      status.textContent = 'Could not undo. Please try again.';
    } finally {
      pending = false;
      button.textContent = 'Undo last Prefill';
      paint();
    }
  });
  host.append(button, status);
  return host;
}

/** Popup prefill also works on forms where the career sidebar was not detected. */
export function mountPrefillUndoFallback(
  request: (id: string) => Promise<PrefillUndoResult>
): void {
  if (
    document.querySelector('.tmo-prefill-undo') ||
    !getPrefillUndoState().available
  )
    return;
  const host = createPrefillUndoControl(async () => {
    const id = getPrefillUndoState().runId;
    if (!id) throw new Error('Nothing to undo');
    return request(id);
  });
  host.id = 'tmo-prefill-undo-fallback';
  const style = document.createElement('style');
  style.textContent = `#tmo-prefill-undo-fallback{position:fixed;right:16px;bottom:16px;z-index:2147483647;box-sizing:border-box;width:min(320px,calc(100vw - 32px));padding:12px;border:1px solid ${COLORS.light.border};border-radius:12px;background:${COLORS.light.surface};color:${COLORS.light.ink};font:13px/1.5 system-ui;box-shadow:0 4px 18px rgba(0,0,0,.12)}
    #tmo-prefill-undo-fallback button{min-height:36px;border:1px solid ${COLORS.light.border};border-radius:8px;padding:6px 10px;background:${COLORS.light.surface};color:${COLORS.light.ink};font:inherit;cursor:pointer}
    #tmo-prefill-undo-fallback button:disabled{opacity:.55;cursor:default}
    #tmo-prefill-undo-fallback button:focus-visible{outline:2px solid ${COLORS.light.accentStrong};outline-offset:2px}
    #tmo-prefill-undo-fallback [role=status]:not(:empty){margin-top:8px}`;
  host.append(style);
  document.body.append(host);
}
