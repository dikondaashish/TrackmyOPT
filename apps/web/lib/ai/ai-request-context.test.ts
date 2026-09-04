import { describe, expect, it } from 'vitest';

import {
  getAiRequestCostSummary,
  getAiRequestId,
  recordAiRequestCost,
  runWithAiRequestContext,
} from './ai-request-context';

describe('ai-request-context', () => {
  it('accumulates costs within a request scope', async () => {
    await runWithAiRequestContext(async () => {
      const requestId = getAiRequestId();
      expect(requestId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );

      recordAiRequestCost({
        task: 'resume_generate',
        model: 'gemini-3.8-flash',
        costUsd: 0.04,
        fallbackUsed: false,
      });
      recordAiRequestCost({
        task: 'latex_fix',
        model: 'gemini-3.7-flash',
        costUsd: 0.01,
        fallbackUsed: false,
      });

      const summary = getAiRequestCostSummary();
      expect(summary?.requestId).toBe(requestId);
      expect(summary?.totalCostUsd).toBeCloseTo(0.05, 6);
      expect(summary?.callCount).toBe(2);
      expect(summary?.byTask.resume_generate).toBeCloseTo(0.04, 6);
      expect(summary?.byTask.latex_fix).toBeCloseTo(0.01, 6);
      expect(summary?.primaryModel).toBe('gemini-3.8-flash');
    });

    expect(getAiRequestCostSummary()).toBeUndefined();
    expect(getAiRequestId()).toBeUndefined();
  });
});
