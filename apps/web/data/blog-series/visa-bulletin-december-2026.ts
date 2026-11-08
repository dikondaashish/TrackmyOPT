import { defineArticle, source } from './shared';
import type { ArticleSource, ArticleTable, ResearchArticle } from './types';

// December 2026 Visa Bulletin outlook, in English and Spanish. Both articles
// are built from the official October and November 2026 bulletins; every
// forward-looking number is labelled as scenario arithmetic, not a forecast.

export const octoberBulletin: ArticleSource = {
  label: 'Visa Bulletin for October 2026',
  publisher: 'U.S. Department of State',
  url: 'https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin/2027/visa-bulletin-for-october-2026.html',
};

export const novemberBulletin: ArticleSource = {
  label: 'Visa Bulletin for November 2026',
  publisher: 'U.S. Department of State',
  url: 'https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin/2027/visa-bulletin-for-november-2026.html',
};

export const uscisCharts: ArticleSource = {
  label: 'Adjustment of Status Filing Charts from the Visa Bulletin',
  publisher: 'USCIS',
  url: 'https://www.uscis.gov/green-card/green-card-processes-and-procedures/visa-availability-priority-dates/adjustment-of-status-filing-charts-from-the-visa-bulletin',
};

const EN_SLUG = 'december-2026-visa-bulletin-predictions';
const ES_SLUG = 'boletin-de-visas-diciembre-2026-predicciones';

// Official November 2026 employment-based Final Action Dates (CA/VO: October 5, 2026).
export const novemberFinalAction: ArticleTable = {
  caption:
    'November 2026 Visa Bulletin, employment-based Final Action Dates (official). "C" = current.',
  columns: ['Category', 'All other countries', 'China', 'India', 'Mexico', 'Philippines'],
  rows: [
    ['EB-1', 'C', 'Aug 1, 2023', 'Feb 1, 2023', 'C', 'C'],
    ['EB-2', 'Apr 1, 2025', 'Oct 1, 2021', 'Nov 1, 2013', 'Apr 1, 2025', 'Apr 1, 2025'],
    ['EB-3', 'Jun 15, 2024', 'Jan 22, 2022', 'Jan 22, 2014', 'Jun 15, 2024', 'Aug 15, 2023'],
    ['EB-3 Other Workers', 'Jun 1, 2022', 'Oct 1, 2019', 'Jan 22, 2014', 'Jun 1, 2022', 'Jan 1, 2022'],
    ['EB-4', 'Dec 15, 2022', 'Dec 15, 2022', 'Dec 15, 2022', 'Dec 15, 2022', 'Dec 15, 2022'],
    ['EB-5 Unreserved', 'C', 'Dec 1, 2016', 'Dec 1, 2023', 'C', 'C'],
  ],
};

export const octoberToNovember: ArticleTable = {
  caption: 'Employment-based Final Action Dates: October 2026 vs November 2026 (official).',
  columns: ['Category', 'October 2026', 'November 2026', 'Movement'],
  rows: [
    ['EB-1 India', 'Feb 1, 2023', 'Feb 1, 2023', 'No change'],
    ['EB-2 India', 'Nov 1, 2013', 'Nov 1, 2013', 'No change'],
    ['EB-3 India', 'Jan 1, 2014', 'Jan 22, 2014', '+3 weeks'],
    ['EB-1 China', 'Jul 1, 2023', 'Aug 1, 2023', '+1 month'],
    ['EB-2 China', 'Oct 1, 2021', 'Oct 1, 2021', 'No change'],
    ['EB-3 China', 'Jan 8, 2022', 'Jan 22, 2022', '+2 weeks'],
    ['EB-2 all other countries', 'Jan 1, 2025', 'Apr 1, 2025', '+3 months'],
    ['EB-3 all other countries', 'May 15, 2024', 'Jun 15, 2024', '+1 month'],
    ['EB-3 Other Workers (other countries)', 'Jan 1, 2022', 'Jun 1, 2022', '+5 months'],
    ['EB-5 India (unreserved)', 'Dec 1, 2023', 'Dec 1, 2023', 'No change'],
  ],
};

const decemberScenarios: ArticleTable = {
  caption:
    'Scenario arithmetic only: the Final Action Date each category would reach in December 2026 if its October-to-November movement repeated exactly. Not a forecast.',
  columns: ['Category', 'November 2026 (official)', 'If the November step repeats', 'What to watch'],
  rows: [
    ['EB-1 India', 'Feb 1, 2023', 'Feb 1, 2023 (no step to repeat)', 'Any move at all would be news; a hold is the base case'],
    ['EB-2 India', 'Nov 1, 2013', 'Nov 1, 2013 (no step to repeat)', 'Has held since October; days or weeks, not months'],
    ['EB-3 India', 'Jan 22, 2014', 'About Feb 12, 2014', 'Second straight small step, or a pause'],
    ['EB-1 China', 'Aug 1, 2023', 'Sep 1, 2023', 'Steady one-month steps so far this fiscal year'],
    ['EB-3 China', 'Jan 22, 2022', 'About Feb 5, 2022', 'Two-week steps'],
    ['EB-2 all other countries', 'Apr 1, 2025', 'Jul 1, 2025', 'Recovering from the October retrogression'],
    ['EB-3 all other countries', 'Jun 15, 2024', 'Jul 15, 2024', 'Recovering from the October retrogression'],
  ],
};

