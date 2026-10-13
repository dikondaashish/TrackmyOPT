import { act, fireEvent } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import { JobTrackerBoard } from './JobTrackerBoard';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
  usePathname: () => '/dashboard/career/job-tracker',
}));
vi.mock('@/app/dashboard/career/job-tracker/actions', () => ({
  updateApplicationStatus: vi.fn(),
  clearApplicationFollowup: vi.fn(),
  clearAllFollowups: vi.fn(),
  deleteApplication: vi.fn(),
  archiveApplication: vi.fn(),
}));
vi.mock('@/components/pricing/PricingModal', () => ({
  PricingModal: () => null,
}));
vi.mock('./ApplicationDrawer', () => ({ ApplicationDrawer: () => null }));
vi.mock('./CompanyLogo', () => ({ CompanyLogo: () => <span>Logo</span> }));

const applications = [
  {
    id: 'synthetic-application',
    user_id: 'synthetic-account',
    company_name: 'Synthetic Labs',
    role_title: 'Engineer',
    status: 'Applied',
    applied_at: '2026-09-30T12:00:00Z',
    created_at: '2026-09-30T12:00:00Z',
    updated_at: '2026-09-30T12:00:00Z',
  },
];
const board = (
  <JobTrackerBoard
    initialApplications={applications}
    planTier="free"
    customStages={[]}
  />
);
afterEach(() => vi.restoreAllMocks());

it('hydrates drag instructions consistently after earlier server renders and handles blocked view storage', async () => {
  // dnd-kit uses a module counter unless the board supplies a stable ID.
  renderToString(board);
  const container = document.createElement('div');
  container.innerHTML = renderToString(board);
  document.body.append(container);
  const serverInstructions = container
    .querySelector('[aria-describedby]')
    ?.getAttribute('aria-describedby');
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new DOMException('Blocked', 'SecurityError');
  });
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new DOMException('Blocked', 'SecurityError');
  });
  let root: ReturnType<typeof hydrateRoot> | undefined;
  try {
    await act(async () => {
      root = hydrateRoot(container, board);
    });
    expect(consoleError).not.toHaveBeenCalled();
    expect(serverInstructions).toBeTruthy();
    expect(document.getElementById(serverInstructions!)).toBeInTheDocument();
    const tableButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Table'
    );
    expect(tableButton).toBeTruthy();
    fireEvent.click(tableButton!);
    expect(container.querySelector('table')).toHaveTextContent(
      'Synthetic Labs'
    );
  } finally {
    await act(async () => root?.unmount());
    container.remove();
  }
});
