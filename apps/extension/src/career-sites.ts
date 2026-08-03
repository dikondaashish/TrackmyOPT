/**
 * Career site detection — single source of truth for all job board / ATS / freelance
 * / remote-work platform identification.
 *
 * HOW TO ADD A NEW DOMAIN:
 *   1. Add the bare hostname (no www) to the appropriate array below.
 *   2. Add the corresponding manifest.json URL pattern in the content_scripts.matches
 *      array (both www and bare domain, e.g. "*://domain.com/*").
 *   3. That's it — the runtime isCareerPage() check will pick it up automatically.
 */

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1 — GLOBAL JOB BOARDS
// ─────────────────────────────────────────────────────────────────────────────

/** 🇺🇸 USA / Global job boards */
export const JOB_BOARDS_USA: readonly string[] = [
  'linkedin.com',
  'indeed.com',
  'glassdoor.com',
  'monster.com',
  'ziprecruiter.com',
  'simplyhired.com',
  'careerbuilder.com',
  'dice.com',
  'hired.com',
  'wellfound.com',
  'angel.co',
  'weworkremotely.com',
  'remote.co',
  'flexjobs.com',
  'joinhandshake.com',
  'snagajob.com',
  'usajobs.gov',
  'idealist.org',
  'builtin.com',
  'otta.com',
  'levels.fyi',
  'wayup.com',
  'collegegrad.com',
  'aftercollege.com',
  'vault.com',
  'theladders.com',
  'salary.com',
  'getwork.org',
  'joblist.com',
  'lensa.com',
  'talent.com',
  'jooble.org',
  'jobcase.com',
  'careerjet.com',
  'nexxt.com',
  'mediabistro.com',
  'journalismjobs.com',
  'poachedjobs.com',
  'entertainmentcareers.net',
  'productionhub.com',
  'mandy.com',
  'staff.com',
  'gun.io',
  'authenticjobs.com',
  'techjobsforgood.com',
  'diversityjobs.com',
  'disabledperson.com',
  'ihireveterans.com',
  'jobsinnetwork.com',
  'laddrs.com',
  'jobsinthemoney.com',
  'workopolis.com',
  'eluta.ca',
  'jobbank.gc.ca',
];

/** 🇬🇧 United Kingdom */
export const JOB_BOARDS_UK: readonly string[] = [
  'reed.co.uk',
  'totaljobs.com',
  'cv-library.co.uk',
  'fish4.co.uk',
  'jobs.ac.uk',
  'cwjobs.co.uk',
  'jobsite.co.uk',
  'jobs.nhs.uk',
  's1jobs.com',
  'jobsgopublic.com',
  'charityjob.co.uk',
  'thirdsector.co.uk',
  'milkround.com',
  'gradcracker.com',
  'graduateland.com',
];

/** 🇮🇳 India */
export const JOB_BOARDS_INDIA: readonly string[] = [
  'naukri.com',
  'shine.com',
  'foundit.in',
  'instahyre.com',
  'apna.co',
  'internshala.com',
  'freshersworld.com',
  'timesjobs.com',
  'iimjobs.com',
  'cutshort.io',
  'hirist.com',
  'monsterindia.com',
  'placementindia.com',
  'updazz.com',
  'workindia.in',
  'jobhai.com',
  'naukrihub.com',
  'careesma.in',
  'sumhr.com',
  'firstnaukri.com',
  'hirect.in',
];

/** 🌍 Middle East / Gulf */
export const JOB_BOARDS_GULF: readonly string[] = [
  'bayt.com',
  'gulftalent.com',
  'naukrigulf.com',
  'dubizzle.com',
  'monstergulf.com',
  'laimoon.com',
  'drjobs.ae',
  'tanqeeb.com',
  'akhtaboot.com',
  'mihnati.com',
  'wuzzuf.net',
  'forasna.com',
  'jobnet.com.eg',
];

