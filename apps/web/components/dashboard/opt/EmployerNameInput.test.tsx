import { useState } from 'react';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { EmployerNameInput } from './EmployerNameInput';
import { employerSuggestionLogoUrl } from './EmployerSuggestionLogo';
import { EmploymentSpanForm } from './EmploymentSpanForm';

const companies = [
  { name: 'Amazon', domain: 'amazon.com' },
  { name: 'Amazon Web Services', domain: 'aws.amazon.com' },
];
const response = (data: unknown = companies) => ({
  ok: true,
  json: async () => data,
});
function Form() {
  const [value, setValue] = useState('');
  return <EmployerNameInput value={value} onChange={setValue} />;
}
const type = (value: string) =>
  fireEvent.change(screen.getByRole('combobox'), { target: { value } });
const tick = async (ms = 300) =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response()));
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

it('waits for three characters and debounces requests using only the public client ID', async () => {
  render(<Form />);
  type('Am');
  await tick();
  expect(fetch).not.toHaveBeenCalled();
  type('Ama');
  await tick(150);
  type('Amaz');
  await tick(299);
  expect(fetch).not.toHaveBeenCalled();
  await tick(1);
  expect(fetch).toHaveBeenCalledTimes(1);
  const [url, options] = vi.mocked(fetch).mock.calls[0];
  expect(String(url)).toContain('/search/Amaz?c=');
  expect(options).toMatchObject({
    credentials: 'omit',
    cache: 'no-store',
    referrerPolicy: 'no-referrer',
  });
  expect(options).not.toHaveProperty('headers');
});

it('supports keyboard selection without changing anything until Enter', async () => {
  render(<Form />);
  type('Ama');
  await tick();
  fireEvent.keyDown(screen.getByRole('combobox'), { key: 'ArrowDown' });
  expect(screen.getByRole('combobox')).toHaveValue('Ama');
  expect(screen.getByRole('combobox')).toHaveAttribute('aria-activedescendant');
  fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' });
  expect(screen.getByRole('combobox')).toHaveValue('Amazon');
  expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  await tick();
  expect(fetch).toHaveBeenCalledTimes(1);
});

it('selects with a click and allows editing the legal employer name', async () => {
  render(<Form />);
  type('Ama');
  await tick();
  fireEvent.click(screen.getByRole('option', { name: /Amazon Web Services/ }));
  expect(screen.getByRole('combobox')).toHaveValue('Amazon Web Services');
  type('Amazon Web Services, Inc.');
  expect(screen.getByRole('combobox')).toHaveValue('Amazon Web Services, Inc.');
});

it('Escape dismisses results and Tab never silently selects one', async () => {
  render(<Form />);
  type('Ama');
  await tick();
  fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Escape' });
  expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  type('Amaz');
  await tick();
  fireEvent.keyDown(screen.getByRole('combobox'), { key: 'ArrowDown' });
  fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Tab' });
  expect(screen.getByRole('combobox')).toHaveValue('Amaz');
  expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
});

it.each([[], null, [{ name: null, domain: 'bad.test' }]].map((data) => [data]))(
  'allows manual names with no usable results: %j',
  async (data) => {
    vi.mocked(fetch).mockResolvedValue(response(data) as Response);
    render(<Form />);
    type('My company');
    await tick();
    expect(screen.getByRole('combobox')).toHaveValue('My company');
    expect(screen.queryByRole('option')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(/keep the name/i);
  }
);

it('keeps manual entry available after a rate-limit failure', async () => {
  vi.mocked(fetch).mockResolvedValue({ ok: false, status: 429 } as Response);
  render(<Form />);
  type('My employer');
  await tick();
  expect(screen.getByRole('status')).toHaveTextContent(/unavailable/i);
  expect(screen.getByRole('combobox')).toHaveValue('My employer');
});

it('ignores stale responses and aborts previous requests', async () => {
  let resolveOld!: (value: Response) => void;
  vi.mocked(fetch).mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        resolveOld = resolve;
      })
  );
  render(<Form />);
  type('Ama');
  await tick();
  const signal = vi.mocked(fetch).mock.calls[0][1]!.signal!;
  type('Mic');
  expect(signal.aborted).toBe(true);
  vi.mocked(fetch).mockResolvedValue(
    response([{ name: 'Microsoft', domain: 'microsoft.com' }]) as Response
  );
  await tick();
  await act(async () => {
    resolveOld(response() as Response);
  });
  expect(screen.getAllByRole('option')).toHaveLength(1);
  expect(screen.getByRole('option')).toHaveTextContent('Microsoft');
});

