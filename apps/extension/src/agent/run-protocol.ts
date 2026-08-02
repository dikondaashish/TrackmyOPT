/**
 * Agent run protocol — shared vocabulary for long-running agent work.
 *
 * Before this, every agent action was a single `chrome.runtime.sendMessage`
 * round trip. Tailoring a résumé makes six network calls and takes 30–60s, but
 * the UI saw one boolean: pending or done. There was no way to show which step
 * was running, and no way to stop it.
 *
 * This module defines the states, steps, and messages. `run-session.ts` drives
 * them in the background; `run-client.ts` consumes them in the UI.
 */

/* ------------------------------------------------------------------ states */

export const RUN_STATES = [
    'idle',
    'preparing',
    'running',
    'awaiting_approval',
    'succeeded',
    'failed',
    'cancelled',
] as const;

export type RunState = (typeof RUN_STATES)[number];

/** States from which no further transition happens. */
export const TERMINAL_STATES: readonly RunState[] = ['succeeded', 'failed', 'cancelled'];

export function isTerminal(state: RunState): boolean {
    return TERMINAL_STATES.includes(state);
}

const ALLOWED_TRANSITIONS: Record<RunState, readonly RunState[]> = {
    idle: ['preparing', 'cancelled'],
    preparing: ['running', 'failed', 'cancelled'],
    running: ['running', 'awaiting_approval', 'succeeded', 'failed', 'cancelled'],
    awaiting_approval: ['running', 'failed', 'cancelled'],
    succeeded: [],
    failed: ['preparing'], // retry
    cancelled: ['preparing'], // retry
};

export function canTransition(from: RunState, to: RunState): boolean {
    return ALLOWED_TRANSITIONS[from].includes(to);
}

/* ------------------------------------------------------------------- steps */

/** Steps of the résumé tailoring pipeline, in execution order. */
export const RESUME_RUN_STEPS = [
    'load_resume',
    'baseline_score',
    'tailor',
    'compile',
    'repair',
    'extract',
    'package',
] as const;

export type ResumeRunStep = (typeof RESUME_RUN_STEPS)[number];

/** Human-readable, present-tense labels. Shown verbatim in the run console. */
export const STEP_LABELS: Record<ResumeRunStep, string> = {
    load_resume: 'Loading your résumé',
    baseline_score: 'Scoring against the job',
    tailor: 'Tailoring with AI',
    compile: 'Compiling PDF',
    repair: 'Fixing formatting',
    extract: 'Reading fields for autofill',
    package: 'Packaging result',
};

/**
 * Steps that may be skipped without failing the run. The UI renders these as
 * "skipped" rather than as an error.
 */
export const OPTIONAL_STEPS: readonly ResumeRunStep[] = [
    'baseline_score',
    'repair',
    'extract',
];

export type StepStatus = 'pending' | 'active' | 'done' | 'skipped' | 'failed';

export interface StepSnapshot {
    id: ResumeRunStep;
    label: string;
    status: StepStatus;
    /** Short result detail, e.g. "72/100" or "2 issues fixed". */
    detail?: string;
    startedAt?: number;
    endedAt?: number;
}

/* ---------------------------------------------------------------- messages */

export const RUN_PORT_NAME = 'tmo-agent-run';

/** UI -> background. */
export type RunCommand =
    | { type: 'start'; runId: string; kind: 'resume'; input: Record<string, unknown> }
    | { type: 'cancel'; runId: string }
    | { type: 'approve'; runId: string; approvalId: string }
    | { type: 'reject'; runId: string; approvalId: string }
    /**
     * Sent every KEEPALIVE_INTERVAL_MS while a run is in flight. The résumé
     * pipeline's longest step (tailoring, with a model fallback retry) can run
     * well past Chrome's ~30s service-worker idle timeout; without traffic on
     * the port, Chrome kills the background script mid-request and the run
     * surfaces as a generic "Lost connection to the extension" failure that
     * has nothing to do with the network or the user's auth. Any message on
     * an open port resets that idle timer, so the payload here is never read —
     * receiving it is the entire point.
     */
    | { type: 'keepalive' };

/** Send a keepalive at least this often. Comfortably under the ~30s ceiling. */
export const KEEPALIVE_INTERVAL_MS = 15_000;

/** background -> UI. */
export type RunEvent =
    | { type: 'state'; runId: string; state: RunState; steps: StepSnapshot[] }
    | { type: 'step'; runId: string; step: StepSnapshot }
    | {
          type: 'approval';
          runId: string;
          approvalId: string;
          title: string;
          /** Why the agent is pausing — shown to the user verbatim. */
          reason: string;
          items: string[];
      }
    | { type: 'done'; runId: string; result: unknown }
    | { type: 'error'; runId: string; code: string; message: string; retryable: boolean };

/* ------------------------------------------------------------------ errors */

/**
 * Maps the pipeline's existing error codes to user-facing copy. Previously the
 * widget showed raw codes like `compile_failed`.
 */
export const ERROR_COPY: Record<string, { message: string; retryable: boolean }> = {
    not_signed_in: { message: 'Sign in to TrackMyOPT to tailor résumés.', retryable: false },
    no_job_description: { message: 'No job description found on this page.', retryable: false },
    no_base_resume: { message: 'Upload a résumé first, then try again.', retryable: false },
    no_template: { message: 'Choose a template first.', retryable: false },
    limit: { message: "You've used all your generations this month.", retryable: false },
    base_failed: { message: "Couldn't load your saved résumé.", retryable: true },
    generate_failed: { message: 'The AI could not tailor this résumé.', retryable: true },
    compile_failed: { message: "The résumé didn't compile. Try again or pick another template.", retryable: true },
    network: { message: 'Network problem. Check your connection.', retryable: true },
    cancelled: { message: 'Stopped.', retryable: true },
    unknown: { message: 'Something went wrong.', retryable: true },
};

export function describeError(code: string): { code: string; message: string; retryable: boolean } {
    const entry = ERROR_COPY[code] ?? ERROR_COPY.unknown;
    return { code, ...entry };
}

/** Fresh, ordered step list with everything pending. */
export function initialSteps(): StepSnapshot[] {
    return RESUME_RUN_STEPS.map((id) => ({
        id,
        label: STEP_LABELS[id],
        status: 'pending' as StepStatus,
    }));
}

export function newRunId(): string {
    return `run-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
