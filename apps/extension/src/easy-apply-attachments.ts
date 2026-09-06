/**
 * Resume / cover-letter PDF attach helpers for the fill-only prefill engine.
 */

import type { GeneratedCoverLetterAttachment } from './resume-autofill-contract';
import {
  getLabelText,
  queryAllDeep,
} from './easy-apply-dom';

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

export const RESUME_FILE_FIELD_RE = /\b(resume|résumé|curriculum\s+vitae|cv)\b/i;
export const NON_RESUME_FILE_FIELD_RE = /\b(cover\s+letter|portfolio|photo|headshot|transcript|certificate)\b/i;

export function getFileInputLabel(input: HTMLInputElement): string {
  const parts = [
    getLabelText(input),
    input.getAttribute('aria-label') || '',
    input.getAttribute('name') || '',
    input.id || '',
    input.getAttribute('data-automation-id') || '',
    input.getAttribute('data-testid') || '',
  ];
  const describedBy = input.getAttribute('aria-describedby');
  if (describedBy) {
    for (const id of describedBy.split(/\s+/)) {
      parts.push(document.getElementById(id)?.textContent || '');
    }
  }
  const field = input.closest<HTMLElement>(
    '[data-test-form-element], .jobs-document-upload, .application-field, .field, .form-field, .form-group, [class*="resume"], [class*="Resume"]'
  );
  if (field?.textContent) parts.push(field.textContent.slice(0, 300));

  // Nearby heading fallback only when this input still has no document-type
  // signal. Walking every previous sibling mixes "Resume" into a following
  // "Cover letter" input and blocks cover-letter attach.
  const preliminary = parts.join(' ').replace(/\s+/g, ' ').trim();
  if (!/\b(resume|résumé|curriculum\s+vitae|\bcv\b|cover\s*letter|letter\s*of\s*interest)\b/i.test(preliminary)) {
    const parent = input.parentElement;
    if (parent?.previousElementSibling?.textContent) {
      parts.push(parent.previousElementSibling.textContent.slice(0, 120));
    }
    const immediate = input.previousElementSibling;
    if (immediate?.textContent) parts.push(immediate.textContent.slice(0, 120));
  }
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

export function acceptsPdf(input: HTMLInputElement): boolean {
  const accept = (input.accept || '').trim().toLowerCase();
  if (!accept || accept === '*/*') return true;
  return accept.split(',').some((value) => {
    const token = value.trim();
    return token === '.pdf' || token === 'application/pdf' || token === 'application/*';
  });
}

export function pdfBase64ToFile(pdfBase64: string, filename: string): File | null {
  try {
    const bytes = Uint8Array.from(atob(pdfBase64), (char) => char.charCodeAt(0));
    if (bytes.length < 5) return null;
    const safeFilename = filename.toLowerCase().endsWith('.pdf') ? filename : `${filename}.pdf`;
    return new File([bytes], safeFilename, { type: 'application/pdf', lastModified: Date.now() });
  } catch {
    return null;
  }
}

export function tryAttachPdfToInput(
  input: HTMLInputElement,
  file: File,
  onAttached?: (input: HTMLInputElement) => void,
): ResumeAttachmentResult {
  if (input.disabled) return 'unsupported';
  if (input.files && input.files.length > 0) return 'already_present';
  if (!acceptsPdf(input)) return 'unsupported';
  try {
    const transfer = new DataTransfer();
    transfer.items.add(file);
    input.files = transfer.files;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
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

  const inputs = queryAllDeep<HTMLInputElement>(container, 'input[type="file"]');
  let sawResumeInput = false;
  let lastSoftFailure: ResumeAttachmentResult = 'not_found';
  for (const input of inputs) {
    const label = getFileInputLabel(input);
    if (!RESUME_FILE_FIELD_RE.test(label) || NON_RESUME_FILE_FIELD_RE.test(label)) continue;
    sawResumeInput = true;
    const result = tryAttachPdfToInput(input, file, onAttached);
    if (result === 'attached' || result === 'already_present') return result;
    lastSoftFailure = result;
  }

  // Fallback for portals with a single unlabeled PDF upload (common when the
  // visible control is "Select → File" and the real input is aria-hidden).
  if (!sawResumeInput) {
    const pdfCandidates = inputs.filter((input) => {
      if (input.disabled || !acceptsPdf(input)) return false;
      const label = getFileInputLabel(input);
      return !NON_RESUME_FILE_FIELD_RE.test(label);
    });
    if (pdfCandidates.length === 1) {
      return tryAttachPdfToInput(pdfCandidates[0]!, file, onAttached);
    }
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
      /\b(resume|cv|portfolio|transcript|photo|certificate)\b/i.test(label)
    )
      continue;
    saw = true;
    if (input.disabled) continue;
    if (input.files?.length) return 'already_present';
    if (!acceptsPdf(input)) continue;
    try {
      const transfer = new DataTransfer();
      transfer.items.add(file);
      input.files = transfer.files;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      onAttached?.(input);
      return 'attached';
    } catch {
      return 'unsupported';
    }
  }
  return saw ? 'unsupported' : 'not_found';
}