/** 🇪🇺 Europe */
export const JOB_BOARDS_EUROPE: readonly string[] = [
  'xing.com',
  'stepstone.de',
  'stepstone.com',
  'karriere.at',
  'jobs.ch',
  'jobup.ch',
  'monster.de',
  'monster.fr',
  'cadremploi.fr',
  'apec.fr',
  'pole-emploi.fr',
  'infojobs.net',
  'tecnoempleo.com',
  'trabajos.com',
  'michaelpage.com',
  'hays.com',
  'robertwalters.com',
  'manpower.com',
  'adecco.com',
  'randstad.com',
  'eurobrussels.com',
  'euractiv.com',
  'jobted.it',
  'jobs.ie',
  'irishjobs.ie',
  'nijobs.com',
  'jobs.lu',
  'jobat.be',
  'stepstone.be',
  'jobs.nl',
  'nationalcareers.service.gov.uk',
];

/** 🌏 Asia-Pacific */
export const JOB_BOARDS_APAC: readonly string[] = [
  'jobsdb.com',
  'jobstreet.com',
  'seek.com.au',
  'seek.co.nz',
  'mycareer.com.au',
  'careerone.com.au',
  'jobsora.com',
  'rikunabi.com',
  'mynavi.jp',
  'doda.jp',
  'saramin.co.kr',
  'jobkorea.co.kr',
  '104.com.tw',
  'jobs.com.hk',
  'cpjobs.com',
  'zhaopin.com',
  'liepin.com',
  '51job.com',
  'bossjob.com',
  'bossjob.ph',
  'jobsgo.vn',
  'careerlink.vn',
  'kalibrr.com',
  'jobstreet.com.ph',
  'jobscentral.com.sg',
  'stjobs.sg',
  'sgemployment.com',
  'jobs.recruitment.com',
];

/** 🌎 Latin America */
export const JOB_BOARDS_LATAM: readonly string[] = [
  'computrabajo.com',
  'bumeran.com',
  'zonajobs.com.ar',
  'konzerta.com',
  'vagas.com.br',
  'catho.com.br',
  'infojobs.com.br',
  'emprego.net.br',
  'getonbrd.com',
  'laborum.com',
  'trabajando.com',
  'occ.com.mx',
];

/** 🌍 Africa */
export const JOB_BOARDS_AFRICA: readonly string[] = [
  'jobberman.com',
  'myjobmag.com',
  'brightermonday.com',
  'jobwebkenya.com',
  'careers24.com',
  'pnet.co.za',
  'bizcommunity.com',
  'jobsrwanda.com',
  'ethiojobs.net',
];

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2 — ATS / EMPLOYER PORTALS (matched via host suffix)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * ATS host suffixes — matched against the end of the hostname.
 * Each entry must start with a dot (e.g. '.greenhouse.io').
 * A wildcard subdomain like 'company.greenhouse.io' matches '.greenhouse.io'.
 */
