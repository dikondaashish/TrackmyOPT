/**
 * Run console — the visible half of an agent run.
 *
 * Shows which step is executing, what each step produced, and a Stop control
 * that is live for the whole run. Every state change is also announced to a
 * live region, because previously the only signal was a spinner.
 */

import {
    banner, button, card, iconButton, liveRegion, row, spinner, stack, text, uid,
} from '../design/primitives';
import type { RunState, StepSnapshot } from './run-protocol';

export interface RunConsoleOptions {
    title?: string;
    onCancel?: () => void;
    onRetry?: () => void;
}

export interface RunConsoleHandle {
    node: HTMLElement;
    setState: (state: RunState, steps: StepSnapshot[]) => void;
    updateStep: (step: StepSnapshot) => void;
    showError: (error: { message: string; retryable: boolean }) => void;
    showApproval: (approval: {
        title: string;
        reason: string;
        items: string[];
        onApprove: () => void;
        onReject: () => void;
    }) => void;
    destroy: () => void;
}

const STATE_SUMMARY: Record<RunState, string> = {
    idle: 'Ready',
    preparing: 'Starting…',
    running: 'Working…',
    awaiting_approval: 'Needs your approval',
    succeeded: 'Done',
    failed: 'Failed',
    cancelled: 'Stopped',
};

const STATUS_GLYPH: Record<StepSnapshot['status'], string> = {
    pending: '○',
    active: '',        // replaced by a spinner
    done: '✓',
    skipped: '–',
    failed: '✕',
};

function stepRow(step: StepSnapshot): HTMLElement {
    const node = row({
        gap: '2',
        align: 'center',
        attrs: { 'data-step': step.id },
        style: 'display:grid;grid-template-columns:18px minmax(0,1fr);column-gap:8px;row-gap:3px;align-items:start;min-height:28px;padding:5px 0',
    });

    const marker = document.createElement('span');
    marker.setAttribute('aria-hidden', 'true');
    marker.style.cssText =
        'display:inline-flex;align-items:center;justify-content:center;width:14px;flex-shrink:0;font-size:var(--tmo-text-sm)';
    marker.style.color = step.status === 'done' ? 'var(--tmo-color-success-ink)'
        : step.status === 'failed' ? 'var(--tmo-color-danger-ink)'
        : step.status === 'active' ? 'var(--tmo-color-accent)' : 'var(--tmo-color-ink-muted)';
    if (step.status === 'active') marker.appendChild(spinner({ size: 12 }));
    else marker.textContent = STATUS_GLYPH[step.status];
    node.appendChild(marker);

    const tone =
        step.status === 'failed' ? 'danger'
        : step.status === 'done' ? 'default'
        : step.status === 'active' ? 'default'
        : 'muted';
    node.appendChild(
        text({
            text: step.label,
            size: 'sm',
            tone,
            weight: step.status === 'active' ? 'medium' : 'regular',
            style: 'flex:1;min-width:0',
        })
    );

    if (step.detail || step.status === 'skipped') {
        const detail = step.status === 'skipped' && step.id === 'extract'
            ? 'Review form fields manually; resume is still available.'
            : step.detail || 'Not needed';
        node.appendChild(text({ text: detail, size: 'xs', tone: 'muted',
            attrs: {'data-step-detail':'', title:detail},
            style:'grid-column:2;min-width:0;overflow-wrap:anywhere;line-height:1.45;max-height:3em;overflow:auto' }));
    }

    // Screen readers get the status as words, not as a glyph.
    const statusWord =
        step.status === 'active' ? 'in progress'
        : step.status === 'done' ? 'complete'
        : step.status;
    node.setAttribute('aria-label', `${step.label}: ${statusWord}${step.detail ? `, ${step.detail}` : ''}`);
    node.setAttribute('role', 'listitem');
    return node;
}