export const novemberDatesForFiling: ArticleTable = {
  caption: 'November 2026 Visa Bulletin, employment-based Dates for Filing (official). USCIS accepted this chart for November adjustment filings.',
  columns: ['Category', 'All other countries', 'China', 'India'],
  rows: [
    ['EB-1', 'C', 'Jul 1, 2024', 'Jul 1, 2024'],
    ['EB-2', 'Mar 15, 2026', 'Jan 1, 2023', 'Jan 15, 2015'],
    ['EB-3', 'Aug 1, 2024', 'Apr 1, 2024', 'Jan 15, 2015'],
    ['EB-3 Other Workers', 'Jul 1, 2022', 'Oct 1, 2020', 'Jan 15, 2015'],
    ['EB-5 Unreserved', 'C', 'Mar 1, 2021', 'May 1, 2024'],
  ],
};

export const familyMovement: ArticleTable = {
  caption: 'Family-sponsored Final Action Dates, all other countries unless noted: October 2026 vs November 2026 (official).',
  columns: ['Category', 'October 2026', 'November 2026', 'Movement'],
  rows: [
    ['F1', 'Jan 22, 2020', 'Jan 22, 2021', '+1 year'],
    ['F2A', 'Sep 22, 2026', 'Oct 22, 2026', '+1 month'],
    ['F2B', 'Aug 22, 2019', 'Aug 22, 2020', '+1 year'],
    ['F3', 'Oct 22, 2014', 'Oct 22, 2015', '+1 year'],
    ['F4', 'Oct 22, 2011', 'Oct 22, 2012', '+1 year'],
    ['F4 India', 'Dec 15, 2006', 'Dec 15, 2006', 'No change'],
    ['F4 Mexico', 'Apr 22, 2001', 'Apr 22, 2001', 'No change'],
  ],
};

function translate(table: ArticleTable, columns: string[], caption: string): ArticleTable {
  return { ...table, columns, caption };
}

const esMovement = (value: string) =>
  value
    .replace('No change', 'Sin cambio')
    .replace('+3 weeks', '+3 semanas')
    .replace('+2 weeks', '+2 semanas')
    .replace('+1 month', '+1 mes')
    .replace('+3 months', '+3 meses')
    .replace('+5 months', '+5 meses')
    .replace('+1 year', '+1 año');

const ES_MONTHS: Record<string, string> = {
  Jan: 'ene', Feb: 'feb', Mar: 'mar', Apr: 'abr', May: 'may', Jun: 'jun',
  Jul: 'jul', Aug: 'ago', Sep: 'sep', Oct: 'oct', Nov: 'nov', Dec: 'dic',
};

// "Aug 1, 2023" -> "1 ago 2023"; "About Feb 12, 2014" -> "Aprox. 12 feb 2014".
const esDate = (value: string) =>
  value
    .replace(/About /g, 'Aprox. ')
    .replace(
      /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{1,2}), (\d{4})/g,
      (_match, month: string, day: string, year: string) =>
        `${day} ${ES_MONTHS[month]} ${year}`
    );

const esRows = (rows: string[][]) =>
  rows.map((row) => row.map((cell) => esMovement(esDate(cell))));

