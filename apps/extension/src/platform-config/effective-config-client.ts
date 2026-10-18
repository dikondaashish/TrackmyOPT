import {
  normalizeEffectiveConfig,
  type EffectiveExtensionConfig,
} from './remote-config';
import { baselineEffectiveConfig } from './remote-config-baseline';

/** Mirrors EFFECTIVE_CONFIG_KEY in background-remote-config.ts. */
export const EFFECTIVE_CONFIG_STORAGE_KEY = 'tmo_effective_config_v1';

let cached: EffectiveExtensionConfig = baselineEffectiveConfig();
let loaded: Promise<EffectiveExtensionConfig> | null = null;
const listeners = new Set<(config: EffectiveExtensionConfig) => void>();
let watching = false;

function storageArea(): chrome.storage.StorageArea | null {
  try { return typeof chrome !== 'undefined' && chrome.storage?.local ? chrome.storage.local : null; } catch { return null; }
}

/** Synchronous view for hot paths; starts as the bundled baseline. */
export function currentEffectiveConfig(): EffectiveExtensionConfig {
  return cached;
}

/** Read the worker-derived config. Malformed storage falls back to baseline. */
export function loadEffectiveConfig(): Promise<EffectiveExtensionConfig> {
  loaded ??= (async () => {
    const area = storageArea();
    if (!area) return cached;
    try {
      const stored = (await area.get(EFFECTIVE_CONFIG_STORAGE_KEY))[EFFECTIVE_CONFIG_STORAGE_KEY];
      cached = normalizeEffectiveConfig(stored, baselineEffectiveConfig());
    } catch {
      // Storage unavailable: keep the bundled baseline.
    }
    return cached;
  })();
  watch();
  return loaded;
}

/** Live updates so an emergency switch stops in-progress work on open pages. */
export function onEffectiveConfigChange(listener: (config: EffectiveExtensionConfig) => void): () => void {
  listeners.add(listener);
  watch();
  return () => listeners.delete(listener);
}

function watch(): void {
  if (watching) return;
  try {
    if (typeof chrome === 'undefined' || !chrome.storage?.onChanged) return;
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== 'local' || !changes[EFFECTIVE_CONFIG_STORAGE_KEY]) return;
      cached = normalizeEffectiveConfig(changes[EFFECTIVE_CONFIG_STORAGE_KEY].newValue, baselineEffectiveConfig());
      for (const listener of listeners) {
        try { listener(cached); } catch { /* one listener cannot block another */ }
      }
    });
    watching = true;
  } catch {
    // Context invalidated; the page keeps its last known switches.
  }
}

export function setEffectiveConfigForTests(config: EffectiveExtensionConfig | null): void {
  cached = config ?? baselineEffectiveConfig();
  loaded = Promise.resolve(cached);
  for (const listener of listeners) listener(cached);
}
