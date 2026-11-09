import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import {
  MAX_STEM_CIP_RESULTS,
  StemCipSearch,
  filterStemCipCodes,
} from './StemCipSearch';
import {
  STEM_CIP_CODES,
  STEM_CIP_LIST_PUBLISHED_COUNT,
} from '@/data/stem-cip-list';

afterEach(() => {
  cleanup();
});

const search = (value: string) =>
  fireEvent.change(screen.getByLabelText('CIP code or field of study'), {
    target: { value },
  });

describe('STEM CIP list data', () => {
  it('holds every published row once, in code order', () => {
    expect(STEM_CIP_CODES).toHaveLength(STEM_CIP_LIST_PUBLISHED_COUNT);
    const codes = STEM_CIP_CODES.map((entry) => entry.code);
    expect(new Set(codes).size).toBe(codes.length);
    expect([...codes].sort()).toEqual(codes);
    for (const entry of STEM_CIP_CODES) {
      expect(entry.code).toMatch(/^\d{2}\.\d{4}$/);
      expect(entry.title.trim()).not.toBe('');
    }
  });
});

describe('filterStemCipCodes', () => {
  it('matches a code typed with or without the dot', () => {
    expect(filterStemCipCodes('11.0701')).toEqual([
      { code: '11.0701', title: 'Computer Science.' },
    ]);
    expect(filterStemCipCodes('110701')).toEqual(filterStemCipCodes('11.0701'));
    expect(filterStemCipCodes(' 11.07 ').map((entry) => entry.code)).toEqual([
      '11.0701',
    ]);
  });

  it('matches titles case-insensitively', () => {
    const codes = filterStemCipCodes('DATA SCIENCE').map((entry) => entry.code);
    expect(codes).toContain('30.7001');
  });

  it('returns nothing for an empty query or a code not on the list', () => {
    expect(filterStemCipCodes('   ')).toEqual([]);
    expect(filterStemCipCodes('52.0201')).toEqual([]);
  });
});

describe('StemCipSearch', () => {
  it('prompts before the reader types', () => {
    render(<StemCipSearch />);
    expect(screen.getByRole('status')).toHaveTextContent(
      `search ${STEM_CIP_LIST_PUBLISHED_COUNT} codes`
    );
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });

  it('shows a single match and its count', () => {
    render(<StemCipSearch />);
    search('110701');
    expect(screen.getByRole('status')).toHaveTextContent('1 match.');
    expect(screen.getByRole('listitem')).toHaveTextContent(
      '11.0701Computer Science.'
    );
  });

  it('caps the results at 50 and reports the full count', () => {
    render(<StemCipSearch />);
    search('26');
    const total = filterStemCipCodes('26').length;
    expect(total).toBeGreaterThan(MAX_STEM_CIP_RESULTS);
    expect(screen.getAllByRole('listitem')).toHaveLength(MAX_STEM_CIP_RESULTS);
    expect(screen.getByRole('status')).toHaveTextContent(
      `Showing ${MAX_STEM_CIP_RESULTS} of ${total} matches`
    );
    expect(screen.getByText(/whole 26 series as STEM/)).toBeInTheDocument();
  });

  it('says when nothing matches without claiming ineligibility', () => {
    render(<StemCipSearch />);
    search('underwater basket weaving');
    expect(screen.getByRole('status')).toHaveTextContent(
      'No match on the July 22, 2024 list.'
    );
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });
});
