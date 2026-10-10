import { showMessage } from '../job-portal-widget-ui';

export type SavedResumeOption = {
  id: string;
  filename: string;
  updatedAt?: string | null;
};

// Single source shared with the side panel. See agent/panel-templates.ts.

// ── Analyze with AI (in-widget ATS fit) ─────────────────────────────────────

/** Every UI request settles, including an invalidated extension or lost reply. */
export function sendToolMessage<T>(message: object, callback: (value: T | undefined) => void, timeout = 45_000): void {
  let finished = false;
  const complete = (value?: T) => {
    if (finished) return;
    finished = true;
    window.clearTimeout(timer);
    callback(value);
  };
  const timer = window.setTimeout(() => complete(), timeout);
  try {
    chrome.runtime.sendMessage(message, (value: T) => {
      complete(chrome.runtime.lastError ? undefined : value);
    });
  } catch { complete(); }
}

/** Preserve the user gesture, deduplicate clicks, and invalidate slow work. */
export async function prepareJobTool(
  card: HTMLElement,
  button: HTMLButtonElement | null,
  work: (isCurrent: () => boolean) => Promise<void>,
): Promise<void> {
  if (card.dataset.tmoPreparingTool === 'true') return;
  const pageUrl = location.href;
  let finished = false;
  const isCurrent = () => !finished && card.isConnected && location.href === pageUrl;
  const label = button?.querySelector('.tmo-action-label');
  const previousLabel = label?.textContent;
  card.dataset.tmoPreparingTool = 'true';
  if (button) { button.disabled = true; button.setAttribute('aria-busy', 'true'); }
  if (label) label.textContent = 'Opening…';
  let timer: number | undefined;
  try {
    await Promise.race([
      work(isCurrent),
      new Promise<never>((_, reject) => { timer = window.setTimeout(() => reject(new Error('timeout')), 20_000); }),
    ]);
  } catch {
    if (isCurrent()) showMessage('Could not open this tool. Please try again.', true);
  } finally {
    finished = true;
    window.clearTimeout(timer);
    delete card.dataset.tmoPreparingTool;
    if (button) { button.disabled = false; button.setAttribute('aria-busy', 'false'); }
    if (label && previousLabel) label.textContent = previousLabel;
  }
}
