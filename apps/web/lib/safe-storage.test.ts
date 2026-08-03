import { afterEach, describe, expect, it } from "vitest";
import {
  safeStorageGet,
  safeStorageRemove,
  safeStorageSet,
} from "@/lib/safe-storage";

const realStorage = window.localStorage;

function stubLocalStorage(value: Storage | null) {
  Object.defineProperty(window, "localStorage", { configurable: true, value });
}

const throwingStorage = {
  getItem() {
    throw new DOMException("The operation is insecure.", "SecurityError");
  },
  setItem() {
    throw new DOMException("The operation is insecure.", "SecurityError");
  },
  removeItem() {
    throw new DOMException("The operation is insecure.", "SecurityError");
  },
} as unknown as Storage;

afterEach(() => {
  stubLocalStorage(realStorage);
  window.localStorage.clear();
});

describe("safe storage", () => {
  it("reads and writes through to real storage", () => {
    expect(safeStorageSet("k", "v")).toBe(true);
    expect(safeStorageGet("k")).toBe("v");

    safeStorageRemove("k");
    expect(safeStorageGet("k")).toBeNull();
  });

  it("returns null for a missing key", () => {
    expect(safeStorageGet("never-written")).toBeNull();
  });

  // Privacy modes and embedded webviews expose localStorage as null. Reading it
  // directly threw "Cannot read properties of null (reading 'getItem')".
  it("degrades to no-ops when localStorage is null", () => {
    stubLocalStorage(null);

    expect(safeStorageGet("k")).toBeNull();
    expect(safeStorageSet("k", "v")).toBe(false);
    expect(() => safeStorageRemove("k")).not.toThrow();
  });

  it("degrades to no-ops when every storage access throws", () => {
    stubLocalStorage(throwingStorage);

    expect(safeStorageGet("k")).toBeNull();
    expect(safeStorageSet("k", "v")).toBe(false);
    expect(() => safeStorageRemove("k")).not.toThrow();
  });
});
