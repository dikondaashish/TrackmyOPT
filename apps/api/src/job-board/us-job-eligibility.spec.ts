import {
  ashbyLocations,
  isUsCountry,
  isUsEligibleJob,
} from './us-job-eligibility';

describe('US job eligibility', () => {
  it.each([
    ['San Francisco, CA', true],
    ['Remote - United States', true],
    ['London, UK; San Francisco, CA', true],
    ['Remote', true],
    [null, true],
    ['550', true],
    ['London', false],
    ['Bangkok, Thailand', false],
    ['Remote Canada', false],
  ])('%s -> %s from the location text', (location, eligible) => {
    expect(isUsEligibleJob({ location })).toBe(eligible);
  });

  it('trusts an ATS country over the location text', () => {
    // A US address makes any text eligible.
    expect(
      isUsEligibleJob({
        location: 'London',
        location_countries: ['United Kingdom', 'United States'],
      }),
    ).toBe(true);
    // "Remote" names no country, but the ATS says Canada.
    expect(
      isUsEligibleJob({ location: 'Remote', location_countries: ['Canada'] }),
    ).toBe(false);
    // US text still wins over a foreign address.
    expect(
      isUsEligibleJob({
        location: 'Remote - US',
        location_countries: ['Canada'],
      }),
    ).toBe(true);
  });

  it('recognizes US country spellings', () => {
    for (const name of [
      'United States',
      'USA',
      'US',
      'U.S.',
      'United States of America',
    ])
      expect(isUsCountry(name)).toBe(true);
    for (const name of ['United Kingdom', 'Canada', 'Australia'])
      expect(isUsCountry(name)).toBe(false);
  });

  it('combines Ashby primary and secondary locations with their countries', () => {
    expect(
      ashbyLocations({
        location: 'London',
        address: { postalAddress: { addressCountry: 'United Kingdom' } },
        secondaryLocations: [
          {
            location: 'New York City',
            address: { postalAddress: { addressCountry: 'United States' } },
          },
          {
            location: 'London',
            address: { postalAddress: { addressCountry: 'United Kingdom' } },
          },
        ],
      }),
    ).toEqual({
      location: 'London | New York City',
      countries: ['United Kingdom', 'United States'],
    });
    expect(ashbyLocations({ location: 'Remote' })).toEqual({
      location: 'Remote',
      countries: [],
    });
    expect(ashbyLocations({})).toEqual({ location: null, countries: [] });
  });

  it('keeps the stored location within the 1,000-character column', () => {
    const secondaryLocations = Array.from({ length: 80 }, (_, i) => ({
      location: `Some Long City Name Number ${i}, ST`,
    }));
    const { location } = ashbyLocations({
      location: 'Austin, TX',
      secondaryLocations,
    });
    expect(location!.length).toBeLessThanOrEqual(1000);
    expect(location!.startsWith('Austin, TX | ')).toBe(true);
  });
});