export const decemberBulletinPredictions = defineArticle({
  slug: EN_SLUG,
  lang: 'en',
  translations: { es: ES_SLUG },
  title:
    'December 2026 Visa Bulletin Predictions: EB-1, EB-2 and EB-3 India, China and Rest of World',
  seoTitle: 'December 2026 Visa Bulletin Predictions: EB-1, EB-2, EB-3',
  description:
    'December 2026 Visa Bulletin predictions built from the official October and November tables: what moved, what held, release timing, the USCIS chart choice, and what OPT workers should do.',
  category: 'Green Card Outlook',
  tags: [
    'December 2026 Visa Bulletin',
    'Visa Bulletin predictions',
    'EB-2 India',
    'EB-3 India',
    'EB-1 India',
    'Dates for Filing',
  ],
  readTime: '10 min read',
  publishedDate: '2026-11-08',
  modifiedDate: '2026-11-08',
  newsSitemapEligible: true,
  newsPublishedAt: '2026-11-08T22:00:00Z',
  cta: 'uscis-tracking',
  image: `/blog/${EN_SLUG}.png`,
  imageAlt:
    'TrackMyOPT cover: December 2026 Visa Bulletin predictions with the October to November movement for EB-2 and EB-3.',
  imageCaption:
    'Cover generated from the official October and November 2026 tables. Scenario math, not a forecast.',
  badgeLabel: 'Monthly outlook · updated on release',
  statusNote:
    'Checked November 8, 2026: the State Department index lists November 2026 as the current bulletin and USCIS lists the December charts as "coming soon". No official December 2026 dates exist yet. Every December number below is arithmetic on the published October-to-November movement, clearly labelled, and this page will be rewritten with the official tables on release day.',
  directAnswer:
    'The December 2026 Visa Bulletin is not published yet; it usually appears in the middle of November. The November bulletin held EB-1 India at February 1, 2023 and EB-2 India at November 1, 2013, moved EB-3 India three weeks to January 22, 2014, and advanced EB-2 and EB-3 for all other countries by three months and one month after their October retrogression. The base case for December is another hold for EB-1 and EB-2 India and small steps elsewhere. USCIS accepted the Dates for Filing chart in October and November; check its December choice before filing.',
  keyTakeaways: [
    'November moved EB-3 India (+3 weeks), EB-1 China (+1 month), EB-3 China (+2 weeks) and the rest-of-world EB-2 (+3 months) and EB-3 (+1 month) categories. EB-1 and EB-2 India did not move.',
    'A December scenario that simply repeats November would put EB-3 India near February 12, 2014 and rest-of-world EB-2 at July 1, 2025. That is arithmetic, not a prediction with a probability.',
    'USCIS used the Dates for Filing chart for employment-based adjustment in both October and November 2026. The December choice is separate and must be checked on the USCIS page.',
    'None of this changes an OPT or STEM OPT EAD date. Track the I-765 and any I-140 or I-485 receipts separately.',
  ],
  sections: [
    {
      heading: 'When the December 2026 Visa Bulletin comes out',
      paragraphs: [
        'The State Department publishes each bulletin in the middle of the month before it takes effect. The November 2026 bulletin carries an internal date of October 5 and appeared on the index later that month. The December 2025 bulletin, one year ago, was summarised by law firms on November 17, 2025, which is a reasonable guide to timing: expect the December 2026 bulletin between roughly November 12 and November 20, with no fixed date promised by the Department.',
        'Two pages matter on release day. The State Department bulletin sets the Final Action Dates and Dates for Filing. USCIS then announces, on its own page, which of the two charts adjustment-of-status applicants may use that month. As of November 2, 2026 the USCIS page lists the December charts as "coming soon".',
      ],
      bullets: [
        'Official bulletin index: travel.state.gov, Visa Bulletin.',
        'USCIS chart choice: the Adjustment of Status Filing Charts page, updated after each bulletin.',
        'If a prediction site shows December dates before the index does, they are estimates.',
      ],
      sources: [source.visaBulletin, uscisCharts],
    },
    {
      heading: 'The November 2026 baseline: official Final Action Dates',
      paragraphs: [
        'Every December scenario starts from the November table. These are the official employment-based Final Action Dates from the November 2026 bulletin. A priority date must be earlier than the listed cutoff for a visa number to be available for final action.',
      ],
      table: novemberFinalAction,
      sources: [novemberBulletin],
    },
    {
      heading: 'What moved from October to November, category by category',
      paragraphs: [
        'October opened fiscal year 2027 with a reset that restored EB-2 India to a printed date after August’s "unavailable" and that retrogressed EB-2 and EB-3 for all other countries. November recovered part of that retrogression and nudged several Asia-chargeable categories. India’s EB-1 and EB-2 held.',
      ],
      table: octoberToNovember,
      note: 'Read movement as a sign of demand reporting, not as a trend line. The Department allocates numbers month by month against annual and quarterly limits, and a category can hold for several months and then jump, or advance and then retrogress.',
      sources: [octoberBulletin, novemberBulletin],
    },
    {
      heading: 'December 2026 scenarios by category',
      paragraphs: [
        'The honest way to "predict" the December bulletin is to show what each category reaches if its latest step repeats, and then say why that may not happen. The table does the arithmetic. The paragraphs below explain the uncertainty for the categories most OPT and STEM OPT workers ask about.',
      ],
      table: decemberScenarios,
      bullets: [
        'EB-2 India: held at November 1, 2013 in both October and November. Early fiscal-year bulletins often hold India EB-2 while the Department measures demand under the new annual limit. A small forward step of days or a few weeks is possible; a jump of months would contradict the pattern since 2024. A hold is the base case.',
        'EB-1 India: held at February 1, 2023 since the October reset. Any forward movement would be meaningful news, and a hold is again the base case. The August 2026 bulletin warned that EB-1 India could become unavailable late in a fiscal year, which is a reminder that the risk runs both ways.',
        'EB-3 India: advanced three weeks in November to January 22, 2014. Another step of two to four weeks is consistent with that, which would land in early-to-mid February 2014. A pause would also be unremarkable.',
        'EB-2 and EB-3 for all other countries: October retrogressed both; November recovered three months and one month respectively. A second recovery step is plausible, but the Department said the October retrogression was needed to keep issuances within quarterly limits, so recovery may stop short of the September 2026 position, when both were current.',
        'China: EB-1 moved one month and EB-3 two weeks in November; EB-2 China held at October 1, 2021. Expect similar small steps or a hold.',
      ],
      sources: [novemberBulletin, octoberBulletin],
    },
    {
      heading: 'Dates for Filing and the USCIS chart choice',
      paragraphs: [
        'For adjustment of status inside the United States, the chart USCIS selects matters as much as the dates. In both October and November 2026 USCIS accepted the Dates for Filing chart for all employment-based categories, which lets applicants with later priority dates file Form I-485 and request an EAD and advance parole while they wait for a final action date.',
        'The November Dates for Filing did not change for EB-1, EB-2 or EB-3 in any country; only the Other Workers row for the rest of the world moved a month. If December again uses Dates for Filing, the question for an India EB-2 or EB-3 applicant is simply whether the priority date is before January 15, 2015. Confirm the December selection on the USCIS page before filing anything.',
      ],
      table: novemberDatesForFiling,
      sources: [novemberBulletin, uscisCharts],
    },
    {
      heading: 'Family-sponsored categories in November',
      paragraphs: [
        'Family categories had a strong November, with F1, F2B, F3 and F4 for most countries advancing a full year and F2A moving a month. India F4 and Mexico’s F1 through F4 rows stayed within days of their October dates. December movement in family categories is usually smaller after a jump like this.',
      ],
      table: familyMovement,
      sources: [octoberBulletin, novemberBulletin],
    },
    {
      heading: 'What OPT and STEM OPT workers should do before the release',
      paragraphs: [
        'Green-card timing and F-1 work authorization run on separate clocks. A priority date becoming current does not extend an OPT or STEM OPT EAD, and an EAD expiring does not pause a priority date. Use the days before the December bulletin to put both sets of dates in one place.',
      ],
      numbered: [
        'Write down your category, country of chargeability and priority date from the I-140 approval or receipt notice, and confirm them with the employer’s counsel.',
        'Save the October and November tables above so you can compare the December bulletin line by line on release day.',
        'Check whether your priority date is already before the November Dates for Filing cutoff. If it is, ask counsel now what an I-485 package would need, so a December filing window is not lost to document collection.',
        'Keep the I-765 (OPT or STEM OPT), any I-140 and any I-485 or I-131 receipts tracked separately, and keep SEVP Portal reporting current whatever the bulletin says.',
      ],
      links: [
        { label: 'How to track an I-140 case', href: '/blog/i-140-case-status-tracking' },
        { label: 'OPT to green card paths: EB-2 NIW', href: '/blog/eb2-niw-green-card-opt' },
        { label: 'H-1B cap-gap rules', href: '/blog/h1b-cap-gap-extension' },
      ],
    },
    {
      heading: 'How this page will be updated',
      paragraphs: [
        'On the day the State Department publishes the December 2026 bulletin, this page will be rewritten with the official Final Action Dates and Dates for Filing, a November-to-December comparison, and the USCIS chart selection once USCIS posts it. The scenario table will be kept below the official numbers so readers can see how the arithmetic compared with reality.',
      ],
      links: [
        { label: 'November 2026 Visa Bulletin: official dates vs predictions', href: '/blog/november-2026-visa-bulletin-predictions-opt-workers' },
        { label: 'October 2026 fiscal-year reset guide', href: '/blog/october-2026-visa-bulletin-fiscal-year-reset' },
      ],
    },
  ],
  checklist: [
    'Confirm category, chargeability and priority date from the I-140 notice.',
    'Bookmark the State Department index and the USCIS chart page.',
    'Compare December line by line against the November table above.',
    'Keep OPT and STEM OPT deadlines and SEVP reporting on their own calendar.',
  ],
  mistakes: [
    'Sharing a scenario date as if it were an official December cutoff.',
    'Checking the State Department bulletin but not the USCIS chart selection.',
    'Assuming an I-140 approval or a current priority date authorizes work after an EAD expires.',
  ],
  faq: [
    {
      question: 'When will the December 2026 Visa Bulletin be released?',
      answer:
        'The Department has not announced a date. Bulletins appear in the middle of the preceding month; the December 2025 bulletin was public by November 17, 2025. Expect the December 2026 bulletin in the second or third week of November 2026 and check the official index rather than a prediction site.',
    },
    {
      question: 'Will EB-2 India move in December 2026?',
      answer:
        'It cannot be known before publication. EB-2 India held at November 1, 2013 in October and November. A hold or a step of days to a few weeks fits the recent pattern; a multi-month jump does not.',
    },
    {
      question: 'Will EB-3 India advance in December 2026?',
      answer:
        'EB-3 India moved from January 1 to January 22, 2014 in November. If that three-week step repeats, December would land near February 12, 2014. A pause is equally consistent with how the Department has managed India EB-3.',
    },
    {
      question: 'Which chart will USCIS use in December 2026?',
      answer:
        'USCIS used the Dates for Filing chart for employment-based adjustment in October and November 2026. The December choice is announced separately on the USCIS filing-charts page, which listed it as "coming soon" on November 2, 2026.',
    },
    {
      question: 'Does a current priority date extend my OPT or STEM OPT?',
      answer:
        'No. OPT and STEM OPT authorization depend on the F-1 rules and the EAD dates. A pending or approved I-485 can lead to a separate EAD, but that is a different application with its own receipt.',
    },
  ],
  sources: [novemberBulletin, octoberBulletin, uscisCharts, source.visaBulletin],
  related: [
    { label: 'November 2026 Visa Bulletin: official dates vs predictions', href: '/blog/november-2026-visa-bulletin-predictions-opt-workers' },
    { label: 'October 2026 Visa Bulletin: fiscal-year reset', href: '/blog/october-2026-visa-bulletin-fiscal-year-reset' },
    { label: 'I-140 case status tracking', href: '/blog/i-140-case-status-tracking' },
    { label: 'Predicciones del Boletín de visas de diciembre 2026 (en español)', href: `/blog/${ES_SLUG}` },
  ],
});

