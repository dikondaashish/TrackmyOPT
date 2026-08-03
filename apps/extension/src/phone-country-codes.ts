/**
 * Dial codes for phone country-code dropdowns.
 *
 * Application forms very often split the phone number into a country-code
 * select plus a number field. The select's options look like "+1",
 * "United States (+1)", or "US +1" — none of which equal the user's stored
 * country string, so the control was always left on its placeholder and the
 * number alone was rejected as incomplete.
 *
 * Two sources, in order of confidence:
 *  1. the stored phone number itself, when it carries an explicit "+<code>";
 *  2. the stored country, via the table below.
 *
 * Dependency-free so both the matcher and its tests can use it directly.
 */

/** ISO-3166 alpha-2 → E.164 dial code, for the markets the extension targets. */
const COUNTRY_DIAL_CODES: Record<string, string> = {
  US: '1', CA: '1', GB: '44', IE: '353', IN: '91', PK: '92', BD: '880',
  LK: '94', NP: '977', AU: '61', NZ: '64', SG: '65', MY: '60', ID: '62',
  PH: '63', TH: '66', VN: '84', CN: '86', HK: '852', TW: '886', JP: '81',
  KR: '82', DE: '49', FR: '33', ES: '34', IT: '39', NL: '31', BE: '32',
  CH: '41', AT: '43', SE: '46', NO: '47', DK: '45', FI: '358', PL: '48',
  PT: '351', CZ: '420', GR: '30', RO: '40', HU: '36', UA: '380', RU: '7',
  TR: '90', IL: '972', AE: '971', SA: '966', QA: '974', KW: '965',
  BH: '973', OM: '968', JO: '962', LB: '961', EG: '20', ZA: '27',
  NG: '234', KE: '254', GH: '233', MA: '212', BR: '55', MX: '52',
  AR: '54', CL: '56', CO: '57', PE: '51', VE: '58', EC: '593', UY: '598',
};

/** Country names → alpha-2, including the aliases forms actually present. */
const COUNTRY_NAME_TO_ALPHA2: Record<string, string> = {
  'united states': 'US',
  'united states of america': 'US',
  usa: 'US',
  us: 'US',
  america: 'US',
  canada: 'CA',
  'united kingdom': 'GB',
  uk: 'GB',
  'great britain': 'GB',
  england: 'GB',
  ireland: 'IE',
  india: 'IN',
  pakistan: 'PK',
  bangladesh: 'BD',
  'sri lanka': 'LK',
  nepal: 'NP',
  australia: 'AU',
  'new zealand': 'NZ',
  singapore: 'SG',
  malaysia: 'MY',
  indonesia: 'ID',
  philippines: 'PH',
  thailand: 'TH',
  vietnam: 'VN',
  china: 'CN',
  'hong kong': 'HK',
  taiwan: 'TW',
  japan: 'JP',
  'south korea': 'KR',
  korea: 'KR',
  germany: 'DE',
  france: 'FR',
  spain: 'ES',
  italy: 'IT',
  netherlands: 'NL',
  belgium: 'BE',
  switzerland: 'CH',
  austria: 'AT',
  sweden: 'SE',
  norway: 'NO',
  denmark: 'DK',
  finland: 'FI',
  poland: 'PL',
  portugal: 'PT',
  'czech republic': 'CZ',
  czechia: 'CZ',
  greece: 'GR',
  romania: 'RO',
  hungary: 'HU',
  ukraine: 'UA',
  russia: 'RU',
  turkey: 'TR',
  israel: 'IL',
  'united arab emirates': 'AE',
  uae: 'AE',
  'saudi arabia': 'SA',
  qatar: 'QA',
  kuwait: 'KW',
  bahrain: 'BH',
  oman: 'OM',
  jordan: 'JO',
  lebanon: 'LB',
  egypt: 'EG',
  'south africa': 'ZA',
  nigeria: 'NG',
  kenya: 'KE',
  ghana: 'GH',
  morocco: 'MA',
  brazil: 'BR',
  mexico: 'MX',
  argentina: 'AR',
  chile: 'CL',
  colombia: 'CO',
  peru: 'PE',
  venezuela: 'VE',
  ecuador: 'EC',
  uruguay: 'UY',
};

function normalizeName(value: string): string {
  return value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * The "+<code>" a phone number already carries, if any. This beats the country
 * table: a user living in one country may deliberately store a number from
 * another, and the number they typed is the fact.
 */
export function dialCodeFromPhoneNumber(phone: string): string | null {
  const trimmed = (phone || '').trim();
  if (!trimmed.startsWith('+')) return null;
  const digits = trimmed.slice(1).replace(/\D/g, '');
  if (!digits) return null;
  // Longest known code first so +1 does not shadow +972 or +44.
  const known = new Set(Object.values(COUNTRY_DIAL_CODES));
  for (const length of [4, 3, 2, 1]) {
    const candidate = digits.slice(0, length);
    if (candidate && known.has(candidate)) return candidate;
  }
  return null;
}

/** Dial code for a country name or alpha-2 code, or null when unknown. */
export function dialCodeForCountry(country: string): string | null {
  const raw = (country || '').trim();
  if (!raw) return null;
  const upper = raw.toUpperCase();
  if (COUNTRY_DIAL_CODES[upper]) return COUNTRY_DIAL_CODES[upper];
  const alpha2 = COUNTRY_NAME_TO_ALPHA2[normalizeName(raw)];
  return alpha2 ? COUNTRY_DIAL_CODES[alpha2] ?? null : null;
}

/**
 * The dial code to select for this applicant, preferring what their own phone
 * number states. Returns the bare digits, e.g. "1" — callers compare against
 * both "1" and "+1" forms.
 */
export function resolveDialCode(input: {
  phone?: string;
  country?: string;
}): string | null {
  return (
    dialCodeFromPhoneNumber(input.phone || '') ??
    dialCodeForCountry(input.country || '')
  );
}
