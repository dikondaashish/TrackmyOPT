import { afterEach, describe, expect, it, vi } from 'vitest';
const generate = vi.hoisted(() => vi.fn());
vi.mock('@/lib/ai/google-ai', () => ({ generateAiContent: generate }));
import { generateResumeWithDeadline, ResumeGenerationTimeout } from './generate-with-deadline';
afterEach(() => { vi.useRealTimers(); generate.mockReset(); });

describe('resume generation deadline', () => {
    it('normalizes exhausted model attempts for the route refund/error path', async () => {
        generate.mockRejectedValue(Object.assign(new Error('attempt timed out'), { name: 'ModelAttemptTimeout' }));
        await expect(generateResumeWithDeadline({ task: 'resume_generate', contents: 'synthetic' })).rejects.toBeInstanceOf(ResumeGenerationTimeout);
    });
    it('cancels the provider and rejects even if the SDK never settles', async () => {
        vi.useFakeTimers();
        generate.mockImplementation(() => new Promise(() => {}));
        const pending = generateResumeWithDeadline({ task: 'resume_generate', contents: 'synthetic' }, 100);
        const assertion = expect(pending).rejects.toBeInstanceOf(ResumeGenerationTimeout);
        await vi.advanceTimersByTimeAsync(100);
        await assertion;
        expect(generate.mock.calls[0][0].config.abortSignal.aborted).toBe(true);
        expect(vi.getTimerCount()).toBe(0);
    });
});
