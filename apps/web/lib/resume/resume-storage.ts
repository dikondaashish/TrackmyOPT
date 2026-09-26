import type { PersistStorage, StorageValue } from 'zustand/middleware';

/** Keep the editor usable when browser storage is denied, full, or corrupted. */
export function createResumeStorage<T>(): PersistStorage<T> {
    const memory = new Map<string, StorageValue<T>>();
    return {
        getItem(name) {
            if (memory.has(name)) return memory.get(name)!;
            try {
                const raw = window.localStorage.getItem(name);
                if (raw) {
                    const value = JSON.parse(raw) as StorageValue<T>;
                    if (value && typeof value.state === 'object' && value.state !== null) {
                        memory.set(name, value);
                        return value;
                    }
                }
            } catch {
                // Storage access and parsing can fail in restricted browser contexts.
            }
            return memory.get(name) ?? null;
        },
        setItem(name, value) {
            memory.set(name, value);
            try {
                window.localStorage.setItem(name, JSON.stringify(value));
            } catch {
                // The current tab retains the draft even if persistence is unavailable.
            }
        },
        removeItem(name) {
            memory.delete(name);
            try {
                window.localStorage.removeItem(name);
            } catch {
                // Reset still succeeds for this tab.
            }
        },
    };
}
