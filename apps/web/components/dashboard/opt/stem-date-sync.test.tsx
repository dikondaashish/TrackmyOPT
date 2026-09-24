import { StrictMode } from 'react';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { OptDatesSection } from './OptDatesSection';
import { StemApplyTool } from '../opt-tools/tools/StemApplyTool';
import { DateSelector } from './DateSelector';
import { areOptDatesEqual } from '@/lib/immigration/opt-dates-page-utils';
import {
  daysBetween,
  getStemFilingWindow,
} from '@/lib/immigration/opt-calculations';

const { toast } = vi.hoisted(() => ({ toast: vi.fn() }));
vi.mock('@/hooks/useToast', () => ({ useToast: () => ({ toast }) }));
vi.mock('@/hooks/useEmploymentSetupAck', () => ({
  useEmploymentSetupAck: () => ({ setAck: vi.fn(), ack: null }),
}));
vi.mock('@/components/ui/jargon-tooltip', () => ({
  JargonTooltip: ({
    term,
    children,
  }: {
    term: string;
    children?: React.ReactNode;
  }) => <span>{children || term}</span>,
}));
vi.mock('./EmploymentHistoryLog', () => ({ EmploymentHistoryLog: () => null }));
vi.mock('./EmploymentSetupModal', () => ({ EmploymentSetupModal: () => null }));
vi.mock('./OptEmailRemindersPanel', () => ({
  OptEmailRemindersPanel: () => null,
}));
vi.mock('@/components/pricing/PricingModal', () => ({
  PricingModal: () => null,
}));
vi.mock('../opt-tools/EmailReminder', () => ({ EmailReminder: () => null }));
vi.mock('../opt-tools/LiveStatsWidget', () => ({
  LiveStatsWidget: () => null,
}));
vi.mock('../opt-tools/TickingClock', () => ({
  TickingClock: ({ targetDate }: { targetDate: Date }) => (
    <div data-testid="deadline">{targetDate.toLocaleDateString('en-US')}</div>
  ),
  TickingClockCompact: () => null,
}));
vi.mock('@/lib/immigration/opt-calculations', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/lib/immigration/opt-calculations')>();
  return {
    ...actual,
    getStemFilingWindow: vi.fn(actual.getStemFilingWindow),
    daysBetween: vi.fn(actual.daysBetween),
  };
});

const saved = {
  program_end_date: '05/15/2026',
  dso_recommendation_date: '04/20/2026',
  opt_start_date: '06/01/2026',
  opt_ead_end_date: '05/31/2027',
  stem_start_date: '',
  stem_dso_recommendation_date: '03/01/2027',
};
const response = (data: unknown, ok = true) =>
  ({ ok, json: async () => data }) as Response;
