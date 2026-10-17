/**
 * US location reading for the job board. Shared verbatim by apps/api (which
 * filters and counts jobs with it) and apps/web (which applies the same
 * filters to loaded jobs and maps resume preferences to places); a sync spec
 * keeps the copies identical.
 *
 * ATS location text is free-form ("San Francisco, CA | New York City, NY",
 * "Remote - United States", "London, England, United Kingdom", "Pangyo
 * (Software Dream Center), South Korea"). A job is:
 * - `us` when any of its places is in the United States (a job offered in
 *   both London and New York is a US job);
 * - `non_us` when it names only places outside the United States;
 * - `unknown` when nothing identifies a country ("Remote", "550"). Unknown
 *   jobs stay visible: hiding them would hide real US jobs.
 */

export type JobLocationScope = 'us' | 'non_us' | 'unknown';

export type UsPlaceKind = 'state' | 'city' | 'remote';

export type JobLocationInfo = {
  scope: JobLocationScope;
  /** Two-letter codes of the US states (and DC, PR) the job names. */
  states: string[];
  /** US cities as "City, ST". */
  cities: string[];
  /** Remote within the US, or remote with no country stated. */
  remoteUs: boolean;
};

/** Filter keys: `state:CA`, `city:San Francisco, CA`, `remote:us`. */
export const REMOTE_US_PLACE_KEY = 'remote:us';

export const US_STATES: Readonly<Record<string, string>> = {
  AL: 'Alabama',
  AK: 'Alaska',
  AZ: 'Arizona',
  AR: 'Arkansas',
  CA: 'California',
  CO: 'Colorado',
  CT: 'Connecticut',
  DE: 'Delaware',
  DC: 'District of Columbia',
  FL: 'Florida',
  GA: 'Georgia',
  HI: 'Hawaii',
  ID: 'Idaho',
  IL: 'Illinois',
  IN: 'Indiana',
  IA: 'Iowa',
  KS: 'Kansas',
  KY: 'Kentucky',
  LA: 'Louisiana',
  ME: 'Maine',
  MD: 'Maryland',
  MA: 'Massachusetts',
  MI: 'Michigan',
  MN: 'Minnesota',
  MS: 'Mississippi',
  MO: 'Missouri',
  MT: 'Montana',
  NE: 'Nebraska',
  NV: 'Nevada',
  NH: 'New Hampshire',
  NJ: 'New Jersey',
  NM: 'New Mexico',
  NY: 'New York',
  NC: 'North Carolina',
  ND: 'North Dakota',
  OH: 'Ohio',
  OK: 'Oklahoma',
  OR: 'Oregon',
  PA: 'Pennsylvania',
  PR: 'Puerto Rico',
  RI: 'Rhode Island',
  SC: 'South Carolina',
  SD: 'South Dakota',
  TN: 'Tennessee',
  TX: 'Texas',
  UT: 'Utah',
  VT: 'Vermont',
  VA: 'Virginia',
  WA: 'Washington',
  WV: 'West Virginia',
  WI: 'Wisconsin',
  WY: 'Wyoming',
};

const STATE_BY_NAME = new Map(
  Object.entries(US_STATES).map(([code, name]) => [fold(name), code]),
);
STATE_BY_NAME.set('washington state', 'WA');
STATE_BY_NAME.set('new york state', 'NY');
STATE_BY_NAME.set('d.c.', 'DC');
STATE_BY_NAME.set('dc', 'DC');

