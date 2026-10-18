import { withPrefillUndo, getPrefillUndoState } from '../../prefill/prefill-undo';
import { runPrefill, findApplicationForm, type GeneratedResumeAttachment, type PrefillOptions } from '../../easy-apply/easy-apply-engine';
import { type BasicContactProfile, type ResumeAutofillSnapshotV1 } from '../../resume/resume-autofill-contract';
import { withPrefillModeGuard } from '../../prefill/prefill-mode-guard';
import { acceptPrefillRelay, waitForPrefillRelayTurn } from '../../prefill/prefill-relay-guard';
import { fillConfirmedSensitiveAnswers, normalizeSensitiveAnswerSession } from '../../prefill/sensitive-autofill';
import { loadEffectiveConfig } from '../../platform-config/effective-config-client';
import { autofillBlocked, autofillGates } from '../../platform-config/feature-gates';
/** Cross-origin ATS frames receive prefill through the background relay and fill here. */

export function runChildFramePrefillRelay(
  message: any,
  sendResponse: (response: any) => void,
): boolean {
  const relayCurrent = acceptPrefillRelay(message);
  if (!relayCurrent) return false;
  const prefill = (message.prefill ?? {}) as {
    resume?: GeneratedResumeAttachment;
    coverLetter?: PrefillOptions['coverLetter'];
    generatedContentHash?: string;
    snapshot?: ResumeAutofillSnapshotV1;
    profileFallback?: BasicContactProfile;
    autofillSkills?: boolean;
    allowRowCreation?: boolean;
    quietResultToast?: boolean;
    sensitiveAnswers?: unknown;
  };
  const sensitiveAnswers = normalizeSensitiveAnswerSession(
    prefill.sensitiveAnswers
  );
  void waitForPrefillRelayTurn(relayCurrent, () => getPrefillUndoState().busy).then(ready => ready ? withPrefillUndo(() => withPrefillModeGuard(message.continuous === true, async guard => {
    // Each frame enforces the same emergency switches as the top frame.
    await loadEffectiveConfig();
    const gates = autofillGates();
    if (gates.block.blocked) return;
    const shouldContinue = () => guard() && !autofillBlocked().blocked;
    const result = await runPrefill({
      blockedCapabilities: gates.blockedCapabilities,
      fieldRules: gates.fieldRules,
      resume: prefill.resume,
      coverLetter: prefill.coverLetter,
      generatedContentHash: prefill.generatedContentHash,
      snapshot: prefill.snapshot,
      profileFallback: prefill.profileFallback,
      autofillSkills: prefill.autofillSkills === true,
      allowRowCreation: prefill.allowRowCreation === true && message.continuous !== true,
      quietResultToast: prefill.quietResultToast === true,
      quietIfNoForm: true,
      animateFields: message.continuous !== true,
      shouldContinue: () => shouldContinue() && relayCurrent(),
    });
    if (!result.paused && sensitiveAnswers && shouldContinue() && relayCurrent()) {
      await fillConfirmedSensitiveAnswers(
        findApplicationForm() ?? document,
        sensitiveAnswers,
        () => shouldContinue() && relayCurrent(),
        undefined,
        { blockedCapabilities: gates.blockedCapabilities },
      );
    }
  }), message.undoRunId).then(() => true) : false).then(completed => sendResponse({ ok: completed && relayCurrent() }))
    .catch(() => sendResponse({ ok: false }));
  return true;
}
