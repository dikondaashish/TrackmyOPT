// In-process caches for job-board reads that every visitor shares. Job data
// changes only when ingestion runs (hours apart), so a short-lived copy keeps
// slow Oracle scans off the page load without hiding new jobs for long.

/**
 * Keeps one value fresh for `ttlMs`. After that the stale value is still
 * served while a single background read refreshes it, so only the very first
 * read (or one after a failure) waits for the database.
 */
export class StaleWhileRevalidate<T> {
  private current: { expiresAt: number; value: T } | null = null;
  private refreshing: Promise<T> | null = null;

  constructor(
    private readonly ttlMs: number,
    private readonly load: () => Promise<T>,
    private readonly onBackgroundError: (error: unknown) => void,
    private readonly now: () => number = Date.now,
  ) {}

  get(): Promise<T> {
    const current = this.current;
    if (current && current.expiresAt > this.now()) {
      return Promise.resolve(current.value);
    }
    const refresh = this.refresh();
    if (!current) return refresh;
    refresh.catch(this.onBackgroundError);
    return Promise.resolve(current.value);
  }

  private refresh() {
    this.refreshing ??= this.load()
      .then((value) => {
        this.current = { expiresAt: this.now() + this.ttlMs, value };
        return value;
      })
      .finally(() => {
        this.refreshing = null;
      });
    return this.refreshing;
  }
}

/**
 * Remembers recent results by key for `ttlMs`, oldest evicted first, sharing
 * one in-flight read between identical concurrent requests. Failed reads are
 * not kept.
 */
export class TtlCache<T> {
  private readonly entries = new Map<
    string,
    { expiresAt: number; value: Promise<T> }
  >();

  constructor(
    private readonly ttlMs: number,
    private readonly maxEntries: number,
    private readonly now: () => number = Date.now,
  ) {}

  get(key: string, load: () => Promise<T>): Promise<T> {
    const hit = this.entries.get(key);
    if (hit && hit.expiresAt > this.now()) return hit.value;
    const entry = { expiresAt: this.now() + this.ttlMs, value: load() };
    this.entries.delete(key);
    this.entries.set(key, entry);
    // Map keys iterate oldest first; deleting while iterating is safe.
    for (const oldest of this.entries.keys()) {
      if (this.entries.size <= this.maxEntries) break;
      this.entries.delete(oldest);
    }
    entry.value.catch(() => {
      if (this.entries.get(key) === entry) this.entries.delete(key);
    });
    return entry.value;
  }
}