/** Cities often written without a state, with the state they mean. */
const US_CITIES: Readonly<Record<string, string>> = {
  'new york': 'NY',
  'los angeles': 'CA',
  chicago: 'IL',
  houston: 'TX',
  phoenix: 'AZ',
  philadelphia: 'PA',
  'san antonio': 'TX',
  'san diego': 'CA',
  dallas: 'TX',
  'san jose': 'CA',
  austin: 'TX',
  jacksonville: 'FL',
  'fort worth': 'TX',
  columbus: 'OH',
  charlotte: 'NC',
  indianapolis: 'IN',
  'san francisco': 'CA',
  seattle: 'WA',
  denver: 'CO',
  'washington dc': 'DC',
  nashville: 'TN',
  'oklahoma city': 'OK',
  'el paso': 'TX',
  boston: 'MA',
  portland: 'OR',
  'las vegas': 'NV',
  detroit: 'MI',
  memphis: 'TN',
  louisville: 'KY',
  baltimore: 'MD',
  milwaukee: 'WI',
  albuquerque: 'NM',
  tucson: 'AZ',
  fresno: 'CA',
  sacramento: 'CA',
  mesa: 'AZ',
  'kansas city': 'MO',
  atlanta: 'GA',
  omaha: 'NE',
  'colorado springs': 'CO',
  raleigh: 'NC',
  'long beach': 'CA',
  'virginia beach': 'VA',
  miami: 'FL',
  oakland: 'CA',
  minneapolis: 'MN',
  tulsa: 'OK',
  bakersfield: 'CA',
  wichita: 'KS',
  arlington: 'VA',
  tampa: 'FL',
  'new orleans': 'LA',
  cleveland: 'OH',
  honolulu: 'HI',
  anaheim: 'CA',
  orlando: 'FL',
  irvine: 'CA',
  pittsburgh: 'PA',
  cincinnati: 'OH',
  'st. louis': 'MO',
  'saint louis': 'MO',
  'st louis': 'MO',
  'salt lake city': 'UT',
  'santa clara': 'CA',
  'santa monica': 'CA',
  sunnyvale: 'CA',
  'mountain view': 'CA',
  'palo alto': 'CA',
  'menlo park': 'CA',
  'redwood city': 'CA',
  'san mateo': 'CA',
  'foster city': 'CA',
  'san carlos': 'CA',
  'south san francisco': 'CA',
  cupertino: 'CA',
  'los gatos': 'CA',
  milpitas: 'CA',
  fremont: 'CA',
  pleasanton: 'CA',
  emeryville: 'CA',
  berkeley: 'CA',
  burlingame: 'CA',
  'el segundo': 'CA',
  'beverly hills': 'CA',
  'culver city': 'CA',
  pasadena: 'CA',
  burbank: 'CA',
  glendale: 'CA',
  'newport beach': 'CA',
  'costa mesa': 'CA',
  carlsbad: 'CA',
  'la jolla': 'CA',
  hawthorne: 'CA',
  torrance: 'CA',
  'long island city': 'NY',
  brooklyn: 'NY',
  manhattan: 'NY',
  'jersey city': 'NJ',
  hoboken: 'NJ',
  newark: 'NJ',
  princeton: 'NJ',
  stamford: 'CT',
  'new haven': 'CT',
  hartford: 'CT',
  providence: 'RI',
  cambridge: 'MA',
  somerville: 'MA',
  waltham: 'MA',
  burlington: 'MA',
  bellevue: 'WA',
  redmond: 'WA',
  kirkland: 'WA',
  tacoma: 'WA',
  spokane: 'WA',
  boulder: 'CO',
  'fort collins': 'CO',
  plano: 'TX',
  irving: 'TX',
  frisco: 'TX',
  'the woodlands': 'TX',
  scottsdale: 'AZ',
  tempe: 'AZ',
  chandler: 'AZ',
  lehi: 'UT',
  provo: 'UT',
  'ann arbor': 'MI',
  madison: 'WI',
  'st. paul': 'MN',
  'saint paul': 'MN',
  durham: 'NC',
  'chapel hill': 'NC',
  'research triangle park': 'NC',
  richmond: 'VA',
  mclean: 'VA',
  reston: 'VA',
  herndon: 'VA',
  chantilly: 'VA',
  tysons: 'VA',
  'tysons corner': 'VA',
  fairfax: 'VA',
  alexandria: 'VA',
  'fort belvoir': 'VA',
  springfield: 'VA',
  'crystal city': 'VA',
  vienna: 'VA',
  bethesda: 'MD',
  rockville: 'MD',
  'silver spring': 'MD',
  columbia: 'MD',
  annapolis: 'MD',
  'fort meade': 'MD',
  huntsville: 'AL',
  birmingham: 'AL',
  charleston: 'SC',
  greenville: 'SC',
  savannah: 'GA',
  'fort lauderdale': 'FL',
  'boca raton': 'FL',
  'west palm beach': 'FL',
  'st. petersburg': 'FL',
  tallahassee: 'FL',
  gainesville: 'FL',
  'miami beach': 'FL',
  'des moines': 'IA',
  'west des moines': 'IA',
  'sioux falls': 'SD',
  boise: 'ID',
  reno: 'NV',
  anchorage: 'AK',
  'baton rouge': 'LA',
  'little rock': 'AR',
  knoxville: 'TN',
  chattanooga: 'TN',
  lexington: 'KY',
  buffalo: 'NY',
  rochester: 'NY',
  albany: 'NY',
  syracuse: 'NY',
  'white plains': 'NY',
  dayton: 'OH',
  akron: 'OH',
  toledo: 'OH',
  'grand rapids': 'MI',
  'king of prussia': 'PA',
  'state college': 'PA',
  wilmington: 'DE',
  alameda: 'CA',
  'south bend': 'IN',
  'idaho falls': 'ID',
  'fort wayne': 'IN',
  tualatin: 'OR',
  elyria: 'OH',
  leominster: 'MA',
  inkster: 'MI',
  hayward: 'CA',
  'walnut creek': 'CA',
  'thousand oaks': 'CA',
  watertown: 'MA',
  'san juan': 'PR',
};

