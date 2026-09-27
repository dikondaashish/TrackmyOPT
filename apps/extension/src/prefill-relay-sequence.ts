/** Background-owned order and top-document check for frame relays. */
export class PrefillRelaySequencer {
  private readonly sequences = new Map<number, number>();

  next(tabId: number, now = Date.now()): number {
    const next = Math.max((this.sequences.get(tabId) ?? 0) + 1, now * 1000);
    this.sequences.set(tabId, next);
    return next;
  }
}

export function currentPrefillRelayContext(input: {
  frameId: number | undefined;
  runId: unknown;
  requestedUrl: unknown;
  currentTabUrl: string | undefined;
}): boolean {
  if (input.frameId !== undefined && input.frameId !== 0) return false;
  if (typeof input.runId !== 'string' || !/^[a-zA-Z0-9-]{1,80}$/.test(input.runId)) return false;
  if (typeof input.requestedUrl !== 'string' || !input.currentTabUrl) return false;
  try {
    const requested = new URL(input.requestedUrl);
    const current = new URL(input.currentTabUrl);
    return ['http:', 'https:'].includes(requested.protocol) && requested.href === current.href;
  } catch { return false; }
}
