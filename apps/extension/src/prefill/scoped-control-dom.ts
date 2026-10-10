/** Follow only a control's enclosing roots; never search sibling components. */
export function enclosingControlRoots(
  control: Element
): Array<Document | ShadowRoot> {
  const roots: Array<Document | ShadowRoot> = [];
  let node: Node = control;
  while (node) {
    const root = node.getRootNode() as Document | ShadowRoot;
    if (roots.includes(root)) break;
    roots.push(root);
    if (!('host' in root)) break;
    node = root.host;
  }
  return roots;
}

export function linkedControlElement(
  control: Element,
  id: string
): HTMLElement | null {
  for (const root of enclosingControlRoots(control)) {
    const target = root.getElementById?.(id);
    if (target) return target;
  }
  return null;
}

/** Semantic visibility across shadow boundaries; geometry is checked by callers. */
export function isInActiveControlTree(element: Element): boolean {
  let node: Element | null = element;
  while (node) {
    if (
      node.hasAttribute('hidden') ||
      node.hasAttribute('inert') ||
      node.getAttribute('aria-hidden') === 'true' ||
      node.getAttribute('aria-disabled') === 'true'
    )
      return false;
    const style = node.ownerDocument.defaultView?.getComputedStyle(node);
    if (
      style?.display === 'none' ||
      style?.visibility === 'hidden' ||
      style?.visibility === 'collapse' ||
      style?.contentVisibility === 'hidden'
    )
      return false;
    node =
      node.parentElement || (node.getRootNode() as ShadowRoot).host || null;
  }
  return true;
}