/** City spellings that name another city entry. */
const CITY_ALIASES: Readonly<Record<string, string>> = {
  nyc: 'new york',
  'new york city': 'new york',
  'ny city': 'new york',
  sf: 'san francisco',
  'san fran': 'san francisco',
  'sf bay area': 'san francisco',
  'san francisco bay area': 'san francisco',
  'bay area': 'san francisco',
  la: 'los angeles',
  'washington d.c.': 'washington dc',
  'washington d.c': 'washington dc',
  'washington, d.c.': 'washington dc',
  'district of columbia': 'washington dc',
  dc: 'washington dc',
  'd.c.': 'washington dc',
  philly: 'philadelphia',
  atl: 'atlanta',
  chi: 'chicago',
  'salt lake': 'salt lake city',
  slc: 'salt lake city',
  'st petersburg': 'st. petersburg',
};

/** Regions that are wholly inside the United States. */
const US_REGIONS = new Set([
  'silicon valley',
  'new england',
  'pacific northwest',
  'midwest',
  'east coast',
  'west coast',
  'southeast',
  'southwest',
  'northeast',
  'mid-atlantic',
  'tri-state area',
  'east bay',
  'east bay area',
]);

const US_COUNTRY = new Set([
  'us',
  'usa',
  'u.s.',
  'u.s',
  'u.s.a.',
  'u.s.a',
  'united states',
  'united states of america',
  'america',
  'americas',
  'north america',
  'amer',
  'nationwide',
  'united sates',
  'namer',
  'noram',
  'na',
  'north american',
  'guam',
  'us nationwide',
  'anywhere in the us',
]);

