export const TOUR_KEY = 'productTourV1';
export const TOUR_STEPS = 7;
export type TourState = {
  version: 1;
  step: number;
  status: 'pending' | 'active' | 'skipped' | 'completed';
};

export function normalizeTourState(value: unknown): TourState | null {
  if (!value || typeof value !== 'object') return null;
  const v = value as TourState;
  return v.version === 1 &&
    Number.isInteger(v.step) &&
    v.step >= 0 &&
    v.step < TOUR_STEPS &&
    ['pending', 'active', 'skipped', 'completed'].includes(v.status)
    ? { version: 1, step: v.step, status: v.status }
    : null;
}

/** Local, installation-scoped progress only. No identity, answers, or tokens. */
export function createOnboarding(io: {
  read(): Promise<unknown>;
  write(state: TourState): Promise<void>;
  open(): Promise<void>;
}) {
  let queue: Promise<unknown> = Promise.resolve();
  const serial = <T>(work: () => Promise<T>): Promise<T> => {
    const next = queue.then(work);
    queue = next.catch(() => {});
    return next;
  };
  return {
    install: (reason: string) =>
      serial(async () => {
        if (reason === 'install' && !normalizeTourState(await io.read())) {
          await io.write({ version: 1, step: 0, status: 'pending' });
        }
      }),
    signedIn: () =>
      serial(async () => {
        const state = normalizeTourState(await io.read());
        if (state?.status !== 'pending') return;
        await io.write({ ...state, status: 'active' });
        try {
          await io.open();
        } catch (error) {
          await io.write(state);
          throw error;
        }
      }),
    replay: () =>
      serial(async () => {
        const previous = normalizeTourState(await io.read());
        await io.write({ version: 1, step: 0, status: 'active' });
        try {
          await io.open();
        } catch (error) {
          await io.write(
            previous ?? { version: 1, step: 0, status: 'skipped' }
          );
          throw error;
        }
      }),
    save: (step: number, status: TourState['status']) =>
      serial(async () => {
        const state = normalizeTourState({ version: 1, step, status });
        if (!state || status === 'pending')
          throw new Error('Invalid tour progress');
        await io.write(state);
      }),
  };
}

export function chromeOnboarding() {
  const url = chrome.runtime.getURL('tour.html');
  return createOnboarding({
    read: async () => (await chrome.storage.local.get(TOUR_KEY))[TOUR_KEY],
    write: (state) => chrome.storage.local.set({ [TOUR_KEY]: state }),
    open: async () => {
      const tabs = await chrome.tabs.query({});
      const existing = tabs.find((tab) => tab.url?.split('#')[0] === url);
      if (existing?.id !== undefined) {
        await chrome.tabs.update(existing.id, { active: true });
        await chrome.tabs.reload(existing.id);
        if (existing.windowId !== undefined)
          await chrome.windows.update(existing.windowId, { focused: true });
      } else {
        await chrome.tabs.create({ url });
      }
    },
  });
}