export const boletinDiciembre2026Predicciones = defineArticle({
  slug: ES_SLUG,
  lang: 'es',
  translations: { en: EN_SLUG },
  title:
    'Boletín de visas de diciembre 2026: predicciones para EB-1, EB-2 y EB-3 (India, China y resto del mundo)',
  seoTitle: 'Boletín de visas diciembre 2026: predicciones EB-1, EB-2, EB-3',
  description:
    'Predicciones del Boletín de visas de diciembre 2026 a partir de las tablas oficiales de octubre y noviembre: qué avanzó, qué se mantuvo, cuándo sale y qué gráfico usa USCIS.',
  category: 'Boletín de visas',
  tags: [
    'boletín de visas diciembre 2026',
    'boletin de visas diciembre 2026 predicciones',
    'fechas de prioridad',
    'EB-2 India',
    'EB-3',
    'Dates for Filing',
  ],
  readTime: '10 min de lectura',
  publishedDate: '2026-11-08',
  modifiedDate: '2026-11-08',
  newsSitemapEligible: true,
  newsPublishedAt: '2026-11-08T22:00:00Z',
  cta: 'uscis-tracking',
  image: `/blog/${ES_SLUG}.png`,
  imageAlt:
    'Portada de TrackMyOPT: predicciones del Boletín de visas de diciembre 2026 con el movimiento de octubre a noviembre para EB-2 y EB-3.',
  imageCaption:
    'Portada generada a partir de las tablas oficiales de octubre y noviembre de 2026. Escenarios aritméticos, no un pronóstico.',
  badgeLabel: 'Perspectiva mensual · se actualiza al publicarse',
  reviewLabel: 'Revisado con las tablas oficiales del Departamento de Estado',
  statusNote:
    'Verificado el 8 de noviembre de 2026: el índice del Departamento de Estado muestra noviembre 2026 como el boletín vigente y USCIS indica que los gráficos de diciembre están "próximamente". Todavía no existen fechas oficiales de diciembre. Cada cifra de diciembre de esta página es aritmética sobre el movimiento publicado de octubre a noviembre, está señalada como tal, y la página se reescribirá con las tablas oficiales el día de la publicación.',
  directAnswer:
    'El Boletín de visas de diciembre 2026 aún no se ha publicado; suele aparecer a mediados de noviembre. El boletín de noviembre mantuvo EB-1 India en el 1 de febrero de 2023 y EB-2 India en el 1 de noviembre de 2013, avanzó EB-3 India tres semanas hasta el 22 de enero de 2014, y avanzó EB-2 y EB-3 para el resto del mundo tres meses y un mes tras el retroceso de octubre. El escenario base para diciembre es otra pausa en EB-1 y EB-2 India y pasos pequeños en el resto. USCIS aceptó el gráfico de Dates for Filing en octubre y noviembre; confirma su elección de diciembre antes de presentar cualquier solicitud.',
  keyTakeaways: [
    'En noviembre avanzaron EB-3 India (+3 semanas), EB-1 China (+1 mes), EB-3 China (+2 semanas) y, para el resto del mundo, EB-2 (+3 meses) y EB-3 (+1 mes). EB-1 y EB-2 India no se movieron.',
    'Si diciembre repitiera el paso de noviembre, EB-3 India quedaría cerca del 12 de febrero de 2014 y EB-2 resto del mundo en el 1 de julio de 2025. Es aritmética, no una predicción con probabilidad.',
    'USCIS usó el gráfico de Dates for Filing para el ajuste de estatus por empleo en octubre y noviembre de 2026. La elección de diciembre se anuncia por separado en la página de USCIS.',
    'Nada de esto cambia la fecha de un EAD de OPT o STEM OPT. Sigue por separado el I-765 y cualquier recibo de I-140 o I-485.',
  ],
  sections: [
    {
      heading: 'Cuándo sale el Boletín de visas de diciembre 2026',
      paragraphs: [
        'El Departamento de Estado publica cada boletín a mediados del mes anterior al que corresponde. El boletín de noviembre 2026 lleva fecha interna del 5 de octubre y apareció en el índice más adelante ese mes. El boletín de diciembre 2025, hace un año, ya estaba resumido por despachos de abogados el 17 de noviembre de 2025. Es una guía razonable: espera el boletín de diciembre 2026 entre el 12 y el 20 de noviembre aproximadamente, sin que el Departamento prometa una fecha fija.',
        'El día de la publicación importan dos páginas. El boletín del Departamento de Estado fija las Final Action Dates (fechas de acción final) y las Dates for Filing (fechas para presentar). Después, USCIS anuncia en su propia página cuál de los dos gráficos pueden usar ese mes quienes solicitan el ajuste de estatus. Al 2 de noviembre de 2026, la página de USCIS muestra los gráficos de diciembre como "próximamente".',
      ],
      bullets: [
        'Índice oficial del boletín: travel.state.gov, Visa Bulletin.',
        'Elección de gráfico de USCIS: la página Adjustment of Status Filing Charts, que se actualiza tras cada boletín.',
        'Si un sitio de predicciones muestra fechas de diciembre antes que el índice oficial, son estimaciones.',
      ],
      sources: [source.visaBulletin, uscisCharts],
    },
    {
      heading: 'La base de noviembre 2026: Final Action Dates oficiales',
      paragraphs: [
        'Todo escenario de diciembre parte de la tabla de noviembre. Estas son las Final Action Dates oficiales por empleo del boletín de noviembre 2026. La fecha de prioridad debe ser anterior a la fecha indicada para que haya un número de visa disponible para la acción final. "C" significa "current" (disponible para todas las fechas).',
      ],
      table: translate(
        { ...novemberFinalAction, rows: esRows(novemberFinalAction.rows) },
        ['Categoría', 'Resto del mundo', 'China', 'India', 'México', 'Filipinas'],
        'Boletín de visas de noviembre 2026, Final Action Dates por empleo (oficial). "C" = current.'
      ),
      sources: [novemberBulletin],
    },
    {
      heading: 'Qué se movió de octubre a noviembre, categoría por categoría',
      paragraphs: [
        'Octubre abrió el año fiscal 2027 con un reinicio que devolvió a EB-2 India una fecha impresa después del "no disponible" de agosto, y que hizo retroceder EB-2 y EB-3 para el resto del mundo. Noviembre recuperó parte de ese retroceso y movió ligeramente varias categorías de China e India. EB-1 y EB-2 India se mantuvieron.',
      ],
      table: translate(
        { ...octoberToNovember, rows: esRows(octoberToNovember.rows).map((row) => [row[0].replace('all other countries', 'resto del mundo').replace('Other Workers (other countries)', 'Other Workers (resto del mundo)').replace('(unreserved)', '(no reservado)'), ...row.slice(1)]) },
        ['Categoría', 'Octubre 2026', 'Noviembre 2026', 'Movimiento'],
        'Final Action Dates por empleo: octubre 2026 frente a noviembre 2026 (oficial).'
      ),
      note: 'Lee el movimiento como una señal de la demanda reportada, no como una línea de tendencia. El Departamento asigna números mes a mes contra límites anuales y trimestrales; una categoría puede mantenerse varios meses y luego saltar, o avanzar y después retroceder.',
      sources: [octoberBulletin, novemberBulletin],
    },
    {
      heading: 'Escenarios de diciembre 2026 por categoría',
      paragraphs: [
        'La manera honesta de "predecir" el boletín de diciembre es mostrar hasta dónde llegaría cada categoría si su último paso se repitiera, y explicar por qué podría no ocurrir. La tabla hace la aritmética. Los puntos siguientes explican la incertidumbre en las categorías por las que más preguntan quienes trabajan con OPT y STEM OPT.',
      ],
      table: translate(
        { ...decemberScenarios, rows: esRows(decemberScenarios.rows).map((row) => [
          row[0].replace('all other countries', 'resto del mundo'),
          row[1],
          row[2].replace('(no step to repeat)', '(sin paso que repetir)'),
          row[3]
            .replace('Any move at all would be news; a hold is the base case', 'Cualquier avance sería noticia; la pausa es el escenario base')
            .replace('Has held since October; days or weeks, not months', 'Sin cambios desde octubre; días o semanas, no meses')
            .replace('Second straight small step, or a pause', 'Segundo paso pequeño seguido, o una pausa')
            .replace('Steady one-month steps so far this fiscal year', 'Pasos constantes de un mes en lo que va del año fiscal')
            .replace('Two-week steps', 'Pasos de dos semanas')
            .replace('Recovering from the October retrogression', 'Recuperándose del retroceso de octubre'),
        ]) },
        ['Categoría', 'Noviembre 2026 (oficial)', 'Si se repite el paso de noviembre', 'Qué vigilar'],
        'Solo aritmética de escenarios: la Final Action Date que alcanzaría cada categoría en diciembre 2026 si su movimiento de octubre a noviembre se repitiera exactamente. No es un pronóstico.'
      ),
      bullets: [
        'EB-2 India: se mantuvo en el 1 de noviembre de 2013 en octubre y en noviembre. Los primeros boletines de cada año fiscal suelen mantener EB-2 India mientras el Departamento mide la demanda bajo el nuevo límite anual. Es posible un pequeño avance de días o pocas semanas; un salto de meses contradiría el patrón desde 2024. La pausa es el escenario base.',
        'EB-1 India: en el 1 de febrero de 2023 desde el reinicio de octubre. Cualquier avance sería noticia relevante y la pausa vuelve a ser el escenario base. El boletín de agosto 2026 advirtió que EB-1 India podría quedar no disponible al final de un año fiscal: el riesgo corre en ambas direcciones.',
        'EB-3 India: avanzó tres semanas en noviembre hasta el 22 de enero de 2014. Otro paso de dos a cuatro semanas sería coherente, lo que la dejaría a principios o mediados de febrero de 2014. Una pausa tampoco sorprendería.',
        'EB-2 y EB-3 resto del mundo: octubre hizo retroceder ambas; noviembre recuperó tres meses y un mes respectivamente. Un segundo paso de recuperación es plausible, pero el Departamento explicó que el retroceso de octubre era necesario para respetar los límites trimestrales, así que la recuperación puede quedarse corta respecto a septiembre 2026, cuando ambas estaban "current".',
        'China: EB-1 avanzó un mes y EB-3 dos semanas en noviembre; EB-2 China se mantuvo en el 1 de octubre de 2021. Espera pasos pequeños similares o una pausa.',
      ],
      sources: [novemberBulletin, octoberBulletin],
    },
    {
      heading: 'Dates for Filing y la elección de gráfico de USCIS',
      paragraphs: [
        'Para el ajuste de estatus dentro de Estados Unidos, el gráfico que elige USCIS importa tanto como las fechas. En octubre y en noviembre de 2026 USCIS aceptó el gráfico de Dates for Filing para todas las categorías por empleo, lo que permite a solicitantes con fechas de prioridad posteriores presentar el Formulario I-485 y pedir un EAD y advance parole mientras esperan la fecha de acción final.',
        'Las Dates for Filing de noviembre no cambiaron para EB-1, EB-2 ni EB-3 en ningún país; solo la fila de Other Workers para el resto del mundo avanzó un mes. Si diciembre vuelve a usar Dates for Filing, la pregunta para un solicitante EB-2 o EB-3 de India es simplemente si su fecha de prioridad es anterior al 15 de enero de 2015. Confirma la elección de diciembre en la página de USCIS antes de presentar nada.',
      ],
      table: translate(
        { ...novemberDatesForFiling, rows: esRows(novemberDatesForFiling.rows) },
        ['Categoría', 'Resto del mundo', 'China', 'India'],
        'Boletín de visas de noviembre 2026, Dates for Filing por empleo (oficial). USCIS aceptó este gráfico para las solicitudes de ajuste de noviembre.'
      ),
      sources: [novemberBulletin, uscisCharts],
    },
    {
      heading: 'Categorías familiares en noviembre',
      paragraphs: [
        'Las categorías familiares tuvieron un noviembre fuerte: F1, F2B, F3 y F4 para la mayoría de países avanzaron un año completo y F2A avanzó un mes. F4 India y las filas F1 a F4 de México quedaron a días de sus fechas de octubre. Tras un salto así, el movimiento de diciembre en las categorías familiares suele ser menor.',
      ],
      table: translate(
        { ...familyMovement, rows: esRows(familyMovement.rows).map((row) => [row[0].replace('Mexico', 'México'), ...row.slice(1)]) },
        ['Categoría', 'Octubre 2026', 'Noviembre 2026', 'Movimiento'],
        'Final Action Dates familiares, resto del mundo salvo que se indique: octubre 2026 frente a noviembre 2026 (oficial).'
      ),
      sources: [octoberBulletin, novemberBulletin],
    },
    {
      heading: 'Qué deben hacer quienes trabajan con OPT y STEM OPT antes de la publicación',
      paragraphs: [
        'El tiempo de la residencia permanente y la autorización de trabajo F-1 corren en relojes distintos. Que una fecha de prioridad quede "current" no extiende un EAD de OPT o STEM OPT, y que un EAD venza no pausa la fecha de prioridad. Usa los días previos al boletín de diciembre para reunir ambos conjuntos de fechas en un solo lugar.',
      ],
      numbered: [
        'Anota tu categoría, país de cargo (chargeability) y fecha de prioridad según la aprobación o el recibo del I-140, y confírmalos con el abogado de tu empleador.',
        'Guarda las tablas de octubre y noviembre de arriba para comparar el boletín de diciembre línea por línea el día de la publicación.',
        'Comprueba si tu fecha de prioridad ya es anterior al corte de Dates for Filing de noviembre. Si lo es, pregunta ahora qué necesitaría un paquete de I-485, para no perder una ventana de diciembre reuniendo documentos.',
        'Sigue por separado los recibos del I-765 (OPT o STEM OPT), del I-140 y de cualquier I-485 o I-131, y mantén al día los reportes en el SEVP Portal diga lo que diga el boletín.',
      ],
      links: [
        { label: 'Cómo seguir un caso I-140 (en inglés)', href: '/blog/i-140-case-status-tracking' },
        { label: 'De OPT a la residencia: EB-2 NIW (en inglés)', href: '/blog/eb2-niw-green-card-opt' },
      ],
    },
    {
      heading: 'Cómo se actualizará esta página',
      paragraphs: [
        'El día que el Departamento de Estado publique el boletín de diciembre 2026, esta página se reescribirá con las Final Action Dates y Dates for Filing oficiales, una comparación noviembre-diciembre y la elección de gráfico de USCIS en cuanto se publique. La tabla de escenarios se mantendrá debajo de las cifras oficiales para que puedas ver cómo se comparó la aritmética con la realidad.',
        'La versión en inglés de esta guía contiene las mismas tablas y se actualiza al mismo tiempo.',
      ],
      links: [
        { label: 'December 2026 Visa Bulletin predictions (English version)', href: `/blog/${EN_SLUG}` },
        { label: 'Boletín de octubre 2026: reinicio del año fiscal (en inglés)', href: '/blog/october-2026-visa-bulletin-fiscal-year-reset' },
      ],
    },
  ],
  checklist: [
    'Confirma categoría, país de cargo y fecha de prioridad con el aviso del I-140.',
    'Guarda el índice del Departamento de Estado y la página de gráficos de USCIS.',
    'Compara diciembre línea por línea con la tabla de noviembre de arriba.',
    'Mantén los plazos de OPT y STEM OPT y los reportes SEVP en su propio calendario.',
  ],
  mistakes: [
    'Compartir una fecha de escenario como si fuera un corte oficial de diciembre.',
    'Revisar el boletín del Departamento de Estado pero no la elección de gráfico de USCIS.',
    'Suponer que una aprobación de I-140 o una fecha de prioridad "current" autoriza a trabajar después de que vence el EAD.',
  ],
  faq: [
    {
      question: '¿Cuándo sale el Boletín de visas de diciembre 2026?',
      answer:
        'El Departamento no ha anunciado una fecha. Los boletines aparecen a mediados del mes anterior; el boletín de diciembre 2025 era público el 17 de noviembre de 2025. Espera el de diciembre 2026 en la segunda o tercera semana de noviembre de 2026 y revisa el índice oficial, no un sitio de predicciones.',
    },
    {
      question: '¿Avanzará EB-2 India en diciembre 2026?',
      answer:
        'No se puede saber antes de la publicación. EB-2 India se mantuvo en el 1 de noviembre de 2013 en octubre y noviembre. Una pausa o un paso de días a pocas semanas encaja con el patrón reciente; un salto de varios meses no.',
    },
    {
      question: '¿Avanzará EB-3 India en diciembre 2026?',
      answer:
        'EB-3 India pasó del 1 al 22 de enero de 2014 en noviembre. Si ese paso de tres semanas se repite, diciembre quedaría cerca del 12 de febrero de 2014. Una pausa es igual de coherente con cómo el Departamento ha manejado EB-3 India.',
    },
    {
      question: '¿Qué gráfico usará USCIS en diciembre 2026?',
      answer:
        'USCIS usó el gráfico de Dates for Filing para el ajuste por empleo en octubre y noviembre de 2026. La elección de diciembre se anuncia por separado en la página de gráficos de USCIS, que el 2 de noviembre de 2026 la mostraba como "próximamente".',
    },
    {
      question: '¿Una fecha de prioridad "current" extiende mi OPT o STEM OPT?',
      answer:
        'No. La autorización de OPT y STEM OPT depende de las reglas F-1 y de las fechas del EAD. Un I-485 pendiente o aprobado puede dar lugar a un EAD distinto, pero es otra solicitud con su propio recibo.',
    },
  ],
  sources: [novemberBulletin, octoberBulletin, uscisCharts, source.visaBulletin],
  related: [
    { label: 'December 2026 Visa Bulletin predictions (English)', href: `/blog/${EN_SLUG}` },
    { label: 'Boletín de noviembre 2026: fechas oficiales frente a predicciones (en inglés)', href: '/blog/november-2026-visa-bulletin-predictions-opt-workers' },
    { label: 'Cómo seguir el estado de un caso de USCIS (en inglés)', href: '/blog/uscis-case-status-tracking-guide' },
  ],
});

export const decemberBulletinArticles: ResearchArticle[] = [
  decemberBulletinPredictions,
  boletinDiciembre2026Predicciones,
];