const NON_US_COUNTRIES = [
  'afghanistan',
  'albania',
  'algeria',
  'andorra',
  'angola',
  'argentina',
  'armenia',
  'australia',
  'austria',
  'azerbaijan',
  'bahamas',
  'bahrain',
  'bangladesh',
  'barbados',
  'belarus',
  'belgium',
  'belize',
  'benin',
  'bhutan',
  'bolivia',
  'bosnia and herzegovina',
  'bosnia',
  'botswana',
  'brazil',
  'brasil',
  'brunei',
  'bulgaria',
  'burkina faso',
  'burundi',
  'cambodia',
  'cameroon',
  'canada',
  'cape verde',
  'chad',
  'chile',
  'china',
  'colombia',
  'congo',
  'costa rica',
  "cote d'ivoire",
  'ivory coast',
  'croatia',
  'cuba',
  'cyprus',
  'czech republic',
  'czechia',
  'denmark',
  'djibouti',
  'dominican republic',
  'ecuador',
  'egypt',
  'el salvador',
  'estonia',
  'eswatini',
  'ethiopia',
  'fiji',
  'finland',
  'france',
  'gabon',
  'gambia',
  'germany',
  'deutschland',
  'ghana',
  'greece',
  'guatemala',
  'guinea',
  'guyana',
  'haiti',
  'honduras',
  'hong kong',
  'hungary',
  'iceland',
  'india',
  'indonesia',
  'iran',
  'iraq',
  'ireland',
  'israel',
  'italy',
  'jamaica',
  'japan',
  'jordan',
  'kazakhstan',
  'kenya',
  'korea',
  'south korea',
  'republic of korea',
  'kosovo',
  'kuwait',
  'kyrgyzstan',
  'laos',
  'latvia',
  'lebanon',
  'lesotho',
  'liberia',
  'libya',
  'liechtenstein',
  'lithuania',
  'luxembourg',
  'macau',
  'madagascar',
  'malawi',
  'malaysia',
  'maldives',
  'mali',
  'malta',
  'mauritania',
  'mauritius',
  'mexico',
  'moldova',
  'monaco',
  'mongolia',
  'montenegro',
  'morocco',
  'mozambique',
  'myanmar',
  'namibia',
  'nepal',
  'netherlands',
  'the netherlands',
  'holland',
  'new zealand',
  'nicaragua',
  'niger',
  'nigeria',
  'north macedonia',
  'macedonia',
  'norway',
  'oman',
  'pakistan',
  'palestine',
  'panama',
  'papua new guinea',
  'paraguay',
  'peru',
  'philippines',
  'poland',
  'portugal',
  'qatar',
  'romania',
  'russia',
  'russian federation',
  'rwanda',
  'saudi arabia',
  'ksa',
  'senegal',
  'serbia',
  'seychelles',
  'sierra leone',
  'singapore',
  'slovakia',
  'slovenia',
  'somalia',
  'south africa',
  'spain',
  'espana',
  'sri lanka',
  'sudan',
  'suriname',
  'sweden',
  'switzerland',
  'syria',
  'taiwan',
  'tajikistan',
  'tanzania',
  'thailand',
  'togo',
  'trinidad and tobago',
  'tunisia',
  'turkey',
  'turkiye',
  'turkmenistan',
  'uganda',
  'ukraine',
  'united arab emirates',
  'uae',
  'united kingdom',
  'uk',
  'u.k.',
  'great britain',
  'britain',
  'england',
  'scotland',
  'wales',
  'northern ireland',
  'uruguay',
  'uzbekistan',
  'venezuela',
  'vietnam',
  'viet nam',
  'yemen',
  'zambia',
  'zimbabwe',
  // Regions that do not include the United States.
  'emea',
  'apac',
  'apj',
  'latam',
  'latin america',
  'south america',
  'central america',
  'europe',
  'eu',
  'asia',
  'asia pacific',
  'africa',
  'middle east',
  'oceania',
  'anz',
  'nordics',
  'dach',
  'benelux',
  'mena',
  'uk&i',
  'ukie',
  'can',
  'aus',
  'ind',
  // Canadian provinces and territories.
  'ontario',
  'quebec',
  'british columbia',
  'alberta',
  'manitoba',
  'saskatchewan',
  'nova scotia',
  'new brunswick',
  'newfoundland',
  'newfoundland and labrador',
  'prince edward island',
  'yukon',
  'northwest territories',
  'nunavut',
  // Common subdivisions written as the last part of a location.
  // (City-states such as Berlin and Tokyo are cities, so "Berlin, DE" reads
  // the country code that follows them.)
  'greater london',
  'bavaria',
  'bayern',
  'hessen',
  'karnataka',
  'maharashtra',
  'telangana',
  'tamil nadu',
  'haryana',
  'uttar pradesh',
  'new south wales',
  'victoria',
  'queensland',
  'rio grande do sul',
  'minas gerais',
  'santa catarina',
  'parana',
  'jalisco',
  'nuevo leon',
  'catalonia',
  'catalunya',
  'ile-de-france',
  'north holland',
  'noord-holland',
  'gyeonggi-do',
  'gyeonggi',
];

/** Canadian province codes, read only when written in capitals. */
const CANADIAN_PROVINCE_CODES = new Set([
  'AB',
  'BC',
  'MB',
  'NB',
  'NL',
  'NS',
  'NT',
  'NU',
  'ON',
  'PE',
  'QC',
  'SK',
  'YT',
]);

