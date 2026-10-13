import { act, fireEvent } from '@testing-library/react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { DndContext } from '@dnd-kit/core';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { JobApplication } from '@/lib/career/job-tracker/types';
import { JobApplicationCard } from './JobApplicationCard';
import { JobTrackerStatsRow } from './JobTrackerStatsRow';
import { JobTrackerCalendarView } from './JobTrackerCalendarView';
import { JobTrackerTableView } from './JobTrackerTableView';

vi.mock('./CompanyLogo', () => ({ CompanyLogo: () => <span>Logo</span> }));
const application = {
  id: 'synthetic-application',
  user_id: 'synthetic-account',
  company_name: 'Synthetic Labs',
  role_title: 'Engineer',
  status: 'Applied',
  applied_at: '2026-09-30T12:00:00Z',
  next_follow_up_at: '2026-10-01',
  created_at: '2026-09-30T12:00:00Z',
  updated_at: '2026-09-30T12:00:00Z',
} satisfies JobApplication;
let root: Root | undefined;
let container: HTMLDivElement;
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  container = document.createElement('div');
  document.body.append(container);
});
afterEach(async () => {
  await act(async () => root?.unmount());
  root = undefined;
  container.remove();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const views = [
  [
    'card',
    () => (
      <DndContext id="synthetic-job-board">
        <JobApplicationCard application={application} onClick={() => {}} />
      </DndContext>
    ),
    'Added Yesterday',
  ],
  [
    'summary',
    () => <JobTrackerStatsRow applications={[application]} />,
    'Follow-ups due',
  ],
  [
    'calendar',
    () => (
      <JobTrackerCalendarView
        applications={[application]}
        onCardClick={() => {}}
      />
    ),
    'October 2026',
  ],
  [
    'table',
    () => (
      <JobTrackerTableView
        applications={[application]}
        onCardClick={() => {}}
      />
    ),
    'Today',
  ],
] as const;

it.each(views)(
  'hydrates the %s after the browser date crosses a month boundary',
  async (_name, View, expected) => {
    vi.setSystemTime(new Date('2026-09-30T12:00:00Z'));
    container.innerHTML = renderToString(<View />);
    vi.setSystemTime(new Date('2026-10-01T12:00:00Z'));
    const errors: unknown[] = [];
    await act(async () => {
      root = hydrateRoot(container, <View />, {
        onRecoverableError: (error) => errors.push(error),
      });
    });
    expect(errors).toEqual([]);
    expect(container).toHaveTextContent(expected);
    if (_name === 'summary') {
      expect(
        Array.from(container.querySelectorAll('p')).find(
          (p) => p.textContent === 'Follow-ups due'
        )?.previousElementSibling
      ).toHaveTextContent('1');
    }
  }
);

it('keeps calendar navigation and Today working after hydration', async () => {
  vi.setSystemTime(new Date('2026-10-01T12:00:00Z'));
  container.innerHTML = renderToString(
    <JobTrackerCalendarView applications={[]} onCardClick={() => {}} />
  );
  await act(async () => {
    root = hydrateRoot(
      container,
      <JobTrackerCalendarView applications={[]} onCardClick={() => {}} />
    );
  });
  const buttons = container.querySelectorAll('button');
  fireEvent.click(buttons[0]);
  expect(container).toHaveTextContent('September 2026');
  fireEvent.click(
    Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Today'
    )!
  );
  expect(container).toHaveTextContent('October 2026');
});
