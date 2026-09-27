import { verifyNativeCommit } from './prefill-commit';
import { createUploadProbe, waitForUploadEvidence, UPLOAD_STATUS_COPY, type UploadVerification } from './upload-verification';
/**
 * TrackMyOPT — job application prefill engine (FILL-ONLY).
 *
 * Shared by BOTH the popup-injected script (easy-apply-fill.ts) and the on-page
 * job widget (content-job-portal.ts), so the fill logic and its safety rules
 * live in exactly one place. Fills the visible identity text fields of a
 * supported, OPEN application form from the user's TrackMyOPT profile, then
 * stops. The engine is ATS-agnostic and uses native semantics plus guarded
 * heuristics across LinkedIn, Greenhouse, Workday, Lever, Ashby, iCIMS, and
 * other standards-based application forms.
 *
 * HARD INVARIANTS — do not change without product + compliance sign-off. These
 * apply to EVERY platform, no exceptions:
 *  1. NEVER clicks any action button. No Submit / Next / Review automation.
 *     Guided navigation is a separate, explicit mode and still stops before
 *     Review/Submit. Exact custom-dropdown option selection is delegated to
 *     smart-dropdown.ts, whose candidates can never include action buttons.
 *  2. NEVER fills work-authorization / visa / sponsorship / EEO / salary / DOB /
 *     SSN fields. Those are the user's to answer (see SENSITIVE_FIELD_RE).
 *  3. NEVER overwrites a value the user already entered.
 *  4. Custom dropdowns are selected only when exactly one high-confidence
 *     saved value matches. Ambiguous or unsupported controls remain for review.
 *  5. No timers/delays for evasion, no loop. One open form, once.
 *  6. A resume PDF is attached only when the caller provides the
 *     job-scoped *generated* PDF for this posting. Never invent or upload a
 *     base/saved resume. If nothing was generated, leave the file input alone.
 *     Also require a confidently labeled Resume/CV input with no file already
 *     selected by the user.
 *
 * The JWT never reaches this code: it asks the background worker for the
 * resolved profile; the token stays in the background.
 *
 * DOM / attach / form-discovery helpers live in sibling modules:
 * easy-apply-dom.ts, easy-apply-attachments.ts, easy-apply-form.ts.
 */

import { classifyField } from './easy-apply-matchers';
import {
  emptyPrefillCoverage,
  summarizePrefillOutcomes,
  type PrefillControlOutcome,
  type PrefillCoverageResult,
  type PrefillRetryOperation,
} from './prefill-coverage';
import { buildContactAutofillProfile, contactValueSource } from './prefill-contact-source';
import { buildSkillsPrefillValue } from './skills-prefill';
import type {
  BasicContactProfile,
  GeneratedCoverLetterAttachment,
  ResumeAutofillSnapshotV1,
} from './resume-autofill-contract';
import { selectAtsPrefillAdapter } from './ats-prefill-adapters';
import { fillRepeatableRecords } from './repeatable-record-engine';
import { expandRepeatableRows } from './repeatable-row-expansion';
import { beginPrefillOperationSession } from './prefill-operation-session';
import { snapshotPrefillProgress } from './prefill-progress-protocol';
import { recoverPrefillControl } from './prefill-control-recovery';
import {
  resolveAutofillFeatureFlags,
  type AutofillFeatureFlags,
} from './autofill-feature-flags';
import { autofillErrorCopy } from './autofill-errors';
import {
  createAutofillVisualFeedback,
  type AutofillVisualFeedback,
} from './autofill-visual-feedback';
import { scanApplicationFields } from './application-field-scan';
import {
  isCustomDropdownControl,
  customDropdownHasValue,
  selectSmartDropdown,
  type SmartDropdownContext,
} from './smart-dropdown';
import {
  APPLICATION_CONTROL_SELECTOR,
  dropdownMatchKind,
  getLabelText,
  isFillable,
  isFillableSelect,
  isPlainSkillsControl,
  matchingSelectValue,
  queryAllDeep,
  setNativeSelectValue,
  setNativeValue,
  valueForKind,
} from './easy-apply-dom';
import {
  attachGeneratedCoverLetter,
  attachGeneratedResume,
  type GeneratedResumeAttachment,
} from './easy-apply-attachments';
import {
  findApplicationForm,
  getPrefillCandidateSignature,
  jumpToPrefillField,
  remainingRequiredOutcomes,
} from './easy-apply-form';

