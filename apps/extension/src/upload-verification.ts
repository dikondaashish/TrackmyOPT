import { isInActiveControlTree } from './scoped-control-dom';
import { queryAllDeep } from './easy-apply-dom';

export type UploadVerification = 'verified' | 'unverified' | 'rejected' | 'timed_out' | 'cancelled';
export interface UploadEvidence { accepted: boolean; busy: boolean; rejected: boolean; signature: string }
export interface UploadCapability {
  scope: string;
  success: string;
  failure: string;
  busy: string;
}

/** Packaged, deliberately narrow evidence. A FileList alone is never server acceptance. */
export const UPLOAD_CAPABILITIES: Readonly<Record<string, UploadCapability>> = {
  workday: {
    scope: '[data-automation-id="resumeUpload"], [data-automation-id="file-upload-drop-zone"]',
    success: '[data-automation-id="file-upload-successful"]',
    failure: '[data-automation-id="errorMessage"], [role="alert"]',
    busy: '[role="progressbar"], [aria-busy="true"]',
  },
  greenhouse: {
    scope: '#resume_field, .field, .application-field',
    success: '.uploaded-file, .filename',
    failure: '.field-error, [role="alert"]',
    busy: '[role="progressbar"], [aria-busy="true"]',
  },
  lever: {
    scope: '.application-field',
    success: '.resume-upload-success',
    failure: '.resume-upload-failure',
    busy: '[role="progressbar"], [aria-busy="true"]',
  },
  ashby: {
    scope: '.ashby-application-form-input-file',
    success: '.ashby-application-form-input-file-item-name',
    failure: '[role="alert"]',
    busy: '[role="progressbar"], [aria-busy="true"]',
  },
  smartrecruiters: {
    scope: 'spl-dropzone[data-test="resume-upload"], .jobs-document-upload',
    success: '[data-test="uploaded-file-name"]',
    failure: '[role="alert"]',
    busy: '[role="progressbar"], [aria-busy="true"]',
  },
};

/** Pure scheduler core: caller owns the clock and probe, so race cases are testable. */
export async function waitForUploadEvidence(io: {
  probe(): UploadEvidence;
  current(): boolean;
  now(): number;
  sleep(ms: number): Promise<void>;
  timeoutMs?: number;
  stableMs?: number;
}): Promise<UploadVerification> {
  const started = io.now();
  let signature: string | undefined;
  let stableSince = started;
  let sawBusy = false;
  let wasAccepted = false;
  let wasBusy = false;
  const stableMs = io.stableMs ?? 600;
  const timeout = io.timeoutMs ?? 12_000;
  while (true) {
    if (!io.current()) return 'cancelled';
    const evidence = io.probe();
    const now = io.now();
    if (evidence.rejected) return 'rejected';
    sawBusy ||= evidence.busy;
    if (evidence.busy || wasBusy || !evidence.accepted || !wasAccepted || signature !== evidence.signature) stableSince = now;
    wasAccepted = evidence.accepted;
    wasBusy = evidence.busy;
    signature = evidence.signature;
    if (!evidence.busy && evidence.accepted && now - stableSince >= stableMs && now - started >= 1_000) return 'verified';
    if (now - started >= timeout) return sawBusy ? 'timed_out' : 'unverified';
    await io.sleep(Math.min(100, timeout - (now - started)));
  }
}

export function createUploadProbe(input: HTMLInputElement, form: HTMLElement, adapter: string | UploadCapability | undefined): () => UploadEvidence {
  const capability = typeof adapter === 'string' ? UPLOAD_CAPABILITIES[adapter] : adapter;
  const filename = input.files?.[0]?.name ?? '';
  const root = input.getRootNode() as Document | ShadowRoot;
  const scope = capability && (input.closest<HTMLElement>(capability.scope) || ('host' in root && root.host.matches(capability.scope) ? root.host as HTMLElement : null));
  const originalUrl = form.ownerDocument.location.href;
  const visible = (selector: string, parent: HTMLElement | Document | ShadowRoot) => queryAllDeep<HTMLElement>(parent, selector).filter(isInActiveControlTree);
  return () => {
    const active = !!scope?.isConnected && isInActiveControlTree(scope);
    const signature = queryAllDeep<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(form, 'input:not([type="file"]), select, textarea')
      .filter(isInActiveControlTree).map(el => [el.tagName, el.id, el.name, el.value, 'checked' in el ? el.checked : ''].join(':')).join('\n');
    return {
      accepted: !!(active && capability && filename && visible(capability.success, scope!).some(el => el.textContent?.includes(filename))),
      rejected: !!(active && capability && visible(capability.failure, scope!).some(el => /fail|error|reject|too large|invalid|unsupported/i.test(el.textContent ?? ''))),
      busy: !!(active && capability && (scope!.matches(capability.busy) || visible(capability.busy, scope!).length)) || form.getAttribute('aria-busy') === 'true' || visible('[aria-busy="true"]', form).length > 0,
      signature: originalUrl + signature,
    };
  };
}

export const UPLOAD_STATUS_COPY: Record<UploadVerification, string> = {
  verified: 'The application page confirmed the document upload. Review it before submitting.',
  unverified: 'File selected, but the website has not confirmed the upload. Check the document on the application before continuing.',
  rejected: 'The website reported an upload error. Check its message and upload the document manually.',
  timed_out: 'The document is still processing. Wait for the website to finish, then click Prefill again. Your existing file will be preserved.',
  cancelled: 'Upload verification stopped because the application changed or Prefill was stopped.',
};
