import type { ArticleSource } from './types';

/**
 * Sources and tracker figures shared by the November 20, 2026 status-message
 * guides (topics 1 to 5 of the keyword research run that day).
 *
 * Tracker figures are aggregates of the USCIS-dated status history of I-765
 * cases saved on TrackMyOPT, read on November 20, 2026. No receipt numbers or
 * personal data are included. Re-run the queries before changing a number.
 */
export const statusSources = {
  status: {
    label: 'Case Status Online',
    publisher: 'USCIS',
    url: 'https://egov.uscis.gov/',
  },
  delivery: {
    label: 'How to Track Delivery of Your Notice or Secure Identity Document (or Card)',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/forms/filing-guidance/how-to-track-delivery-of-your-notice-or-secure-identity-document-or-card',
  },
  ead: {
    label: 'Employment Authorization Document',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/green-card/green-card-processes-and-procedures/employment-authorization-document',
  },
  opt: {
    label: 'Optional Practical Training (OPT) for F-1 Students',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/optional-practical-training-opt-for-f-1-students',
  },
  address: {
    label: 'How to Change Your Address',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/addresschange',
  },
  inquiries: {
    label: 'Case inquiries and nondelivery requests (e-Request)',
    publisher: 'USCIS',
    url: 'https://egov.uscis.gov/e-request/',
  },
  contact: {
    label: 'USCIS Contact Center',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/contactcenter',
  },
  times: {
    label: 'Check Case Processing Times',
    publisher: 'USCIS',
    url: 'https://egov.uscis.gov/processing-times/',
  },
  expedite: {
    label: 'Expedite Requests',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/forms/filing-guidance/expedite-requests',
  },
  expeditePolicy: {
    label: 'Policy Manual, Volume 1, Part A, Chapter 5: Expedite Requests',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/policy-manual/volume-1-part-a-chapter-5',
  },
  premium: {
    label: 'Form I-907, Request for Premium Processing Service',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/i-907',
  },
  api: {
    label: 'Case Status API',
    publisher: 'USCIS Developer Portal',
    url: 'https://developer.uscis.gov/api/case-status',
  },
  informedDelivery: {
    label: 'Informed Delivery',
    publisher: 'United States Postal Service',
    url: 'https://informeddelivery.usps.com/',
  },
  missingMail: {
    label: 'Missing Mail and Lost Packages',
    publisher: 'United States Postal Service',
    url: 'https://www.usps.com/help/missing-mail.htm',
  },
  biometrics: {
    label: 'Preparing for Your Biometric Services Appointment',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/forms/filing-guidance/preparing-for-your-biometric-services-appointment',
  },
  stemBridge: {
    label: '8 CFR 274a.12(b)(6)(iv): STEM OPT extension pending',
    publisher: 'eCFR',
    url: 'https://www.ecfr.gov/current/title-8/chapter-I/subchapter-B/part-274a/subpart-B/section-274a.12',
  },
  i9Students: {
    label: 'Handbook for Employers M-274, 7.4.2: F-1 and M-1 Nonimmigrant Students',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/i-9-central/form-i-9-resources/handbook-for-employers-m-274/70-evidence-of-employment-authorization-for-certain-categories/74-exchange-visitors-and-students/742-f-1-and-m-1-nonimmigrant-students',
  },
  sevpTravel: {
    label: 'Travel: Re-entry for F-1 Nonimmigrants',
    publisher: 'ICE SEVP',
    url: 'https://www.ice.gov/sevis/travel',
  },
  berkeleyTravel: {
    label: 'Travel and Re-entry to the U.S. While on OPT',
    publisher: 'Berkeley International Office',
    url: 'https://internationaloffice.berkeley.edu/students/employment/opt/travel',
  },
  h1b: {
    label: 'H-1B Specialty Occupations',
    publisher: 'USCIS',
    url: 'https://www.uscis.gov/working-in-the-united-states/h-1b-specialty-occupations',
  },
  cfrH: {
    label: '8 CFR 214.2(h): H-1B portability, extensions beyond six years, H-4 employment',
    publisher: 'eCFR',
    url: 'https://www.ecfr.gov/current/title-8/chapter-I/subchapter-B/part-214/subpart-A/section-214.2',
  },
  cfr240: {
    label: '8 CFR 274a.12(b)(20): 240-day rule for timely filed extensions',
    publisher: 'eCFR',
    url: 'https://www.ecfr.gov/current/title-8/chapter-I/subchapter-B/part-274a/subpart-B/section-274a.12',
  },
  priorityDate: {
    label: '8 CFR 204.5(d) and (e): priority dates and retention',
    publisher: 'eCFR',
    url: 'https://www.ecfr.gov/current/title-8/chapter-I/subchapter-B/part-204/subpart-A/section-204.5',
  },
  revocation: {
    label: '8 CFR 205.1: automatic revocation and the 180-day rule',
    publisher: 'eCFR',
    url: 'https://www.ecfr.gov/current/title-8/chapter-I/subchapter-B/part-205/section-205.1',
  },
  visaBulletin: {
    label: 'Visa Bulletin',
    publisher: 'U.S. Department of State',
    url: 'https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin.html',
  },
  asu: {
    label: 'EAD card guidance for OPT students',
    publisher: 'Arizona State University ISSC',
    url: 'https://issc.asu.edu/f-1j-1-students/employment/ead-card',
  },
} satisfies Record<string, ArticleSource>;

export const TRACKER_DATA_NOTE =
  'Tracker figures are totals from the USCIS-dated status history of Form I-765 cases saved on TrackMyOPT, read on November 20, 2026. Most are OPT and STEM OPT cases. They describe finished cases and are not a prediction for yours.';

export const STATUS_GUIDE_DATE = '2026-11-20';
