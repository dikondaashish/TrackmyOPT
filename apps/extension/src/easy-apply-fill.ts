/**
 * TrackMyOPT — job application prefill entry (popup-injected via activeTab).
 *
 * Thin wrapper: the actual fill logic + all safety invariants live in the
 * shared engine (easy-apply-engine.ts), which the on-page job widget also uses.
 *
 * This entry used to call runPrefill() with no arguments, so the popup's
 * "Prefill this application" button could fill contact fields but could never
 * attach the résumé the user had just generated for the job — the single most
 * requested behaviour. It now resolves the active artifact exactly like the
 * widget does before filling.
 *
 * Frame model mirrors the widget: only the top frame resolves the payload (a
 * child frame's own URL is the ATS iframe, not the posting, so it would never
 * match the artifact). The resolved, already-bounded payload is then relayed to
 * child frames through the background worker.
 */

import { runPrefill, findApplicationForm, type PrefillOptions } from './easy-apply-engine';
import { withPrefillUndo, currentPrefillUndoRunId, markPrefillUndoDelegated, isPrefillUndoAllowed, getPrefillUndoState } from './prefill-undo';
import { mountPrefillUndoFallback } from './prefill-undo-ui';
import { requestPrefillUndo } from './prefill-undo-request';
import { loadPrivateAnswersForPrefill } from './private-prefill-request';
import { prefillSavedPortalLogin } from './portal-login-prefill';
import { createAutofillVisualFeedback } from './autofill-visual-feedback';
import { scanApplicationFields } from './application-field-scan';
import { runSmartAnswers } from './smart-answers';
import { AUTOFILL_FEATURE_FLAGS } from './autofill-feature-flags';
import { fillConfirmedSensitiveAnswers, normalizeSensitiveAnswerSession } from './sensitive-autofill';
import { withPrefillModeGuard } from './prefill-mode-guard';
import { AUTOFILL_PREFERENCES_KEY, normalizeAutofillPreferences } from './autofill-preferences';
import type {
  BasicContactProfile,
  GeneratedResumeAttachment,
  ResumeAutofillSnapshotV1,
  V1PrefillPayloadResponse,
} from './resume-autofill-contract';

type RelayedPrefill = {
  resume?: GeneratedResumeAttachment;
  coverLetter?: PrefillOptions['coverLetter'];
  generatedContentHash?: string;
  snapshot?: ResumeAutofillSnapshotV1;
  profileFallback?: BasicContactProfile;
  autofillSkills?: boolean;
  sensitiveAnswers?: unknown;
};

const isTopFrame = window.top === window.self;
getPrefillUndoState();

// Registered synchronously, before the top frame's async resolve round-trip, so
// a child frame is listening by the time the relay arrives.
if (!isTopFrame) {
  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type !== 'RUN_PREFILL_IN_CHILD_FRAME') return false;
    const prefill = (message.prefill ?? {}) as RelayedPrefill;
    void withPrefillUndo(() => withPrefillModeGuard(message.continuous === true, async shouldContinue => {
      await runPrefill({
        resume: prefill.resume,
        coverLetter: prefill.coverLetter,
        generatedContentHash: prefill.generatedContentHash,
        snapshot: prefill.snapshot,
        profileFallback: prefill.profileFallback,
        autofillSkills: prefill.autofillSkills === true,
        quietResultToast: true,
        quietIfNoForm: true,
        animateFields: message.continuous !== true,
        shouldContinue,
      });
      const answers = normalizeSensitiveAnswerSession(prefill.sensitiveAnswers);
      if (answers && shouldContinue()) await fillConfirmedSensitiveAnswers(findApplicationForm() ?? document, answers, shouldContinue);
    }), message.undoRunId).catch(() => {});
    return false;
  });
}

