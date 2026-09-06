import { WEBSITE_URL } from './config';
import { performExtensionSignOut } from './signOut';
import { purgeLegacySyncToken } from './token-store';
import {
  FREE_AUTOFILL_PLAN_ENTITLEMENTS,
} from './autofill-plan-entitlements';
import { AUTOFILL_FEATURE_FLAGS } from './autofill-feature-flags';
import { RunRegistry, RunCancelledError } from './agent/run-session';
import { RUN_PORT_NAME, type RunCommand } from './agent/run-protocol';
import type {
  GeneratedCoverLetterAttachment,
  V1PrefillPayloadRequest,
} from './resume-autofill-contract';
import {
  validateGeneratedCoverLetterAttachment,
  validateResumeAutofillSnapshotV1,
} from './resume-artifact-validator';
import { normalizeSensitiveAnswerSession } from './sensitive-autofill';
import {
  beginAuth,
  getAutofillPlanEntitlements,
  getExtensionBearerToken,
} from './background-auth';
import {
  clearCurrentGeneratedResumeArtifact,
} from './background-resume-artifact';
import {
  analyzeJobFit,
  getAutofillProfile,
  getOptClockNudge,
  getPrivateApplicationAnswers,
  listSavedResumes,
  resolveCurrentV1PrefillPayload,
  sanitizeBasicContactProfile,
  trackWidgetEvent,
  uploadResumeFile,
} from './background-profile';
import {
  requestSavedScreeningAnswer,
  requestScreeningDraft,
  saveScreeningAnswerForCurrentUser,
} from './background-screening';
import {
  generateCoverLetterForCurrentArtifact,
  recompileCoverLetterForCurrentArtifact,
} from './background-cover-letter';
import { generateTailoredResume } from './background-tailored-resume';
import {
  checkJobSaved,
  handleAddJobToTracker,
} from './background-job-tracker';

// One-time migration: older builds stored the JWT in chrome.storage.sync.
// Purge any leftover so no credential material remains in synced storage.
chrome.runtime.onInstalled.addListener(() => {
  purgeLegacySyncToken().catch(() => {});
});

// ISS-039: refresh token whenever the user focuses the browser/extension —
// this guarantees that after a logout/switch on the web side, the extension
// picks up the new identity within seconds rather than up to 10 minutes.
// Forcing a refresh on every focus change meant one network round trip each
// time the user alt-tabbed back into Chrome. The point is to notice a web-side
// login switch within seconds, which a short floor still achieves.
const FOCUS_REFRESH_MIN_INTERVAL_MS = 60_000;
let lastFocusTokenRefreshAt = 0;

chrome.windows?.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) return;
  const now = Date.now();
  if (now - lastFocusTokenRefreshAt < FOCUS_REFRESH_MIN_INTERVAL_MS) return;
  lastFocusTokenRefreshAt = now;
  await getExtensionBearerToken(true);
});

chrome.runtime.setUninstallURL(`${WEBSITE_URL}/extension/uninstall`);