export function runConsole(options: RunConsoleOptions = {}): RunConsoleHandle {
    const { title = 'Tailoring résumé', onCancel, onRetry } = options;
    const announcer = liveRegion('polite');
    const titleId = uid('run-title');

    const stepList = stack({
        gap: '0.5',
        attrs: { role: 'list', 'aria-labelledby': titleId },
    });

    const stopButton = button({
        label: 'Stop',
        variant: 'ghost',
        size: 'sm',
        onClick: () => onCancel?.(),
    });

    const summary = text({ text: STATE_SUMMARY.idle, size: 'sm', tone: 'muted' });

    const header = row({
        justify: 'between',
        align: 'center',
        children: [
            stack({
                gap: '0',
                children: [
                    text({ text: title, size: 'md', weight: 'semibold', attrs: { id: titleId } }),
                    summary,
                ],
            }),
            stopButton,
        ],
    });

    const footer = stack({ gap: '2' });

    const node = card({
        padding: '3',
        elevation: '1',
        label: title,
        children: [announcer.node, header, stepList, footer],
        style: 'display:flex;flex-direction:column;gap:var(--tmo-space-3)',
    });

    let currentSteps: StepSnapshot[] = [];
    let currentState: RunState = 'idle';

    function renderSteps(steps: StepSnapshot[]): void {
        currentSteps = [...steps];
        stepList.replaceChildren(...steps.filter(step => !(step.status === 'pending' &&
            (currentState === 'succeeded' || step.id === 'repair'))).map(stepRow));
    }

    function updateSummary(): void {
        const done = currentSteps.filter(step => step.status === 'done').length;
        summary.textContent = currentState === 'running'
            ? `${done} ${done === 1 ? 'step' : 'steps'} complete`
            : STATE_SUMMARY[currentState];
    }

    function setStopVisible(visible: boolean): void {
        stopButton.style.display = visible ? '' : 'none';
    }

    return {
        node,

        setState(state, steps) {
            currentState = state;
            renderSteps(steps);
            updateSummary();
            setStopVisible(state === 'preparing' || state === 'running');
            footer.replaceChildren();

            if (state === 'succeeded') {
                announcer.announce('Résumé ready.');
            } else if (state === 'cancelled') {
                announcer.announce('Stopped.');
                if (onRetry) {
                    footer.appendChild(
                        button({ label: 'Try again', variant: 'secondary', size: 'sm', onClick: onRetry })
                    );
                }
            } else if (state === 'running' || state === 'preparing') {
                announcer.announce(STATE_SUMMARY[state]);
            }
        },

        updateStep(step) {
            const index = currentSteps.findIndex((entry) => entry.id === step.id);
            if (index === -1) return;
            currentSteps[index] = step;
            renderSteps(currentSteps);
            updateSummary();
            if (step.status === 'active') announcer.announce(step.label);
            if (step.status === 'done' && step.detail) {
                announcer.announce(`${step.label}: ${step.detail}`);
            }
        },

        showError(error) {
            setStopVisible(false);
            summary.textContent = STATE_SUMMARY.failed;
            announcer.announce(error.message);
            const actions: HTMLElement[] = [];
            if (error.retryable && onRetry) {
                actions.push(
                    button({ label: 'Try again', variant: 'secondary', size: 'sm', onClick: onRetry })
                );
            }
            footer.replaceChildren(
                banner({ tone: 'danger', message: error.message, live: 'assertive', actions })
            );
        },

        showApproval(approval) {
            setStopVisible(false);
            summary.textContent = STATE_SUMMARY.awaiting_approval;
            announcer.announce(`${approval.title}. ${approval.reason}`);

            const list = stack({ gap: '1', attrs: { role: 'list' } });
            for (const item of approval.items) {
                list.appendChild(
                    text({ text: `• ${item}`, size: 'sm', tone: 'muted', attrs: { role: 'listitem' } })
                );
            }

            footer.replaceChildren(
                card({
                    tone: 'warning',
                    padding: '3',
                    attrs: { role: 'group', 'aria-label': approval.title },
                    children: [
                        stack({
                            gap: '2',
                            children: [
                                text({ text: approval.title, size: 'sm', weight: 'semibold', tone: 'warning' }),
                                text({ text: approval.reason, size: 'sm', tone: 'muted' }),
                                list,
                                row({
                                    gap: '2',
                                    children: [
                                        button({
                                            label: 'Approve',
                                            variant: 'primary',
                                            size: 'sm',
                                            onClick: approval.onApprove,
                                        }),
                                        button({
                                            label: 'Skip these',
                                            variant: 'secondary',
                                            size: 'sm',
                                            onClick: approval.onReject,
                                        }),
                                    ],
                                }),
                            ],
                        }),
                    ],
                })
            );
        },

        destroy() {
            node.remove();
        },
    };
}

/** Re-exported so call sites can build a dismiss affordance consistently. */
export { iconButton };
