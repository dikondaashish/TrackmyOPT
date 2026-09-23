/** One ephemeral journal per isolated-world document. Never stored or messaged. */
type Control = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
type Value = string | boolean | number[];
type Snapshot = {
  element: Control;
  value: Value;
  identity: string;
  form: HTMLFormElement | null;
};
type Entry = {
  before: Snapshot[];
  after: Snapshot[];
  edited: boolean;
  cleanup: () => void;
};
type Journal = {
  id: string;
  url: string;
  entries: Entry[];
  unsupported: Set<Element>;
  delegated: boolean;
  abandoned?: boolean;
};
export type PrefillUndoResult = {
  restored: number;
  skipped: number;
  unsupported: number;
};
type Store = {
  active: Journal | null;
  last: Journal | null;
  writing: boolean;
  cancelled: Set<string>;
  listeners: Set<() => void>;
  undo: typeof undoLastPrefill;
  cancelAndUndo: typeof cancelAndUndoPrefill;
};
const KEY = '__tmoPrefillUndoV1';
function store(): Store {
  const host = window as unknown as Record<string, Store>;
  if (!host[KEY]) {
    host[KEY] = {
      active: null,
      last: null,
      writing: false,
      cancelled: new Set(),
      listeners: new Set(),
      undo: undoLastPrefill,
      cancelAndUndo: cancelAndUndoPrefill,
    };
    const discard = () => {
      const s = host[KEY];
      release(s.last);
      release(s.active);
      if (s.active) {
        s.active.abandoned = true;
        s.active.entries = [];
        s.active.unsupported.clear();
      }
      s.last = null;
      notify(s);
    };
    window.addEventListener('pagehide', discard);
    window.addEventListener('popstate', discard);
    document.addEventListener('tmo-page-context-changed', discard);
  }
  return host[KEY];
}
function notify(s: Store) {
  for (const fn of s.listeners) {
    try {
      fn();
    } catch {
      /* UI cannot break a fill. */
    }
  }
}
function release(j: Journal | null) {
  j?.entries.forEach((e) => e.cleanup());
}
function identity(el: Control) {
  return [
    el.tagName,
    el.getAttribute('type'),
    el.id,
    el.getAttribute('name'),
    el.getAttribute('aria-label'),
    el.getAttribute('aria-labelledby'),
    Array.from(el.labels ?? [])
      .map((label) => label.textContent)
      .join(';'),
    el.closest('fieldset')?.querySelector('legend')?.textContent,
    el.tagName === 'INPUT' &&
    ['radio', 'checkbox'].includes((el as HTMLInputElement).type)
      ? el.value
      : '',
    el.tagName === 'SELECT'
      ? Array.from((el as HTMLSelectElement).options)
          .map((o) => `${o.value}:${o.text}`)
          .join(';')
      : '',
  ].join('|');
}
function snapshot(element: Control): Snapshot {
  const value: Value =
    element.tagName === 'SELECT'
      ? Array.from((element as HTMLSelectElement).options).flatMap((o, i) =>
          o.selected ? [i] : []
        )
      : element.tagName === 'INPUT' &&
          ['radio', 'checkbox'].includes((element as HTMLInputElement).type)
        ? (element as HTMLInputElement).checked
        : element.value;
  return { element, value, identity: identity(element), form: element.form };
}
function matches(s: Snapshot) {
  return (
    s.element.isConnected &&
    !s.element.disabled &&
    !('readOnly' in s.element && s.element.readOnly) &&
    identity(s.element) === s.identity &&
    s.element.form === s.form &&
    JSON.stringify(snapshot(s.element).value) === JSON.stringify(s.value)
  );
}
function controls(el: Control): Control[] {
  if (
    el.tagName !== 'INPUT' ||
    (el as HTMLInputElement).type !== 'radio' ||
    !el.name
  )
    return [el];
  return Array.from(
    (
      el.getRootNode() as Document | ShadowRoot
    ).querySelectorAll<HTMLInputElement>('input[type="radio"]')
  ).filter((r) => r.name === el.name && r.form === el.form);
}
function native(el: Element): el is Control {
  return (
    /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) &&
    !el.matches(
      '[role="combobox"],[aria-autocomplete],input[type="file"],input[type="hidden"]'
    ) &&
    !el.closest('.select__control,[role="combobox"]')
  );
}
export function getPrefillUndoState() {
  const s = store();
  return {
    available: Boolean(s.last && s.last.url === window.location.href),
    busy: Boolean(s.active),
    runId: s.last?.id ?? null,
  };
}
export function subscribePrefillUndo(listener: () => void): () => void {
  const s = store();
  s.listeners.add(listener);
  return () => s.listeners.delete(listener);
}
export function currentPrefillUndoRunId(): string | undefined {
  return store().active?.id;
}
export function isPrefillUndoAllowed(): boolean {
  const s = (window as unknown as Record<string, Store>)[KEY];
  if (!s) return true;
  return !s.active || (!s.active.abandoned && !s.cancelled.has(s.active.id));
}
export function markPrefillUndoDelegated(): void {
  const s = store();
  if (s.active && document.querySelector('iframe')) s.active.delegated = true;
}
export function markPrefillUndoUnsupported(element: Element): void {
  if (typeof window !== 'undefined')
    (window as unknown as Record<string, Store>)[KEY]?.active?.unsupported.add(
      element
    );
}

