export const EXTENSION_RELEASE_KEY = 'extensionReleaseV1';
export const STORAGE_SCHEMA_VERSION = 1;
export interface ExtensionReleaseState {
  schemaVersion: number;
  version: string;
  previousVersion?: string;
  updatedAt: string;
  noticeDismissed: boolean;
}

/** Ordered, restart-safe migrations. Only our own metadata is rewritten. */
export function createExtensionLifecycle(io: {
  read(): Promise<unknown>;
  write(value: ExtensionReleaseState): Promise<void>;
  purgeLegacyToken(): Promise<void>;
  now(): string;
}) {
  let queue: Promise<unknown> = Promise.resolve();
  return (version: string, previousVersion?: string) => {
    const next = queue.then(async () => {
      const raw = await io.read();
      const state = normalizeReleaseState(raw);
      const hasPreviousVersion = validVersion(previousVersion) && previousVersion !== version;
      // A downgrade must not overwrite a schema it cannot interpret.
      if (raw && typeof raw === 'object' && 'schemaVersion' in raw && typeof raw.schemaVersion === 'number' && raw.schemaVersion > STORAGE_SCHEMA_VERSION) return;
      if (!state || state.schemaVersion < 1) await io.purgeLegacyToken();
      if (state?.version === version && state.schemaVersion === STORAGE_SCHEMA_VERSION &&
          (!hasPreviousVersion || state.previousVersion === previousVersion)) return;
      const previous = hasPreviousVersion ? previousVersion : state?.version;
      if (!validVersion(version)) throw new Error('Invalid extension version');
      await io.write({ schemaVersion: STORAGE_SCHEMA_VERSION, version,
        ...(previous ? { previousVersion: previous } : {}), updatedAt: io.now(),
        noticeDismissed: !previous,
      });
    });
    queue = next.catch(() => {});
    return next;
  };
}

export const RELEASE_NOTES = [
  'Clearer document upload status and safer retry handling.',
  'Application tools protected from website styles.',
  'Lighter loading on supported pages and safer extension updates.',
] as const;

function validVersion(value: unknown): value is string {
  return typeof value === 'string' && /^\d+(?:\.\d+){0,3}$/.test(value) && value.split('.').every(n => Number(n) <= 65535);
}
export function normalizeReleaseState(value: unknown): ExtensionReleaseState | undefined {
  if (!value || typeof value !== 'object') return;
  const state = value as ExtensionReleaseState;
  if (!Number.isInteger(state.schemaVersion) || state.schemaVersion < 0 || !validVersion(state.version) ||
      typeof state.updatedAt !== 'string' || typeof state.noticeDismissed !== 'boolean') return;
  return { schemaVersion: state.schemaVersion, version: state.version,
    ...(validVersion(state.previousVersion) ? {previousVersion: state.previousVersion} : {}),
    updatedAt: state.updatedAt, noticeDismissed: state.noticeDismissed };
}
