/**
 * UI-side client for agent runs.
 *
 * Opens a port to the background, forwards commands, and surfaces events. The
 * port also acts as a liveness signal: if the UI goes away (navigation, panel
 * close), the background cancels the run instead of burning quota on a result
 * nobody will see.
 */

import {
    RUN_PORT_NAME,
    initialSteps,
    isTerminal,
    newRunId,
    type RunEvent,
    type RunState,
    type StepSnapshot,
} from './run-protocol';

export interface RunObserver {
    onState?: (state: RunState, steps: StepSnapshot[]) => void;
    onStep?: (step: StepSnapshot) => void;
    onApproval?: (approval: Extract<RunEvent, { type: 'approval' }>) => void;
    onDone?: (result: unknown) => void;
    onError?: (error: { code: string; message: string; retryable: boolean }) => void;
}

type PortLike = {
    postMessage: (message: unknown) => void;
    disconnect: () => void;
    onMessage: { addListener: (fn: (message: unknown) => void) => void };
    onDisconnect: { addListener: (fn: () => void) => void };
};

export interface RunClientOptions {
    /** Injectable for tests; defaults to chrome.runtime.connect. */
    connect?: () => PortLike;
}

export class AgentRunClient {
    private port: PortLike | null = null;
    private runId: string | null = null;
    private observer: RunObserver = {};
    private lastState: RunState = 'idle';
    private lastSteps: StepSnapshot[] = initialSteps();
    private readonly connectFn: () => PortLike;

    constructor(options: RunClientOptions = {}) {
        this.connectFn =
            options.connect ??
            (() => chrome.runtime.connect({ name: RUN_PORT_NAME }) as unknown as PortLike);
    }

    get state(): RunState {
        return this.lastState;
    }

    get steps(): StepSnapshot[] {
        return this.lastSteps.map((step) => ({ ...step }));
    }

    get activeRunId(): string | null {
        return this.runId;
    }

    start(kind: 'resume', input: Record<string, unknown>, observer: RunObserver): string {
        this.disconnect();
        this.observer = observer;
        this.lastState = 'idle';
        this.lastSteps = initialSteps();

        const runId = newRunId();
        this.runId = runId;
        const port = this.connectFn();
        this.port = port;

        port.onMessage.addListener((raw) => this.handle(raw));
        port.onDisconnect.addListener(() => {
            // A disconnect before a terminal state means the worker died.
            if (!isTerminal(this.lastState)) {
                this.observer.onError?.({
                    code: 'network',
                    message: 'Lost connection to the extension. Try again.',
                    retryable: true,
                });
            }
            this.port = null;
        });

        port.postMessage({ type: 'start', runId, kind, input });
        return runId;
    }

    cancel(): void {
        if (!this.port || !this.runId) return;
        this.port.postMessage({ type: 'cancel', runId: this.runId });
    }

    respondToApproval(approvalId: string, approved: boolean): void {
        if (!this.port || !this.runId) return;
        this.port.postMessage({
            type: approved ? 'approve' : 'reject',
            runId: this.runId,
            approvalId,
        });
    }

    disconnect(): void {
        this.port?.disconnect();
        this.port = null;
        this.runId = null;
    }

    private handle(raw: unknown): void {
        const event = raw as RunEvent;
        if (!event || typeof event !== 'object' || !('type' in event)) return;
        // Ignore events from a superseded run.
        if ('runId' in event && event.runId !== this.runId) return;

        switch (event.type) {
            case 'state':
                this.lastState = event.state;
                this.lastSteps = event.steps;
                this.observer.onState?.(event.state, event.steps);
                break;
            case 'step': {
                const index = this.lastSteps.findIndex((step) => step.id === event.step.id);
                if (index !== -1) this.lastSteps[index] = event.step;
                this.observer.onStep?.(event.step);
                break;
            }
            case 'approval':
                this.observer.onApproval?.(event);
                break;
            case 'done':
                this.observer.onDone?.(event.result);
                break;
            case 'error':
                this.observer.onError?.({
                    code: event.code,
                    message: event.message,
                    retryable: event.retryable,
                });
                break;
        }
    }
}