/** Call only at extension-owned write boundaries, never from generic DOM observers. */
export function trackPrefillChange<T>(element: Element, write: () => T): T {
  // This module is also bundled by background imports; only DOM writers call it.
  const s =
    typeof window === 'undefined'
      ? undefined
      : (window as unknown as Record<string, Store>)[KEY];
  const j = s?.active;
  if (!j) return write();
  if (j.abandoned || j.url !== window.location.href || s.cancelled.has(j.id))
    return undefined as T;
  if (j.entries.length >= 500) {
    const result = write();
    j.unsupported.add(element);
    return result;
  }
  if (!native(element)) {
    const result = write();
    j.unsupported.add(element);
    return result;
  }
  const group = controls(element);
  let entry = j.entries.find((e) =>
    e.before.some((b) => b.element === element)
  );
  if (!entry) {
    entry = {
      before: group.map(snapshot),
      after: [],
      edited: false,
      cleanup: () => {},
    };
    const edit = () => {
      if (!s.writing) entry!.edited = true;
    };
    for (const control of group)
      for (const event of ['input', 'change'])
        control.addEventListener(event, edit, true);
    entry.cleanup = () => {
      for (const control of group)
        for (const event of ['input', 'change'])
          control.removeEventListener(event, edit, true);
    };
    j.entries.push(entry);
  }
  const previous = s.writing;
  s.writing = true;
  try {
    return write();
  } finally {
    entry.after = group.map(snapshot);
    s.writing = previous;
  }
}

export async function withPrefillUndo<T>(
  run: () => Promise<T>,
  runId?: string
): Promise<T> {
  const s = store();
  const id = runId || window.crypto.randomUUID();
  if (s.active || s.cancelled.has(id))
    throw new Error('Prefill already running or cancelled');
  const j: Journal = {
    id,
    url: window.location.href,
    entries: [],
    unsupported: new Set(),
    delegated: false,
  };
  s.active = j;
  notify(s);
  try {
    return await run();
  } finally {
    s.active = null;
    j.entries = j.entries.filter((e) => {
      const changed = e.before.some(
        (b, i) => JSON.stringify(b.value) !== JSON.stringify(e.after[i]?.value)
      );
      if (!changed) e.cleanup();
      return changed;
    });
    if (
      !j.abandoned &&
      (j.entries.length || j.unsupported.size || j.delegated)
    ) {
      release(s.last);
      s.last = j;
    }
    notify(s);
  }
}

