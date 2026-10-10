/** A native control must retain its committed value through asynchronous updates.
 * Never retry a write here: rejection, replacement and user edits belong to review.
 */
export async function verifyNativeCommit(
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  expected: string,
  current: () => boolean,
): Promise<boolean> {
  const view = element.ownerDocument.defaultView;
  if (!view) return false;
  for (let check = 0; check < 2; check++) {
    await new Promise<void>(resolve => view.setTimeout(resolve, 80));
    if (!current() || !element.isConnected || element.value !== expected) return false;
  }
  return true;
}