const deferred = () => {
  let resolve!: (response: Response) => void;
  const promise = new Promise<Response>((r) => {
    resolve = r;
  });
  return { promise, resolve };
};
let fetchMock: ReturnType<typeof vi.fn>;
beforeEach(() => {
  vi.clearAllMocks();
  fetchMock = vi.fn(async (url, options) =>
    url === '/api/opt/calculator'
      ? response(
          options?.method === 'POST' ? { ok: true } : { ok: true, data: saved }
        )
      : response({})
  );
  vi.stubGlobal('fetch', fetchMock);
  vi.spyOn(window, 'alert').mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
const posted = () =>
  JSON.parse(
    fetchMock.mock.calls.find(([, options]) => options?.method === 'POST')![1]
      .body
  );

describe('dashboard STEM recommendation', () => {
  it('tracks a STEM-only change as dirty', () => {
    expect(
      areOptDatesEqual(saved, { ...saved, stem_dso_recommendation_date: '' })
    ).toBe(false);
  });
  it('preserves all five original date inputs', async () => {
    render(<OptDatesSection />);
    await screen.findByLabelText(/Program End Date/);
    for (const name of [
      /Program End Date/,
      /^DSO Recommendation Date/,
      /^OPT Start Date/,
      /^OPT EAD End Date/,
      /^STEM Extension Start Date/,
    ]) {
      expect(screen.getByLabelText(name)).toBeInTheDocument();
    }
  });
  it('does not turn a history load failure into a zero-job unemployment count and supports retry', async () => {
    fetchMock.mockImplementation(async (url) =>
      url === '/api/employment-spans'
        ? response({ ok: false }, false)
        : url === '/api/opt/calculator'
          ? response({ ok: true, data: saved })
          : response({})
    );
    render(<OptDatesSection />);
    expect(await screen.findByText('Unavailable')).toBeInTheDocument();
    expect(
      screen.getByText(/Could not load employment history/)
    ).toBeInTheDocument();
    fetchMock.mockResolvedValueOnce(response({ ok: true, spans: [] }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Retry employment history' })
    );
    await waitFor(() =>
      expect(screen.queryByText('Unavailable')).not.toBeInTheDocument()
    );
  });
  it('loads, edits, discards, and explicitly clears STEM without changing other dates', async () => {
    render(<OptDatesSection />);
    const field = await screen.findByLabelText(/STEM DSO Recommendation Date/);
    expect(field).toHaveValue(saved.stem_dso_recommendation_date);
    fireEvent.change(field, { target: { value: '03/05/2027' } });
    fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
    expect(field).toHaveValue(saved.stem_dso_recommendation_date);
    fireEvent.change(field, { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Dates' }));
    await waitFor(() =>
      expect(posted()).toEqual({
        stem_dso_recommendation_date: null,
        _lastModifiedField: 'stem_dso_recommendation_date',
      })
    );
    fireEvent.change(field, { target: { value: '03/10/2027' } });
    fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
    expect(field).toHaveValue('');
    expect(screen.getByLabelText(/Program End Date/)).toHaveValue(
      saved.program_end_date
    );
    expect(screen.getByLabelText(/OPT.*EAD.*End Date/)).toHaveValue(
      saved.opt_ead_end_date
    );
  });
  it('does not overwrite the actual EAD end date when the OPT start date changes', async () => {
    render(<OptDatesSection />);
    const field = await screen.findByLabelText(/^OPT Start Date/);
    fireEvent.change(field, { target: { value: '06/02/2026' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Dates' }));
    await waitFor(() =>
      expect(posted()).toEqual({
        opt_start_date: '06/02/2026',
        _lastModifiedField: 'opt_start_date',
      })
    );
    expect(screen.getByLabelText(/STEM DSO Recommendation Date/)).toHaveValue(
      saved.stem_dso_recommendation_date
    );
  });
  it('never invents a DSO recommendation from the program end date', async () => {
    fetchMock.mockImplementationOnce(async () =>
      response({ ok: true, data: { ...saved, dso_recommendation_date: '' } })
    );
    render(<OptDatesSection />);
    fireEvent.change(await screen.findByLabelText(/Program End Date/), {
      target: { value: '05/16/2026' },
    });
    expect(screen.getByLabelText(/^DSO Recommendation Date/)).toHaveValue('');
    fireEvent.click(screen.getByRole('button', { name: 'Save Dates' }));
    await waitFor(() =>
      expect(posted()).toEqual({
        program_end_date: '05/16/2026',
        _lastModifiedField: 'program_end_date',
      })
    );
  });
  it('preserves input edited while a save is pending', async () => {
    const pending = deferred();
    render(<OptDatesSection />);
    const field = await screen.findByLabelText(/STEM DSO Recommendation Date/);
    fetchMock.mockImplementationOnce(() => pending.promise);
    fireEvent.change(field, { target: { value: '03/05/2027' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Dates' }));
    fireEvent.change(field, { target: { value: '03/10/2027' } });
    await act(async () => pending.resolve(response({ ok: true })));
    expect(screen.getByLabelText(/STEM DSO Recommendation Date/)).toHaveValue(
      '03/10/2027'
    );
    expect(
      screen.getByRole('button', { name: 'Discard changes' })
    ).toBeInTheDocument();
  });
  it('ignores a late initial request after the user edits', async () => {
    const pending = deferred();
    fetchMock.mockImplementationOnce(() => pending.promise);
    render(
      <StrictMode>
        <OptDatesSection />
      </StrictMode>
    );
    const field = await screen.findByLabelText(/STEM DSO Recommendation Date/);
    fireEvent.change(field, { target: { value: '03/10/2027' } });
    await act(async () => pending.resolve(response({ ok: true, data: saved })));
    expect(field).toHaveValue('03/10/2027');
  });
  it('keeps edits dirty and reports failure when saving fails', async () => {
    render(<OptDatesSection />);
    const field = await screen.findByLabelText(/STEM DSO Recommendation Date/);
    fetchMock.mockResolvedValueOnce(
      response({ ok: false, error: 'Save failed' })
    );
    fireEvent.change(field, { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Dates' }));
    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({ variant: 'destructive' })
      )
    );
    expect(
      screen.getByRole('button', { name: 'Discard changes' })
    ).toBeInTheDocument();
  });
});

describe('STEM apply tool', () => {
  it('calculates calendar-day urgency from local YYYY-MM-DD, not Date instants', async () => {
    render(<StemApplyTool />);
    await screen.findByLabelText(/STEM DSO Recommendation Date/);
    const today = new Date();
    const localISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    await waitFor(() =>
      expect(daysBetween).toHaveBeenLastCalledWith(localISO, '2027-04-30')
    );
  });
  it('labels pending work authorization without cap-gap terminology', async () => {
    render(<StemApplyTool />);
    await screen.findByLabelText(/STEM DSO Recommendation Date/);
    expect(screen.queryByText(/cap-gap/i)).not.toBeInTheDocument();
    // The form can render before the async saved-date calculation completes.
    expect(await screen.findByText(/whichever comes first/)).toHaveTextContent(
      /Confirm.*DSO/
    );
  });
  it('warns when the preview differs from saved reminder dates until saving succeeds', async () => {
    render(<StemApplyTool />);
    const field = await screen.findByLabelText(/STEM DSO Recommendation Date/);
    expect(screen.queryByText(/Unsaved preview/)).not.toBeInTheDocument();
    fireEvent.change(field, { target: { value: '03/05/2027' } });
    expect(screen.getByText(/Unsaved preview/)).toHaveTextContent(
      /reminders.*saved dates/
    );
    fetchMock.mockResolvedValueOnce(response({ ok: false }));
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not save your dates'
    );
    expect(screen.getByText(/Unsaved preview/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await screen.findByRole('button', { name: 'Saved!' });
    expect(screen.queryByText(/Unsaved preview/)).not.toBeInTheDocument();
  });
  it('loads a separate optional STEM date and uses the shared filing deadline', async () => {
    render(<StemApplyTool />);
    // The input mounts before the saved dates arrive; wait for hydration, not
    // just for the input's presence (CI can resolve the fetch later).
    await waitFor(() =>
      expect(screen.getByLabelText(/STEM DSO Recommendation Date/)).toHaveValue(
        saved.stem_dso_recommendation_date
      )
    );
    expect(getStemFilingWindow).toHaveBeenCalledWith(
      '2027-05-31',
      '2027-03-01'
    );
    expect(
      screen.getByRole('region', { name: 'Filing estimate' })
    ).toHaveTextContent('Apr 30, 2027');
  });
  it('clears the STEM date using null and omits unrelated dates', async () => {
    render(<StemApplyTool />);
    fireEvent.change(
      await screen.findByLabelText(/STEM DSO Recommendation Date/),
      { target: { value: '' } }
    );
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await screen.findByRole('button', { name: 'Saved!' });
    expect(posted()).toEqual({ stem_dso_recommendation_date: null });
    expect(getStemFilingWindow).toHaveBeenLastCalledWith('2027-05-31', null);
    expect(
      screen.getByRole('region', { name: 'Filing estimate' })
    ).toHaveTextContent('May 31, 2027');
  });
  it('does not show success for an application-level failed save', async () => {
    render(<StemApplyTool />);
    fireEvent.change(
      await screen.findByLabelText(/STEM DSO Recommendation Date/),
      { target: { value: '03/05/2027' } }
    );
    fetchMock.mockResolvedValueOnce(response({ ok: false }));
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not save your dates'
    );
    expect(
      screen.queryByRole('button', { name: 'Saved!' })
    ).not.toBeInTheDocument();
  });
  it('ignores stale loads in StrictMode after input is edited', async () => {
    const pending = deferred();
    fetchMock.mockImplementationOnce(() => pending.promise);
    render(
      <StrictMode>
        <StemApplyTool />
      </StrictMode>
    );
    const field = await screen.findByLabelText(/STEM DSO Recommendation Date/);
    fireEvent.change(field, { target: { value: '03/10/2027' } });
    await act(async () => pending.resolve(response({ ok: true, data: saved })));
    expect(field).toHaveValue('03/10/2027');
  });
  it('does not mark newer unsaved input as saved', async () => {
    const pending = deferred();
    render(<StemApplyTool />);
    const field = await screen.findByLabelText(/STEM DSO Recommendation Date/);
    await waitFor(() =>
      expect(field).toHaveValue(saved.stem_dso_recommendation_date)
    );
    fireEvent.change(field, { target: { value: '03/05/2027' } });
    fetchMock.mockImplementationOnce(() => pending.promise);
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    fireEvent.change(field, { target: { value: '03/10/2027' } });
    await act(async () => pending.resolve(response({ ok: true })));
    expect(field).toHaveValue('03/10/2027');
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
  });
  it.each(['02/30/2027', '03/'])(
    'does not calculate or save an invalid recommendation %s',
    async (value) => {
      render(<StemApplyTool />);
      fireEvent.change(
        await screen.findByLabelText(/STEM DSO Recommendation Date/),
        { target: { value } }
      );
      expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
      expect(
        screen.queryByRole('region', { name: 'Filing estimate' })
      ).not.toBeInTheDocument();
    }
  );
  it('removes the stale countdown when the EAD date is cleared', async () => {
    render(<StemApplyTool />);
    fireEvent.change(await screen.findByLabelText(/Current OPT EAD End Date/), {
      target: { value: '' },
    });
    expect(
      screen.queryByRole('region', { name: 'Filing estimate' })
    ).not.toBeInTheDocument();
  });
});

it('auto-selects the labelled STEM recommendation in the dashboard date selector', async () => {
  fetchMock.mockResolvedValue(
    response({
      ok: true,
      data: { ...saved, last_updated_field: 'stem_dso_recommendation_date' },
    })
  );
  render(<DateSelector />);
  expect(
    await screen.findByRole('button', { name: /STEM DSO Recommendation Date/ })
  ).toBeInTheDocument();
  expect(
    screen.getByText(saved.stem_dso_recommendation_date)
  ).toBeInTheDocument();
});

it.each([
  ['dashboard', OptDatesSection, 'Save Dates'],
  ['STEM tool', StemApplyTool, 'Save'],
] as const)(
  '%s blocks saving after a failed load and can retry',
  async (_name, Component, button) => {
    fetchMock.mockResolvedValueOnce(response({ ok: false }, false));
    render(<Component />);
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not load your saved dates'
    );
    expect(screen.getByRole('button', { name: button })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(
      await screen.findByLabelText(/STEM DSO Recommendation Date/)
    ).toHaveValue(saved.stem_dso_recommendation_date);
    expect(screen.getByRole('button', { name: button })).toBeEnabled();
  }
);