export const ATS_HOST_SUFFIXES: readonly string[] = [
  // Core applicant tracking
  '.myworkdayjobs.com',    // Workday (wd1/wd2/wd3.myworkdayjobs.com)
  '.myworkday.com',        // Workday legacy
  '.greenhouse.io',        // Greenhouse
  '.lever.co',             // Lever
  '.icims.com',            // iCIMS
  '.taleo.net',            // Taleo / Oracle
  '.brassring.com',        // Brassring / Kenexa
  '.successfactors.com',   // SAP SuccessFactors
  '.smartrecruiters.com',  // SmartRecruiters
  '.jazzhr.com',           // JazzHR
  '.bamboohr.com',         // BambooHR
  '.recruitee.com',        // Recruitee
  '.ashbyhq.com',          // Ashby
  '.jobvite.com',          // Jobvite
  '.comeet.com',           // Comeet
  '.dover.com',            // Dover
  '.workable.com',         // Workable
  '.teamtailor.com',       // Teamtailor
  '.rippling.com',         // Rippling
  '.pinpointhq.com',       // Pinpoint
  '.applytojob.com',       // ApplyToJob
  '.eightfold.ai',         // Eightfold
  '.beamery.com',          // Beamery
  '.avature.net',          // Avature
  '.snagajob.com',         // Snagajob ATS
  '.breezyhr.com',         // Breezy HR
  '.freshteam.com',        // Freshteam
  '.recruitcrm.io',        // RecruitCRM
  '.jobadder.com',         // JobAdder
  '.personio.de',          // Personio
  '.personio.com',         // Personio (global)
  '.oraclecloud.com',      // Oracle HCM
  '.jobsoid.com',          // Jobsoid
  '.hirevue.com',          // HireVue
  '.paradox.ai',           // Paradox AI (Olivia)
  '.loxo.co',              // Loxo
  '.crelate.com',          // Crelate
  '.bullhorn.com',         // Bullhorn
  '.ceipal.com',           // Ceipal
  '.cornerstone.com',      // Cornerstone OnDemand
  '.kronos.com',           // Kronos / UKG
  '.ultipro.com',          // UKG Pro (ex-UltiPro)
  '.paycom.com',           // Paycom
  '.paychex.com',          // Paychex
  '.adp.com',              // ADP
  '.ceridian.com',         // Ceridian / Dayforce
  '.namely.com',           // Namely
  '.paylocity.com',        // Paylocity
  '.jobscore.com',         // JobScore
  '.jobdiva.com',          // JobDiva
  '.silkroad.com',         // SilkRoad
  '.pcrecruiter.net',      // PCRecruiter
  '.careerplug.com',       // CareerPlug
  '.clearcompany.com',     // ClearCompany
  '.talentreef.com',       // TalentReef
  '.phenom.com',           // Phenom
  '.hirebridge.com',       // HireBridge
  '.employmentsystems.com',// Employment Systems
  '.zohorecruit.com',      // Zoho Recruit
  '.manatal.com',          // Manatal
  '.keka.com',             // Keka HR
  '.darwinbox.com',        // Darwinbox
  '.springrecruit.com',    // Spring Recruit
  '.hirecraft.in',         // HireCraft
];

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3 — FREELANCE & GIG PLATFORMS
// ─────────────────────────────────────────────────────────────────────────────

export const FREELANCE_HOSTS: readonly string[] = [
  'upwork.com',
  'freelancer.com',
  'fiverr.com',
  'toptal.com',
  'guru.com',
  'peopleperhour.com',
  '99designs.com',
  'designcrowd.com',
  'twine.net',
  'servicescape.com',
  'truelancer.com',
  'workana.com',
  'solidgigs.com',
  'bark.com',
  'thumbtack.com',
  'airtasker.com',
  'outsourcely.com',
  'contra.com',
  'arc.dev',
  'codementor.io',
  'gigsalad.com',
  'designhill.com',
  'envato.com',
  'mightybytes.com',
  'craigslist.org',   // /jobs path only (handled by path RE)
];

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4 — REMOTE JOB PLATFORMS
// ─────────────────────────────────────────────────────────────────────────────

export const REMOTE_HOSTS: readonly string[] = [
  'remoteok.com',
  'remote.com',
  'remotive.com',
  'justremote.co',
  'remoteleaf.com',
  'nodesk.co',
  'remotehub.com',
  'virtualvocations.com',
  'pangian.com',
  'jobspresso.co',
  'workingnomads.com',
  'himalayas.app',
  '4dayweek.io',
  'freshremote.work',
  'tryremotely.com',
  'remotists.com',
  'europeremotely.com',
  'remote.tools',
  'workfromhomejobs.me',
  'latitudework.com',
  'remotewoman.com',
  'jobsremotely.org',
  'skipthedrive.com',
];

// ─────────────────────────────────────────────────────────────────────────────
// COMBINED — all explicit job-site hostnames in one flat set
// ─────────────────────────────────────────────────────────────────────────────

export const ALL_JOB_BOARD_HOSTS: readonly string[] = [
  ...JOB_BOARDS_USA,
  ...JOB_BOARDS_UK,
  ...JOB_BOARDS_INDIA,
  ...JOB_BOARDS_GULF,
  ...JOB_BOARDS_EUROPE,
  ...JOB_BOARDS_APAC,
  ...JOB_BOARDS_LATAM,
  ...JOB_BOARDS_AFRICA,
  ...FREELANCE_HOSTS,
  ...REMOTE_HOSTS,
];

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5 — URL PATH PATTERNS
// ─────────────────────────────────────────────────────────────────────────────