/** Cities outside the United States that are often written alone. */
const NON_US_CITIES = [
  'london',
  'manchester',
  'edinburgh',
  'glasgow',
  'bristol',
  'leeds',
  'liverpool',
  'belfast',
  'oxford',
  'reading',
  'dublin',
  'cork',
  'galway',
  'paris',
  'lyon',
  'marseille',
  'bordeaux',
  'nantes',
  'toulouse',
  'lille',
  'nice',
  'berlin',
  'munich',
  'munchen',
  'hamburg',
  'frankfurt',
  'cologne',
  'koln',
  'stuttgart',
  'dusseldorf',
  'leipzig',
  'amsterdam',
  'rotterdam',
  'the hague',
  'utrecht',
  'eindhoven',
  'brussels',
  'antwerp',
  'ghent',
  'luxembourg city',
  'zurich',
  'geneva',
  'basel',
  'lausanne',
  'bern',
  'vienna, austria',
  'madrid',
  'barcelona',
  'valencia',
  'seville',
  'malaga',
  'lisbon',
  'porto',
  'milan',
  'rome',
  'turin',
  'florence',
  'bologna',
  'stockholm',
  'gothenburg',
  'malmo',
  'copenhagen',
  'aarhus',
  'oslo',
  'bergen',
  'helsinki',
  'espoo',
  'tallinn',
  'riga',
  'vilnius',
  'warsaw',
  'krakow',
  'wroclaw',
  'gdansk',
  'poznan',
  'lodz',
  'prague',
  'brno',
  'budapest',
  'bucharest',
  'cluj-napoca',
  'cluj',
  'sofia',
  'belgrade',
  'zagreb',
  'ljubljana',
  'athens, greece',
  'istanbul',
  'ankara',
  'kyiv',
  'kiev',
  'lviv',
  'moscow',
  'saint petersburg, russia',
  'tel aviv',
  'tel aviv-yafo',
  'jerusalem',
  'haifa',
  'herzliya',
  'dubai',
  'abu dhabi',
  'riyadh',
  'jeddah',
  'doha',
  'cairo',
  'lagos',
  'nairobi',
  'johannesburg',
  'cape town',
  'casablanca',
  'bangalore',
  'bengaluru',
  'hyderabad',
  'chennai',
  'pune',
  'mumbai',
  'new delhi',
  'delhi',
  'gurgaon',
  'gurugram',
  'noida',
  'kolkata',
  'ahmedabad',
  'karachi',
  'lahore',
  'islamabad',
  'dhaka',
  'colombo',
  'kathmandu',
  'singapore',
  'kuala lumpur',
  'jakarta',
  'bangkok',
  'manila',
  'makati',
  'cebu',
  'ho chi minh city',
  'hanoi',
  'tokyo',
  'osaka',
  'kyoto',
  'roppongi',
  'seoul',
  'pangyo',
  'busan',
  'beijing',
  'shanghai',
  'shenzhen',
  'guangzhou',
  'hangzhou',
  'chengdu',
  'taipei',
  'hsinchu',
  'sydney',
  'melbourne',
  'brisbane',
  'perth',
  'adelaide',
  'canberra',
  'auckland',
  'wellington',
  'toronto',
  'montreal',
  'vancouver',
  'ottawa',
  'calgary',
  'edmonton',
  'waterloo',
  'kitchener',
  'mississauga',
  'winnipeg',
  'halifax',
  'quebec city',
  'mexico city',
  'ciudad de mexico',
  'guadalajara',
  'monterrey',
  'bogota',
  'medellin',
  'lima',
  'santiago',
  'buenos aires',
  'cordoba',
  'montevideo',
  'sao paulo',
  'rio de janeiro',
  'campinas',
  'belo horizonte',
  'curitiba',
  'sao jose dos campos',
  'cali',
  'buenaventura',
  'aachen',
  'lugano',
  'milton keynes',
  'yokohama',
  'chiba',
  'fukuoka',
  'yerevan',
  'tirana',
  'deinze',
  'brussel',
  'bedfordshire',
  'gibraltar',
  'north sydney',
  'western sydney',
  'johor bahru',
  'ho chi minh',
  'burnaby',
  'wan chai',
  'florianopolis',
  'porto alegre',
  'recife',
  'san jose, costa rica',
];

const NON_US_COUNTRY_NAMES = new Set(NON_US_COUNTRIES.map(fold));
const NON_US_CITY_NAMES = new Set(NON_US_CITIES.map(fold));

/**
 * US state codes that are also country codes, with the cities they follow:
 * "Berlin, DE" and "Toronto, CA" name the country, while "Dublin, CA" and
 * "Moscow, PA" are US cities.
 */
