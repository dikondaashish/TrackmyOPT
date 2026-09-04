import { AsyncLocalStorage } from 'async_hooks';
import { randomUUID } from 'crypto';

export type AiCostLine = {
  task: string;
  model: string;
  costUsd: number | null;
  fallbackUsed: boolean;
};

type AiRequestContext = {
  requestId: string;
  costs: AiCostLine[];
};

const storage = new AsyncLocalStorage<AiRequestContext>();

export function runWithAiRequestContext<T>(fn: () => Promise<T>): Promise<T> {
  return storage.run({ requestId: randomUUID(), costs: [] }, fn);
}

export function getAiRequestId(): string | undefined {
  return storage.getStore()?.requestId;
}

export function recordAiRequestCost(line: AiCostLine): void {
  storage.getStore()?.costs.push(line);
}

export function getAiRequestCostSummary():
  | {
      requestId: string;
      totalCostUsd: number;
      callCount: number;
      fallbackUsed: boolean;
      byTask: Partial<Record<string, number>>;
      primaryModel: string | null;
    }
  | undefined {
  const store = storage.getStore();
  if (!store) return undefined;

  const byTask: Partial<Record<string, number>> = {};
  let totalCostUsd = 0;
  let fallbackUsed = false;
  let primaryModel: string | null = null;

  for (const line of store.costs) {
    if (line.costUsd != null) {
      totalCostUsd += line.costUsd;
      byTask[line.task] = (byTask[line.task] ?? 0) + line.costUsd;
    }
    if (line.fallbackUsed) fallbackUsed = true;
    if (!primaryModel && line.task === 'resume_generate') {
      primaryModel = line.model;
    }
  }

    if (!primaryModel && store.costs[0]) {
      primaryModel = store.costs[0].model;
    } else if (!primaryModel) {
      const regen = store.costs.find((line) => line.task === 'resume_regenerate');
      if (regen) primaryModel = regen.model;
    }

  return {
    requestId: store.requestId,
    totalCostUsd,
    callCount: store.costs.length,
    fallbackUsed,
    byTask,
    primaryModel,
  };
}
