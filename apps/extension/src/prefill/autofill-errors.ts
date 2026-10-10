export const AUTOFILL_ERROR_CODES = [
  'extraction_failed',
  'unsupported_control',
  'draft_review_pending',
  'attachment_failed',
] as const;

export type AutofillErrorCode = (typeof AUTOFILL_ERROR_CODES)[number];

export interface AutofillErrorCopy {
  title: string;
  message: string;
  recovery: string;
}

/**
 * Shared, content-free support taxonomy for autofill failures. These codes may
 * be sent in telemetry; labels, field values, answers, resume content, and file
 * bytes must never be included.
 */
export const AUTOFILL_ERROR_COPY: Readonly<
  Record<AutofillErrorCode, AutofillErrorCopy>
> = Object.freeze({
  extraction_failed: {
    title: 'Resume fields unavailable',
    message:
      'Your PDF is ready, but TrackMyOPT could not safely extract structured fields from this generated resume.',
    recovery:
      'Download the PDF, complete application fields manually, or regenerate the resume.',
  },
  unsupported_control: {
    title: 'Field needs you',
    message:
      'This application uses a custom control that TrackMyOPT does not fill safely.',
    recovery:
      'Choose or enter the value yourself, then review the rest of the application.',
  },
  draft_review_pending: {
    title: 'Review required',
    message:
      'This draft stays marked for review until you edit it or choose Confirm reviewed.',
    recovery:
      'Read the complete answer, make any needed edits, then confirm it before continuing.',
  },
  attachment_failed: {
    title: 'Attachment not added',
    message:
      'TrackMyOPT could not safely attach the generated PDF to this application field.',
    recovery:
      'Download the PDF and upload it manually. An existing file will never be replaced.',
  },
});

export function autofillErrorCopy(code: AutofillErrorCode): AutofillErrorCopy {
  return AUTOFILL_ERROR_COPY[code];
}
