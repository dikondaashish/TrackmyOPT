declare global {
  interface Window {
    __trackmyoptDomMutationGuardRegistered?: boolean;
  }
}

/**
 * Keep React rendering when something outside React moved its DOM nodes.
 *
 * Chrome's page translator and some extensions wrap text nodes in their own
 * elements. React later calls removeChild/insertBefore on the original parent,
 * the browser throws NotFoundError and the page crashes
 * (https://github.com/facebook/react/issues/11538). Skip only those
 * impossible operations; every valid call goes to the browser unchanged.
 */
export function registerDomMutationGuard(): void {
  if (typeof window === "undefined" || typeof Node !== "function") return;
  if (window.__trackmyoptDomMutationGuardRegistered) return;

  window.__trackmyoptDomMutationGuardRegistered = true;

  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function removeChild<T extends Node>(this: Node, child: T): T {
    if (child.parentNode !== this) {
      console.warn("Skipped removeChild: the page was changed outside React (translator or extension)");
      return child;
    }
    return originalRemoveChild.call(this, child) as T;
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function insertBefore<T extends Node>(
    this: Node,
    node: T,
    child: Node | null,
  ): T {
    if (child && child.parentNode !== this) {
      console.warn("Skipped insertBefore: the page was changed outside React (translator or extension)");
      return node;
    }
    return originalInsertBefore.call(this, node, child) as T;
  };
}