export type { PrefillCoverageResult } from './prefill-coverage';
export type { GeneratedResumeAttachment } from './easy-apply-attachments';
export {
  getLabelText,
  attachGeneratedResume,
  attachGeneratedCoverLetter,
  findApplicationForm,
  getPrefillCandidateSignature,
  jumpToPrefillField,
};

type AutofillProfile = BasicContactProfile;

export interface PrefillOptions {
  resume?: GeneratedResumeAttachment;
  coverLetter?: GeneratedCoverLetterAttachment;
  generatedContentHash?: string;
  snapshot?: ResumeAutofillSnapshotV1;
  profileFallback?: BasicContactProfile;
  /** Rule 8 is default-off and only reads snapshot.skills when explicitly on. */
  autofillSkills?: boolean;
  /** Child frames without an application form should stay silent so only the
   * frame that actually fills fields reports a result. */
  quietIfNoForm?: boolean;
  /** Continuous mode reports through the widget instead of spawning toasts. */
  quietResultToast?: boolean;
  /** Short visual sequencing for explicit fills; never used for evasion. */
  animateFields?: boolean;
  /** Local-only shared progress across profile and saved private answers. */
  visualFeedback?: AutofillVisualFeedback;
  /** Local-only cancellation guard; never serialized in frame messages. */
  shouldContinue?: () => boolean;
  /** Tests/future remote config only. Runtime message boundaries do not relay
   * feature overrides from job pages. */
  featureFlags?: Partial<AutofillFeatureFlags>;
  /** Row creation requires an explicit Prefill click, never continuous mode. */
  allowRowCreation?: boolean;
}

const TOAST_ID = 'tmo-easy-apply-toast';

function showToast(message: string): void {
  document.getElementById(TOAST_ID)?.remove();
  const el = document.createElement('div');
  el.id = TOAST_ID;
  el.setAttribute('role', 'status');
  el.textContent = message; // textContent only — never innerHTML
  el.style.cssText = [
    'position:fixed', 'top:16px', 'left:50%', 'transform:translateX(-50%)',
    'z-index:2147483647', 'max-width:420px', 'padding:12px 16px',
    'background:#111827', 'color:#fff', 'font-size:13px', 'line-height:1.4',
    'font-weight:600', 'border-radius:10px', 'box-shadow:0 6px 24px rgba(0,0,0,0.25)',
    "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",
  ].join(';');
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 8000);
}

/**
 * Run the fill-only prefill against the open application form on the current
 * page. Safe to call from any content-script context (popup-injected or the
 * on-page widget). Shows a toast with the result. Never submits.
 */
