/** LinkedIn's current Easy Apply flow uses a native dialog without a form. */
export function findLinkedInEasyApplyDialog(doc: Document = document): HTMLDialogElement | null {
  const host = doc.location?.hostname ?? '';
  if (host !== 'linkedin.com' && !host.endsWith('.linkedin.com')) return null;

  return Array.from(doc.querySelectorAll<HTMLDialogElement>('dialog[open]')).find((dialog) =>
    /^Apply to\b/i.test(dialog.querySelector('h1, h2')?.textContent?.trim() ?? '') &&
    dialog.querySelector('input, select, textarea') !== null
  ) ?? null;
}
