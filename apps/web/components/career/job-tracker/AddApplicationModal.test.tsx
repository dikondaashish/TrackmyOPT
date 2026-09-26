import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AddApplicationModal } from './AddApplicationModal';
import { createApplication } from '@/app/dashboard/career/job-tracker/actions';

vi.mock('@/app/dashboard/career/job-tracker/actions', () => ({
  createApplication: vi.fn(),
}));

describe('AddApplicationModal', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(createApplication).mockResolvedValue({
      id: 'new-application',
    } as Awaited<ReturnType<typeof createApplication>>);
  });

  it('lets users select a company with a logo before saving an application', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(
            JSON.stringify([
              {
                name: 'Microsoft',
                domain: 'microsoft.com',
                brandId: 'microsoft',
              },
            ])
          )
      )
    );
    render(<AddApplicationModal />);
    fireEvent.click(screen.getByRole('button', { name: 'Add Application' }));

    fireEvent.change(screen.getByLabelText(/Company name/), {
      target: { value: 'Micro' },
    });
    const option = await screen.findByRole('option', { name: /Microsoft/ });
    expect(option.querySelector('img')?.getAttribute('src')).toContain(
      'microsoft.com'
    );
    fireEvent.click(option);
    fireEvent.change(screen.getByLabelText(/Role title/), {
      target: { value: 'Software Engineer' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save application' }));

    await waitFor(() =>
      expect(createApplication).toHaveBeenCalledWith(
        expect.objectContaining({
          company_name: 'Microsoft',
          role_title: 'Software Engineer',
        })
      )
    );
  });
});