function restore(s: Snapshot) {
  const el = s.element;
  const view = el.ownerDocument.defaultView!;
  if (el.tagName === 'SELECT') {
    const select = el as HTMLSelectElement;
    if (!select.multiple) {
      Object.getOwnPropertyDescriptor(
        view.HTMLSelectElement.prototype,
        'selectedIndex'
      )?.set?.call(select, (s.value as number[])[0] ?? -1);
    } else {
      Array.from(select.options).forEach(
        (o, i) => (o.selected = (s.value as number[]).includes(i))
      );
    }
  } else {
    const prop = typeof s.value === 'boolean' ? 'checked' : 'value';
    const proto =
      el.tagName === 'TEXTAREA'
        ? view.HTMLTextAreaElement.prototype
        : view.HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, prop)?.set?.call(el, s.value);
  }
}
function choiceMayClearUserWork(entry: Entry, j: Journal): boolean {
  const first = entry.before[0].element;
  if (
    first.tagName !== 'SELECT' &&
    !(
      first.tagName === 'INPUT' &&
      ['radio', 'checkbox'].includes((first as HTMLInputElement).type)
    )
  )
    return false;
  const scope = first.form ?? (first.getRootNode() as Document | ShadowRoot);
  // Choice changes often reset dependent fields (country → city, employed →
  // employment details). Without a portal-specific dependency adapter, preserve
  // the choice if that form contains user work outside this undo transaction.
  return Array.from(
    scope.querySelectorAll<Control>('input,textarea,select,[role="combobox"]')
  ).some((control) => {
    if (control === first || control.matches('input[type="hidden"]'))
      return false;
    // Opaque custom controls may hold selected text outside their input. Their
    // dependencies cannot be established safely, even when they appear blank.
    if (!native(control)) return true;
    const own = j.entries.find((e) =>
      e.after.some((a) => a.element === control)
    );
    if (own) return own.edited || !own.after.every(matches);
    if (
      control.tagName === 'INPUT' &&
      ['radio', 'checkbox'].includes((control as HTMLInputElement).type)
    )
      return (control as HTMLInputElement).checked;
    return Boolean(control.value.trim());
  });
}
export function undoLastPrefill(runId?: string): PrefillUndoResult {
  const result = { restored: 0, skipped: 0, unsupported: 0 };
  const s = store();
  if (s.active) return result;
  // A delayed child-frame relay must not refill after its run was undone.
  if (runId) {
    s.cancelled.add(runId);
    if (s.cancelled.size > 50)
      s.cancelled.delete(s.cancelled.values().next().value!);
  }
  const j = s.last;
  if (!j || (runId && runId !== j.id)) return result;
  s.last = null;
  release(j);
  result.unsupported = j.unsupported.size;
  // The old completion banner/coverage must not describe values just undone.
  const documents = new Set([
    document,
    ...j.entries.flatMap((e) => e.before.map((b) => b.element.ownerDocument)),
  ]);
  for (const doc of documents) {
    doc.getElementById('tmo-autofill-progress')?.remove();
    doc.getElementById('tmo-easy-apply-toast')?.remove();
    const line = doc.querySelector<HTMLElement>('.tmo-prefill-result-line');
    if (line) {
      line.replaceChildren();
      line.style.display = 'none';
    }
  }
  for (const e of j.entries)
    for (const b of e.before)
      b.element.removeAttribute('data-tmo-autofill-visual');
  for (const el of j.unsupported)
    el.removeAttribute('data-tmo-autofill-visual');
  const unsafeChoices = new Set(
    j.entries.filter((e) => choiceMayClearUserWork(e, j))
  );
  for (const entry of [...j.entries].reverse()) {
    if (
      j.url !== window.location.href ||
      entry.edited ||
      unsafeChoices.has(entry) ||
      !entry.after.every(matches)
    ) {
      result.skipped++;
      continue;
    }
    try {
      entry.before.forEach(restore);
      for (const b of entry.before) {
        const EventCtor = b.element.ownerDocument.defaultView!.Event;
        b.element.dispatchEvent(
          new EventCtor('input', { bubbles: true, composed: true })
        );
        b.element.dispatchEvent(
          new EventCtor('change', { bubbles: true, composed: true })
        );
      }
      if (entry.before.every(matches)) result.restored++;
      else result.skipped++;
    } catch {
      result.skipped++;
    }
  }
  s.cancelled.add(j.id);
  notify(s);
  return result;
}

/** Called only in the extension's isolated world, scoped to an opaque run ID. */
async function cancelAndUndoPrefill(runId: string): Promise<PrefillUndoResult> {
  const s = store();
  s.cancelled.add(runId);
  if (s.cancelled.size > 50)
    s.cancelled.delete(s.cancelled.values().next().value!);
  if (s.active?.id === runId) {
    // Cancellation guards stop pending asynchronous writers before rollback.
    await new Promise<void>((resolve) => {
      const finish = () => {
        s.listeners.delete(done);
        window.clearTimeout(timer);
        resolve();
      };
      const done = () => {
        if (s.active?.id !== runId) finish();
      };
      const timer = window.setTimeout(finish, 10_000);
      s.listeners.add(done);
    });
  }
  if (s.active?.id === runId)
    return {
      restored: 0,
      skipped: s.active.entries.length || 1,
      unsupported: s.active.unsupported.size,
    };
  return undoLastPrefill(runId);
}
