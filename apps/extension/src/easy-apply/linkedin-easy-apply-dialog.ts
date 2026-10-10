/** LinkedIn's current Easy Apply flow uses a native dialog without a form. */
export function findLinkedInEasyApplyDialog(doc: Document = document): HTMLDialogElement | null {
  const host = doc.location?.hostname ?? '';
  if (host !== 'linkedin.com' && !host.endsWith('.linkedin.com')) return null;

  return Array.from(doc.querySelectorAll<HTMLDialogElement>('dialog[open]')).find((dialog) =>
    /^Apply to\b/i.test(dialog.querySelector('h1, h2')?.textContent?.trim() ?? '') &&
    dialog.querySelector('input, select, textarea') !== null
  ) ?? null;
}

/** LinkedIn puts the required marker on the question above the radio group,
 * rather than on the individual inputs. */
export function isLinkedInRequiredRadioQuestion(control: HTMLElement): boolean {
  const dialog = control.closest('dialog[open]');
  if (!dialog || dialog !== findLinkedInEasyApplyDialog(control.ownerDocument)) return false;
  const group = control.closest('fieldset[role="radiogroup"]');
  const question = group?.parentElement?.querySelector(':scope > p')?.textContent?.trim() ?? '';
  return /\*\s*$/.test(question);
}
