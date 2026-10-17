import {
  jobPlaceKeys,
  matchesPlaceKeys,
  parsePlaceKeys,
  placeLabel,
  readJobLocation,
} from './us-location';

/** Location strings below are taken from open production jobs. */
describe('readJobLocation', () => {
  it.each([
    ['San Francisco, CA', ['CA'], ['San Francisco, CA']],
    ['San Francisco', ['CA'], ['San Francisco, CA']],
    ['SF Office', ['CA'], ['San Francisco, CA']],
    ['New York, NY (HQ)', ['NY'], ['New York, NY']],
    ['New York City, United States', ['NY'], ['New York, NY']],
    ['White Plains, New York, United States', ['NY'], ['White Plains, NY']],
    ['Washington, DC', ['DC'], ['Washington, DC']],
    ['Beverly Hills, California, United States', ['CA'], ['Beverly Hills, CA']],
    ['United States- Mossville, Illinois', ['IL'], ['Mossville, IL']],
    ['Tualatin, OR', ['OR'], ['Tualatin, OR']],
    ['Albany NY', ['NY'], ['Albany, NY']],
    ['Dublin, CA (HQ)', ['CA'], ['Dublin, CA']],
    ['Vancouver, WA', ['WA'], ['Vancouver, WA']],
    ['Woodfield Mall, Schaumburg, IL (10112)', ['IL'], ['Schaumburg, IL']],
    ['Dallas-Fort Worth, Texas', ['TX'], ['Dallas-Fort Worth, TX']],
    ['Atlanta - Onsite', ['GA'], ['Atlanta, GA']],
    ['Texas, United States', ['TX'], []],
    ['New York State', ['NY'], []],
    ['Virtual Prep Academy of Missouri', ['MO'], []],
  ])('%s is in the US', (location, states, cities) => {
    const info = readJobLocation(location);
    expect(info.scope).toBe('us');
    expect(info.states).toEqual(states);
    expect(info.cities).toEqual(cities);
  });

  it('reads every place of a multi-location job', () => {
    expect(
      readJobLocation('San Francisco, CA | New York City, NY | Seattle, WA'),
    ).toEqual({
      scope: 'us',
      states: ['CA', 'NY', 'WA'],
      cities: ['San Francisco, CA', 'New York, NY', 'Seattle, WA'],
      remoteUs: false,
    });
    expect(
      readJobLocation('US-Remote | US-VA-Arlington | US-NC-Chapel Hill').cities,
    ).toEqual(['Arlington, VA', 'Chapel Hill, NC']);
  });

  it('keeps a job offered in the US and abroad', () => {
    const info = readJobLocation(
      'London, UK; Ontario, CAN; Remote-Friendly, United States; San Francisco, CA',
    );
    expect(info.scope).toBe('us');
    expect(info.cities).toEqual(['San Francisco, CA']);
    expect(info.remoteUs).toBe(true);
  });

  it.each([
    'London',
    'London, UK',
    'Bangkok, Thailand',
    'Pangyo (Software Dream Center), South Korea',
    'Campinas, São Paulo, Brasil',
    'Campinas-SP',
    'Remote Canada',
    'Remote - India',
    'Argentina - Fully Remote',
    'Toronto, ON',
    'Berlin, DE',
    'Vienna, Austria',
    'Cambridge, UK',
    'Vancouver',
    'Dublin, IE',
    'Latin America',
    'Southgate Centre, Edmonton, AB (10071)',
    'Bangkok (One Bangkok Office) or Seoul office',
  ])('%s is outside the US', (location) => {
    const info = readJobLocation(location);
    expect(info.scope).toBe('non_us');
    expect(info.remoteUs).toBe(false);
    expect(jobPlaceKeys(info)).toEqual([]);
  });

  it.each([
    ['Remote - United States', true],
    ['Remote US', true],
    ['Remote, USA', true],
    ['Remote-NAMER', true],
    ['United States', false],
    ['Remote (United States | Canada)', true],
  ])('%s is a US job (remote: %s)', (location, remote) => {
    const info = readJobLocation(location);
    expect(info.scope).toBe('us');
    expect(info.remoteUs).toBe(remote);
  });

  it.each(['Remote', 'Fully Remote', '550', 'Lincoln Park Academy', ''])(
    '%s names no country and stays visible',
    (location) => {
      expect(readJobLocation(location).scope).toBe('unknown');
    },
  );

  it('counts remote without a country as US remote, but not foreign remote', () => {
    expect(readJobLocation('Remote').remoteUs).toBe(true);
    expect(readJobLocation('Remote Canada').remoteUs).toBe(false);
    expect(readJobLocation('Remote Canada | San Francisco, CA').remoteUs).toBe(
      false,
    );
  });
});

describe('place keys', () => {
  it('lists the states, cities and remote option a job matches', () => {
    expect(jobPlaceKeys(readJobLocation('Boston or Remote'))).toEqual([
      'state:MA',
      'city:Boston, MA',
      'remote:us',
    ]);
    // Washington, DC is offered once, as a city.
    expect(jobPlaceKeys(readJobLocation('Washington, DC'))).toEqual([
      'city:Washington, DC',
    ]);
  });

  it('matches any selected place', () => {
    const info = readJobLocation('Cambridge, MA');
    expect(matchesPlaceKeys(info, [])).toBe(true);
    expect(matchesPlaceKeys(info, ['state:NY', 'state:MA'])).toBe(true);
    expect(matchesPlaceKeys(info, ['city:Boston, MA'])).toBe(false);
  });

  it('labels and validates keys', () => {
    expect(placeLabel('state:MA')).toEqual({
      kind: 'state',
      label: 'Massachusetts',
    });
    expect(placeLabel('city:Boston, MA')).toEqual({
      kind: 'city',
      label: 'Boston, MA',
    });
    expect(placeLabel('remote:us')).toEqual({
      kind: 'remote',
      label: 'Remote (US)',
    });
    expect(
      parsePlaceKeys([
        'state:MA',
        'state:ZZ',
        'state:DC',
        'city:Boston',
        'x',
        'state:MA',
      ]),
    ).toEqual(['state:MA']);
  });
});
