/** Recover only an unambiguous replacement inside the same live form/root.
 * A whole-form replacement is a new operation context and must be reviewed. */
const anchors = new WeakMap<HTMLElement, Element | Document>();

function anchorFor(control: HTMLElement): Element | Document {
  let current: Element | null = control;
  while (current) {
    if (current !== control && current.matches('form,oc-oneclick-form,[data-automation-id="jobApplicationPage"]')) return current;
    current = current.parentElement || ((current.getRootNode() as ShadowRoot).host ?? null);
  }
  return control.ownerDocument;
}

function inside(anchor: Element | Document, candidate: Element): boolean {
  if (anchor.nodeType === 9) return candidate.ownerDocument === anchor;
  let current: Element | null = candidate;
  while (current) {
    if (current === anchor) return true;
    current = current.parentElement || ((current.getRootNode() as ShadowRoot).host ?? null);
  }
  return false;
}

export function recoverPrefillControl<T extends HTMLElement>(original: T): T | null {
  if (original.isConnected) {
    anchors.set(original, anchorFor(original));
    return original;
  }
  const anchor = anchors.get(original);
  if (!anchor || (anchor.nodeType !== 9 && !(anchor as Element).isConnected)) return null;
  const id = original.id;
  const testId = original.getAttribute('data-testid');
  const automationId = original.getAttribute('data-automation-id');
  if (!id && !testId && !automationId) return null;
  const root = original.ownerDocument;
  const candidates: HTMLElement[] = [];
  const visit = (scope: Document | ShadowRoot) => {
    for (const candidate of Array.from(scope.querySelectorAll<HTMLElement>('*'))) {
      if (candidate.shadowRoot) visit(candidate.shadowRoot);
      if (candidate.tagName !== original.tagName || !candidate.isConnected || !inside(anchor, candidate)) continue;
      if (id && candidate.id !== id) continue;
      if (testId && candidate.getAttribute('data-testid') !== testId) continue;
      if (automationId && candidate.getAttribute('data-automation-id') !== automationId) continue;
      if (candidate.getAttribute('name') !== original.getAttribute('name')) continue;
      if (candidate.getAttribute('type') !== original.getAttribute('type')) continue;
      if (candidate.getAttribute('aria-label') !== original.getAttribute('aria-label')) continue;
      candidates.push(candidate);
    }
  };
  visit(root);
  return candidates.length === 1 ? candidates[0] as T : null;
}
