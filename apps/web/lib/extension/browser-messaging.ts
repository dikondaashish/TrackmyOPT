export interface ExtensionResponse {
  ok: boolean;
  installed?: boolean;
  version?: string;
  opened?: boolean;
  message?: string;
  error?: string;
}

export interface ExtensionRuntime {
  sendMessage: (
    extensionId: string,
    message: { type: string; tool?: string },
    callback: (response: ExtensionResponse | undefined) => void
  ) => void | Promise<ExtensionResponse | undefined>;
  lastError?: { message: string };
}

function expectedExtensionFailure(error: unknown): boolean {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'object' && error !== null && 'message' in error
        ? String(error.message)
        : String(error);
  return /tab not found|no tab (?:with|found)|receiving end does not exist|message port closed|extension context invalidated|could not establish connection/i.test(
    message
  );
}

/** Chrome versions and wrappers can return a promise even with a callback. */
export function sendExtensionMessage(
  runtime: ExtensionRuntime,
  extensionId: string,
  message: { type: string; tool?: string }
): Promise<ExtensionResponse | null> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (response: ExtensionResponse | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(response);
    };
    const fail = (error: unknown) => {
      if (!settled && !expectedExtensionFailure(error)) {
        console.error('TrackMyOPT extension communication failed');
      }
      finish(null);
    };
    const timer = setTimeout(() => {
      if (message.type !== 'PING')
        console.error('TrackMyOPT extension request timed out');
      finish(null);
    }, 2000);
    const onResponse = (response: ExtensionResponse | undefined) => {
      if (runtime.lastError) fail(runtime.lastError);
      else finish(response ?? null);
    };
    try {
      const pending = runtime.sendMessage(extensionId, message, onResponse);
      if (pending)
        void pending.then((response) => {
          // Callback-style wrappers may resolve void before invoking the callback.
          if (response !== undefined) onResponse(response);
        }, fail);
    } catch (error) {
      fail(error);
    }
  });
}
