import assert from 'node:assert/strict';
import {
    canTransition,
    describeError,
    initialSteps,
    isTerminal,
    RESUME_RUN_STEPS,
    RUN_STATES,
} from '../src/agent/run-protocol';
import { RunRegistry, RunSession, RunCancelledError } from '../src/agent/run-session';
import { AgentRunClient } from '../src/agent/run-client';
import type { RunEvent } from '../src/agent/run-protocol';

/* ------------------------------------------------------------ state machine */

assert.ok(RUN_STATES.includes('awaiting_approval'));
assert.ok(isTerminal('succeeded') && isTerminal('failed') && isTerminal('cancelled'));
assert.ok(!isTerminal('running'));

// A run may be cancelled from any live state.
for (const state of ['idle', 'preparing', 'running', 'awaiting_approval'] as const) {
    assert.ok(canTransition(state, 'cancelled'), `${state} must be cancellable`);
}
// Terminal states never continue...
assert.ok(!canTransition('succeeded', 'running'));
// ...except that a failure or cancellation can be retried.
assert.ok(canTransition('failed', 'preparing'));
assert.ok(canTransition('cancelled', 'preparing'));

/* ------------------------------------------------------------------ session */

function collect() {
    const events: RunEvent[] = [];
    return { events, emit: (event: RunEvent) => void events.push(event) };
}

// Steps report in order and drive the run into `running`.
{
    const { events, emit } = collect();
    const session = new RunSession('r1', emit);
    session.setState('preparing');
    session.step('load_resume', 'active');
    assert.equal(session.state, 'running', 'first active step must start the run');
    session.step('load_resume', 'done', 'resume.pdf');

    const stepEvents = events.filter((e) => e.type === 'step');
    assert.equal(stepEvents.length, 2);
    assert.equal((stepEvents[1] as { step: { detail?: string } }).step.detail, 'resume.pdf');
}

// Cancelling aborts the signal and rewinds the in-flight step to pending —
// the user stopped it, it did not break.
{
    const { events, emit } = collect();
    const session = new RunSession('r2', emit);
    session.setState('preparing');
    session.step('tailor', 'active');
    assert.equal(session.signal.aborted, false);

    session.cancel();
    assert.equal(session.signal.aborted, true);
    assert.equal(session.state, 'cancelled');

    const final = events.filter((e) => e.type === 'state').at(-1) as {
        steps: { id: string; status: string }[];
    };
    const tailor = final.steps.find((s) => s.id === 'tailor');
    assert.equal(tailor?.status, 'pending', 'a cancelled step must not read as failed');
}

// throwIfCancelled is how the pipeline notices between awaits.
{
    const session = new RunSession('r3', () => {});
    session.setState('preparing');
    session.cancel();
    assert.throws(() => session.throwIfCancelled(), RunCancelledError);
}

// A cancelled run cannot later report success — the result is discarded.
{
    const { events, emit } = collect();
    const session = new RunSession('r4', emit);
    session.setState('preparing');
    session.cancel();
    session.succeed({ ok: true });
    assert.equal(events.filter((e) => e.type === 'done').length, 0);
    assert.equal(session.state, 'cancelled');
}

// Optional steps degrade to `skipped`; required steps fail the run.
// The unit-test runner bundles to CJS, so async work goes in an IIFE and
// reports failure through process.exitCode.
void (async () => {
    const session = new RunSession('r5', () => {});
    session.setState('preparing');

    const skipped = await session.track('baseline_score', async () => {
        throw new Error('endpoint down');
    });
    assert.equal(skipped, undefined);
    assert.equal(session.snapshot.find((s) => s.id === 'baseline_score')?.status, 'skipped');

    await assert.rejects(
        session.track('tailor', async () => {
            throw new Error('model failed');
        })
    );
    assert.equal(session.snapshot.find((s) => s.id === 'tailor')?.status, 'failed');

    // Cancelling mid-step propagates rather than being swallowed as "skipped".
    const cancelled = new RunSession('r6', () => {});
    cancelled.setState('preparing');
    await assert.rejects(
        cancelled.track('baseline_score', async () => {
            cancelled.cancel();
            throw new Error('aborted');
        }),
        RunCancelledError
    );

    console.log('agent-run: async step tracking verified');
})().catch((error) => {
    console.error('agent-run async assertions failed:', error);
    process.exitCode = 1;
});

/* ----------------------------------------------------------------- registry */

{
    const registry = new RunRegistry();
    const session = registry.create('a', () => {});
    assert.equal(registry.size, 1);
    assert.equal(registry.cancel('a'), true);
    assert.equal(session.signal.aborted, true);
    assert.equal(registry.size, 0);
    assert.equal(registry.cancel('missing'), false);

    // Starting a run with a live id supersedes the old one rather than leaking it.
    const first = registry.create('b', () => {});
    registry.create('b', () => {});
    assert.equal(first.signal.aborted, true, 'superseded run must be aborted');
    registry.cancelAll();
    assert.equal(registry.size, 0);
}

/* ------------------------------------------------------------------- client */

{
    const posted: unknown[] = [];
    let onMessage: ((m: unknown) => void) | null = null;
    const port = {
        postMessage: (m: unknown) => void posted.push(m),
        disconnect: () => {},
        onMessage: { addListener: (fn: (m: unknown) => void) => { onMessage = fn; } },
        onDisconnect: { addListener: () => {} },
    };

    const client = new AgentRunClient({ connect: () => port });
    const seen: string[] = [];
    const runId = client.start('resume', { templateId: 'modern' }, {
        onState: (state) => void seen.push(`state:${state}`),
        onStep: (step) => void seen.push(`step:${step.id}:${step.status}`),
        onDone: () => void seen.push('done'),
    });

    assert.equal((posted[0] as { type: string }).type, 'start');

    onMessage!({ type: 'state', runId, state: 'running', steps: initialSteps() });
    onMessage!({ type: 'step', runId, step: { id: 'tailor', label: 'Tailoring', status: 'active' } });
    // An event from a superseded run must be ignored.
    onMessage!({ type: 'done', runId: 'other-run', result: {} });
    onMessage!({ type: 'done', runId, result: {} });

    assert.deepEqual(seen, ['state:running', 'step:tailor:active', 'done']);

    client.cancel();
    assert.equal((posted.at(-1) as { type: string }).type, 'cancel');
}

/* ------------------------------------------------------------------- copy */

// Error codes the pipeline already returns must all have human copy.
for (const code of [
    'not_signed_in', 'no_job_description', 'no_base_resume', 'no_template',
    'limit', 'base_failed', 'generate_failed', 'compile_failed',
]) {
    const described = describeError(code);
    assert.notEqual(described.message, describeError('unknown').message, `${code} has no copy`);
}
// Quota and auth problems must not offer a retry.
assert.equal(describeError('limit').retryable, false);
assert.equal(describeError('not_signed_in').retryable, false);
assert.equal(describeError('compile_failed').retryable, true);

assert.equal(initialSteps().length, RESUME_RUN_STEPS.length);
assert.ok(initialSteps().every((step) => step.status === 'pending'));

console.log('agent-run: state machine, cancellation, registry, and client verified');