// Internal message listener (from popup and content scripts)
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'OPEN_SIDE_PANEL') {
    // Must run in the same turn as the originating user gesture.
    const opened = openSidePanelForTab(_sender.tab?.id, _sender.tab?.windowId);
    sendResponse({ ok: opened });
    return false;
  }
  if (msg.type === 'BEGIN_AUTH') {
    beginAuth().then(()=>sendResponse({ok:true})).catch(e=>sendResponse({ok:false, err:String(e)}));
    return true;
  }
  if (msg.type === 'ADD_JOB_TO_TRACKER') {
    const status = msg.status === 'Wishlist' ? 'Wishlist' : 'Applied';
    handleAddJobToTracker(msg.job, !!msg.autoAdd, status).then(sendResponse).catch((e) => {
      sendResponse({ ok: false, error: e instanceof Error ? e.message : 'Failed to add job' });
    });
    return true; // async response
  }
  if (msg.type === 'EXTENSION_SIGN_OUT') {
    performExtensionSignOut()
      .then(async () => {
        await clearCurrentGeneratedResumeArtifact();
        const tabs = await chrome.tabs.query({}).catch(() => []);
        await Promise.allSettled(
          tabs
            .filter((tab) => typeof tab.id === 'number')
            .map((tab) =>
              chrome.tabs.sendMessage(tab.id!, {
                type: 'CLEAR_RESUME_AUTOFILL_ARTIFACT',
              })
            )
        );
        sendResponse({ ok: true as const });
      })
      .catch((e) => sendResponse({ ok: false as const, error: e instanceof Error ? e.message : String(e) }));
    return true;
  }
  if (msg.type === 'SUBMIT_FEEDBACK') {
    // Post the in-popup feedback to the backend. Bearer-linked when signed in;
    // the endpoint also accepts anonymous feedback.
    (async () => {
      try {
        const bearer = await getExtensionBearerToken();
        const res = await fetch(`${WEBSITE_URL}/api/extension/feedback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
          },
          body: JSON.stringify(msg.payload || {}),
        });
        const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
        sendResponse({ ok: res.ok && data.ok !== false, error: data.error });
      } catch {
        sendResponse({ ok: false, error: 'network' });
      }
    })();
    return true;
  }
  if (msg.type === 'GET_AUTOFILL_PROFILE') {
    // Resolve the user's name/email for Easy Apply prefill. The bearer token
    // stays here — only these non-sensitive fields are returned to the content
    // script running on linkedin.com.
    getAutofillProfile()
      .then((profile) => sendResponse(profile))
      .catch(() => sendResponse({ ok: false as const, error: 'error' }));
    return true;
  }
  if (msg.type === 'GET_AUTOFILL_ENTITLEMENTS') {
    getAutofillPlanEntitlements()
      .then(sendResponse)
      .catch(() =>
        sendResponse({
          ok: false,
          planTier: 'free',
          entitlements: FREE_AUTOFILL_PLAN_ENTITLEMENTS,
        })
      );
    return true;
  }
  if (msg.type === 'GET_PRIVATE_APPLICATION_ANSWERS') {
    getPrivateApplicationAnswers(_sender.tab?.url)
      .then((response) => sendResponse(response))
      .catch(() =>
        sendResponse({ ok: false as const, error: 'unavailable' })
      );
    return true;
  }
  if (msg.type === 'GET_JOB_PORTAL_LOGIN_FOR_TAB') {
    getPrivateApplicationAnswers(_sender.tab?.url)
      .then((response) => {
        if (!response.ok) {
          sendResponse(response);
          return;
        }
        sendResponse({
          ok: true,
          credential: response.data?.defaultJobPortalLogin ?? null,
        });
      })
      .catch(() =>
        sendResponse({ ok: false as const, error: 'unavailable' })
      );
    return true;
  }
  if (msg.type === 'RESOLVE_V1_PREFILL_PAYLOAD') {
    const request: V1PrefillPayloadRequest = {
      now: String(msg.request?.now ?? ''),
      jobContext: {
        jobUrl: String(msg.request?.jobContext?.jobUrl ?? ''),
        companyName: String(msg.request?.jobContext?.companyName ?? ''),
        roleTitle: String(msg.request?.jobContext?.roleTitle ?? ''),
      },
    };
    resolveCurrentV1PrefillPayload(request, {
      discardRejectedArtifact: msg.discardRejectedArtifact !== false,
    })
      .then((response) => {
        sendResponse(response);
      })
      .catch(() => sendResponse({ ok: false as const, error: 'unavailable' }));
    return true;
  }
  if (msg.type === 'PREFILL_CHILD_FRAMES') {
    if (!_sender.tab?.id) {
      sendResponse({ ok: false, error: 'missing_tab' });
      return true;
    }
    const requestedPrefill = (msg.prefill ?? { resume: msg.resume }) as {
      resume?: { pdfBase64?: unknown; filename?: unknown };
      coverLetter?: unknown;
      generatedContentHash?: unknown;
      snapshot?: unknown;
      profileFallback?: unknown;
      autofillSkills?: unknown;
      quietResultToast?: unknown;
      sensitiveAnswers?: unknown;
    };
    const generatedContentHash =
      AUTOFILL_FEATURE_FLAGS.artifactPrefill &&
      typeof requestedPrefill.generatedContentHash === 'string' &&
      /^[a-f0-9]{64}$/i.test(requestedPrefill.generatedContentHash)
        ? requestedPrefill.generatedContentHash
        : undefined;
    const requestedResume = requestedPrefill.resume;
    const resume = AUTOFILL_FEATURE_FLAGS.artifactPrefill &&
      requestedResume &&
      typeof requestedResume.pdfBase64 === 'string' &&
      requestedResume.pdfBase64.length <= 25_000_000 &&
      typeof requestedResume.filename === 'string'
      ? {
          pdfBase64: requestedResume.pdfBase64,
          filename: requestedResume.filename.slice(0, 180),
        }
      : undefined;
    const coverLetter =
      AUTOFILL_FEATURE_FLAGS.coverLetter &&
      generatedContentHash &&
      validateGeneratedCoverLetterAttachment(
        requestedPrefill.coverLetter,
        generatedContentHash
      )
        ? (requestedPrefill.coverLetter as GeneratedCoverLetterAttachment)
        : undefined;
    const snapshot =
      AUTOFILL_FEATURE_FLAGS.artifactPrefill &&
      validateResumeAutofillSnapshotV1(requestedPrefill.snapshot)
      ? requestedPrefill.snapshot
      : undefined;
    const profileFallback = sanitizeBasicContactProfile(
      requestedPrefill.profileFallback
    );
    chrome.tabs.sendMessage(_sender.tab.id, {
      type: 'RUN_PREFILL_IN_CHILD_FRAME',
      prefill: {
        resume,
        coverLetter,
        generatedContentHash,
        snapshot,
        profileFallback,
        autofillSkills:
          AUTOFILL_FEATURE_FLAGS.skills &&
          requestedPrefill.autofillSkills === true,
        quietResultToast: requestedPrefill.quietResultToast === true,
        sensitiveAnswers:
          AUTOFILL_FEATURE_FLAGS.guidedAutopilot
            ? normalizeSensitiveAnswerSession(requestedPrefill.sensitiveAnswers)
            : undefined,
      },
    }).then(() => sendResponse({ ok: true })).catch(() => {
      // A page without child-frame receivers is normal; the top-frame engine
      // has already run, so this is not a user-visible error.
      sendResponse({ ok: true, childFramesAvailable: false });
    });
    return true;
  }
  if (msg.type === 'LIST_SAVED_RESUMES') {
    listSavedResumes()
      .then((res) => sendResponse(res))
      .catch(() => sendResponse({ ok: false as const, error: 'error' }));
    return true;
  }
  if (msg.type === 'UPLOAD_RESUME_FILE') {
    uploadResumeFile({
      filename: String(msg.filename ?? ''),
      fileType: String(msg.fileType ?? ''),
      fileBase64: String(msg.fileBase64 ?? ''),
    })
      .then((res) => sendResponse(res))
      .catch(() => sendResponse({ success: false, error: 'error' }));
    return true;
  }
  if (msg.type === 'GENERATE_RESUME') {
    // Orchestrate selected resume -> tailored LaTeX -> compiled PDF. Bearer
    // stays in the background; the page receives only the result and an opaque
    // authenticated editor-handoff URL.
    clearCurrentGeneratedResumeArtifact().then(() => generateTailoredResume({
      jobDescription: String(msg.jobDescription ?? ''),
      resumeId: String(msg.resumeId ?? ''),
      templateId: String(msg.templateId ?? ''),
      companyName: String(msg.companyName ?? ''),
      roleTitle: String(msg.roleTitle ?? ''),
      jobUrl: String(msg.jobUrl ?? ''),
      jobKey: String(msg.jobKey ?? ''),
      outputFilename: String(msg.outputFilename ?? 'TrackMyOPT-resume.pdf'),
      focusKeywords: Array.isArray(msg.focusKeywords)
        ? msg.focusKeywords.map((keyword: unknown) => String(keyword ?? '')).filter(Boolean)
        : [],
      alignJobTitles: msg.alignJobTitles === true,
      baselineScore: typeof msg.baselineScore === 'number' ? msg.baselineScore : undefined,
      applicationId:
        typeof msg.applicationId === 'string' && msg.applicationId.trim()
          ? msg.applicationId.trim()
          : undefined,
      resumeText: typeof msg.resumeText === 'string' ? msg.resumeText : undefined,
    }))
      .then((res) => sendResponse(res))
      .catch(() => sendResponse({ ok: false as const, error: 'error' }));
    return true;
  }
  if (msg.type === 'GENERATE_COVER_LETTER') {
    if (!AUTOFILL_FEATURE_FLAGS.coverLetter) {
      sendResponse({ ok: false, error: 'feature_disabled' });
      return false;
    }
    generateCoverLetterForCurrentArtifact({
      artifactId: String(msg.artifactId ?? ''),
      jobDescription: String(msg.jobDescription ?? ''),
      isRegeneration: msg.isRegeneration === true,
    }).then(sendResponse).catch(() => sendResponse({ ok: false, error: 'generation_failed' }));
    return true;
  }
  if (msg.type === 'RECOMPILE_COVER_LETTER') {
    if (!AUTOFILL_FEATURE_FLAGS.coverLetter) {
      sendResponse({ ok: false, error: 'feature_disabled' });
      return false;
    }
    recompileCoverLetterForCurrentArtifact({
      artifactId: String(msg.artifactId ?? ''),
      editedText: String(msg.editedText ?? ''),
      sourceContentHash: String(msg.sourceContentHash ?? ''),
    }).then(sendResponse).catch(() => sendResponse({ ok: false, error: 'compile_failed' }));
    return true;
  }
  if (msg.type === 'GENERATE_SCREENING_DRAFT') {
    if (!AUTOFILL_FEATURE_FLAGS.aiScreeningDrafts) {
      sendResponse({ ok: false, error: 'feature_disabled' });
      return false;
    }
    requestScreeningDraft(msg).then(sendResponse).catch(() => sendResponse({ ok: false, error: 'generation_failed' }));
    return true;
  }
  if (msg.type === 'LOAD_SCREENING_ANSWER' || msg.type === 'DELETE_SCREENING_ANSWER') {
    requestSavedScreeningAnswer(msg.type === 'LOAD_SCREENING_ANSWER' ? 'GET' : 'DELETE', String(msg.questionHash ?? ''))
      .then(sendResponse).catch(() => sendResponse({ ok: false, error: 'storage_failed' }));
    return true;
  }
  if (msg.type === 'SAVE_SCREENING_ANSWER') {
    saveScreeningAnswerForCurrentUser(msg.answer).then(sendResponse)
      .catch(() => sendResponse({ ok: false, error: 'storage_failed' }));
    return true;
  }
  if (msg.type === 'CHECK_JOB_SAVED') {
    // Look up whether the current posting is already in the tracker. Bearer
    // stays in the worker; the content script only receives the boolean/status.
    checkJobSaved({
      jobUrl: String(msg.jobUrl ?? ''),
      companyName: String(msg.companyName ?? ''),
      roleTitle: String(msg.roleTitle ?? ''),
    })
      .then((res) => sendResponse(res))
      .catch(() => sendResponse({ ok: false as const, error: 'error' }));
    return true;
  }
  if (msg.type === 'GET_OPT_CLOCK_NUDGE') {
    getOptClockNudge()
      .then((res) => sendResponse(res))
      .catch(() => sendResponse({ ok: false as const, error: 'error' }));
    return true;
  }
  if (msg.type === 'TRACK_WIDGET_EVENT') {
    trackWidgetEvent(msg.event, msg.properties)
      .then((res) => sendResponse(res))
      .catch(() => sendResponse({ ok: false as const, error: 'network' }));
    return true;
  }
  if (msg.type === 'ANALYZE_JOB_FIT') {
    // Fetch the user's base resume + run the ATS gap analysis. The resume text
    // and Bearer token never enter the page — only the score/keywords return.
    analyzeJobFit({ jobDescription: String(msg.jobDescription ?? '') })
      .then((res) => sendResponse(res))
      .catch(() => sendResponse({ ok: false as const, error: 'error' }));
    return true;
  }
});

/**
 * Long-running agent work runs over a port rather than a single sendMessage, so
 * the UI can show which step is executing and stop it mid-flight. The port also
 * acts as a liveness signal: if the UI disconnects, the run is cancelled rather
 * than burning quota on a result nobody will see.
 */
const runRegistry = new RunRegistry();

/**
 * Side panel availability. Chrome 114+ only, so every call is guarded — an
 * older Chrome keeps the popup and simply never sees the panel.
 */
if (chrome.sidePanel?.setPanelBehavior) {
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: false })
    .catch(() => {
      // Non-fatal: the popup remains the primary entry point.
    });
}

/**
 * Opening the side panel must happen inside a user-gesture turn, so the widget
 * sends this message straight from its click handler.
 */
function openSidePanelForTab(tabId: number | undefined, windowId: number | undefined): boolean {
  if (!chrome.sidePanel?.open) return false;
  try {
    if (tabId !== undefined) void chrome.sidePanel.open({ tabId });
    else if (windowId !== undefined) void chrome.sidePanel.open({ windowId });
    else return false;
    return true;
  } catch {
    return false;
  }
}

chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== RUN_PORT_NAME) return;

  let activeRunId: string | null = null;

  port.onMessage.addListener(async (raw) => {
    const command = raw as RunCommand;
    if (!command || typeof command !== 'object') return;

    // No-op: receiving any message on the port is what resets Chrome's
    // service-worker idle timer. See the KEEPALIVE_INTERVAL_MS doc comment.
    if (command.type === 'keepalive') return;

    if (command.type === 'cancel') {
      runRegistry.cancel(command.runId);
      return;
    }
    if (command.type !== 'start' || command.kind !== 'resume') return;

    activeRunId = command.runId;
    const session = runRegistry.create(command.runId, (event) => {
      try {
        port.postMessage(event);
      } catch {
        // Port closed mid-run; cancellation is handled by onDisconnect.
      }
    });

    session.setState('preparing');
    try {
      const result = await generateTailoredResume(
        command.input as Parameters<typeof generateTailoredResume>[0],
        session
      );
      if (session.state === 'cancelled') return;
      if (result.ok) session.succeed(result);
      else session.fail(result.error ?? 'unknown');
    } catch (error) {
      if (session.state === 'cancelled' || error instanceof RunCancelledError) return;
      session.fail(error instanceof Error && error.name === 'AbortError' ? 'cancelled' : 'unknown');
    } finally {
      runRegistry.finish(command.runId);
    }
  });

  port.onDisconnect.addListener(() => {
    if (activeRunId) runRegistry.cancel(activeRunId);
  });
});

// External message listener (from web app)
chrome.runtime.onMessageExternal.addListener((msg, sender, sendResponse) => {
  // Respond to ping to confirm extension is installed
  if (msg.type === 'PING') {
    sendResponse({ ok: true, installed: true, version: chrome.runtime.getManifest().version });
    return true;
  }
  
  // Check extension status - called from Settings page
  if (msg.type === 'TMO_CHECK_EXTENSION') {
    // Respond that extension is installed
    sendResponse({ 
      ok: true, 
      installed: true, 
      version: chrome.runtime.getManifest().version,
      type: 'TMO_EXTENSION_PRESENT'
    });
    
    // Also inject localStorage marker into the webpage if possible
    if (sender.tab?.id) {
      chrome.scripting.executeScript({
        target: { tabId: sender.tab.id },
        func: (version: string) => {
          localStorage.setItem('tmo_extension_connected', 'true');
          localStorage.setItem('tmo_extension_version', version);
          localStorage.setItem('tmo_extension_last_sync', new Date().toISOString());
        },
        args: [chrome.runtime.getManifest().version]
      }).catch(() => {
        // Scripting might fail if permissions aren't granted
      });
    }
    return true;
  }
  
  // Open a specific tool in the extension popup
  if (msg.type === 'OPEN_TOOL') {
    const toolPage = msg.tool;
    
    // Save the requested page so popup opens to it
    chrome.storage.local.set({ lastPage: toolPage }).then(() => {
      if (chrome.action && chrome.action.openPopup) {
        chrome.action.openPopup().then(() => {
          sendResponse({ ok: true, opened: true });
        }).catch(() => {
          sendResponse({ ok: true, opened: false, message: 'Click the TrackMyOPT extension icon to open the tool' });
        });
      } else {
        sendResponse({ ok: true, opened: false, message: 'Click the TrackMyOPT extension icon to open the tool' });
      }
    });
    return true;
  }
  
  sendResponse({ ok: false, error: 'Unknown message type' });
  return true;
});
