import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { EmploymentSpanRow } from './EmploymentSpanRow';
import {
  mapEmploymentSpans,
  type EmploymentSpan,
} from './employment-history-helpers';

afterEach(cleanup);
const span: EmploymentSpan = {
  id: 'test-job',
  employer_name: 'Example Company',
  employer_domain: 'example.com',
  start_date: '2026-01-01',
  end_date: null,
  is_current: true,
};
const props = { saving: false, onEdit: vi.fn(), onDelete: vi.fn() };

it('renders a saved domain after reload while preserving dates and actions', () => {
  const restored = mapEmploymentSpans(JSON.parse(JSON.stringify([span])))[0];
  const { container } = render(
    <EmploymentSpanRow {...props} span={restored} />
  );
  const logo = container.querySelector('img')!;
  expect(new URL(logo.src).searchParams.get('url')).toBe('https://example.com');
  expect(new URL(logo.src).searchParams.get('size')).toBe('256');
  expect(screen.getByText('Current')).toBeInTheDocument();
  expect(screen.getByText(/Present/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
  expect(props.onEdit).toHaveBeenCalledWith(restored);
  fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
  expect(props.onDelete).toHaveBeenCalledWith(span.id, span.employer_name);
});

it.each([
  ['Zyene, inc.', 'zyene.com'],
  ['LightningMinds', 'lightningminds.ai'],
])(
  'shows the logo for existing %s records without a saved domain',
  (name, domain) => {
    const { container } = render(
      <EmploymentSpanRow
        {...props}
        span={{ ...span, employer_name: name, employer_domain: undefined }}
      />
    );
    expect(
      new URL(container.querySelector('img')!.src).searchParams.get('url')
    ).toBe(`https://${domain}`);
  }
);

it('uses readable initials for unknown employers and broken images', () => {
  const view = render(
    <EmploymentSpanRow
      {...props}
      span={{ ...span, employer_domain: undefined }}
    />
  );
  expect(view.container.querySelector('img')).toBeNull();
  expect(screen.getByText('EC')).toHaveClass('text-primary');
  view.rerender(<EmploymentSpanRow {...props} span={span} />);
  fireEvent.error(view.container.querySelector('img')!);
  expect(view.container.querySelector('img')).toBeNull();
  expect(screen.getByText('EC')).toBeInTheDocument();
  // A previous failure must not suppress a different, corrected website.
  view.rerender(
    <EmploymentSpanRow
      {...props}
      span={{ ...span, employer_domain: 'corrected.com' }}
    />
  );
  expect(
    new URL(view.container.querySelector('img')!.src).searchParams.get('url')
  ).toBe('https://corrected.com');
});
