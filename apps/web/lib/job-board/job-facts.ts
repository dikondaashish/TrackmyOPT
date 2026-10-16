/**
 * Job facts inferred from the text of a job posting.
 *
 * This file is shared verbatim by apps/api (the description filter flags
 * stored at ingestion) and apps/web (job badges and resume matching), so the
 * filters and what the page shows agree. Edit both copies together:
 * apps/api/src/job-board/job-facts.sync.spec.ts fails when they differ. It has
 * no imports and avoids regular-expression features newer than ES2017.
 *
 * Every rule matches whole words or phrases, never substrings, and prefers
 * missing evidence over a false match: "12 years" is not "2 years", "Scrum
 * Master" is not a Master's degree, "remote teams" is not a remote role.
 */

export type JobWorkplace = 'remote' | 'hybrid' | 'on_site';
export type JobDegreeLevel = 'bachelor' | 'master' | 'doctorate';
export type JobTypeKind = 'internship' | 'contract' | 'temporary' | 'permanent';
export type JobEmploymentKind = 'full_time' | 'part_time';
export type JobExperienceBucket = 'entry' | 'mid' | 'senior';

export type TextJobFacts = {
  /** Workplace evidence; a posting can mention several arrangements. */
  workplaces: JobWorkplace[];
  degreeLevels: JobDegreeLevel[];
  /**
   * The minimum years of experience the posting requires: the largest lower
   * bound among its required-experience statements ("3-5 years" counts as 3,
   * "5+ years" as 5). Statements marked preferred count only when no required
   * one exists, and then the smallest applies. Null when none is stated.
   */
  minimumExperienceYears: number | null;
  jobTypes: JobTypeKind[];
  employmentTypes: JobEmploymentKind[];
};

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  ndash: '-',
  mdash: '-',
  minus: '-',
  hyphen: '-',
  rsquo: "'",
  lsquo: "'",
  rdquo: '"',
  ldquo: '"',
  hellip: '...',
  bull: '\n',
  middot: ' ',
  bullet: '\n',
};

