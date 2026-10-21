import { StaleWhileRevalidate, TtlCache } from './read-cache';

describe('StaleWhileRevalidate', () => {
  it('serves the stale value while one background read refreshes it', async () => {
    let now = 0;
    let version = 0;
    let release: () => void = () => {};
    const load = jest.fn(() =>
      version === 0
        ? Promise.resolve(++version)
        : new Promise<number>((resolve) => {
            release = () => resolve(++version);
          }),
    );
    const cache = new StaleWhileRevalidate(1_000, load, jest.fn(), () => now);

    await expect(cache.get()).resolves.toBe(1);
    await expect(cache.get()).resolves.toBe(1);
    expect(load).toHaveBeenCalledTimes(1);

    now = 2_000;
    await expect(cache.get()).resolves.toBe(1);
    await expect(cache.get()).resolves.toBe(1);
    expect(load).toHaveBeenCalledTimes(2);
    release();
    await new Promise((resolve) => setImmediate(resolve));
    await expect(cache.get()).resolves.toBe(2);
  });

  it('keeps the previous value and reports a failed background refresh', async () => {
    let now = 0;
    const onError = jest.fn();
    const load = jest
      .fn()
      .mockResolvedValueOnce('first')
      .mockRejectedValueOnce(new Error('ORA-12170'));
    const cache = new StaleWhileRevalidate(1_000, load, onError, () => now);
    await cache.get();
    now = 2_000;
    await expect(cache.get()).resolves.toBe('first');
    await new Promise((resolve) => setImmediate(resolve));
    expect(onError).toHaveBeenCalledWith(expect.any(Error));
  });

  it('lets the first read fail to its caller', async () => {
    const cache = new StaleWhileRevalidate(
      1_000,
      () => Promise.reject(new Error('down')),
      jest.fn(),
    );
    await expect(cache.get()).rejects.toThrow('down');
  });
});

describe('TtlCache', () => {
  it('reuses a result until it expires and evicts the oldest key', async () => {
    let now = 0;
    const cache = new TtlCache<string>(1_000, 2, () => now);
    const load = jest.fn((key: string) => Promise.resolve(key));
    await cache.get('a', () => load('a'));
    await cache.get('a', () => load('a'));
    expect(load).toHaveBeenCalledTimes(1);
    await cache.get('b', () => load('b'));
    await cache.get('c', () => load('c'));
    await cache.get('a', () => load('a'));
    expect(load).toHaveBeenCalledTimes(4);
    now = 5_000;
    await cache.get('c', () => load('c'));
    expect(load).toHaveBeenCalledTimes(5);
  });

  it('does not keep failures', async () => {
    const cache = new TtlCache<string>(1_000, 2);
    await expect(
      cache.get('a', () => Promise.reject(new Error('x'))),
    ).rejects.toThrow('x');
    await expect(cache.get('a', () => Promise.resolve('ok'))).resolves.toBe(
      'ok',
    );
  });
});
