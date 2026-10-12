import { afterEach, expect, it, vi } from 'vitest';
import {
  sendExtensionMessage,
  type ExtensionRuntime,
} from './browser-messaging';

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

it.each([
  'Tab not found.',
  'Could not establish connection. Receiving end does not exist.',
])(
  'consumes promise rejections for unavailable extension contexts: %s',
  async (message) => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const runtime: ExtensionRuntime = {
      sendMessage: vi.fn(() => Promise.reject(new Error(message))),
    };
    await expect(
      sendExtensionMessage(runtime, 'synthetic-extension', { type: 'PING' })
    ).resolves.toBeNull();
    expect(log).not.toHaveBeenCalled();
  }
);

it('reports unexpected promise failures without copying their contents', async () => {
  const log = vi.spyOn(console, 'error').mockImplementation(() => {});
  await expect(
    sendExtensionMessage(
      {
        sendMessage: () =>
          Promise.reject(new Error('Synthetic private failure')),
      },
      'synthetic-extension',
      { type: 'OPEN_TOOL', tool: 'clock' }
    )
  ).resolves.toBeNull();
  expect(log.mock.calls).toEqual([
    ['TrackMyOPT extension communication failed'],
  ]);
});

it('supports callback and promise responses without processing them twice', async () => {
  const response = { ok: true, installed: true };
  const runtime: ExtensionRuntime = {
    sendMessage: (_id, _message, callback) => {
      callback(response);
      return Promise.resolve(response);
    },
  };
  await expect(
    sendExtensionMessage(runtime, 'synthetic-extension', { type: 'PING' })
  ).resolves.toEqual(response);
});

it('supports promise-only responses and catches synchronous context failures', async () => {
  await expect(
    sendExtensionMessage(
      { sendMessage: () => Promise.resolve({ ok: true, opened: true }) },
      'synthetic-extension',
      { type: 'OPEN_TOOL' }
    )
  ).resolves.toEqual({ ok: true, opened: true });
  await expect(
    sendExtensionMessage(
      {
        sendMessage: () => {
          throw new Error('Extension context invalidated');
        },
      },
      'synthetic-extension',
      { type: 'PING' }
    )
  ).resolves.toBeNull();
});

it('bounds an unresponsive open-tool request and reports the timeout', async () => {
  vi.useFakeTimers();
  const log = vi.spyOn(console, 'error').mockImplementation(() => {});
  const result = sendExtensionMessage(
    { sendMessage: () => {} },
    'synthetic-extension',
    { type: 'OPEN_TOOL' }
  );
  await vi.advanceTimersByTimeAsync(2000);
  await expect(result).resolves.toBeNull();
  expect(log.mock.calls).toEqual([['TrackMyOPT extension request timed out']]);
});

it('waits for a delayed callback when a wrapper promise resolves void', async () => {
  vi.useFakeTimers();
  const result = sendExtensionMessage(
    {
      sendMessage: (_id, _message, callback) => {
        setTimeout(() => callback({ ok: true, installed: true }), 20);
        return Promise.resolve(undefined);
      },
    },
    'synthetic-extension',
    { type: 'PING' }
  );
  await vi.advanceTimersByTimeAsync(20);
  await expect(result).resolves.toEqual({ ok: true, installed: true });
});
