import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NetworkingWorkspace } from './LegacyNetworkingWorkspace';

describe('NetworkingWorkspace', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('uses the candidate message and opens a prefilled Gmail draft for a verified contact', async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (url === '/api/career/email-finder') {
        return new Response(
          JSON.stringify({
            ok: true,
            data: { linkedinUrl: 'https://www.linkedin.com/in/alex-example' },
          })
        );
      }
      if (url === 'https://api.applybolt.app/public/findEmailByLinkedIn') {
        return new Response(
          JSON.stringify({
            found: true,
            email: 'alex@example.com',
            fullName: 'Alex Example',
            company: 'Amazon',
            jobTitle: 'Recruiter',
            validation: 'valid',
          })
        );
      }
      return new Response(
        JSON.stringify({
          ok: true,
          data: {
            subject: 'Amazon role',
            emailBody: 'Hi Alex, could we talk about the role?',
            linkedinNote: 'Hi Alex, I would love to connect.',
          },
        })
      );
    });
    vi.stubGlobal('fetch', fetchMock);

    render(
      <NetworkingWorkspace
        applications={[
          {
            id: 'application-1',
            company_name: 'Amazon',
            role_title: 'Engineer',
          },
        ]}
        initialApplicationId="application-1"
        applicationsUnavailable={false}
      />
    );
    fireEvent.change(screen.getByLabelText('What you want to say'), {
      target: { value: 'Ask for a short conversation about the role.' },
    });
    fireEvent.change(screen.getByLabelText('LinkedIn profile URL'), {
      target: { value: 'https://www.linkedin.com/in/alex-example' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Find work email' }));
    expect(await screen.findByText('alex@example.com')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.applybolt.app/public/findEmailByLinkedIn',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          linkedinUrl: 'https://www.linkedin.com/in/alex-example',
        }),
        referrerPolicy: 'no-referrer',
      })
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Draft outreach with AI' })
    );
    const gmail = await screen.findByRole('link', { name: /Open in Gmail/ });
    const url = new URL(gmail.getAttribute('href') || '');
    expect(url.hostname).toBe('mail.google.com');
    expect(url.searchParams.get('to')).toBe('alex@example.com');
    expect(url.searchParams.get('su')).toBe('Amazon role');
    expect(url.searchParams.get('body')).toBe(
      'Hi Alex, could we talk about the role?'
    );
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/career/networking/draft',
        expect.objectContaining({
          body: expect.stringContaining(
            'Ask for a short conversation about the role.'
          ),
        })
      )
    );
    expect(
      screen.getByRole('link', { name: /Open in Outlook/ })
    ).toBeInTheDocument();
  });

  it('allows three contacts and keeps email compose unavailable without verification', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(JSON.stringify({ ok: true, data: { found: false } }))
      )
    );
    render(
      <NetworkingWorkspace
        applications={[]}
        initialApplicationId=""
        applicationsUnavailable={false}
      />
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Add another contact' })
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Add another contact' })
    );
    expect(screen.getAllByLabelText('LinkedIn profile URL')).toHaveLength(3);
    expect(
      screen.queryByRole('button', { name: 'Add another contact' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /Open in Gmail/ })
    ).not.toBeInTheDocument();
  });

  it('withholds email drafting when the lookup reports another employer', async () => {
    const fetchMock = vi.fn(async (url: string) =>
      url === '/api/career/email-finder'
        ? new Response(
            JSON.stringify({
              ok: true,
              data: { linkedinUrl: 'https://www.linkedin.com/in/alex' },
            })
          )
        : new Response(
            JSON.stringify({
              found: true,
              email: 'alex@other.com',
              fullName: 'Alex',
              company: 'Other Company',
              jobTitle: 'Recruiter',
              validation: 'valid',
            })
          )
    );
    vi.stubGlobal('fetch', fetchMock);
    render(
      <NetworkingWorkspace
        applications={[]}
        initialApplicationId=""
        applicationsUnavailable={false}
      />
    );
    fireEvent.change(screen.getByLabelText('Company (optional)'), {
      target: { value: 'Amazon' },
    });
    fireEvent.change(screen.getByLabelText('LinkedIn profile URL'), {
      target: { value: 'https://www.linkedin.com/in/alex' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Find work email' }));
    expect(
      await screen.findByText(/reported company differs/)
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /Open in Gmail/ })
    ).not.toBeInTheDocument();
  });

  it('explains the provider lookup limit without showing an email', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) =>
        url === '/api/career/email-finder'
          ? new Response(
              JSON.stringify({
                ok: true,
                data: { linkedinUrl: 'https://www.linkedin.com/in/alex' },
              })
            )
          : new Response('', { status: 429 })
      )
    );
    render(
      <NetworkingWorkspace
        applications={[]}
        initialApplicationId=""
        applicationsUnavailable={false}
      />
    );
    fireEvent.change(screen.getByLabelText('LinkedIn profile URL'), {
      target: { value: 'https://www.linkedin.com/in/alex' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Find work email' }));
    expect(
      await screen.findByText(/ApplyBolt has reached its lookup limit/)
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /Open in Gmail/ })
    ).not.toBeInTheDocument();
  });
});
