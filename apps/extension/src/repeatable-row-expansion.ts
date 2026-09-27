import { classifySection, sectionSignal, type AtsPrefillAdapter } from './ats-prefill-adapters';
import { isVisibleForRepeatablePrefill } from './repeatable-record-engine';

type Section = 'experience' | 'education';
const SECTION_SELECTOR = 'fieldset,section,[role="group"],[data-automation-id],[data-testid]';

function uniqueAddButton(root: HTMLElement, section: Section, selector: string): HTMLElement | null {
  const label = section === 'experience'
    ? /^(?:add|\+)\s*(?:(?:work|professional)\s+)?(?:experience|employment|job)(?:\s+(?:entry|record))?$/i
    : /^(?:add|\+)\s*(?:education|school|degree)(?:\s+(?:entry|record))?$/i;
  const found = new Set<HTMLElement>();
  for (const sectionElement of Array.from(root.querySelectorAll<HTMLElement>(SECTION_SELECTOR))) {
    if (classifySection(sectionSignal(sectionElement)) !== section) continue;
    for (const button of Array.from(sectionElement.querySelectorAll<HTMLElement>(selector))) {
      const name = (button.getAttribute('aria-label') || button.textContent || '').replace(/\s+/g, ' ').trim();
      if (!label.test(name) || !isVisibleForRepeatablePrefill(button) ||
          (button instanceof HTMLButtonElement && button.type !== 'button') ||
          button.matches('a[href],input[type="submit"],input[type="image"]') ||
          button.matches(':disabled') || button.getAttribute('aria-disabled') === 'true') continue;
      found.add(button);
    }
  }
  return found.size === 1 ? [...found][0] : null;
}

function recordCount(adapter: AtsPrefillAdapter, root: HTMLElement, section: Section): number {
  return new Set(adapter.classifyRepeatableSections(root)
    .filter(control => control.section === section && control.recordIndex !== undefined &&
      isVisibleForRepeatablePrefill(control.element))
    .map(control => control.recordIndex)).size;
}

/** Explicit Prefill only. At most five new rows, each confirmed by a new
 * classified record before the next Add click. Ambiguous controls stop safely. */
export async function expandRepeatableRows(
  adapter: AtsPrefillAdapter,
  root: HTMLElement,
  section: Section,
  desiredRecords: number,
  current: () => boolean,
): Promise<number> {
  const selector = adapter.capabilities.addRecord?.[section];
  if (!selector || !current() || !root.isConnected) return 0;
  // A user- or parser-populated row may already represent a different record.
  // Do not create additional rows until that mapping has been reviewed.
  if (adapter.classifyRepeatableSections(root).some(control => control.section === section &&
      (control.element.value.trim() !== '' ||
       (control.element instanceof HTMLInputElement && control.element.type === 'checkbox' && control.element.checked)))) return 0;
  let count = recordCount(adapter, root, section);
  if (count < 1 || count >= desiredRecords) return 0;
  let added = 0;
  while (count < desiredRecords && added < 5 && current() && root.isConnected) {
    const button = uniqueAddButton(root, section, selector);
    if (!button || recordCount(adapter, root, section) !== count || !current()) break;
    button.click();
    const view = root.ownerDocument.defaultView;
    if (!view) break;
    let next = count;
    for (let attempt = 0; attempt < 15 && current(); attempt += 1) {
      await new Promise<void>(resolve => view.setTimeout(resolve, 80));
      if (!root.isConnected) break;
      next = recordCount(adapter, root, section);
      if (next > count) break;
    }
    if (!current() || !root.isConnected || next !== count + 1) break;
    count = next;
    added += 1;
  }
  return added;
}
