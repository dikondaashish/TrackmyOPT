import { buildJobLocationIndex, jobLocationFilter } from './job-location-index';

describe('job location index', () => {
  const index = buildJobLocationIndex([
    { location: 'San Francisco, CA', count: 291 },
    { location: 'San Francisco', count: 594 },
    { location: 'London', count: 156 },
    { location: 'Remote', count: 153 },
    { location: 'Boston, MA', count: 41 },
    { location: 'London, UK; Boston, MA', count: 2 },
  ]);

  it('lists US places with open-job counts, most jobs first', () => {
    expect(index.places.slice(0, 4)).toEqual([
      { key: 'state:CA', kind: 'state', label: 'California', count: 885 },
      {
        key: 'city:San Francisco, CA',
        kind: 'city',
        label: 'San Francisco, CA',
        count: 885,
      },
      { key: 'remote:us', kind: 'remote', label: 'Remote (US)', count: 153 },
      { key: 'city:Boston, MA', kind: 'city', label: 'Boston, MA', count: 43 },
    ]);
    expect(index.nonUs).toEqual(['London']);
  });

  it('resolves the country and place filters to exact location strings', () => {
    expect(jobLocationFilter(index, {})).toBeUndefined();
    expect(jobLocationFilter(index, { country: 'all' })).toBeUndefined();
    expect(jobLocationFilter(index, { country: 'us' })).toEqual({
      excluded: ['London'],
    });
    expect(
      jobLocationFilter(index, { places: ['state:MA', 'city:Boston, MA'] }),
    ).toEqual({ included: ['Boston, MA', 'London, UK; Boston, MA'] });
    // An unknown place matches nothing rather than everything.
    expect(jobLocationFilter(index, { places: ['state:WY'] })).toEqual({
      included: [],
    });
  });
});
