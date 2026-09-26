import { generateAiContent } from '@/lib/ai/google-ai';

export class ResumeGenerationTimeout extends Error {
    constructor() {
        super('Resume generation took too long. Please try again.');
        this.name = 'ResumeGenerationTimeout';
    }
}

// Leave time inside the 120-second function budget for validation and credit cleanup.
export const RESUME_AI_TIMEOUT_MS = 90_000;

export async function generateResumeWithDeadline(
    input: Parameters<typeof generateAiContent>[0],
    timeoutMs = RESUME_AI_TIMEOUT_MS,
) {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const deadline = new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
            const error = new ResumeGenerationTimeout();
            reject(error);
            controller.abort(error);
        }, Math.max(1, timeoutMs));
    });
    try {
        return await Promise.race([
            generateAiContent({
                ...input,
                config: { ...input.config, abortSignal: controller.signal },
            }),
            deadline,
        ]);
    } finally {
        clearTimeout(timer);
    }
}