async function prefillFromActiveArtifact(): Promise<void> {
  if (!isTopFrame) return;
  const pageUrl = window.location.href;
  const shouldContinue = () => isPrefillUndoAllowed() && window.location.href === pageUrl;
  const login = await prefillSavedPortalLogin({ shouldContinue });
  if (!shouldContinue() || login.status === 'stopped') return;
  const privateLoad = await loadPrivateAnswersForPrefill(shouldContinue);
  if (!shouldContinue()) return;
  if (privateLoad.status === 'unavailable') {
    document.querySelector('.tmo-sensitive-answer-panel')?.dispatchEvent(
      new CustomEvent('tmo-private-prefill-status', { detail: 'unavailable' })
    );
  }

  const resolved = (await chrome.runtime
    .sendMessage({
      type: 'RESOLVE_V1_PREFILL_PAYLOAD',
      // Peek only. A soft mismatch must not destroy a résumé the user just
      // generated; the resolver still refuses to hand it over when it does not
      // belong to this posting.
      discardRejectedArtifact: false,
      request: {
        now: new Date().toISOString(),
        jobContext: {
          jobUrl: window.location.href,
          companyName: '',
          roleTitle: '',
        },
      },
    })
    .catch(() => null)) as V1PrefillPayloadResponse | null;

  // No profile and no artifact — let the engine resolve the profile itself and
  // surface its own sign-in guidance.
  if (!resolved?.ok) {
    await runPrefill({ shouldContinue });
    if (shouldContinue()) await fillConfirmedSensitiveAnswers(findApplicationForm() ?? document, privateLoad.answers, shouldContinue);
    if (shouldContinue() && AUTOFILL_FEATURE_FLAGS.aiScreeningDrafts) await runSmartAnswers({root:findApplicationForm() ?? document,job:{jobUrl:pageUrl,companyName:'',roleTitle:''},hasResume:false,shouldContinue});
    return;
  }

  const stored: Record<string, unknown> = await chrome.storage.sync.get(AUTOFILL_PREFERENCES_KEY).catch(() => ({}));
  const preferences = normalizeAutofillPreferences(stored[AUTOFILL_PREFERENCES_KEY]);
  if (window.location.href !== pageUrl) return;

  const prefill: PrefillOptions =
    resolved.source === 'generated_resume'
      ? {
          resume: resolved.resume,
          coverLetter: resolved.coverLetter,
          generatedContentHash: resolved.generatedContentHash,
          snapshot: resolved.snapshot,
          profileFallback: resolved.profileFallback,
          autofillSkills: preferences.autofillSkills,
        }
      : // Profile-only: nothing was generated for this posting, so no file is
        // attached. Never fall back to some other job's résumé.
        { profileFallback: resolved.profileFallback };

  chrome.runtime
    .sendMessage({ type: 'PREFILL_CHILD_FRAMES', undoRunId: currentPrefillUndoRunId(), prefill: { ...prefill, sensitiveAnswers: privateLoad.answers } })
    .catch(() => {
      // A page with no accessible child frames is the normal case.
    });

  markPrefillUndoDelegated();

  const root = findApplicationForm();
  const visual = privateLoad.answers.confirmed && root ? createAutofillVisualFeedback(document) : undefined;
  try {
    const result = await runPrefill({ ...prefill, shouldContinue, visualFeedback: visual, quietResultToast: privateLoad.answers.confirmed });
    if (!shouldContinue()) { visual?.fail('Prefill stopped'); return; }
    const sensitive = await fillConfirmedSensitiveAnswers(root ?? document, privateLoad.answers, shouldContinue, visual);
    if (!shouldContinue()) { visual?.fail('Prefill stopped'); return; }
    const smartFilled = AUTOFILL_FEATURE_FLAGS.aiScreeningDrafts ? await runSmartAnswers({
      root:root ?? document,
      job:{jobUrl:pageUrl,companyName:'',roleTitle:'',jobDescription:resolved.source === 'generated_resume' ? resolved.jobDescription : ''},
      hasResume:resolved.source === 'generated_resume',snapshot:resolved.source === 'generated_resume' ? resolved.snapshot : undefined,shouldContinue,
    }) : 0;
    if (!shouldContinue()) { visual?.fail('Prefill stopped'); return; }
    visual?.finish({ filled: result.filled + sensitive.filled + smartFilled, skipped: scanApplicationFields(root ?? document).unansweredRequired });
  } catch {
    visual?.fail('Prefill paused. Try again.');
  }
}

if (isTopFrame) void withPrefillUndo(prefillFromActiveArtifact).catch(() => {}).finally(() => mountPrefillUndoFallback(requestPrefillUndo));
