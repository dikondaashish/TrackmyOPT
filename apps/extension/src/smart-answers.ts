import {
  getLabelText,
  isControlVisible,
  setNativeValue,
} from './easy-apply-dom';
import { classifyField, SENSITIVE_FIELD_RE } from './easy-apply-matchers';
import { isSensitiveApplicationQuestion } from './sensitive-question-policy';
import {
  normalizeQuestionText,
  questionHash,
} from './screening-question-drafts';
import { flashAutofillField } from './autofill-visual-feedback';
import type { JobContextIdentity } from './resume-autofill-contract';
import {
  hasQuestionEvidence,
  hasUnsupportedTools,
} from './screening-answer-evidence';

interface SmartAnswerOptions {
  root: ParentNode;
  job: JobContextIdentity & { jobDescription?: string };
  hasResume: boolean;
  snapshot?: unknown;
  shouldContinue?: () => boolean;
}
const attempts = new WeakMap<Element, string>();
const running = new WeakSet<object>();
const notes = new WeakMap<Element, HTMLElement>();
const EXCLUDED =
  /\b(password|passcode|otp|mfa|bank|credit card|criminal|convict\w*|medical|health|accommod\w*|relocat\w*|commut\w*|start date|available to start|age|birth|pronouns|religion|marital)\b/i;
const QUESTION =
  /\b(what|why|how|describe|explain|tell us|tell me|provide|share|outline|discuss|give an example|additional information)\b/i;
const JOB_SPECIFIC =
  /\b(this|our|your|company|position|role|opportunity|apply|applying|interested|join|here)\b/i;
const MAX_QUESTIONS = 8;
type Reply = {
  ok?: boolean;
  draft?: string;
  error?: string;
  answer?: {
    normalizedQuestionText?: string;
    editedAnswer?: string;
    source?: string;
  };
};

async function request(message: object): Promise<Reply> {
  // Bound UI waiting; a slow backend may still finish, but its late answer is
  // never inserted or retried automatically (which could spend twice).
  let timer: number | undefined;
  try {
    return await Promise.race([
      chrome.runtime.sendMessage(message),
      new Promise<Reply>((resolve) => {
        timer = window.setTimeout(
          () => resolve({ ok: false, error: 'timeout' }),
          45_000
        );
      }),
    ]);
  } catch {
    return { ok: false, error: 'unavailable' };
  } finally {
    if (timer !== undefined) window.clearTimeout(timer);
  }
}

function writable(field: HTMLInputElement | HTMLTextAreaElement): boolean {
  if (
    !field.isConnected ||
    field.matches(':disabled') ||
    field.readOnly ||
    field.value.trim()
  )
    return false;
  for (let node: HTMLElement | null = field; node; node = node.parentElement) {
    if (
      node.hidden ||
      node.hasAttribute('inert') ||
      node.getAttribute('aria-hidden') === 'true'
    )
      return false;
    const style = node.ownerDocument.defaultView?.getComputedStyle(node);
    if (
      style?.display === 'none' ||
      style?.visibility === 'hidden' ||
      style?.opacity === '0'
    )
      return false;
  }
  return isControlVisible(field);
}
function validAnswer(text: unknown, limit: number): text is string {
  return (
    typeof text === 'string' &&
    Boolean(text.trim()) &&
    text.length <= limit &&
    !/NEEDS_USER_INPUT/.test(text) &&
    !isSensitiveApplicationQuestion(text) &&
    !EXCLUDED.test(text)
  );
}

/** Explicit Prefill only. No page-load or Continuous generation, no analytics,
 * no DOM event payloads containing answers, and no automatic answer persistence.
 */