function decodeEntities(value: string) {
  return value.replace(
    /&(#\d{1,7}|#x[0-9a-f]{1,6}|[a-z]{2,8});/gi,
    (entity, body: string) => {
      if (body[0] === '#') {
        const code =
          body[1] === 'x' || body[1] === 'X'
            ? parseInt(body.slice(2), 16)
            : parseInt(body.slice(1), 10);
        return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : ' ';
      }
      return NAMED_ENTITIES[body.toLowerCase()] ?? entity;
    },
  );
}

const BLOCK_TAG =
  /<\/?(?:p|div|li|ul|ol|br|hr|h[1-6]|tr|td|th|table|section|article|header|footer|blockquote|dt|dd)\b[^>]*>/gi;

/**
 * Lower-case plain text with one line per block element. ATS descriptions are
 * HTML, and Greenhouse escapes it once more (`&lt;p&gt;`), so entities are
 * decoded before and after tags are removed.
 */
export function jobPostingPlainText(value: string | null | undefined): string {
  if (!value) return '';
  let text = decodeEntities(decodeEntities(value));
  text = text
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, ' ')
    .replace(BLOCK_TAG, '\n')
    .replace(/<[^>]*>/g, ' ');
  text = decodeEntities(text)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[‘’‛′`]/g, "'")
    .replace(/[‐-―−]/g, '-')
    .replace(/[•▪●·]/g, '\n')
    .replace(/[^\S\n]+/g, ' ')
    .replace(/ ?\n[\n ]*/g, '\n')
    .toLowerCase();
  return text.trim();
}

const WORD_NUMBERS: Record<string, number> = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
};

const WORD_NUMBER =
  /\b(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)\b/g;

/** "two (2) years" and "2 (two) years" become "2 years"; "a year of" "1 year of". */
function normalizeNumbers(clause: string) {
  return clause
    .replace(WORD_NUMBER, (word: string) => String(WORD_NUMBERS[word]))
    .replace(/\b(\d{1,2})\s*\(\s*(\d{1,2})\s*\)/g, (match, a: string, b) =>
      a === b ? a : match,
    )
    .replace(
      /\b(?:a|an) (?:full |single )?year(?= (?:of|in|or more)\b|\+)/g,
      '1 year',
    );
}

/** Sections that list preferred rather than required qualifications. */
const PREFERRED_HEADING =
  /^(?:(?:additional|other|some|desired|ideal|what|bonus)\s+)?(?:preferred|bonus|nice[- ]to[- ]haves?|desired|pluses|ideal|extra credit)\b|\b(?:would make you stand out|it'?s a plus|it would be great if|even better if|you might also have|we'?d love (?:it )?if|nice to haves?)\b/;
const REQUIRED_HEADING =
  /^(?:(?:the|our|your|basic|minimum|key|what)\s+)?(?:minimum|basic|required|requirements|qualifications|must[- ]haves?|responsibilities|what you(?:'ll)? (?:need|bring|do)|what we(?:'re)? looking for|you (?:have|bring|are|might be)|about you|who you are|about the role|the role)\b/;
const PREFERRED_CLAUSE =
  /\b(?:prefer|preferred|preferably|ideally|nice[- ]to[- ]have|bonus|a plus|desired|desirable|advantageous|is an advantage)\b/;

const YEARS_EXPRESSION =
  /(\d{1,2}(?:\.\d)?)\s*(\+|plus|or more|or greater|or above)?\s*(?:(?:-|to|or)\s*(\d{1,2}(?:\.\d)?)\s*\+?\s*)?(?:full\s+)?(years?|yrs?\.?|yoe)(?![a-z])/g;
const MONTHS_EXPRESSION =
  /(\d{1,2})\s*\+?\s*(?:(?:-|to)\s*\d{1,2}\s*)?months?\s+(?:of\s+)?(?:[a-z-]+\s+){0,3}?(?:experience|exp)\b/g;

/** Words after "N years" that make it something other than experience. */
const NOT_EXPERIENCE_AFTER =
  /^\s*(?:old\b|older\b|or older\b|or over\b|of age\b|ago\b|degree\b|(?:college|university|undergraduate|bachelor'?s?|associate'?s?) degree\b|program\b|later\b|from now\b|in business\b(?! (?:development|analy|operations|intelligence|systems|strategy|administration|management|roles?|functions?|partner))|in a row\b|warranty\b|contract\b|lease\b|cliff\b|vesting\b|of (?:college|university|school|study|studies|undergraduate|graduate|education|coursework|schooling|age|service|tenure|operations?|history|growth|existence|employment with us|vesting))/;
/** Phrases before "N years" that describe time, not a requirement. */
const NOT_EXPERIENCE_BEFORE =
  /(?:\b(?:in|for|over|during|within) the (?:past|last|next|first|coming)|\b(?:within|every|after|per|since|in under|in less than|the (?:past|last|next|first))|\b(?:we|we've|we have|we've been|our (?:team|company|firm|founders?|leadership) (?:has|have)|(?:company|firm|team|organization) (?:has|with))(?: (?:had|been|spent|built))?(?: (?:over|more than|nearly|almost|about))?)\s*$/;
const EXPERIENCE_WORD =
  /\b(?:experience|exp|expertise|background|track record|work history)\b/;
const REQUIREMENT_BEFORE =
  /(?:\b(?:at least|a minimum of|minimum of|minimum|min\.?|requires?|required|must have|you have|you bring|you've|bring|need|needs|with|having|possess|over|more than)|^[\s\-*:]*)\s*$/;
/** "minimum of 5 years" on its own still states the requirement... */
const MINIMUM_BEFORE =
  /\b(?:at least|a minimum of|minimum of|minimum|min\.?)\s*$/;
/** ...but "commit for at least 2 years" or "valid for a minimum of" does not. */
const NOT_MINIMUM_BEFORE =
  /\b(?:for|commit\w*|remain|stay|valid|lasts?|lasting|term|period|duration|within|employed)\s+(?:at least|a minimum of|minimum of|minimum|min\.?)\s*$/;
const WORK_AFTER =
  /^\s*(?:of\s+)?(?:professional|relevant|related|industry|hands[- ]on|practical|progressive|proven|direct|prior|previous|full[- ]time|post[- ]?(?:graduate|doctoral|degree)|work|working|in|as|with|building|developing|designing|leading|managing|writing|doing|programming|coding|engineering|software|creating|supporting|delivering|running|operating|selling|teaching|conducting|performing|applying|using|owning|shipping|[a-z]{3,}ing)\b/;
const EXPERIENCE_BEFORE =
  /\b(?:experience|exp|track record|background)\b[^.;\n]{0,25}?(?::|-|of|with|in|requirements?:?|required:?|level:?)?\s*(?:at least|minimum(?: of)?|min\.?|over|more than|approximately|about|around|~|\()?\s*$/;
const NO_EXPERIENCE_REQUIRED =
  /\bno (?:prior |previous |professional |work |industry )?experience (?:is )?(?:required|necessary|needed)\b/;

type ExperienceMention = {
  years: number;
  preferred: boolean;
  start: number;
  end: number;
};

/**
 * Mentions in one clause. Alternatives joined by "or" ("6+ years (senior) or
 * 10+ years (staff)") collapse to the smallest, since either one qualifies.
 */
function experienceMentions(
  clause: string,
  preferred: boolean,
): ExperienceMention[] {
  const text = normalizeNumbers(clause);
  const mentions = clauseMentions(text, preferred).sort(
    (left, right) => left.start - right.start,
  );
  const merged: ExperienceMention[] = [];
  for (const mention of mentions) {
    const previous = merged[merged.length - 1];
    const gap = previous ? text.slice(previous.end, mention.start) : '';
    if (
      previous &&
      /\bor\b/.test(gap) &&
      !/\b(?:and|with|plus)\b|[,;]/.test(gap.replace(/\([^)]*\)/g, ''))
    ) {
      previous.years = Math.min(previous.years, mention.years);
      previous.end = mention.end;
    } else {
      merged.push({ ...mention });
    }
  }
  return merged;
}

function clauseMentions(text: string, preferred: boolean) {
  const mentions: ExperienceMention[] = [];
  for (const match of text.matchAll(YEARS_EXPRESSION)) {
    const start = match.index ?? 0;
    const previous = start > 0 ? text[start - 1] : ' ';
    if (/[a-z0-9.$/,#]/.test(previous)) continue;
    const low = Number(match[1]);
    const high = match[3] === undefined ? low : Number(match[3]);
    if (!Number.isFinite(low) || low > 40 || high > 50 || high < low) continue;
    const before = text.slice(Math.max(0, start - 70), start);
    const after = text.slice(
      start + match[0].length,
      start + match[0].length + 90,
    );
    if (NOT_EXPERIENCE_AFTER.test(after)) continue;
    if (NOT_EXPERIENCE_BEFORE.test(before)) continue;
    const words = after.trim().split(/\s+/).slice(0, 12).join(' ');
    const minimumStated =
      MINIMUM_BEFORE.test(before) &&
      !NOT_MINIMUM_BEFORE.test(before) &&
      /^\s*(?:$|[,:)(-]|required\b|preferred\b|minimum\b|of\b|in\b)/.test(
        after,
      );
    const accepted =
      minimumStated ||
      match[4] === 'yoe' ||
      EXPERIENCE_WORD.test(words) ||
      EXPERIENCE_BEFORE.test(before) ||
      ((REQUIREMENT_BEFORE.test(before) ||
        match[2] !== undefined ||
        match[3] !== undefined) &&
        WORK_AFTER.test(after)) ||
      // "3+ years across sales", "2-4 years at an agency": a stated minimum
      // or range is a requirement unless "year" is an adjective
      // ("a 3+ year roadmap").
      ((match[2] !== undefined || match[3] !== undefined) &&
        !(
          match[4] === 'year' &&
          /^\s*[a-z]/.test(after) &&
          !WORK_AFTER.test(after) &&
          !/^\s*(?:of|experience|exp)\b/.test(after)
        ));
    if (accepted)
      mentions.push({
        years: low,
        preferred,
        start,
        end: start + match[0].length,
      });
  }
  for (const match of text.matchAll(MONTHS_EXPRESSION)) {
    const start = match.index ?? 0;
    if (start > 0 && /[a-z0-9.$/,#]/.test(text[start - 1])) continue;
    mentions.push({
      years: Math.floor(Number(match[1]) / 12),
      preferred,
      start,
      end: start + match[0].length,
    });
  }
  return mentions;
}

export function inferMinimumExperienceYears(plainText: string): number | null {
  const mentions: ExperienceMention[] = [];
  let preferredSection = false;
  for (const line of plainText.split('\n')) {
    const heading = line.replace(/[:\s]+$/, '');
    if (
      heading.length <= 60 &&
      heading.split(' ').length <= 7 &&
      !/\d/.test(heading)
    ) {
      if (PREFERRED_HEADING.test(heading)) {
        preferredSection = true;
        continue;
      }
      if (REQUIRED_HEADING.test(heading)) {
        preferredSection = false;
        continue;
      }
    }
    for (const clause of line.split(/[.!?;](?=\s|$)/)) {
      mentions.push(
        ...experienceMentions(
          clause,
          preferredSection || PREFERRED_CLAUSE.test(clause),
        ),
      );
    }
  }
  const required = mentions.filter((mention) => !mention.preferred);
  if (required.length)
    return Math.max(...required.map((mention) => mention.years));
  if (mentions.length)
    return Math.min(...mentions.map((mention) => mention.years));
  return NO_EXPERIENCE_REQUIRED.test(plainText) ? 0 : null;
}

/** Up to 2 years is entry, up to 5 mid, more than 5 senior. */
export function experienceBucket(
  years: number | null,
): JobExperienceBucket | null {
  if (years === null) return null;
  if (years <= 2) return 'entry';
  if (years <= 5) return 'mid';
  return 'senior';
}

const DEGREE_TOKEN =
  "(?:bachelor'?s?|master'?s?|b\\.\\s?[sa]\\.?|m\\.\\s?s\\.?|bs|ba|ms|ma|phd|ph\\.\\s?d\\.?|mba|bsc|msc)";
const DEGREE_PAIR_AFTER = new RegExp(
  `^\\s*(?:/|or|and|,|&|\\+)\\s*(?:a\\s+)?(?:${DEGREE_TOKEN}|equivalent|higher|advanced|graduate)`,
);
const DEGREE_PAIR_BEFORE = new RegExp(
  `${DEGREE_TOKEN}\\s*(?:/|or|and|,|&|\\+)\\s*(?:an?\\s+)?$`,
);
const DEGREE_WORD_AFTER =
  /^\s*(?:degree|diploma|program|candidates?|students?|holders?|in (?!the\b|a\b|an\b|our\b|order\b|office\b|excel\b|word\b|teams\b)[a-z]|from\b|required\b|preferred\b|or equivalent\b)/;
const MS_PRODUCT_AFTER =
  /^\s*(?:office|excel|word|teams|powerpoint|outlook|project|access|sql|dynamics|azure|visio|sharepoint|365|windows|fabric|intune|entra|defender|power|exchange|onedrive|navision|dos)\b/;
const MASTER_NOT_DEGREE_BEFORE =
  /\b(?:scrum|data|web|post|quarter|ring|head|toast|task|grand|zen|pay|line|yard|chess|house|harbor|harbour|station|band|stage|brew|burgo|school|quiz|dungeon|game|spy|puppet|choir|concert|ballet|cellar|tool|build|release|config|configuration|record|records|mold|tax|key|branch)[- ]?$/;
const MASTER_NOT_DEGREE_AFTER =
  /^\s*(?:of ceremonies|of none|data|branch|record|records|file|files|list|class|plan|schedule|service|services|agreement|bedroom|suite|key|node|scheduler|copy|chef|electrician|plumber|technician|mechanic|craftsman|carpenter|builder|planner|sergeant|cylinder|database|control|switch|volume|template|page|thesis advisor)\b/;

const DEGREE_NEGATED_BEFORE =
  /\b(?:no|without(?: an?)?|(?:don'?t|do not|doesn'?t|does not) (?:need|require)(?: an?)?|not require(?: an?)?)\s*$/;
const DEGREE_NEGATED_AFTER =
  /^[^.;\n]{0,30}?\b(?:is |are )?not (?:required|necessary|needed|a requirement)\b/;
const MASTER_OF_FIELD =
  /^\s*(?:science|arts|business|engineering|fine arts|public|education|computer|information|mathematics|statistics|laws?|finance|accounting|management|data|applied|social|health|international|economics|philosophy|technology|architecture|design|music|library|professional|research|urban|nursing)\b/;

const inDegreeContext = (before: string, after: string) =>
  DEGREE_PAIR_AFTER.test(after) ||
  DEGREE_PAIR_BEFORE.test(before) ||
  DEGREE_WORD_AFTER.test(after);

type DegreeRule = {
  level: JobDegreeLevel;
  pattern: RegExp;
  /** Abbreviations must stand alone: no letter, digit or "." around them. */
  standalone?: boolean;
  accept?: (before: string, after: string, word: string) => boolean;
};

const DEGREE_RULES: DegreeRule[] = [
  {
    level: 'bachelor',
    pattern:
      /\bbachelor(?:'?s)?\b|\bbaccalaureate\b|\b(?:bsc|bscs|bsee|bsme|bsba|bba|btech|b\.tech|beng|b\.eng)\b|\b(?:undergraduate|four[- ]year|4[- ]year) (?:college |university )?degree\b/g,
  },
  {
    level: 'bachelor',
    pattern: /b\.(?:sc|s|a|e)\.?|b\. (?:sc|s|a)\./g,
    standalone: true,
  },
  {
    level: 'bachelor',
    pattern: /\b(?:bs|ba)\b/g,
    standalone: true,
    accept: inDegreeContext,
  },
  {
    level: 'master',
    pattern: /\bmaster(?:'?s)?\b(?:\s+(?:of|in|degree)\b)?/g,
    accept: (before, after, word) => {
      if (MASTER_NOT_DEGREE_BEFORE.test(before)) return false;
      if (MASTER_NOT_DEGREE_AFTER.test(after)) return false;
      if (/\sof$/.test(word)) return MASTER_OF_FIELD.test(after);
      // A bare "master" ("master new markets") needs a degree context; the
      // possessive or plural ("Master's", "Masters") is the degree.
      return (
        /^master'?s/.test(word) ||
        /\s(?:in|degree)$/.test(word) ||
        inDegreeContext(before, after)
      );
    },
  },
  {
    level: 'master',
    pattern:
      /\b(?:msc|mscs|msee|msme|mba|meng|m\.eng|mtech|m\.tech|mphil|m\.phil)\b/g,
  },
  {
    level: 'master',
    pattern: /m\.(?:sc|s|a|ed|b\.?a)\.?|m\. (?:sc|s|a)\./g,
    standalone: true,
  },
  {
    level: 'master',
    pattern: /\bms\b/g,
    standalone: true,
    accept: (before, after) =>
      !MS_PRODUCT_AFTER.test(after) && inDegreeContext(before, after),
  },
  {
    level: 'doctorate',
    pattern:
      /\bph\.?\s?d(?:s|'s)?\b|\bdoctorate\b|\bdoctoral\b|\bdoctor of (?:philosophy|science|engineering|education)\b|\bd\.?phil\b/g,
  },
];

function matchesDegreeRule(text: string, rule: DegreeRule) {
  for (const match of text.matchAll(rule.pattern)) {
    const start = match.index ?? 0;
    const end = start + match[0].length;
    const before = text.slice(Math.max(0, start - 40), start);
    const after = text.slice(end, end + 40);
    if (rule.standalone) {
      if (start > 0 && /[a-z0-9.]/.test(text[start - 1])) continue;
      if (/^[a-z0-9]/.test(after)) continue;
    }
    if (rule.accept && !rule.accept(before, after, match[0])) continue;
    // "A PhD is not required", "no bachelor's degree needed".
    if (DEGREE_NEGATED_BEFORE.test(before) || DEGREE_NEGATED_AFTER.test(after))
      continue;
    return true;
  }
  return false;
}

/** Degree levels a posting names, in bachelor, master, doctorate order. */
export function inferDegreeLevels(plainText: string): JobDegreeLevel[] {
  const levels: JobDegreeLevel[] = [];
  for (const rule of DEGREE_RULES) {
    if (levels.includes(rule.level)) continue;
    if (matchesDegreeRule(plainText, rule)) levels.push(rule.level);
  }
  return levels;
}

const DAYS_NUMBER = '(\\d|one|two|three|four|five)';
const DAYS_IN_OFFICE = [
  new RegExp(
    `\\b${DAYS_NUMBER}(?:\\s*(?:-|to)\\s*${DAYS_NUMBER})?\\s*(?:days?|x)\\s*(?:a|per|/|each|every)\\s*week\\s*(?:in[- ]office|in[- ]person|on[- ]?site|in (?:the|our) (?:office|hq|headquarters)|at (?:the|our) (?:office|hq|headquarters|[a-z ]{0,20}office))`,
    'g',
  ),
  new RegExp(
    `\\b(?:in[- ]office|in[- ]person|on[- ]?site|(?:in|from|at) (?:the|our) office)\\s*(?:at least\\s*|a minimum of\\s*)?${DAYS_NUMBER}(?:\\s*(?:-|to)\\s*${DAYS_NUMBER})?\\s*(?:days?|x)\\s*(?:a|per|/|each|every)\\s*week`,
    'g',
  ),
];

const LABEL =
  '(?:location|workplace|workplace type|work location|location type|work arrangement|work model|work type|work setting|working model|arrangement)';
const ON_SITE = '(?:on[- ]?site|in[- ]office|in[- ]person|office[- ]based)';

const REMOTE_DENIED =
  /\b(?:not|no)\s+(?:a\s+)?(?:fully\s+)?remote\b(?!\s*-?\s*first)|\bremote (?:work|working|option|options|arrangements?|employment) (?:is |are )?not (?:available|offered|possible|an option|supported)\b|\bnot (?:eligible|open|available) (?:for|to) remote\b|\bunable to (?:offer|support|accommodate) remote\b|\bthis (?:role|position|job) is not remote\b/;
const REMOTE_PATTERNS = [
  /\bremote\s+(?:(?:full[- ]time|part[- ]time|contract|contractor|permanent|temporary|freelance|paid|seasonal|fixed[- ]term|or|and)\s+){1,3}(?:role|position|job|opportunity)\b/,
  /\b(?:fully|100%|completely|entirely|full[- ]time|permanently|primarily|mostly|totally)\s+remote\b/,
  /(?:^|\s)100% remote\b/,
  /\bremote[- ](?:first|friendly|eligible|ok|okay|optional|based|only)\b/,
  /\bremote\s+(?:role|position|job|opportunity|opportunities|work|working|employee|employment|worker|team member|candidates?|option|setup|arrangement|contract|contractor|freelance|internship|basis)\b/,
  /\bwork(?:s|ed|ing)?\s+(?:fully\s+|100%\s+|completely\s+)?remotely\b/,
  /\bfull[- ]remote\b/,
  /\bremotely (?:in|within|from|across) (?:the )?(?:us|u\.s|usa|united states|canada|uk|eu|europe|any|anywhere|north america|latin america|emea|apac)\b/,
  /#li-remote\b/,
  /\(\s*(?:fully\s+|100%\s+)?remote\s*\)/,
  /\b(?:role|position|job|this|opportunity)\s+(?:is|can be|will be|may be)\s+(?:a\s+)?(?:fully\s+|100%\s+)?(?:remote|performed remotely|done remotely|based remotely|worked remotely)\b/,
  new RegExp(`\\b${LABEL}\\s*[:|-]\\s*(?:fully\\s+)?remote\\b`),
  /\bremote\s*(?:\(|-|,|\||\/)\s*(?:us|u\.s|usa|united states|canada|uk|eu|europe|emea|apac|global|worldwide|anywhere|americas|north america|latam|india|germany|france|spain|mexico|brazil)\b/,
  /\bremote\s+(?:in|within|from|across)\s+(?:the\s+)?(?!nature\b|person\b)[a-z]/,
  /\bopen to remote\b/,
  new RegExp(`\\bremote\\s*(?:or|/)\\s*(?:hybrid|${ON_SITE})\\b`),
  new RegExp(`\\b(?:hybrid|${ON_SITE})\\s*(?:or|/)\\s*remote\\b`),
  /(?:^|\n|\|)\s*remote\s*(?:$|\n|\|)/,
];
const HYBRID_PATTERNS = [
  /\bhybrid\s+(?:(?:full[- ]time|part[- ]time|contract|contractor|permanent|temporary|freelance|paid|seasonal|fixed[- ]term|or|and)\s+){1,3}(?:role|position|job|opportunity)\b/,
  /#li-hybrid\b/,
  /\(\s*hybrid\s*\)/,
  /\b\d days? (?:a week |per week )?(?:remote|remotely|from home|wfh)\b/,
  /\bhybrid\s+(?:role|position|job|opportunity|work|working|schedule|model|arrangement|setup|policy|workplace|work environment|basis|office|location|company|organization|organisation|remote|on[- ]?site|in[- ]office)\b/,
  /\bhybrid\s+(?:in|from|out of|based in|at)\s+(?:our\s+|the\s+)?[a-z]/,
  /\b(?:role|position|job|this|opportunity)\s+(?:is|will be)\s+(?:a\s+)?hybrid\b/,
  new RegExp(`\\b${LABEL}\\s*[:|-]\\s*hybrid\\b`),
  /\bhybrid\s*\(\s*\d/,
  /\bhybrid\s*(?:-|\|)\s*(?:\d|us\b|united states\b|onsite\b|on-site\b|in[- ]office\b|remote\b)/,
  /(?:^|\n|\|)\s*hybrid\s*(?:$|\n|\|)/,
];
const ON_SITE_PATTERNS = [
  /\b(?:on[- ]?site|in[- ]office|in[- ]person)\s+(?:(?:full[- ]time|part[- ]time|contract|contractor|permanent|temporary|freelance|paid|seasonal|fixed[- ]term|or|and)\s+){1,3}(?:role|position|job|opportunity)\b/,
  /#li-onsite\b/,
  /\(\s*(?:on[- ]?site|in[- ]office|in[- ]person)\s*\)/,
  new RegExp(
    `\\b(?:fully|100%|completely|entirely|exclusively|full[- ]time|primarily|five days|5 days)\\s+${ON_SITE}\\b`,
  ),
  new RegExp(
    `\\b${ON_SITE}\\s+(?:role|position|job|opportunity|employee|presence|requirement|schedule|basis|5 days|five days|every day|daily|full[- ]time)\\b`,
  ),
  new RegExp(
    `\\b(?:role|position|job|this|opportunity)\\s+(?:is|will be|requires? (?:being|you to be|working))\\s+(?:a\\s+|an\\s+)?(?:fully\\s+|100%\\s+)?${ON_SITE}\\b`,
  ),
  new RegExp(
    `\\bwork(?:ing)?\\s+(?:fully\\s+)?(?:${ON_SITE}|from (?:the|our) office|in (?:the|our) office)\\b`,
  ),
  new RegExp(`\\b${LABEL}\\s*[:|-]\\s*${ON_SITE}\\b`),
  new RegExp(
    `\\b(?:on[- ]?site|in[- ]office|office[- ]based)\\s+(?:in|at)\\s+(?:our\\s+|the\\s+)?(?!customers?\\b|clients?\\b|partners?\\b|events?\\b|conferences?\\b|interviews?\\b)[a-z]`,
  ),
  /(?:^|\n|\|)\s*(?:on[- ]?site|in[- ]office)\s*(?:$|\n|\|)/,
];

function daysNumber(value: string | undefined) {
  if (value === undefined) return undefined;
  return /\d/.test(value) ? Number(value) : WORD_NUMBERS[value];
}

/** "We do not offer hybrid or remote options", "not a remote role". */
const NEGATED_BEFORE =
  /\b(?:not|no|don'?t|do not|doesn'?t|does not|cannot|can'?t|won'?t|will not|unable to|never)\b[^.;,\n]{0,40}$/;

function affirmed(text: string, patterns: readonly RegExp[]) {
  for (const pattern of patterns) {
    const global = new RegExp(pattern.source, 'g');
    for (const match of text.matchAll(global)) {
      const start = match.index ?? 0;
      if (!NEGATED_BEFORE.test(text.slice(Math.max(0, start - 60), start)))
        return true;
    }
  }
  return false;
}

export function inferWorkplaceEvidence(plainText: string): JobWorkplace[] {
  const text = plainText;
  let hybrid = affirmed(text, HYBRID_PATTERNS);
  let onSite = affirmed(text, ON_SITE_PATTERNS);
  for (const pattern of DAYS_IN_OFFICE) {
    for (const match of text.matchAll(pattern)) {
      const days = Math.max(
        daysNumber(match[1]) ?? 0,
        daysNumber(match[2]) ?? 0,
      );
      if (days >= 5) onSite = true;
      else if (days >= 1) hybrid = true;
    }
  }
  const remoteDenied = REMOTE_DENIED.test(text);
  if (remoteDenied) onSite = true;
  const remote = !remoteDenied && affirmed(text, REMOTE_PATTERNS);
  const workplaces: JobWorkplace[] = [];
  if (remote) workplaces.push('remote');
  if (hybrid) workplaces.push('hybrid');
  if (onSite) workplaces.push('on_site');
  return workplaces;
}

const STAFF_BEFORE =
  /\b(?:mentor|mentoring|mentors|manage|managing|supervise|supervising|hire|hiring|recruit|recruiting|train|training|onboard|onboarding|lead|leading|oversee|overseeing|coordinate|coordinating|support|supporting|run|running)\s+(?:(?:the|our|summer|fall|spring|winter|new|university|campus)\s+){0,2}$/;

function hasUnstaffedMatch(text: string, pattern: RegExp) {
  for (const match of text.matchAll(pattern)) {
    const start = match.index ?? 0;
    if (!STAFF_BEFORE.test(text.slice(Math.max(0, start - 40), start)))
      return true;
  }
  return false;
}

/** "Job type: Permanent", "Employment type (...)\nContract", "Type: contract / part-time". */
const TYPE_LABEL =
  '\\b(?:(?:job|employment|position|contract|role|worker|work) )?type(?:\\s*\\([^)\\n]*\\))?\\s*[:\\n|-]\\s*(?:[a-z-]+\\s*(?:/|,|and|or)\\s*)?';

const INTERNSHIP_PATTERNS = [
  new RegExp(
    `${TYPE_LABEL}(?:paid |unpaid )?(?:internship|intern|co-op)\\b`,
    'g',
  ),
  /\b(?:this|the) (?:is an? )?(?:(?:paid|unpaid|summer|fall|spring|winter|autumn|\d+[- ](?:week|month)|full[- ]time|part[- ]time|remote|hybrid|in[- ]person) )*internship\b(?! program\b)/g,
  /\b(?:summer|fall|spring|winter|autumn) (?:\d{4} )?(?:internship|intern|co-op)s?\b/g,
  /\binternship (?:position|role|opportunity|duration|dates|period|term|start date|length|will|is|runs|lasts)\b/g,
  /\bas an intern\b/g,
  /\b(?:paid|unpaid) internship\b/g,
  /\b(?:co-op|coop) (?:position|role|term|placement|student)\b/g,
  /(?:^|\n|\|)\s*internship\s*(?:$|\n|\|)/g,
];
const CONTRACT_PATTERNS = [
  new RegExp(`${TYPE_LABEL}(?:contract|contractor|freelance|1099)\\b`),
  /\b(?:this|the) (?:is (?:an? )?)?(?:(?:\d+[- ](?:week|month|year)|short[- ]term|long[- ]term|remote|part[- ]time|full[- ]time) )*(?:contract|contractor|freelance|1099|contract[- ]to[- ]hire) (?:role|position|job|engagement|opportunity|assignment|basis|gig)\b/,
  /\b(?:contract|contractor|freelance) (?:role|position|engagement|assignment|opportunity|basis|duration|length|period)\b/,
  /\bcontract[- ]to[- ](?:hire|perm|permanent)\b/,
  /\b\d+[- ](?:week|month)s? (?:contract|engagement|assignment)\b/,
  /\bon an? (?:contract|contractor|freelance|1099|consulting|independent contractor) basis\b/,
  /\b(?:w-?2|1099|c2c|corp[- ]to[- ]corp) (?:contract|position|role|only|basis|contractor)\b/,
  /\bfreelance(?=\s*(?:\||$|\n|,|-|\)))/,
  /\bindependent contractor (?:role|position|agreement|engagement|relationship)\b/,
];
const TEMPORARY_PATTERNS = [
  new RegExp(`${TYPE_LABEL}(?:temporary|temp|fixed[- ]term|seasonal)\\b`),
  /\btemporary (?:role|position|job|assignment|contract|employment|basis|opportunity|hire|worker|employee|full[- ]time|part[- ]time|seasonal|staff)\b/,
  /\bthis (?:is an? )?temporary (?!housing|accommodation|disability|relocation|leave)|\b(?:role|position|job|assignment) is temporary\b/,
  /\bfixed[- ]term\b(?=\s*(?:contract|role|position|employment|basis|appointment|assignment|post|hire|\)|\||$|\n))/,
  /\bseasonal (?:role|position|job|employment|worker|employee|associate|hire|staff)\b/,
  /\b(?:maternity|parental) (?:leave )?cover\b/,
];
const PERMANENT_PATTERNS = [
  new RegExp(`${TYPE_LABEL}(?:permanent|regular)\\b`),
  /\bpermanent (?:role|position|job|full[- ]time|part[- ]time|employment|contract|hire|placement|opportunity|basis|employee|staff)\b/,
  /\bregular (?:full[- ]time |part[- ]time )?(?:position|role)\b/,
];
const FULL_TIME =
  /\bfull[- ]?time\b(?!\s*(?:equivalent|students?|student status|enrollment|enrolment|degree|mba|program|study|studies|education))/;
const PART_TIME_PATTERNS = [
  new RegExp(`${TYPE_LABEL}part[- ]?time\\b`),
  /\bpart[- ]?time (?:role|position|job|opportunity|schedule|contract|employment|basis|hours|work|assignment|contractor|freelance|consultant|seasonal|temporary|associate|internship|intern)\b/,
  /\bthis (?:is an? )?part[- ]?time\b|\b(?:role|position|job) is part[- ]?time\b/,
  /(?:^|\n|\||\()\s*part[- ]?time\s*(?:$|\n|\||\))/,
];
const WEEKLY_HOURS =
  /\b(\d{1,2})\s*(?:(?:-|to)\s*(\d{1,2})\s*)?(?:hours|hrs)\s*(?:per|a|\/|each)\s*week\b/g;

export function inferJobTypeEvidence(plainText: string): JobTypeKind[] {
  // Boilerplate such as "duties may change on a temporary or permanent
  // basis" names both kinds and describes neither.
  const text = plainText.replace(
    /\b(?:temporary or permanent|permanent or temporary)\b/g,
    ' ',
  );
  const types: JobTypeKind[] = [];
  if (INTERNSHIP_PATTERNS.some((pattern) => hasUnstaffedMatch(text, pattern)))
    types.push('internship');
  if (CONTRACT_PATTERNS.some((pattern) => pattern.test(text)))
    types.push('contract');
  if (TEMPORARY_PATTERNS.some((pattern) => pattern.test(text)))
    types.push('temporary');
  if (PERMANENT_PATTERNS.some((pattern) => pattern.test(text)))
    types.push('permanent');
  return types;
}

export function inferEmploymentEvidence(
  plainText: string,
): JobEmploymentKind[] {
  const text = plainText;
  let fullTime = FULL_TIME.test(text) || /\b(?:1\.0|100%)\s*fte\b/.test(text);
  let partTime = PART_TIME_PATTERNS.some((pattern) => pattern.test(text));
  for (const match of text.matchAll(WEEKLY_HOURS)) {
    const hours = Number(match[2] ?? match[1]);
    if (hours >= 1 && hours <= 30) partTime = true;
    else if (hours >= 35 && hours <= 60) fullTime = true;
  }
  const types: JobEmploymentKind[] = [];
  if (fullTime) types.push('full_time');
  if (partTime) types.push('part_time');
  return types;
}

/** Facts from a posting's description (HTML or plain text). */
export function inferTextJobFacts(
  description: string | null | undefined,
): TextJobFacts {
  const text = jobPostingPlainText(description);
  return {
    workplaces: inferWorkplaceEvidence(text),
    degreeLevels: inferDegreeLevels(text),
    minimumExperienceYears: inferMinimumExperienceYears(text),
    jobTypes: inferJobTypeEvidence(text),
    employmentTypes: inferEmploymentEvidence(text),
  };
}