const COUNTRY_CODE_CITIES: Readonly<Record<string, readonly string[]>> = {
  DE: [
    'berlin',
    'munich',
    'munchen',
    'hamburg',
    'frankfurt',
    'cologne',
    'koln',
    'stuttgart',
    'dusseldorf',
    'leipzig',
  ],
  IN: [
    'bangalore',
    'bengaluru',
    'hyderabad',
    'chennai',
    'pune',
    'mumbai',
    'new delhi',
    'delhi',
    'gurgaon',
    'gurugram',
    'noida',
    'kolkata',
    'ahmedabad',
  ],
  IL: ['tel aviv', 'tel aviv-yafo', 'jerusalem', 'haifa', 'herzliya'],
  CA: [
    'toronto',
    'montreal',
    'vancouver',
    'ottawa',
    'calgary',
    'edmonton',
    'waterloo',
    'kitchener',
    'mississauga',
    'winnipeg',
    'halifax',
    'quebec city',
    'burnaby',
  ],
  AR: ['buenos aires', 'cordoba'],
  CO: ['bogota', 'medellin', 'cali'],
};

/** Lowercase, strip accents and collapse whitespace. */
function fold(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function titleCase(value: string): string {
  return value.replace(
    /(^|[\s-])(\p{L})/gu,
    (_, before: string, letter: string) => before + letter.toUpperCase(),
  );
}

/** Words about the arrangement or office, not the place. */
const NOISE =
  /\b(?:fully remote|remote first|remote-first|remote|hybrid|on[- ]?site|onsite|in[- ]office|in office|in[- ]person|work from home|wfh|anywhere|distributed|flexible|headquarters|hq|main office|office|offices|campus|based|only|preferred|local|regional|friendly|travel[- ]required|employee|metro(?:politan)? area|greater|area|region|location|locations|multiple|various|or|and|in|within|the|of|time ?zones?)\b/g;

const REMOTE = /\b(?:remote|anywhere|distributed|work from home|wfh)\b/i;

type Part = { text: string; raw: string };

/** Splits one place list ("A, B - C") into its comma/dash separated parts. */
function partsOf(segment: string): Part[] {
  return segment
    .split(/\s*,\s*|\s+[-–—:]\s*|\s*[-–—:]\s+/)
    .map((raw) => {
      const cleaned = raw
        .replace(/\b\d{5}(?:-\d{4})?\b/g, ' ')
        .replace(/#\s*\d+/g, ' ')
        .trim();
      return { raw: cleaned, text: fold(cleaned).replace(/[.]$/, '') };
    })
    .filter((part) => part.raw);
}

function cityKey(name: string) {
  const folded = fold(name);
  return CITY_ALIASES[folded] ?? folded;
}

type SegmentResult = {
  us: boolean;
  nonUs: boolean;
  remote: boolean;
  states: string[];
  cities: string[];
};

type Pending = { name: string; state: string | null; foreign: boolean };

type PartKind =
  | { kind: 'us' }
  | { kind: 'state'; state: string }
  | { kind: 'country' }
  | { kind: 'city'; name: string; state: string | null; foreign: boolean }
  | { kind: 'other'; name: string };

/** What one comma/dash separated part names. */
/** Names of buildings and schools, not cities ("Virtual Prep Academy of Missouri"). */
const NOT_A_CITY =
  /\b(?:academy|school|college|university|institute|center|centre|mall|plaza|campus|building|tower|hospital|clinic|store|galleria|collection|distribution)\b/i;

function classifyPart(raw: string, folded: string): PartKind {
  // "Albany NY", "Honolulu HI": a city followed by a state code.
  const withCode = /^(.*\S)\s+([A-Z]{2})$/.exec(raw);
  if (withCode && US_STATES[withCode[2]] && !NOT_A_CITY.test(withCode[1])) {
    const head = fold(withCode[1])
      .replace(NOISE, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const city = CITY_ALIASES[head] ?? head;
    if (head)
      return {
        kind: 'city',
        name: US_CITIES[city] ? city : withCode[1],
        state: withCode[2],
        foreign: false,
      };
  }
  const stripped = folded.replace(NOISE, ' ').replace(/\s+/g, ' ').trim();
  for (const text of folded === stripped ? [folded] : [folded, stripped]) {
    if (!text) continue;
    const city = CITY_ALIASES[text] ?? text;
    if (US_COUNTRY.has(text) || US_REGIONS.has(text)) return { kind: 'us' };
    if (city === 'washington dc')
      return { kind: 'city', name: city, state: 'DC', foreign: false };
    // "New York" alone is the city; "New York, New York" is city and state.
    if (city === 'new york')
      return { kind: 'city', name: city, state: 'NY', foreign: false };
    const state = STATE_BY_NAME.get(text);
    if (state) return { kind: 'state', state };
    if (NON_US_COUNTRY_NAMES.has(text)) return { kind: 'country' };
    if (US_CITIES[city] || NON_US_CITY_NAMES.has(text))
      return {
        kind: 'city',
        name: city,
        state: US_CITIES[city] ?? null,
        foreign: NON_US_CITY_NAMES.has(text) && !US_CITIES[city],
      };
  }
  if (!stripped) return { kind: 'other', name: '' };
  // A name ending in a state or country ("Austin Texas", "Toronto Canada").
  let best = '';
  for (const name of [
    ...STATE_BY_NAME.keys(),
    ...NON_US_COUNTRY_NAMES,
    ...US_COUNTRY,
  ]) {
    if (
      name.length > 3 &&
      name.length > best.length &&
      stripped.endsWith(` ${name}`)
    )
      best = name;
  }
  if (best) {
    const head = stripped.slice(0, -best.length - 1).trim();
    const state = STATE_BY_NAME.get(best);
    if (state)
      return head && !NOT_A_CITY.test(head)
        ? { kind: 'city', name: head, state, foreign: false }
        : { kind: 'state', state };
    if (US_COUNTRY.has(best)) {
      const city = CITY_ALIASES[head] ?? head;
      return US_CITIES[city]
        ? { kind: 'city', name: city, state: US_CITIES[city], foreign: false }
        : { kind: 'us' };
    }
    return { kind: 'country' };
  }
  const name = raw.replace(NOISE, ' ').replace(/\s+/g, ' ').trim();
  return { kind: 'other', name: NOT_A_CITY.test(name) ? '' : name };
}

function readSegment(segment: string): SegmentResult {
  const result: SegmentResult = {
    us: false,
    nonUs: false,
    remote: REMOTE.test(segment),
    states: [],
    cities: [],
  };
  let pending: Pending | null = null;

  const addState = (state: string) => {
    result.us = true;
    if (!result.states.includes(state)) result.states.push(state);
  };
  const addCity = (name: string, state: string) => {
    const key = cityKey(name);
    const display =
      key === 'washington dc'
        ? 'Washington'
        : US_CITIES[key] === state
          ? titleCase(key)
          : /\p{Lu}/u.test(name)
            ? name.replace(/\s+/g, ' ').trim()
            : titleCase(fold(name));
    addState(state);
    const label = `${display}, ${state}`;
    if (!result.cities.includes(label)) result.cities.push(label);
  };
  const flush = () => {
    if (pending?.state) addCity(pending.name, pending.state);
    else if (pending?.foreign) result.nonUs = true;
    pending = null;
  };

  const normalized = segment.replace(
    /\bwashington,?\s*d\.?\s*c\b\.?/gi,
    'Washington DC',
  );
  for (const part of partsOf(normalized)) {
    const code = part.raw.replace(/[.]/g, '').trim();
    if (/^[A-Z]{2}$/.test(code)) {
      if (US_STATES[code]) {
        const current = pending;
        if (
          current?.foreign &&
          COUNTRY_CODE_CITIES[code]?.includes(fold(current.name))
        ) {
          pending = null;
          result.nonUs = true;
        } else if (current?.name) {
          pending = null;
          addCity(current.name, code);
        } else {
          pending = null;
          addState(code);
        }
        continue;
      }
      if (CANADIAN_PROVINCE_CODES.has(code)) {
        pending = null;
        result.nonUs = true;
        continue;
      }
      if (code === 'US') {
        flush();
        result.us = true;
        continue;
      }
    }

    const kind = classifyPart(part.raw, part.text);
    if (kind.kind === 'us') {
      flush();
      result.us = true;
    } else if (kind.kind === 'state') {
      const current = pending;
      pending = null;
      if (current?.name) addCity(current.name, kind.state);
      else addState(kind.state);
    } else if (kind.kind === 'country') {
      // The country decides the city before it ("Cambridge, UK").
      pending = null;
      result.nonUs = true;
    } else if (
      kind.kind === 'city' &&
      kind.name === 'new york' &&
      pending?.name
    ) {
      const current = pending as unknown as Pending;
      pending = null;
      addCity(current.name, 'NY');
    } else if (kind.kind === 'city') {
      flush();
      pending = { name: kind.name, state: kind.state, foreign: kind.foreign };
    } else if (kind.name) {
      // An unrecognized name is a city only when a state follows it.
      flush();
      pending = { name: kind.name, state: null, foreign: false };
    }
  }
  flush();
  return result;
}

/** Splits a job location into the place lists it names. */
function segmentsOf(location: string): string[] {
  return (
    location
      .replace(/_/g, ' ')
      // "US-VA-Arlington", "Remote-US", "North Carolina-Remote", "Campinas-SP".
      .replace(/\b([A-Z]{2,3})-(?=[A-Za-z])/g, '$1, ')
      .replace(/([A-Za-z])-(?=[A-Z]{2,3}\b)/g, '$1, ')
      .replace(/\b(remote|local|regional)-/gi, '$1, ')
      .replace(/-(remote|local|regional)\b/gi, ', $1')
      // Lowercase only: "Tualatin, OR" is Oregon.
      .split(/\s*(?:[|;•·\n/()&]|\s+or\s+|\s+and\s+)\s*/)
      .map((segment) => segment.trim())
      .filter(Boolean)
  );
}

const cache = new Map<string, JobLocationInfo>();
const CACHE_LIMIT = 20_000;

/** Reads a job's location text; results are memoized per distinct text. */
export function readJobLocation(
  location: string | null | undefined,
): JobLocationInfo {
  const text = (location ?? '').trim();
  const cached = cache.get(text);
  if (cached) return cached;
  let us = false;
  let nonUs = false;
  let remoteUnknown = false;
  let remoteUs = false;
  const states: string[] = [];
  const cities: string[] = [];
  for (const segment of segmentsOf(text)) {
    const read = readSegment(segment);
    us ||= read.us;
    nonUs ||= read.nonUs && !read.us;
    if (read.remote) {
      if (read.us) remoteUs = true;
      else if (!read.nonUs) remoteUnknown = true;
    }
    for (const state of read.states)
      if (!states.includes(state)) states.push(state);
    for (const city of read.cities)
      if (!cities.includes(city)) cities.push(city);
  }
  const scope: JobLocationScope = us ? 'us' : nonUs ? 'non_us' : 'unknown';
  const info: JobLocationInfo = {
    scope,
    states,
    cities,
    // "Remote (United States | Canada)" splits into "Remote" and the
    // countries; a remote segment without a country counts when the job is
    // a US (or unknown-country) job.
    remoteUs: remoteUs || (remoteUnknown && scope !== 'non_us'),
  };
  if (cache.size >= CACHE_LIMIT) cache.clear();
  cache.set(text, info);
  return info;
}

/** The place keys a job matches. */
export function jobPlaceKeys(info: JobLocationInfo): string[] {
  // Washington, DC is one place, offered as a city rather than a "state".
  const keys = [
    ...info.states.map((state) =>
      state === 'DC' ? DC_PLACE_KEY : `state:${state}`,
    ),
    ...info.cities.map((city) => `city:${city}`),
    ...(info.remoteUs ? [REMOTE_US_PLACE_KEY] : []),
  ];
  return [...new Set(keys)];
}

const DC_PLACE_KEY = 'city:Washington, DC';

/** True when a job matches any of the selected place keys. */
export function matchesPlaceKeys(
  info: JobLocationInfo,
  keys: readonly string[],
): boolean {
  if (!keys.length) return true;
  const own = new Set(jobPlaceKeys(info));
  return keys.some((key) => own.has(key));
}

/** Kind and label of a place key ("state:MA" -> State "Massachusetts"). */
export function placeLabel(
  key: string,
): { kind: UsPlaceKind; label: string } | null {
  if (key === REMOTE_US_PLACE_KEY)
    return { kind: 'remote', label: 'Remote (US)' };
  const [kind, value] = [
    key.slice(0, key.indexOf(':')),
    key.slice(key.indexOf(':') + 1),
  ];
  if (kind === 'state' && US_STATES[value] && value !== 'DC') {
    return { kind: 'state', label: US_STATES[value] };
  }
  if (kind === 'city' && /, [A-Z]{2}$/.test(value))
    return { kind: 'city', label: value };
  return null;
}

/** Valid, de-duplicated place keys from user input. */
export function parsePlaceKeys(values: readonly string[]): string[] {
  return [
    ...new Set(
      values.map((value) => value.trim()).filter((value) => placeLabel(value)),
    ),
  ];
}