export async function runPrefill(options: PrefillOptions = {}): Promise<PrefillCoverageResult> {
  const featureFlags = resolveAutofillFeatureFlags(options.featureFlags);
  const emptyCoverage = emptyPrefillCoverage();
  let visual: AutofillVisualFeedback | undefined;
  const runUrl = document.location.href;
  const sessionCurrent = beginPrefillOperationSession(document);
  const current = () => sessionCurrent() && document.location.href === runUrl && options.shouldContinue?.() !== false;
  const stopped = () => {
    if (current()) return false;
    visual?.fail('Prefill stopped');
    return true;
  };
  if (stopped()) return { ...emptyCoverage, paused: true };
  let latestNotice = '';
  const notify = (message: string) => {
    if (visual) {
      latestNotice = message;
    } else if (!options.quietResultToast) {
      showToast(message);
    }
  };
  const container = findApplicationForm();
  if (!container) {
    if (options.quietIfNoForm) return emptyCoverage;
    notify(
      document.querySelector('iframe')
        ? 'Checking the embedded application form. TrackMyOPT will fill supported fields inside accessible application frames.'
        : 'Open the job application form on this page first, then click Prefill. Custom or protected fields stay blank.'
    );
    return emptyCoverage;
  }
  const adapter = selectAtsPrefillAdapter(
    container.ownerDocument,
    featureFlags.atsAdapters
  );
  let frameId = typeof window !== 'undefined' && window.top !== window.self ? -1 : 0;
  if ((!options.profileFallback || options.quietIfNoForm) &&
      typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
    const context = await chrome.runtime.sendMessage({ type: 'GET_PREFILL_FRAME_CONTEXT' })
      .catch(() => null) as { frameId?: number | null } | null;
    if (Number.isInteger(context?.frameId) && (context?.frameId ?? -1) >= 0)
      frameId = context!.frameId!;
  }
  if (stopped() || !container.isConnected) return { ...emptyCoverage, paused: true };
  visual = options.visualFeedback ?? createAutofillVisualFeedback(container.ownerDocument, { animateFields: options.animateFields });

  const fieldSources: NonNullable<PrefillCoverageResult['fieldSources']> = [];
  const retryOperations: PrefillRetryOperation[] = [];
  const pendingUploads: Array<{ input: HTMLInputElement; group: 'resume' | 'cover_letter' }> = [];
  const resumeResult = attachGeneratedResume(
    container,
    featureFlags.artifactPrefill ? options.resume : undefined,
    (input) => pendingUploads.push({ input, group: 'resume' }),
    (input) => pendingUploads.push({ input, group: 'resume' })
  );
  const coverLetterResult =
    featureFlags.artifactPrefill && featureFlags.coverLetter
      ? attachGeneratedCoverLetter(
          container,
          options.coverLetter,
          options.generatedContentHash,
          (input) => pendingUploads.push({ input, group: 'cover_letter' }),
          (input) => pendingUploads.push({ input, group: 'cover_letter' })
        )
      : 'not_requested';
  const uploadVerification: Partial<Record<'resume' | 'cover_letter', UploadVerification>> = {};
  for (const { input, group } of pendingUploads) {
    visual.setStage?.('Waiting for the website to finish processing your document…');
    const state = await waitForUploadEvidence({
      probe: createUploadProbe(input, container, adapter.upload),
      current: () => current() && container.isConnected,
      now: () => Date.now(),
      sleep: ms => new Promise(resolve => setTimeout(resolve, ms)),
      // Unknown/native form controls can defer uploads until final submission.
      // Report that honestly rather than assuming a network upload succeeded.
      timeoutMs: adapter.upload ? 12_000 : 1_000,
    });
    uploadVerification[group] = state;
    if (state === 'verified') visual.markFieldFilled(input, group);
    else visual.markNeedsUser(input);
    if (state === 'cancelled') {
      visual.fail(UPLOAD_STATUS_COPY.cancelled);
      return { ...emptyCoverage, paused: true, uploadVerification };
    }
  }
  const blockedUpload = Object.values(uploadVerification).find(state => state === 'rejected' || state === 'timed_out');
  if (blockedUpload) {
    const result: PrefillCoverageResult = {
      ...emptyCoverage, adapterId: adapter.id, resumeAttachmentResult: resumeResult,
      uploadVerification, paused: true,
    };
    visual.fail(UPLOAD_STATUS_COPY[blockedUpload]);
    return result;
  }
  if (stopped() || !container.isConnected) return { ...emptyCoverage, paused: true };
  const filledOutcomes: PrefillControlOutcome[] = resumeResult === 'attached'
    ? [{ filled: true, fieldGroup: 'resume' }]
    : [];
  if (coverLetterResult === 'attached') {
    filledOutcomes.push({ filled: true, fieldGroup: 'cover_letter' });
  }

  const historyRemaining = { experience: 0, education: 0 };
  const snapshot = featureFlags.artifactPrefill ? options.snapshot : undefined;
  if (snapshot && featureFlags.historyFields) {
    for (const section of ['experience', 'education'] as const) {
      if (!adapter.capabilities[section]) continue;
      if (options.allowRowCreation) {
        await expandRepeatableRows(adapter, container, section, snapshot[section].length, current);
        if (stopped() || !container.isConnected) return { ...emptyCoverage, paused: true };
      }
      const historyControls = adapter.classifyRepeatableSections(container);
      historyControls.forEach(control => recoverPrefillControl(control.element));
      const written: Array<{ element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement; value: string; field: string; checked?: boolean }> = [];
      const outcome = fillRepeatableRecords(section, historyControls, snapshot, element => {
        const control = element as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
        written.push({ element: control, value: control.value,
          field: historyControls.find(item => item.element === control)?.field ?? 'field',
          ...(control.tagName === 'INPUT' && (control as HTMLInputElement).type === 'checkbox' ? { checked: (control as HTMLInputElement).checked } : {}) });
      });
      const accepted = await Promise.all(written.map(async entry =>
        await verifyNativeCommit(entry.element, entry.value, current) &&
        (entry.checked === undefined || (entry.element as HTMLInputElement).checked === entry.checked)));
      if (stopped()) return { ...emptyCoverage, paused: true };
      for (const [index, entry] of written.entries()) {
        if (accepted[index]) {
          fieldSources.push({ control: entry.element, source: 'resume' });
          visual.markFieldFilled(entry.element, section);
        } else {
          outcome.filledFields--;
          outcome.skippedFields++;
          visual.markNeedsUser(entry.element);
          const original = entry.element;
          retryOperations.push({
            id: `history:${section}:${index}`,
            fieldGroup: section,
            label: `${section === 'experience' ? 'employment' : 'education'} ${entry.field.replace(/([A-Z])/g, ' $1').toLowerCase()}`,
            source: 'resume',
            originalControl: original,
            retry: async () => {
              if (!current()) return null;
              const root = findApplicationForm();
              const target = recoverPrefillControl(original);
              if (!root || !target || !root.contains(target)) return null;
              const controls = adapter.classifyRepeatableSections(root);
              if (!controls.some(control => control.element === target && control.section === section)) return null;
              let wrote = false;
              fillRepeatableRecords(section, controls, snapshot, () => { wrote = true; }, target, entry.value);
              if (!wrote || !current() || !await verifyNativeCommit(target, entry.value, current)) return null;
              return { control: target, root };
            },
          });
        }
      }
      historyRemaining[section] = outcome.remainingRecords;
      filledOutcomes.push(
        ...Array.from({ length: outcome.filledFields }, () => ({
          filled: true as const,
          fieldGroup: section,
        })),
        ...Array.from({ length: outcome.skippedFields }, (_, index) => ({
          needsUser: true as const,
          fieldGroup: section,
          groupKey: `${section}:skipped:${index}`,
        })),
      );
    }
  }
  const coverageFor = (
    outcomes: PrefillControlOutcome[]
  ): PrefillCoverageResult => {
    const result: PrefillCoverageResult = {
      ...summarizePrefillOutcomes(outcomes),
      adapterId: adapter.id,
      remainingRecords: historyRemaining,
      applicationScan: scanApplicationFields(container),
      resumeAttachmentResult: resumeResult,
      uploadVerification,
      fieldSources,
      retryOperations,
    };
    result.progress = snapshotPrefillProgress({ runId: sessionCurrent.runId,
      navigationGeneration: sessionCurrent.generation, frameId, adapterId: adapter.id }, result);
    if (!options.visualFeedback) visual.finish(result, latestNotice);
    return result;
  };

  const resp = options.profileFallback
    ? { ok: true, profile: options.profileFallback }
    : ((await chrome.runtime
        .sendMessage({ type: 'GET_AUTOFILL_PROFILE' })
        .catch(() => null)) as {
        ok?: boolean;
        error?: string;
        profile?: AutofillProfile;
      } | null);

  if (stopped()) return { ...emptyCoverage, paused: true };

  if (!resp?.ok || !resp.profile) {
    if (
      resumeResult === 'attached' ||
      coverLetterResult === 'attached'
    ) {
      const attached = [
        resumeResult === 'attached' ? 'resume' : '',
        coverLetterResult === 'attached' ? 'cover letter' : '',
      ]
        .filter(Boolean)
        .join(' and ');
      notify(
        `Your generated ${attached} ${attached.includes(' and ') ? 'were' : 'was'} attached. Profile fields could not be loaded, so please complete them manually.`
      );
      return coverageFor([
        ...filledOutcomes,
        ...remainingRequiredOutcomes(container, visual),
      ]);
    }
    notify(
      resp?.error === 'not_signed_in'
        ? 'Sign in to TrackMyOPT in the extension first.'
        : 'Could not load your TrackMyOPT profile.'
    );
    return coverageFor([
      ...filledOutcomes,
      ...remainingRequiredOutcomes(container, visual),
    ]);
  }

  const profile = buildContactAutofillProfile(snapshot, resp.profile);
  // "+1" is shared by the US and Canada, so a dial-code list that also names
  // countries needs the applicant's country to resolve to one option.
  const dropdownContext: SmartDropdownContext = {
    countryName: profile.country,
    stateName: profile.state,
    shouldContinue: current,
  };
  const controls = queryAllDeep<HTMLElement>(
    container,
    APPLICATION_CONTROL_SELECTOR
  );
  let filled = filledOutcomes.filter((outcome) => outcome.filled && (outcome.fieldGroup === 'experience' || outcome.fieldGroup === 'education')).length;
  const kinds: string[] = [
    ...(filledOutcomes.some((outcome) => outcome.filled && outcome.fieldGroup === 'experience') ? ['experience'] : []),
    ...(filledOutcomes.some((outcome) => outcome.filled && outcome.fieldGroup === 'education') ? ['education'] : []),
  ];

  for (const el of controls) {
    if (stopped()) return { ...emptyCoverage, paused: true };
    recoverPrefillControl(el);
    const kind = classifyField(getLabelText(el));
    if (!kind) continue; // no confident match, or a sensitive field -> leave it
    if (!adapter.capabilities[kind === 'skills' ? 'skills' : 'contact']) continue;
    const value = kind === 'skills'
      ? buildSkillsPrefillValue(
          snapshot?.skills ?? [],
          featureFlags.skills && options.autofillSkills === true
        )
      : valueForKind(kind, profile);
    if (!value) continue; // we don't have this datum -> leave it blank

    let changed = false;
    let retryWrite: PrefillRetryOperation['retry'] | undefined;
    if (kind === 'skills' && (!isPlainSkillsControl(el) || !isFillable(el))) {
      continue; // tag editors/custom widgets require a tested ATS adapter
    } else if (isFillable(el)) {
      await visual.prepareField(el, kind === 'skills' ? 'skills' : 'contact');
      if (stopped()) return { ...emptyCoverage, paused: true };
      // The applicant may type, navigate, or disable a field during feedback.
      if (!el.isConnected || !isFillable(el)) { visual.clearActiveField(); continue; }
      setNativeValue(el, value);
      changed = await verifyNativeCommit(el, value, current);
      if (!changed) retryWrite = async () => {
        if (!current()) return null;
        const root = findApplicationForm();
        const target = recoverPrefillControl(el);
        if (!root || !target || !queryAllDeep(root, APPLICATION_CONTROL_SELECTOR).includes(target) ||
            !isFillable(target) || (kind === 'skills' && !isPlainSkillsControl(target))) return null;
        setNativeValue(target, value);
        return await verifyNativeCommit(target, value, current) ? { control: target, root } : null;
      };
    } else if (isFillableSelect(el)) {
      const selectValue = matchingSelectValue(el, kind, value, dropdownContext);
      if (!selectValue) continue; // never guess a dropdown option
      await visual.prepareField(el, 'contact');
      if (stopped()) return { ...emptyCoverage, paused: true };
      if (!el.isConnected || !isFillableSelect(el) || matchingSelectValue(el, kind, value, dropdownContext) !== selectValue) { visual.clearActiveField(); continue; }
      setNativeSelectValue(el, selectValue);
      changed = await verifyNativeCommit(el, selectValue, current);
      if (!changed) retryWrite = async () => {
        if (!current()) return null;
        const root = findApplicationForm();
        const target = recoverPrefillControl(el);
        if (!root || !target || !queryAllDeep(root, APPLICATION_CONTROL_SELECTOR).includes(target) ||
            !isFillableSelect(target) || matchingSelectValue(target, kind, value, dropdownContext) !== selectValue) return null;
        setNativeSelectValue(target, selectValue);
        return await verifyNativeCommit(target, selectValue, current) ? { control: target, root } : null;
      };
    } else if (isCustomDropdownControl(el)) {
      if (!adapter.capabilities.searchableDropdown) continue;
      if (customDropdownHasValue(el)) continue;
      await visual.prepareField(el, 'contact');
      if (stopped()) return { ...emptyCoverage, paused: true };
      if (!el.isConnected) { visual.clearActiveField(); continue; }
      const selection = await selectSmartDropdown(
        el,
        value,
        dropdownMatchKind(kind),
        undefined,
        undefined,
        dropdownContext
      );
      changed = selection.outcome === 'selected';
      if (!changed && selection.outcome !== 'already_filled') retryWrite = async () => {
        if (!current()) return null;
        const root = findApplicationForm();
        const target = recoverPrefillControl(el);
        if (!root || !target || !queryAllDeep(root, APPLICATION_CONTROL_SELECTOR).includes(target) ||
            !isCustomDropdownControl(target) || customDropdownHasValue(target)) return null;
        const selected = await selectSmartDropdown(target, value, dropdownMatchKind(kind), undefined, undefined, dropdownContext);
        return selected.outcome === 'selected' && current() ? { control: target, root } : null;
      };
    } else {
      continue;
    }
    if (stopped()) return { ...emptyCoverage, paused: true };
    if (!changed) {
      if (retryWrite) retryOperations.push({
        id: `contact:${retryOperations.length}`,
        fieldGroup: kind === 'skills' ? 'skills' : 'contact',
        label: kind.replace(/([A-Z])/g, ' $1').toLowerCase(),
        source: contactValueSource(snapshot, kind),
        originalControl: el,
        retry: retryWrite,
      });
      visual.clearActiveField(); continue;
    }
    filled += 1;
    fieldSources.push({ control: el, source: contactValueSource(snapshot, kind) });
    filledOutcomes.push({
      filled: true,
      fieldGroup: kind === 'skills' ? 'skills' : 'contact',
    });
    visual.markFieldFilled(
      el,
      kind === 'skills' ? 'skills' : 'contact'
    );
    if (!kinds.includes(kind)) kinds.push(kind);
  }

  if (filled === 0) {
    if (
      resumeResult === 'attached' ||
      coverLetterResult === 'attached'
    ) {
      const attachments = [
        resumeResult === 'attached' ? 'resume' : '',
        coverLetterResult === 'attached' ? 'cover letter' : '',
      ]
        .filter(Boolean)
        .join(' and ');
      notify(
        `Your generated ${attachments} ${attachments.includes(' and ') ? 'were' : 'was'} attached. No empty profile fields were available to fill. Review the application and submit it yourself.`
      );
      return coverageFor([
        ...filledOutcomes,
        ...remainingRequiredOutcomes(container, visual),
      ]);
    }
    if (coverLetterResult === 'source_mismatch') {
      notify(
        'The cover letter no longer matches this generated resume, so it was not attached.'
      );
      return coverageFor([
        ...filledOutcomes,
        ...remainingRequiredOutcomes(container, visual),
      ]);
    }
    if (resumeResult === 'already_present') {
      notify('Your existing resume upload was left unchanged. No other empty profile fields were available to fill.');
      return coverageFor([
        ...filledOutcomes,
        ...remainingRequiredOutcomes(container, visual),
      ]);
    }
    if (options.resume && resumeResult === 'not_found') {
      notify('No Resume/CV upload field is visible yet. Open that part of the application and click Prefill again.');
      return coverageFor([
        ...filledOutcomes,
        ...remainingRequiredOutcomes(container, visual),
      ]);
    }
    if (options.resume && resumeResult === 'unsupported') {
      const copy = autofillErrorCopy('attachment_failed');
      notify(`${copy.message} ${copy.recovery}`);
      return coverageFor([
        ...filledOutcomes,
        ...remainingRequiredOutcomes(container, visual),
      ]);
    }
    notify(
      'Nothing to prefill here. Private work-authorization, visa, compensation, ' +
        'and DEI fields use saved private answers when available; unmatched questions need your input. ' +
        autofillErrorCopy('unsupported_control').message
    );
  } else {
    const resumeSummary = resumeResult === 'attached'
      ? 'Your generated resume was attached.'
      : resumeResult === 'already_present'
        ? 'Your existing resume upload was left unchanged.'
        : options.resume && resumeResult === 'not_found'
          ? 'No Resume/CV upload field is visible yet; click Prefill again when that field appears.'
          : options.resume && resumeResult === 'unsupported'
            ? autofillErrorCopy('attachment_failed').message
            : '';
    const coverLetterSummary =
      coverLetterResult === 'attached'
        ? 'Your generated cover letter was attached.'
        : coverLetterResult === 'already_present'
          ? 'Your existing cover-letter upload was left unchanged.'
          : coverLetterResult === 'source_mismatch'
            ? 'The cover letter did not match this resume and was not attached.'
            : '';
    notify(
      `TrackMyOPT prefilled ${filled} field${filled > 1 ? 's' : ''} (${kinds.join(', ')}). ` +
        `${resumeSummary ? `${resumeSummary} ` : ''}${coverLetterSummary ? `${coverLetterSummary} ` : ''}Review every answer and click Submit yourself — we never submit for you.`
    );
  }
  return coverageFor([
    ...filledOutcomes,
    ...remainingRequiredOutcomes(container, visual),
  ]);
}