it('cancels pending searches on blur, short input and unmount', async () => {
  const view = render(<Form />);
  type('Ama');
  fireEvent.blur(screen.getByRole('combobox'));
  await tick();
  expect(fetch).not.toHaveBeenCalled();
  type('Amaz');
  type('A');
  await tick();
  expect(fetch).not.toHaveBeenCalled();
  type('Amazon');
  view.unmount();
  await tick();
  expect(fetch).not.toHaveBeenCalled();
});

it('shows at most five suggestions and renders response text safely', async () => {
  vi.mocked(fetch).mockResolvedValue(
    response(
      Array.from({ length: 8 }, (_, i) => ({
        name: '<img onerror=bad>' + i,
        domain: `company${i}.com`,
      }))
    ) as Response
  );
  render(<Form />);
  type('Com');
  await tick();
  expect(screen.getAllByRole('option')).toHaveLength(5);
  expect(document.body.innerHTML).not.toContain('<img onerror=bad>');
});

it('shows a decorative high-resolution company logo for each suggestion', async () => {
  render(<Form />);
  type('Ama');
  await tick();
  const logo = document.querySelector('img');
  expect(logo).toHaveAttribute('alt', '');
  expect(logo?.getAttribute('src')).toContain(
    'https://t1.gstatic.com/faviconV2?'
  );
  expect(logo?.getAttribute('src')).toContain('size=256');
  expect(logo?.getAttribute('src')).toContain('amazon.com');
});

it('uses the hostname from scheme-bearing company domains', () => {
  const logoUrl = new URL(employerSuggestionLogoUrl('https://example.com')!);
  expect(logoUrl.searchParams.get('url')).toBe('https://example.com');
  expect(logoUrl.searchParams.get('size')).toBe('256');
});

it('falls back to company initials if a logo cannot be loaded', async () => {
  render(<Form />);
  type('Ama');
  await tick();
  const option = screen.getAllByRole('option')[0];
  const logo = option.querySelector('img');
  expect(logo).not.toBeNull();
  fireEvent.error(logo!);
  expect(option.querySelector('img')).toBeNull();
  expect(within(option).getByText('A')).toBeInTheDocument();
});

it('does not search while composing text', async () => {
  render(<Form />);
  fireEvent.compositionStart(screen.getByRole('combobox'));
  type('Ama');
  await tick();
  expect(fetch).not.toHaveBeenCalled();
  fireEvent.compositionEnd(screen.getByRole('combobox'));
  await tick();
  expect(fetch).toHaveBeenCalledTimes(1);
});

it('times out a stalled lookup without blocking manual entry', async () => {
  vi.mocked(fetch).mockImplementation(
    (_url, options) =>
      new Promise((_resolve, reject) => {
        options?.signal?.addEventListener('abort', () =>
          reject(new Error('Aborted'))
        );
      })
  );
  render(<Form />);
  type('Example');
  await tick();
  expect(screen.getByRole('status')).toHaveTextContent('Searching');
  await tick(8000);
  expect(screen.getByRole('status')).toHaveTextContent('unavailable');
  expect(screen.getByRole('combobox')).toHaveValue('Example');
});

it('selection in the real employment form changes only employer and never saves automatically', async () => {
  const employer = vi.fn(),
    start = vi.fn(),
    end = vi.fn(),
    current = vi.fn(),
    submit = vi.fn();
  render(
    <EmploymentSpanForm
      employer=""
      startDate="09/01/2026"
      endDate="09/22/2026"
      isCurrent={false}
      saving={false}
      submitLabel="Save Employment"
      onEmployerChange={employer}
      onStartDateChange={start}
      onEndDateChange={end}
      onIsCurrentChange={current}
      onCancel={vi.fn()}
      onSubmit={submit}
    />
  );
  // Controlled parent receives typed input; render its updated value.
  type('Ama');
  cleanup();
  render(
    <EmploymentSpanForm
      employer="Ama"
      startDate="09/01/2026"
      endDate="09/22/2026"
      isCurrent={false}
      saving={false}
      submitLabel="Save Employment"
      onEmployerChange={employer}
      onStartDateChange={start}
      onEndDateChange={end}
      onIsCurrentChange={current}
      onCancel={vi.fn()}
      onSubmit={submit}
    />
  );
  fireEvent.keyDown(screen.getByRole('combobox'), { key: 'ArrowDown' });
  await tick();
  fireEvent.click(
    screen.getByRole('option', { name: /^Amazon\s*amazon.com$/ })
  );
  expect(employer).toHaveBeenLastCalledWith('Amazon');
  for (const callback of [start, end, current, submit])
    expect(callback).not.toHaveBeenCalled();
  expect(screen.getByDisplayValue('09/01/2026')).toBeInTheDocument();
  expect(screen.getByDisplayValue('09/22/2026')).toBeInTheDocument();
});
