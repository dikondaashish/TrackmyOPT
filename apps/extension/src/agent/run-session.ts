/**
 * Background-side driver for an agent run.
 *
 * Owns the state machine, the step list, and the AbortController. A pipeline
 * reports progress by calling `session.step(...)` and passes `session.signal`
 * into every `fetch`, which is what makes a run cancellable.
 */

import {
    canTransition,
    describeError,
    initialSteps,
    isTerminal,
    OPTIONAL_STEPS,
    STEP_LABELS,
    type ResumeRunStep,
    type RunEvent,
    type RunState,
    type StepSnapshot,
    type StepStatus,
} from './run-protocol';

export type RunEmitter = (event: RunEvent) => void;

/** Thrown when a run is cancelled. Distinguished from genuine failures. */
export class RunCancelledError extends Error {
    constructor() {
        super('cancelled');
        this.name = 'RunCancelledError';
    }
}

export class RunSession {
    readonly runId: string;
    private readonly emit: RunEmitter;
    private readonly controller = new AbortController();
    private steps: StepSnapshot[] = initialSteps();
    private currentState: RunState = 'idle';
    private now: () => number;

    constructor(runId: string, emit: RunEmitter, options: { now?: () => number } = {}) {
        this.runId = runId;
        this.emit = emit;
        this.now = options.now ?? (() => Date.now());
    }

    get signal(): AbortSignal {
        return this.controller.signal;
    }

    get state(): RunState {
        return this.currentState;
    }

    get snapshot(): StepSnapshot[] {
        return this.steps.map((step) => ({ ...step }));
    }

    /** Moves to a new state, ignoring transitions the machine forbids. */
    setState(next: RunState): boolean {
        if (!canTransition(this.currentState, next)) return false;
        this.currentState = next;
        this.emit({ type: 'state', runId: this.runId, state: next, steps: this.snapshot });
        return true;
    }

    /** Marks a step and emits it. Also advances the run into `running`. */
    step(id: ResumeRunStep, status: StepStatus, detail?: string): void {
        const index = this.steps.findIndex((step) => step.id === id);
        if (index === -1) return;

        const previous = this.steps[index];
        const next: StepSnapshot = {
            ...previous,
            label: STEP_LABELS[id],
            status,
            ...(detail !== undefined ? { detail } : {}),
        };
        if (status === 'active') next.startedAt = this.now();
        if (status === 'done' || status === 'failed' || status === 'skipped') {
            next.endedAt = this.now();
        }
        this.steps[index] = next;

        if (status === 'active' && this.currentState === 'preparing') {
            this.setState('running');
        }
        this.emit({ type: 'step', runId: this.runId, step: { ...next } });
    }

    /**
     * Runs `work` as a step: marks it active, then done (or failed/skipped).
     * Optional steps that throw are recorded as skipped so the run continues —
     * this mirrors the pipeline, where the baseline score and field extraction
     * are already best-effort.
     */
    async track<T>(
        id: ResumeRunStep,
        work: () => Promise<T>,
        options: { detail?: (value: T) => string | undefined } = {}
    ): Promise<T | undefined> {
        this.throwIfCancelled();
        this.step(id, 'active');
        try {
            const value = await work();
            this.throwIfCancelled();
            this.step(id, 'done', options.detail?.(value));
            return value;
        } catch (error) {
            // Once aborted, normalise to RunCancelledError whatever the inner
            // failure was — a cancelled fetch rejects with AbortError, which
            // callers would otherwise have to special-case alongside genuine
            // errors. Cancellation must never be downgraded to "skipped".
            if (this.controller.signal.aborted || error instanceof RunCancelledError) {
                throw error instanceof RunCancelledError ? error : new RunCancelledError();
            }
            if (OPTIONAL_STEPS.includes(id)) {
                this.step(id, 'skipped', 'unavailable');
                return undefined;
            }
            this.step(id, 'failed');
            throw error;
        }
    }

    throwIfCancelled(): void {
        if (this.controller.signal.aborted) throw new RunCancelledError();
    }

    cancel(): void {
        if (isTerminal(this.currentState)) return;
        this.controller.abort();
        // Any step still running becomes pending again rather than failed —
        // the user stopped it, it did not break.
        this.steps = this.steps.map((step) =>
            step.status === 'active' ? { ...step, status: 'pending', endedAt: this.now() } : step
        );
        this.currentState = 'cancelled';
        this.emit({ type: 'state', runId: this.runId, state: 'cancelled', steps: this.snapshot });
    }

    succeed(result: unknown): void {
        if (isTerminal(this.currentState)) return;
        this.currentState = 'succeeded';
        this.emit({ type: 'state', runId: this.runId, state: 'succeeded', steps: this.snapshot });
        this.emit({ type: 'done', runId: this.runId, result });
    }

    fail(code: string): void {
        if (isTerminal(this.currentState)) return;
        this.currentState = 'failed';
        this.emit({ type: 'state', runId: this.runId, state: 'failed', steps: this.snapshot });
        const described = describeError(code);
        this.emit({
            type: 'error',
            runId: this.runId,
            code: described.code,
            message: described.message,
            retryable: described.retryable,
        });
    }
}

/** Registry of live runs, so `cancel` can reach the right session. */
export class RunRegistry {
    private readonly sessions = new Map<string, RunSession>();

    create(runId: string, emit: RunEmitter): RunSession {
        this.cancel(runId);
        const session = new RunSession(runId, emit);
        this.sessions.set(runId, session);
        return session;
    }

    get(runId: string): RunSession | undefined {
        return this.sessions.get(runId);
    }

    cancel(runId: string): boolean {
        const session = this.sessions.get(runId);
        if (!session) return false;
        session.cancel();
        this.sessions.delete(runId);
        return true;
    }

    /** Cancels everything — used when a port disconnects. */
    cancelAll(): void {
        for (const runId of [...this.sessions.keys()]) this.cancel(runId);
    }

    finish(runId: string): void {
        this.sessions.delete(runId);
    }

    get size(): number {
        return this.sessions.size;
    }
}