/** Subdomain prefixes that identify a company's career site */
export const CAREER_SUBDOMAIN_PREFIXES: readonly string[] = [
  'careers',
  'jobs',
  'job',
  'talent',
  'talents',
  'recruiting',
  'recruitment',
  'recruit',
  'hire',
  'hiring',
  'apply',
  'application',
  'join',
  'work',
  'opportunity',
  'opportunities',
  'workwithus',
  'joinus',
  'openings',
  'vacancies',
  'employment',
];

/** URL path segments that indicate a job/career page */
export const CAREER_PATH_RE =
  /\/(job|jobs|career|careers|position|positions|opening|openings|apply|application|requisition|vacancy|vacancies|posting|listings?|req\b|talent|recruit|recruiting|recruitment|hiring|candidate|opportunit|join(-us|-our-team)?|work(-with-us|-here)?|employment|jobpostings?|current-openings?|job-openings?|job-listings?)/i;

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 6 — DYNAMIC / DOM FALLBACK SIGNALS
// ─────────────────────────────────────────────────────────────────────────────

/** Strong career phrases found in page <title> or meta description */
export const CAREER_TITLE_STRONG_RE =
  /\b(job opening|job description|job listing|we(?:'re| are) hiring|apply now|open position|current opening|job vacanc|career opportunit|join our team|join us today|work with us|come work|we want you|you're hired)\b|\bjobs?\s+at\b|\bcareers?\s+at\b|\bjobs?\s+@\b/i;

/** Broader career keyword set (secondary check) */
export const CAREER_KEYWORD_RE =
  /\b(jobs?|careers?|hiring|apply|vacanc|opening|position|internship|fellowship|recruitment|employment\s+opportunit|staffing|job\s+post)\b/i;

// ─────────────────────────────────────────────────────────────────────────────
// BLOCKED — sites that are definitively NOT career pages
// ─────────────────────────────────────────────────────────────────────────────

export const BLOCKED_HOSTS: readonly string[] = [
  // Social / entertainment
  'youtube.com', 'youtu.be',
  'facebook.com', 'fb.com',
  'twitter.com', 'x.com',
  'instagram.com',
  'tiktok.com',
  'reddit.com',
  'twitch.tv',
  'pinterest.com',
  'snapchat.com',
  'discord.com',
  'telegram.org',
  'whatsapp.com',
  // Streaming
  'netflix.com', 'hulu.com', 'disneyplus.com',
  'spotify.com', 'soundcloud.com',
  'primevideo.com', 'hbomax.com',
  // E-commerce (general)
  'amazon.com', 'amazon.co.uk', 'amazon.in',
  'flipkart.com',
  'ebay.com',
  'walmart.com',
  'etsy.com',
  'alibaba.com', 'aliexpress.com',
  'shopify.com',       // the storefront builder, not jobs.shopify.com
  // Productivity / communication
  'mail.google.com',
  'docs.google.com',
  'drive.google.com',
  'calendar.google.com',
  'meet.google.com',
  'sheets.google.com',
  'slides.google.com',
  'outlook.live.com',
  'outlook.office.com',
  'mail.yahoo.com',
  'notion.so',
  'slack.com',
  'zoom.us',
  'teams.microsoft.com',
  'office.com',
  // Finance
  'chase.com', 'bankofamerica.com', 'wellsfargo.com',
  'paypal.com', 'venmo.com', 'cashapp.com',
  // News / wikis
  'wikipedia.org',
  'medium.com',
  'substack.com',
  'news.ycombinator.com',
  'techcrunch.com',
  'theverge.com',
  'wired.com',
  'nytimes.com', 'bbc.com', 'cnn.com',
];

// ─────────────────────────────────────────────────────────────────────────────
// MAIN DETECTION FUNCTION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the detection reason string if the current page is a career/job page,
 * or null if it is not.
 *
 * Detection order (highest confidence first):
 *  1. Hard blocklist
 *  2. Known job-board hostname
 *  3. ATS / employer-portal host suffix
 *  4. Career subdomain prefix  (careers.company.com, jobs.company.com)
 *  5. Career URL path segment  (/jobs, /careers, /openings, …)
 *  6. Page <title> strong phrases
 *  7. Meta description / keywords containing career terms
 *  8. JSON-LD JobPosting schema
 *  9. Application form with resume/CV upload or "Apply" submit button
 */
export function isCareerPage(): string | null {
  if (typeof window === 'undefined') return null;
  if (location.protocol !== 'http:' && location.protocol !== 'https:') return null;

  const rawHost = location.hostname.toLowerCase();
  const host = rawHost.replace(/^www\./, '');

  // ── 1. Hard blocklist ──────────────────────────────────────────────────────
  for (let i = 0; i < BLOCKED_HOSTS.length; i++) {
    const b = BLOCKED_HOSTS[i];
    if (host === b || host.endsWith('.' + b)) return null;
  }
  if (host === 'google.com') return null;  // google.com itself is not a career site

  // ── 2. Known job-board hostname ───────────────────────────────────────────
  for (let i = 0; i < ALL_JOB_BOARD_HOSTS.length; i++) {
    const j = ALL_JOB_BOARD_HOSTS[i];
    if (host === j || host.endsWith('.' + j)) {
      return `known-job-board:${j}`;
    }
  }

  // ── 3. ATS / employer portal ──────────────────────────────────────────────
  for (let i = 0; i < ATS_HOST_SUFFIXES.length; i++) {
    const s = ATS_HOST_SUFFIXES[i]; // e.g. '.greenhouse.io'
    if (rawHost.endsWith(s) || rawHost === s.slice(1)) {
      return `ats-portal:${s.slice(1)}`;
    }
  }

  // ── 4. Career subdomain prefix ────────────────────────────────────────────
  const firstLabel = rawHost.split('.')[0];
  for (let i = 0; i < CAREER_SUBDOMAIN_PREFIXES.length; i++) {
    if (firstLabel === CAREER_SUBDOMAIN_PREFIXES[i]) {
      return `career-subdomain:${firstLabel}`;
    }
  }

  // ── 5. Career URL path ────────────────────────────────────────────────────
  const pathAndQuery = location.pathname + (location.search || '');
  if (CAREER_PATH_RE.test(pathAndQuery)) {
    const match = pathAndQuery.match(CAREER_PATH_RE);
    return `career-path:${match ? match[0] : pathAndQuery}`;
  }

  // ── 6. Page <title> strong phrases ────────────────────────────────────────
  const title = document.title || '';
  if (CAREER_TITLE_STRONG_RE.test(title)) {
    return `title-match:${title.slice(0, 60)}`;
  }

  // ── 7. Meta description / keywords ────────────────────────────────────────
  const metaDesc =
    document.querySelector('meta[name="description"]')?.getAttribute('content') ||
    document.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
    '';
  if (CAREER_TITLE_STRONG_RE.test(metaDesc)) {
    return `meta-desc-match`;
  }

  const metaKw = document.querySelector('meta[name="keywords"]')?.getAttribute('content') || '';
  if (CAREER_KEYWORD_RE.test(metaKw)) {
    return `meta-keywords-match`;
  }

  // ── 8. JSON-LD JobPosting schema ──────────────────────────────────────────
  const scripts = document.querySelectorAll('script[type="application/ld+json"]');
  for (let i = 0; i < scripts.length; i++) {
    if (/JobPosting/i.test(scripts[i].textContent || '')) {
      return `json-ld-job-posting`;
    }
  }

  // ── 9. Application form with file/resume upload ───────────────────────────
  const formReason = detectJobApplicationForm();
  if (formReason) return `form:${formReason}`;

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns a reason string if a job-application form is found on the page, or null.
 * Checks for: resume/CV file upload, common ATS field labels, "Apply" submit buttons.
 */
export function detectJobApplicationForm(): string | null {
  const forms = document.querySelectorAll('form');
  for (let i = 0; i < forms.length; i++) {
    const form = forms[i];
    const text = (form.textContent || '').toLowerCase();

    // Resume / CV file upload
    if (form.querySelector('input[type="file"]')) {
      const hasResumeHint =
        text.includes('resume') ||
        text.includes(' cv ') ||
        text.includes('curriculum vitae') ||
        text.includes('cover letter');
      if (hasResumeHint) return 'resume-upload-form';
    }

    // ATS-style field labels (even without file upload)
    const atsHints = [
      'years of experience',
      'current ctc',
      'expected ctc',
      'notice period',
      'expected salary',
      'current salary',
      'date of joining',
      'linkedin profile',
      'portfolio url',
    ];
    for (let k = 0; k < atsHints.length; k++) {
      if (text.includes(atsHints[k])) return `ats-field:${atsHints[k]}`;
    }

    // Apply / Submit Application button
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      const btnText = (submitBtn.textContent || '').toLowerCase().trim();
      if (
        btnText.includes('apply') ||
        btnText.includes('submit application') ||
        btnText === 'apply now' ||
        btnText === 'apply for this job'
      ) {
        return 'apply-submit-button';
      }
    }
  }
  return null;
}

/**
 * Returns true for sites that need the full SPA MutationObserver + retry loop.
 * Generic company career pages only need the lighter timed-retry approach.
 */
export function isKnownJobBoardOrAts(): boolean {
  const rawHost = location.hostname.toLowerCase();
  const host = rawHost.replace(/^www\./, '');
  for (let i = 0; i < ALL_JOB_BOARD_HOSTS.length; i++) {
    const j = ALL_JOB_BOARD_HOSTS[i];
    if (host === j || host.endsWith('.' + j)) return true;
  }
  for (let i = 0; i < ATS_HOST_SUFFIXES.length; i++) {
    const s = ATS_HOST_SUFFIXES[i];
    if (rawHost.endsWith(s) || rawHost === s.slice(1)) return true;
  }
  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 8 — JOB-POSTING EVIDENCE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Does this page's text actually read like a job posting?
 *
 * CAREER_PATH_RE deliberately matches broadly — /apply, /application, /join-us,
 * /talent — because employer career pages use every one of those. On its own
 * that is far too loose: it also matches university admissions, credit-card
 * and loan applications, and volunteer sign-up pages. Combined with the weakest
 * parser (any <h1> plus the domain name), the assistant would mount there and
 * offer to prefill the applicant's personal details into a form that has
 * nothing to do with employment.
 *
 * So a page that is not a known job board or ATS, and carries no JobPosting
 * structured data, must corroborate itself with its own copy before the weak
 * parsers are trusted.
 *
 * Categories rather than a keyword count: "requirements" plus "apply now"
 * describes a university application just as well as a job, so at least one
 * employment-specific signal is required.
 */
const JOB_EVIDENCE_PATTERNS: ReadonlyArray<{
  category: 'duties' | 'employment' | 'requirements' | 'application';
  strong: boolean;
  re: RegExp;
}> = [
  // Employment-specific. One of these must be present.
  { category: 'duties', strong: true, re: /\b(responsibilities|what you'?ll do|what you will do|about (?:the|this) role|role overview|in this role|key duties|job description)\b/i },
  { category: 'employment', strong: true, re: /\b(full[\s-]?time|part[\s-]?time|internship|contract role|employment type|salary range|compensation range|pay range|base salary|equal opportunit\w+ employer|employee benefits|benefits package)\b/i },
  // Supporting only — common to many kinds of application.
  { category: 'requirements', strong: false, re: /\b(qualifications|requirements|what we'?re looking for|minimum qualifications|preferred qualifications|required skills|nice to have)\b/i },
  { category: 'application', strong: false, re: /\b(apply now|apply for this job|submit your application|easy apply|start your application|application form)\b/i },
];

/** Which evidence categories this text shows. Exported for testing. */
export function jobPostingEvidence(text: string): {
  categories: string[];
  strong: boolean;
} {
  const sample = (text || '').slice(0, 20_000);
  const categories = new Set<string>();
  let strong = false;
  for (const pattern of JOB_EVIDENCE_PATTERNS) {
    if (!pattern.re.test(sample)) continue;
    categories.add(pattern.category);
    if (pattern.strong) strong = true;
  }
  return { categories: [...categories], strong };
}

/**
 * True when the page corroborates that it is a job posting: at least one
 * employment-specific signal, plus a second independent category.
 */
export function hasJobPostingEvidence(text: string): boolean {
  const evidence = jobPostingEvidence(text);
  return evidence.strong && evidence.categories.length >= 2;
}