export async function runSmartAnswers(
  options: SmartAnswerOptions
): Promise<number> {
  if (running.has(options.root)) return 0;
  running.add(options.root);
  const pageUrl = window.location.href;
  const allowed = () =>
    window.location.href === pageUrl && options.shouldContinue?.() !== false;
  let processed = 0;
  let generationBlocked = false;
  let filled = 0;
  try {
    const fields = Array.from(
      options.root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
        'textarea,input[type="text"],input:not([type])'
      )
    );
    for (const field of fields) {
      if (!allowed()) break;
      if (
        field.closest(
          '[id^="tmo-"],[class*="tmo-screening"],.tmo-smart-answer-note'
        ) ||
        !writable(field)
      )
        continue;
      const label = normalizeQuestionText(getLabelText(field));
      if (
        !QUESTION.test(label) ||
        classifyField(label) ||
        isSensitiveApplicationQuestion(label) ||
        SENSITIVE_FIELD_RE.test(label) ||
        EXCLUDED.test(label)
      )
        continue;
      const key = `${pageUrl}|${options.job.companyName}|${options.job.roleTitle}|${options.hasResume}|${label}`;
      if (attempts.get(field) === key) continue;
      if (processed++ >= MAX_QUESTIONS) break;
      attempts.set(field, key);
      const hash = await questionHash(label);
      const stillEmpty = () =>
        allowed() &&
        writable(field) &&
        normalizeQuestionText(getLabelText(field)) === label;
      if (!stillEmpty()) continue;
      notes.get(field)?.remove();
      const note = field.ownerDocument.createElement('div');
      note.className = 'tmo-smart-answer-note';
      note.style.cssText =
        'display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin:6px 0 12px;font:12px/1.5 system-ui;color:var(--tmo-widget-muted,#64748b);';
      const status = field.ownerDocument.createElement('span');
      status.setAttribute('role', 'status');
      status.textContent = 'Checking saved answers…';
      const remember = field.ownerDocument.createElement('button');
      remember.type = 'button';
      remember.textContent = 'Remember my answer';
      remember.hidden = true;
      remember.style.cssText =
        'border:1px solid #cbd5e1;border-radius:6px;padding:4px 8px;background:transparent;color:inherit;font:inherit;cursor:pointer;';
      note.append(status, remember);
      (field.closest('label') ?? field).after(note);
      notes.set(field, note);
      note.dataset.reviewState = 'pending';
      const limit = Math.min(
        field.maxLength >= 0 ? field.maxLength : 1200,
        2000
      );
      let generated = false;
      const updateRemember = () => {
        remember.hidden = !field.value.trim();
      };
      field.addEventListener('input', updateRemember);
      remember.addEventListener('click', async () => {
        if (
          !allowed() ||
          !field.isConnected ||
          !validAnswer(field.value, limit)
        ) {
          status.textContent = 'Enter an answer within the field limit first.';
          return;
        }
        remember.disabled = true;
        const answer = field.value;
        const response = await request({
          type: 'SAVE_SCREENING_ANSWER',
          answer: {
            questionHash: hash,
            normalizedQuestionText: label,
            editedAnswer: answer,
            source: generated ? 'user_edited_ai_draft' : 'user_written',
          },
        });
        if (!allowed()) return;
        remember.disabled = false;
        if (response?.ok && field.value === answer) {
          status.textContent = 'Saved for future applications';
          note.dataset.reviewState = 'reviewed';
          remember.hidden = true;
        } else
          status.textContent =
            'Could not save. Your application answer is unchanged.';
      });
      const saved = await request({
        type: 'LOAD_SCREENING_ANSWER',
        questionHash: hash,
      });
      if (!stillEmpty()) {
        note.remove();
        continue;
      }
      let answer: string | undefined;
      if (
        saved?.ok &&
        !JOB_SPECIFIC.test(label) &&
        saved.answer?.normalizedQuestionText === label &&
        ['user_written', 'user_edited_ai_draft'].includes(
          saved.answer.source ?? ''
        ) &&
        validAnswer(saved.answer.editedAnswer, limit)
      ) {
        answer = saved.answer.editedAnswer;
      } else if (!options.hasResume) {
        status.textContent =
          'Generate a resume for this job to enable AI answers, or add your own answer.';
      } else if (generationBlocked) {
        status.textContent = 'AI limit reached. Add your own answer.';
      } else if (!hasQuestionEvidence(label, options.snapshot)) {
        status.textContent =
          'Add your own answer — your resume does not provide enough detail.';
      } else {
        status.textContent = 'Drafting from your resume…';
        const response = await request({
          type: 'GENERATE_SCREENING_DRAFT',
          questionText: label,
          characterLimit: limit,
          jobUrl: options.job.jobUrl,
          companyName: options.job.companyName,
          roleTitle: options.job.roleTitle,
          jobDescription: options.job.jobDescription ?? '',
          regenerate: false,
        });
        if (!stillEmpty()) {
          note.remove();
          continue;
        }
        if (
          response?.ok &&
          validAnswer(response.draft, limit) &&
          !hasUnsupportedTools(response.draft, options.snapshot)
        ) {
          answer = response.draft;
          generated = true;
        } else {
          const error = response?.error ?? '';
          if (/limit|rate_limited/.test(error)) {
            generationBlocked = true;
            status.textContent = 'AI limit reached. Add your own answer.';
          } else if (
            /insufficient_context|artifact_|expired|job_changed/.test(error) ||
            response?.draft === 'NEEDS_USER_INPUT'
          )
            status.textContent =
              'Add your own answer — your resume does not provide enough detail.';
          else
            status.textContent =
              'Could not create a reliable draft. Add your own answer.';
        }
      }
      note.dataset.reviewState = 'needs-input';
      if (answer && stillEmpty()) {
        setNativeValue(field, answer.trim());
        filled++;
        flashAutofillField(field, 'filled');
        status.textContent = generated
          ? 'AI draft · Review'
          : 'Saved answer · Review';
        note.dataset.reviewState = 'needs-review';
        updateRemember();
      }
    }
  } finally {
    running.delete(options.root);
  }
  return filled;
}
