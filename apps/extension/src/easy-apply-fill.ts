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

import { runPrefill, type PrefillOptions } from './easy-apply-engine';
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
};

const isTopFrame = window.top === window.self;

// Registered synchronously, before the top frame's async resolve round-trip, so
// a child frame is listening by the time the relay arrives.
if (!isTopFrame) {
  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type !== 'RUN_PREFILL_IN_CHILD_FRAME') return false;
    const prefill = (message.prefill ?? {}) as RelayedPrefill;
    void runPrefill({
      resume: prefill.resume,
      coverLetter: prefill.coverLetter,
      generatedContentHash: prefill.generatedContentHash,
      snapshot: prefill.snapshot,
      profileFallback: prefill.profileFallback,
      quietResultToast: true,
      quietIfNoForm: true,
    });
    return false;
  });
}

async function prefillFromActiveArtifact(): Promise<void> {
  if (!isTopFrame) return;

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
    await runPrefill({});
    return;
  }

  const prefill: PrefillOptions =
    resolved.source === 'generated_resume'
      ? {
          resume: resolved.resume,
          coverLetter: resolved.coverLetter,
          generatedContentHash: resolved.generatedContentHash,
          snapshot: resolved.snapshot,
          profileFallback: resolved.profileFallback,
        }
      : // Profile-only: nothing was generated for this posting, so no file is
        // attached. Never fall back to some other job's résumé.
        { profileFallback: resolved.profileFallback };

  chrome.runtime
    .sendMessage({ type: 'PREFILL_CHILD_FRAMES', prefill })
    .catch(() => {
      // A page with no accessible child frames is the normal case.
    });

  await runPrefill(prefill);
}

void prefillFromActiveArtifact();
