/**
 * Vertical-only drag for the job-portal widget. The widget stays PINNED to the
 * right edge (right:0) and only moves up/down — it never moves horizontally.
 */

import { saveWidgetPosition } from './widget-preferences';

export function attachDragBehavior(
  root: HTMLElement,
  dragHandle: HTMLElement,
  options: { allowButtonTarget?: boolean; onTap?: () => void } = {},
): void {
  let activePointerId: number | null = null;
  let startClientY = 0;
  let startTop = 0;
  let movedBeyondTapThreshold = false;
  const idleCursor = options.onTap ? 'pointer' : 'grab';

  dragHandle.style.touchAction = 'none';

  const onMove = (ev: PointerEvent) => {
    if (ev.pointerId !== activePointerId) return;
    const deltaY = ev.clientY - startClientY;
    if (!movedBeyondTapThreshold && Math.abs(deltaY) < 4) return;
    movedBeyondTapThreshold = true;
    const pad = 8;
    const rect = root.getBoundingClientRect();
    const maxTop = Math.max(pad, window.innerHeight - rect.height - pad);
    const nextTop = Math.min(Math.max(pad, startTop + deltaY), maxTop);
    root.style.top = `${nextTop}px`; // only vertical; horizontal stays pinned right
  };

  const stopDragging = (ev: PointerEvent) => {
    if (ev.pointerId !== activePointerId) return;
    activePointerId = null;
    dragHandle.style.cursor = idleCursor;
    const rect = root.getBoundingClientRect();
    saveWidgetPosition(rect.top);
    document.removeEventListener('pointermove', onMove, true);
    document.removeEventListener('pointerup', stopDragging, true);
    document.removeEventListener('pointercancel', stopDragging, true);
    if (!movedBeyondTapThreshold && ev.type === 'pointerup') options.onTap?.();
  };

  dragHandle.addEventListener('pointerdown', (ev) => {
    // Don't start a drag when the user clicks a button inside the drag zone.
    if (!options.allowButtonTarget && (ev.target as HTMLElement | null)?.closest('button')) return;
    ev.preventDefault();
    ev.stopPropagation();
    activePointerId = ev.pointerId;
    movedBeyondTapThreshold = false;
    dragHandle.style.cursor = 'grabbing';
    const r = root.getBoundingClientRect();
    startClientY = ev.clientY;
    startTop = r.top;
    // Keep it docked to the right; switch centering transform to an absolute top.
    root.style.top = `${startTop}px`;
    root.style.right = '0';
    root.style.left = 'auto';
    root.style.bottom = 'auto';
    root.style.transform = 'none';
    document.addEventListener('pointermove', onMove, true);
    document.addEventListener('pointerup', stopDragging, true);
    document.addEventListener('pointercancel', stopDragging, true);
  });

  // Pointer activation is handled on pointerup so a completed drag never also
  // opens the panel. Preserve native keyboard/programmatic button activation.
  if (options.onTap) {
    dragHandle.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      if (ev.detail === 0) options.onTap?.();
    });
  }
}
