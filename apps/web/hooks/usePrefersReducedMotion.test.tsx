import { act } from "react";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

describe("usePrefersReducedMotion", () => {
  let root: Root | null;
  let container: HTMLDivElement;

  beforeEach(() => {
    root = null;
    container = document.createElement("div");
    document.body.appendChild(container);

    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: true,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(async () => {
    if (root) {
      await act(async () => root?.unmount());
    }
    container.remove();
    vi.restoreAllMocks();
  });

  it("keeps the server and hydration renders identical when reduced motion is enabled", async () => {
    const recoverableErrors: unknown[] = [];

    function TestComponent() {
      const prefersReducedMotion = usePrefersReducedMotion();

      return (
        <div>
          {!prefersReducedMotion && <span>Animated content</span>}
          <span>Always visible</span>
        </div>
      );
    }

    const serverHtml = renderToString(<TestComponent />);
    expect(serverHtml).toContain("Animated content");
    container.innerHTML = serverHtml;

    await act(async () => {
      root = hydrateRoot(container, <TestComponent />, {
        onRecoverableError: (error) => recoverableErrors.push(error),
      });
    });

    expect(recoverableErrors).toEqual([]);
    expect(container).not.toHaveTextContent("Animated content");
    expect(container).toHaveTextContent("Always visible");
  });
});
