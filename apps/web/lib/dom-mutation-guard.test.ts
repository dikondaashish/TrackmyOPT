// @vitest-environment jsdom
import { beforeAll, describe, expect, it, vi } from "vitest";
import { registerDomMutationGuard } from "./dom-mutation-guard";

beforeAll(() => {
  registerDomMutationGuard();
  registerDomMutationGuard();
});

describe("registerDomMutationGuard", () => {
  it("skips removing a node a translator moved elsewhere", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const parent = document.createElement("div");
    const text = document.createTextNode("Hello");
    parent.appendChild(text);
    // What Chrome's translator does: wrap the text node in its own element.
    const font = document.createElement("font");
    parent.replaceChild(font, text);
    font.appendChild(text);

    expect(parent.removeChild(text)).toBe(text);
    expect(font.contains(text)).toBe(true);
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });

  it("skips inserting before a node that is no longer a child", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const parent = document.createElement("div");
    const stranger = document.createElement("span");
    const node = document.createElement("p");

    expect(parent.insertBefore(node, stranger)).toBe(node);
    expect(node.parentNode).toBeNull();
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });

  it("leaves valid operations unchanged", () => {
    const parent = document.createElement("div");
    const first = document.createElement("span");
    const second = document.createElement("span");
    parent.appendChild(second);

    expect(parent.insertBefore(first, second)).toBe(first);
    expect(parent.insertBefore(document.createElement("i"), null).parentNode).toBe(parent);
    expect(Array.from(parent.children).map((el) => el.tagName)).toEqual(["SPAN", "SPAN", "I"]);
    expect(parent.removeChild(first)).toBe(first);
    expect(first.parentNode).toBeNull();
  });
});
