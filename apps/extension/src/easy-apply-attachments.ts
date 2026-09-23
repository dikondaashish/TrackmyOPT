/**
 * Resume / cover-letter PDF attach helpers for the fill-only prefill engine.
 */

import type { GeneratedCoverLetterAttachment } from './resume-autofill-contract';
import { markPrefillUndoUnsupported } from './prefill-undo';
import { queryAllDeep } from './easy-apply-dom';
import { ashbyExistingUpload } from './ashby-control-context';

export interface GeneratedResumeAttachment {
  pdfBase64: string;
  filename: string;
}

export type ResumeAttachmentResult =
  | 'not_requested'
  | 'attached'
  | 'already_present'
  | 'not_found'
  | 'unsupported'
  | 'source_mismatch';

export const RESUME_FILE_FIELD_RE =
  /(?:\b(resume|curriculum\s+vitae|cv)\b|résumé(?=$|[\s/]))/i;
export const NON_RESUME_FILE_FIELD_RE =
  /\b(cover\s*letter|letter\s*of\s*interest|portfolio|photo|headshot|transcript|certificate)\b/i;

export function getFileInputLabel(input: HTMLInputElement): string {
  const parts = [
    input.getAttribute('aria-label') || '',
    input.getAttribute('name') || '',
    input.id || '',
    input.getAttribute('data-automation-id') || '',
    input.getAttribute('data-testid') || '',
  ];
  const root = input.getRootNode() as Document | ShadowRoot;
  for (const relation of ['aria-labelledby', 'aria-describedby']) {
    for (const id of (input.getAttribute(relation) || '')
      .split(/\s+/)
      .filter(Boolean)) {
      parts.push(root.getElementById?.(id)?.textContent || '');
    }
  }
  for (const label of Array.from(input.labels || []))
    parts.push(label.textContent || '');
  // SmartRecruiters exposes the document type on the shadow host. Its separate
  // "apply with resume" importer must not be treated as the resume attachment.
  if (
    'host' in root &&
    root.host.matches('spl-dropzone[data-test="resume-upload"]')
  )
    parts.push('Resume');
  const field = input.closest<HTMLElement>(
    '[data-test-form-element], .jobs-document-upload, .application-field, .field, .form-field, .form-group, [class*="resume"], [class*="Resume"]'
  );
  if (
    field?.textContent &&
    field.querySelectorAll('input[type="file"]').length === 1
  ) {
    parts.push(field.textContent.slice(0, 300));
  }

  // Nearby heading fallback only when this input still has no document-type
  // signal. Walking every previous sibling mixes "Resume" into a following
  // "Cover letter" input and blocks cover-letter attach.
  const preliminary = parts.join(' ').replace(/\s+/g, ' ').trim();
  if (
    !/\b(resume|résumé|curriculum\s+vitae|\bcv\b|cover\s*letter|letter\s*of\s*interest)\b/i.test(
      preliminary
    )
  ) {
    const parent = input.parentElement;
    if (
      parent?.previousElementSibling?.textContent &&
      !parent.previousElementSibling.querySelector('input, select, textarea')
    ) {
      parts.push(parent.previousElementSibling.textContent.slice(0, 120));
    }
    const immediate = input.previousElementSibling;
    if (
      immediate?.textContent &&
      !immediate.matches('input, select, textarea') &&
      !immediate.querySelector('input, select, textarea')
    )
      parts.push(immediate.textContent.slice(0, 120));
  }
  return parts
    .join(' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Native pickers are often visually hidden; their containing step must be active. */
function uploadIsActive(input: HTMLInputElement): boolean {
  if (
    !input.isConnected ||
    input.disabled ||
    input.matches(':disabled') ||
    input.hasAttribute('webkitdirectory')
  )
    return false;
  let node: Element | null = input;
  while (node) {
    if (
      node.hasAttribute('inert') ||
      node.getAttribute('aria-disabled') === 'true'
    )
      return false;
    if (node !== input) {
      const style = node.ownerDocument.defaultView?.getComputedStyle(node);
      if (
        node.hasAttribute('hidden') ||
        node.getAttribute('aria-hidden') === 'true' ||
        style?.display === 'none' ||
        style?.visibility === 'hidden' ||
        style?.visibility === 'collapse' ||
        style?.contentVisibility === 'hidden'
      )
        return false;
    }
    node =
      node.parentElement || (node.getRootNode() as ShadowRoot).host || null;
  }
  return true;
}

export function acceptsPdf(input: HTMLInputElement): boolean {
  const accept = (input.accept || '').trim().toLowerCase();
  if (!accept || accept === '*/*') return true;
  return accept.split(',').some((value) => {
    const token = value.trim();
    return (
      token === '.pdf' ||
      token === 'application/pdf' ||
      token === 'application/*'
    );
  });
}

export function pdfBase64ToFile(
  pdfBase64: string,
  filename: string
): File | null {
  try {
    const bytes = Uint8Array.from(atob(pdfBase64), (char) =>
      char.charCodeAt(0)
    );
    if (bytes.length < 5) return null;
    const safeFilename = filename.toLowerCase().endsWith('.pdf')
      ? filename
      : `${filename}.pdf`;
    return new File([bytes], safeFilename, {
      type: 'application/pdf',
      lastModified: Date.now(),
    });
  } catch {
    return null;
  }
}

export function tryAttachPdfToInput(
  input: HTMLInputElement,
  file: File,
  onAttached?: (input: HTMLInputElement) => void
): ResumeAttachmentResult {
  if (!uploadIsActive(input)) return 'unsupported';
  if (input.files && input.files.length > 0) return 'already_present';
  if (ashbyExistingUpload(input)) return 'already_present';
  if (!acceptsPdf(input)) return 'unsupported';
  try {
    const view = input.ownerDocument.defaultView;
    const Transfer = view?.DataTransfer || DataTransfer;
    const InputEvent = view?.Event || Event;
    const transfer = new Transfer();
    transfer.items.add(file);
    input.files = transfer.files;
    const accepted = () => input.files?.length === 1 && input.files[0] === file;
    if (!accepted()) return 'unsupported';
    input.dispatchEvent(new InputEvent('input', { bubbles: true }));
    if (!accepted()) return 'unsupported';
    input.dispatchEvent(new InputEvent('change', { bubbles: true }));
    if (!accepted()) return 'unsupported';
    markPrefillUndoUnsupported(input);
    onAttached?.(input);
    return 'attached';
  } catch {
    return 'unsupported';
  }
}

/** Attach only to a confidently identified, currently empty Resume/CV input. */
export function attachGeneratedResume(
  container: HTMLElement,
  attachment?: GeneratedResumeAttachment,
  onAttached?: (input: HTMLInputElement) => void
): ResumeAttachmentResult {
  if (!attachment) return 'not_requested';
  const file = pdfBase64ToFile(attachment.pdfBase64, attachment.filename);
  if (!file || typeof DataTransfer === 'undefined') return 'unsupported';

  const inputs = queryAllDeep<HTMLInputElement>(
    container,
    'input[type="file"]'
  );
  let sawResumeInput = false;
  let lastSoftFailure: ResumeAttachmentResult = 'not_found';
  for (const input of inputs) {
    const label = getFileInputLabel(input);
    if (
      !RESUME_FILE_FIELD_RE.test(label) ||
      NON_RESUME_FILE_FIELD_RE.test(label)
    )
      continue;
    sawResumeInput = true;
    const result = tryAttachPdfToInput(input, file, onAttached);
    if (result === 'attached' || result === 'already_present') return result;
    lastSoftFailure = result;
  }

  return sawResumeInput ? lastSoftFailure : 'not_found';
}

export function attachGeneratedCoverLetter(
  container: HTMLElement,
  attachment: GeneratedCoverLetterAttachment | undefined,
  generatedContentHash: string | undefined,
  onAttached?: (input: HTMLInputElement) => void
): ResumeAttachmentResult {
  if (!attachment) return 'not_requested';
  if (
    !generatedContentHash ||
    attachment.sourceContentHash !== generatedContentHash
  )
    return 'source_mismatch';
  const file = pdfBase64ToFile(attachment.base64, attachment.filename);
  if (!file || typeof DataTransfer === 'undefined') return 'unsupported';
  let saw = false;
  for (const input of queryAllDeep<HTMLInputElement>(
    container,
    'input[type="file"]'
  )) {
    const label = getFileInputLabel(input);
    if (
      !/\b(cover\s*letter|letter\s*of\s*interest)\b/i.test(label) ||
      RESUME_FILE_FIELD_RE.test(label) ||
      /\b(portfolio|transcript|photo|headshot|certificate)\b/i.test(label)
    )
      continue;
    saw = true;
    const result = tryAttachPdfToInput(input, file, onAttached);
    if (result === 'attached' || result === 'already_present') return result;
  }
  return saw ? 'unsupported' : 'not_found';
}
