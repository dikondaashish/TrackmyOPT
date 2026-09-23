import type { PrefillUndoResult } from './prefill-undo';

/** A content script may undo only its own tab, never a caller-supplied tab ID. */
export async function undoPrefillInTab(
  sender: chrome.runtime.MessageSender,
  runId: unknown
) {
  if (
    !sender.tab?.id ||
    sender.frameId !== 0 ||
    typeof runId !== 'string' ||
    !/^[a-zA-Z0-9-]{1,80}$/.test(runId)
  ) {
    return { ok: false };
  }
  try {
    const frames = await chrome.scripting.executeScript({
      target: { tabId: sender.tab.id, allFrames: true },
      world: 'ISOLATED',
      func: async (id: string) => {
        const bridge = (
          window as unknown as {
            __tmoPrefillUndoV1?: {
              cancelAndUndo: (id: string) => Promise<PrefillUndoResult>;
            };
          }
        ).__tmoPrefillUndoV1;
        return bridge
          ? await bridge.cancelAndUndo(id)
          : { restored: 0, skipped: 0, unsupported: 0 };
      },
      args: [runId],
    });
    const result = frames.reduce<PrefillUndoResult>(
      (sum, frame) => {
        const r = frame.result;
        if (!r) {
          sum.skipped++;
          return sum;
        }
        sum.restored += r.restored;
        sum.skipped += r.skipped;
        sum.unsupported += r.unsupported;
        return sum;
      },
      { restored: 0, skipped: 0, unsupported: 0 }
    );
    return { ok: true, result };
  } catch {
    return { ok: false };
  }
}
